# remark-d2

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) ![](https://github.com/mech-a/remark-d2/actions/workflows/ci.yml/badge.svg)

A [remark](https://github.com/remarkjs/remark) plugin that turns [d2](https://github.com/terrastruct/d2) code blocks into diagrams in Markdown files.

## Installation

Ensure that you have [d2](https://github.com/terrastruct/d2) installed and accessible on your `PATH`. Then, install using your favorite package manager:

`npm install remark-d2`

## Usage

In your [unified](https://github.com/unifiedjs/unified#plugin) or [remark](https://github.com/remarkjs/remark) toolchain, you can include the plugin. **Note that the VFile passed in must have a path.**

```js
import { remark } from "remark";
import remarkD2 from "remark-d2";
import { VFile } from "vfile";
import { readFileSync } from "node:fs";

const file = new VFile({
  path: "docs/intro.md",
  value: readFileSync("docs/intro.md"),
});

const output = await remark().use(remarkD2).processSync(file);

console.log(output.toString());
```

## Integrations

If you are using this with [Docusaurus](https://docusaurus.io), as Docusaurus does not currently support [ES Modules](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/), follow [the workaround mentioned in the Docusaurus docs](https://docusaurus.io/docs/markdown-features/plugins#installing-plugins):

```js
// in `docusaurus.config.js`

// wrap your config in a function:
async function createConfig() {
  // import the plugin here
  const d2 = (await import("remark-d2")).default;
  // return your config
  return {
    title: ...,
    tagline: ...,
    presets: [ // install here or in plugin config
      [
        '@docusaurus/preset-classic', // or any other
        {
          docs: {
            remarkPlugins; [d2],
          },
        },
      ],
    ],
  }
};

// export the function (will be automatically called)
module.exports = createConfig
```

## Configuration

Options can be passed in as a parameter in `.use`. They should be in an `Object` form.

- `compilePath`
  - Relative path where d2 diagrams are exported in respective folders
  - default: `static/d2`, compatible with Docusaurus
- `ext`
  - File extension for d2 diagrams: currently only `svg` or `png`
    - Note that `png` is slower
  - default: `svg`
- `linkPath`
  - Path prepended to the relative file path in the image URL
    - Useful if your build system removes the parent folder reference `assets/` or `static/`
  - default: `/d2`, compatible with Docusaurus

## Inspiration

[remark-simple-plantuml](https://github.com/akebifiky/remark-simple-plantuml)
