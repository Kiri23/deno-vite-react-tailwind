#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env

/// <reference lib="deno.ns" />

/**
 * Deployment script for Vite React app with Tailwind CSS v4
 * Based on Deno Deploy Vite tutorial: https://docs.deno.com/deploy/tutorials/vite/
 */

const PROJECT_NAME = Deno.env.get("PROJECT_NAME") || "vite-react-tailwind";

console.log(
  "🚀 Deploying Vite React app with Tailwind CSS v4 to Deno Deploy...",
);
console.log(`📦 Project name: ${PROJECT_NAME}`);

try {
  // Step 1: Build the project
  console.log("\n📦 Building project...");
  const buildCommand = new Deno.Command("deno", {
    args: ["task", "build"],
    stdout: "inherit",
    stderr: "inherit",
  });

  const buildResult = await buildCommand.output();
  if (!buildResult.success) {
    throw new Error(`Build failed with exit code: ${buildResult.code}`);
  }

  // Step 2: Check if dist directory exists
  console.log("\n📁 Checking build output...");
  try {
    await Deno.stat("./dist");
    console.log("✅ Build output found in ./dist");
  } catch {
    throw new Error(
      "Build output not found. Make sure the build completed successfully.",
    );
  }

  // Step 3: Deploy to Deno Deploy
  console.log("\n🌐 Deploying to Deno Deploy...");
  console.log(`📍 Entrypoint: jsr:@std/http@1/file-server`);
  console.log(`🏷️  Project: ${PROJECT_NAME}`);

  const deployCommand = new Deno.Command("deployctl", {
    args: [
      "deploy",
      "--project",
      PROJECT_NAME,
      "--entrypoint",
      "jsr:@std/http@1/file-server",
      "./dist",
    ],
    stdout: "inherit",
    stderr: "inherit",
    cwd: "./dist",
  });

  const deployResult = await deployCommand.output();

  if (deployResult.success) {
    console.log("\n🎉 Deployment successful!");
    console.log(
      `🌍 Your app should be available at: https://${PROJECT_NAME}.deno.dev`,
    );
    console.log("\n📝 Next steps:");
    console.log("   - Visit the URL above to see your app");
    console.log("   - Check Deno Deploy dashboard for logs and monitoring");
    console.log("   - Set up custom domain if needed");
  } else {
    throw new Error(`Deployment failed with exit code: ${deployResult.code}`);
  }
} catch (error) {
  console.error("\n❌ Deployment failed:", error instanceof Error ? error.message : String(error));
  console.log("\n🔧 Troubleshooting:");
  console.log(
    "   1. Make sure you have deployctl installed: deno install --allow-all --reload deployctl",
  );
  console.log("   2. Ensure you're logged in to Deno Deploy: deployctl login");
  console.log("   3. Check that the project name is correct");
  console.log("   4. Verify your build completed successfully");
  Deno.exit(1);
}
