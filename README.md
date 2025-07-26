# Vite + Deno + React + TypeScript + Tailwind CSS v4

## Running

You need to have Deno v2.0.0 or later installed to run this repo.

Start a dev server:

```
$ deno task dev
```

## Build

Build production assets:

```
$ deno task build
```

## Deploy

This project is configured for deployment to Deno Deploy using the [Vite tutorial](https://docs.deno.com/deploy/tutorials/vite/).

### Prerequisites

1. Install deployctl:
```bash
deno install --allow-all --reload deployctl
```

2. Login to Deno Deploy:
```bash
deployctl login
```

### Deployment Options

#### Option 1: Quick Deploy (Default Project Name)
```bash
deno task deploy
```

#### Option 2: Custom Project Name
```bash
PROJECT_NAME=my-custom-project deno task deploy:custom
```

#### Option 3: Using Deployment Script (Recommended)
```bash
deno task deploy:script
```

The deployment script provides:
- ✅ Automatic build process
- ✅ Error handling and validation
- ✅ Clear success/failure messages
- ✅ Troubleshooting guidance

### Deployment Configuration

- **Entrypoint**: `jsr:@std/http@1/file-server`
- **Root Directory**: `dist` (built files)
- **Framework Preset**: Vite
- **Build Step**: `deno task build`

### After Deployment

Your app will be available at: `https://[project-name].deno.dev`
