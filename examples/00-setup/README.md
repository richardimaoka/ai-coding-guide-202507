# 00-setup: ESModule + Vitest Setup

This example demonstrates how to set up a basic Node.js project with ESModules and Vitest for testing.

## Setup Steps

1. **Initialize the project directory**
   ```bash
   mkdir 00-setup
   cd 00-setup
   ```

2. **Create package.json with ESModule configuration**
   ```bash
   npm init -y
   ```
   
   Then edit `package.json` to add:
   - `"type": "module"` for ESModule support
   - Test script: `"test": "vitest run"`
   - Vitest dev dependency

3. **Install Vitest**
   ```bash
   pnpm add -D vitest
   ```

4. **Create Vitest configuration**
   Create `vitest.config.js`:
   ```javascript
   import { defineConfig } from 'vitest/config'
   
   export default defineConfig({
     test: {
       environment: 'node'
     }
   })
   ```

5. **Create source directory and test file**
   ```bash
   mkdir src
   ```
   
   Create `src/index.test.ts` with basic tests.

6. **Run tests**
   ```bash
   pnpm test
   ```

## File Structure

```
00-setup/
├── package.json          # Project configuration with ESModule support
├── vitest.config.js      # Vitest configuration
├── src/
│   └── index.test.ts     # Basic test file
└── README.md            # This file
```

## Key Features

- **ESModule support**: `"type": "module"` in package.json
- **TypeScript**: Vitest supports TypeScript out of the box
- **Modern testing**: Uses Vitest for fast, modern testing experience
- **Simple setup**: Minimal configuration required