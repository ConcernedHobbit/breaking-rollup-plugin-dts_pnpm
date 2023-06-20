# pnpm with rollup, rollup-plugin-dts and @floating-ui/react

## minimal breaking example

This is a minimal breaking example of using rollup-plugin-dts with pnpm and @floating-ui/react.

### Expectation

Running `cd packages/app && pnpm tsc` works without errors,

- creates `packages/app/src/index.js`
- creates `packages/app/src/Tooltip.js`.

Running `pnpm --filter='minimal-fui-app' build` works without errors,

- creates `packages/app/dist/index.d.ts`.

### Reality

Running `cd packages/app && pnpm tsc` works without errors,

- creates `packages/app/src/index.js`
- creates `packages/app/src/Tooltip.js`.

Running `pnpm --filter='minimal-fui-app' build` fails with the following error:

```
src/index.tsx → dist...
src/Tooltip.tsx(20,5): error TS2345: Argument of type '{ open: boolean; onOpenChange: React.Dispatch<React.SetStateAction<boolean>>; placement: string; whileElementsMounted: any; middleware: any[]; }' is not assignable to parameter of type 'Partial<UseFloatingOptions<any>>'.
  Object literal may only specify known properties, and 'open' does not exist in type 'Partial<UseFloatingOptions<any>>'.

[!] (plugin dts) RollupError: Failed to compile. Check the logs above.
```

### Steps to reproduce

```bash
git clone # this repo
cd # this repo
pnpm i

# first step, should work
cd packages/app
# use dry run here to avoid affecting second step.
# alternatively remove created .js files.
pnpm tsc --build --dry --verbose

# second step, should fail
pnpm build

# or from the root
cd ..
pnpm --filter='minimal-fui-app' build
```

### Relevant files

```bash
packages/app/
├── package.json      # contains dependencies, entry point, module type setting and build script
├── rollup.config.js  # sets input as src/index.tsx and output as dist/, format as esm, uses dts plugin without additional settings
├── tsconfig.json     # sets esModuleInterop to allow `import React from 'react'`, sets jsx to allow jsx syntax, sets moduleResolution to `node` to allow imports from node_modules, sets lib to `dom` and `es2015` for minimal functionality
```

#### Other files

```bash
node_modules/         # created by pnpm install
packages/app/
├── dist/             # would be created by rollup if it worked
├── node_modules/     # created by pnpm install
├── src/
│   ├── index.tsx     # entry point, exports Tooltip from Tooltip.tsx
│   └── Tooltip.tsx   # component, imports useFloating from @floating-ui/react. component copied from https://floating-ui.com/docs/tooltip CodeSandbox demo (@0.24.3)
.gitignore            # ignores node_modules and dist to avoid cluttering remote
package.json          # created by pnpm init, left as default
pnpm-lock.yaml        # created by pnpm install
pnpm-workspace.yaml   # created manually to recognize `packages/app` as a package
README.md             # this explanation
```

### Fix attempts

- _[rollup-plugin-dts #143](https://github.com/Swatinem/rollup-plugin-dts/issues/143)_ Attempted to set `preserveSymlinks` to `false` in tsconfig, dts plugin options and both.

### Found workarounds

- Set `pnpm-hoist-pattern[]="@floating-ui/*"` in `.npmrc` to shamefully hoist floating-ui packages.
  - This should not be necessary. Packages should be able to be resolved without this. `tsc` works without this.

### Further exploration

`@floating-ui` dependency could be removed from this recreation to narrow down the issue by

- creating one package with some base typing
- creating a second package that extends said typing
- importing the second package in the example app

However, this would require more time than I have available right now.  
Further boiling down could also be done by removing `react`, `jsx` etc. dependencies.
