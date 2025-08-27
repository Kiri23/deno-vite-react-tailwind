#!/usr/bin/env -S deno run -A

/**
 * Pre-commit Hook Setup Script
 *
 * Sets up currency formatting pre-commit hooks using various methods:
 * - Direct Git hooks
 * - Husky (if available)
 * - Lefthook (if available)
 *
 * Usage: deno run -A scripts/setup-precommit-hooks.ts
 */

interface HookSetupResult {
  method: string;
  success: boolean;
  message: string;
}

class PrecommitHookSetup {
  private async checkGitRepo(): Promise<boolean> {
    try {
      const command = new Deno.Command("git", {
        args: ["rev-parse", "--git-dir"],
        stdout: "piped",
        stderr: "piped",
      });

      const { code } = await command.output();
      return code === 0;
    } catch {
      return false;
    }
  }

  private async checkCommand(cmd: string): Promise<boolean> {
    try {
      const command = new Deno.Command(cmd, {
        args: ["--version"],
        stdout: "piped",
        stderr: "piped",
      });

      const { code } = await command.output();
      return code === 0;
    } catch {
      return false;
    }
  }

  private async setupDirectGitHook(): Promise<HookSetupResult> {
    try {
      const hookPath = ".git/hooks/pre-commit";
      const hookContent = `#!/bin/sh

# Currency Formatting Pre-commit Hook
# 
# Prevents commits that violate currency formatting standards per foundation.md
# This hook runs the precommit:currency Deno task to validate staged files

echo "🔍 Running currency formatting pre-commit checks..."

# Change to the project directory
cd "$(dirname "$0")/../.." || exit 1

# Run the pre-commit currency guard
if ! deno task precommit:currency; then
    echo ""
    echo "🚫 COMMIT BLOCKED: Currency formatting violations detected"
    echo ""
    echo "🔧 How to fix:"
    echo "  1. Review the violations shown above"
    echo "  2. Make the suggested changes"
    echo "  3. Stage your fixes: git add <files>"
    echo "  4. Try committing again"
    echo ""
    echo "💡 Helpful commands:"
    echo "  • Check all violations: deno task check:currency"
    echo "  • Get migration help: deno task fix:currency"
    echo "  • Re-run this check: deno task precommit:currency"
    echo ""
    echo "📚 Reference: foundation.md currency formatting standards"
    exit 1
fi

echo "✅ Currency formatting pre-commit checks passed!"
exit 0`;

      await Deno.writeTextFile(hookPath, hookContent);

      // Make executable
      await Deno.chmod(hookPath, 0o755);

      return {
        method: "Direct Git Hook",
        success: true,
        message: `Created executable pre-commit hook at ${hookPath}`,
      };
    } catch (error) {
      return {
        method: "Direct Git Hook",
        success: false,
        message: `Failed to create Git hook: ${error.message}`,
      };
    }
  }

  private async setupHusky(): Promise<HookSetupResult> {
    try {
      // Check if husky is available
      if (!(await this.checkCommand("npx"))) {
        return {
          method: "Husky",
          success: false,
          message: "npx not available - cannot setup Husky",
        };
      }

      // Initialize husky
      const initCommand = new Deno.Command("npx", {
        args: ["husky", "init"],
        stdout: "piped",
        stderr: "piped",
      });

      await initCommand.output();

      // Add pre-commit hook
      const hookCommand = new Deno.Command("npx", {
        args: [
          "husky",
          "add",
          ".husky/pre-commit",
          "deno task precommit:currency",
        ],
        stdout: "piped",
        stderr: "piped",
      });

      const { code } = await hookCommand.output();

      if (code === 0) {
        return {
          method: "Husky",
          success: true,
          message: "Successfully configured Husky pre-commit hook",
        };
      } else {
        return {
          method: "Husky",
          success: false,
          message: "Failed to configure Husky hook",
        };
      }
    } catch (error) {
      return {
        method: "Husky",
        success: false,
        message: `Husky setup failed: ${error.message}`,
      };
    }
  }

  private async setupLefthook(): Promise<HookSetupResult> {
    try {
      // Check if lefthook is available
      if (!(await this.checkCommand("lefthook"))) {
        return {
          method: "Lefthook",
          success: false,
          message: "lefthook command not available",
        };
      }

      // Create lefthook.yml configuration
      const lefthookConfig = `pre-commit:
  commands:
    currency-format:
      run: deno task precommit:currency
      fail_text: "Currency formatting violations detected. Fix them and try again."
      stage_fixed: false
`;

      await Deno.writeTextFile("lefthook.yml", lefthookConfig);

      // Install lefthook
      const installCommand = new Deno.Command("lefthook", {
        args: ["install"],
        stdout: "piped",
        stderr: "piped",
      });

      const { code } = await installCommand.output();

      if (code === 0) {
        return {
          method: "Lefthook",
          success: true,
          message: "Successfully configured Lefthook pre-commit hook",
        };
      } else {
        return {
          method: "Lefthook",
          success: false,
          message: "Failed to install Lefthook hooks",
        };
      }
    } catch (error) {
      return {
        method: "Lefthook",
        success: false,
        message: `Lefthook setup failed: ${error.message}`,
      };
    }
  }

  async setupPrecommitHooks(): Promise<HookSetupResult[]> {
    console.log("🔧 Setting up currency formatting pre-commit hooks...");

    // Check if we're in a Git repository
    if (!(await this.checkGitRepo())) {
      console.log("❌ Not in a Git repository - cannot setup pre-commit hooks");
      return [];
    }

    const results: HookSetupResult[] = [];

    // Try different methods
    console.log("\n📋 Attempting different pre-commit hook methods:");

    // Method 1: Direct Git hook (always try this)
    console.log("1. Setting up direct Git hook...");
    const gitResult = await this.setupDirectGitHook();
    results.push(gitResult);

    // Method 2: Husky (if available)
    console.log("2. Checking for Husky...");
    const huskyResult = await this.setupHusky();
    results.push(huskyResult);

    // Method 3: Lefthook (if available)
    console.log("3. Checking for Lefthook...");
    const lefthookResult = await this.setupLefthook();
    results.push(lefthookResult);

    return results;
  }

  formatResults(results: HookSetupResult[]): string {
    let output = "\n📊 Pre-commit Hook Setup Results:\n";
    output += "=".repeat(40) + "\n";

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (successful.length > 0) {
      output += "\n✅ Successfully configured:\n";
      for (const result of successful) {
        output += `  • ${result.method}: ${result.message}\n`;
      }
    }

    if (failed.length > 0) {
      output += "\n⚠️  Could not configure:\n";
      for (const result of failed) {
        output += `  • ${result.method}: ${result.message}\n`;
      }
    }

    output += "\n🎯 Recommendation:\n";
    if (successful.some((r) => r.method === "Direct Git Hook")) {
      output +=
        "✅ Direct Git hook is active and will prevent currency formatting violations\n";
    } else {
      output += "⚠️  No pre-commit hooks were successfully configured\n";
      output +=
        "Consider manually running 'deno task precommit:currency' before commits\n";
    }

    output += "\n🔧 Manual Testing:\n";
    output += "  • Test the hook: deno task precommit:currency\n";
    output += "  • Check violations: deno task check:currency\n";
    output += "  • Get migration help: deno task fix:currency\n";

    return output;
  }
}

// Main execution
if (import.meta.main) {
  const setup = new PrecommitHookSetup();

  try {
    const results = await setup.setupPrecommitHooks();
    console.log(setup.formatResults(results));

    const hasSuccessful = results.some((r) => r.success);
    if (!hasSuccessful) {
      console.log(
        "\n⚠️  Warning: No pre-commit hooks were successfully configured"
      );
      console.log(
        "Currency formatting violations may not be caught before commits"
      );
      Deno.exit(1);
    }
  } catch (error) {
    console.error("❌ Pre-commit hook setup failed:", error.message);
    Deno.exit(1);
  }
}

export { PrecommitHookSetup };
