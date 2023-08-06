# remark-d2

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) ![](https://github.com/mech-a/remark-d2/actions/workflows/ci.yml/badge.svg)

A [remark](https://github.com/remarkjs/remark) plugin that turns [d2](https://github.com/terrastruct/d2) code blocks into diagrams in Markdown files.

https://github.com/mech-a/remark-d2/assets/11798509/e6c6276f-8839-46af-b29e-243f31cdce24

## Features

Fast resizing and titling: metadata tags like `width`, `position`, and `title` are compiled:

<!-- prettier-ignore -->
````md
      ┎─────── abbrev. ───────┒
```d2 w=150px;position=center;a="test"
d2->is->fast
```

becomes:

<img alt="test" position="center" width="150px" src="/d2/docs/features/0.svg" />
````

<details>
<summary>All accepted metadata tags & abbreviations</summary>

- `width`, `w`
- `height`, `h`
- `position`, `p`
- `title`, `t`
- `alt`, `a`

</details>

Change default d2 compile settings and default image attributes easily

```js
const output = await remark()
  .use(remarkD2, {
    defaultD2Opts: ["-t 101", "--dark-theme 200"],
    //            "Orange Creamsicle" on light mode,
    //               "Dark Mauve" on dark mode
    defaultImageAttrs: {
      title: "Wow, colors!",
      alt: "Colorful Diagram",
      width: "700px",
    },
  })

  .processSync(file);
```

gets you

<img alt="Colorful Diagram" title="Wow, colors!" width="700px" src="docs/defaults.svg" />

Try changing color modes and see!

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

remark-d2 is compatible with [Docusaurus](https://docusaurus.io) out of the box. However, as Docusaurus does not currently support [ES Modules](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/), to install remark-d2 follow [the workaround mentioned in the Docusaurus docs](https://docusaurus.io/docs/markdown-features/plugins#installing-plugins):

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
        '@docusaurus/preset-classic', // or any other preset
        {
          docs: {
            remarkPlugins; [d2], // works out of the box
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
    - Note that `png` is slower and does not support automatic light/dark mode
  - default: `svg`
- `linkPath`
  - Path prepended to the relative file path in the image URL
    - Useful if your build system removes the parent folder reference `assets/` or `static/`
  - default: `/d2`, compatible with Docusaurus
- `defaultD2Opts`
  - Options passed to d2 CLI. See `man d2` for more.
  - default: `["-t=100", "--dark-theme=200"]`
- `htmlImage`
  - If `true`, replace all code blocks with HTML `<img />` tags instead of Markdown images
    - If a code block has metadata, regardless of `htmlImage`'s value, it will be an HTML image
  - default: `false`
- `defaultImageAttrs`
  - Default attributes for images
    - Only the keys `title` and `alt` apply to both Markdown and HTML images. All other attributes are only used if it is an HTML image.
  - default: `{ alt: "d2 diagram" }`

## Inspiration

[remark-simple-plantuml](https://github.com/akebifiky/remark-simple-plantuml)
