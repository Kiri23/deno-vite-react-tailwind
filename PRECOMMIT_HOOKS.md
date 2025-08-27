# Pre-commit Hooks for Currency Formatting

This document explains how to set up pre-commit hooks to prevent currency formatting violations from being committed to the repository.

## Automatic Setup

Run the setup script to automatically configure pre-commit hooks:

```bash
deno run -A scripts/setup-precommit-hooks.ts
```

This script will attempt to set up hooks using multiple methods and report which ones were successful.

## Manual Setup Options

### Option 1: Direct Git Hook (Recommended)

This is the simplest method and works in any Git repository:

```bash
# The hook is already created at .git/hooks/pre-commit
# Make sure it's executable
chmod +x .git/hooks/pre-commit

# Test the hook
deno task precommit:currency
```

### Option 2: Using Husky

If you prefer using Husky for managing Git hooks:

```bash
# Install Husky
npm install --save-dev husky

# Initialize Husky
npx husky init

# Add the pre-commit hook
npx husky add .husky/pre-commit "deno task precommit:currency"
```

### Option 3: Using Lefthook

If you prefer using Lefthook:

```bash
# Install Lefthook (via Go, Homebrew, or other methods)
# See: https://github.com/evilmartians/lefthook

# Create lefthook.yml
cat > lefthook.yml << EOF
pre-commit:
  commands:
    currency-format:
      run: deno task precommit:currency
      fail_text: "Currency formatting violations detected. Fix them and try again."
      stage_fixed: false
EOF

# Install the hooks
lefthook install
```

## How It Works

The pre-commit hook runs `deno task precommit:currency` which:

1. **Scans staged files** for currency formatting violations
2. **Checks patterns** like:
   - Local `formatCurrency` functions outside the utility
   - Direct `Intl.NumberFormat` usage outside the utility
   - `.toFixed()` usage in components/services
   - Unicode minus signs (−, U+2212) instead of ASCII hyphen-minus (-, U+002D)
3. **Blocks the commit** if violations are found
4. **Provides clear instructions** on how to fix the issues

## What Happens When Violations Are Found

If the hook detects violations, you'll see output like:

```
❌ COMMIT BLOCKED: Found 2 currency formatting violation(s)

📁 src/components/MyComponent.tsx
  Line 42: Intl.NumberFormat usage
    Code: const formatter = new Intl.NumberFormat('en-US', { style: 'currency' });
    Fix:  Import formatCurrency from utils/formatting/currency.ts

🔧 How to fix:
  1. Make the suggested changes above
  2. Stage your fixes: git add <files>
  3. Run this check again: deno task precommit:currency
  4. Commit when all violations are resolved
```

## Manual Commands

You can run these commands manually at any time:

```bash
# Check all files for violations
deno task check:currency

# Get migration assistance
deno task fix:currency

# Test pre-commit hook without committing
deno task precommit:currency

# Run only on specific files
git add src/components/MyComponent.tsx
deno task precommit:currency
```

## Bypassing the Hook (Not Recommended)

In emergency situations, you can bypass the pre-commit hook:

```bash
git commit --no-verify -m "Emergency commit"
```

**Warning**: This bypasses all pre-commit checks and may introduce currency formatting violations that will fail in CI.

## Troubleshooting

### Hook Not Running

1. **Check if the hook exists and is executable**:

   ```bash
   ls -la .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```

2. **Test the hook manually**:

   ```bash
   .git/hooks/pre-commit
   ```

3. **Check Deno installation**:
   ```bash
   deno --version
   ```

### Hook Failing Unexpectedly

1. **Run the check manually**:

   ```bash
   deno task precommit:currency
   ```

2. **Check for script errors**:

   ```bash
   deno run -A ../scripts/precommit-currency-guard.ts
   ```

3. **Verify Git status**:
   ```bash
   git status
   git diff --cached --name-only
   ```

### False Positives

If the hook incorrectly flags legitimate code:

1. **Check if the file should be in the allowlist** (utils/formatting/currency.ts, **tests**, etc.)
2. **Review the pattern matching** in `scripts/precommit-currency-guard.ts`
3. **Consider updating the allowlist** if needed

## Integration with CI

The pre-commit hook works alongside the CI workflow:

- **Pre-commit**: Catches violations before they're committed
- **CI**: Double-checks all files and runs contract tests
- **Both**: Ensure consistent currency formatting standards

This layered approach provides maximum protection against currency formatting violations while maintaining developer productivity.

## Standards Reference

All currency formatting must follow the standards defined in:

- **foundation.md**: Core formatting rules and standards
- **utils/formatting/currency.ts**: Centralized formatting utility
- **.kiro/specs/currency-formatting-fix/**: Complete specification and design

The key requirements are:

- Use ASCII hyphen-minus (-, U+002D) for negative values
- Import formatCurrency from utils/formatting/currency.ts
- No local currency formatting functions
- No direct Intl.NumberFormat usage outside the utility
- No .toFixed() usage for currency values in components/services
