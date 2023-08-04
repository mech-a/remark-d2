"use strict";

import { visit } from "unist-util-visit";
import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";

export const DEFAULT_OPTIONS = {
  blockLang: "d2",
  compilePath: "static/d2",
  ext: "svg",
  linkPath: "/d2",
};

/**
 * Plugin for remark that replaces d2 code blocks with compiled d2 images.
 *
 * It creates a directory `${compilePath}/relative path from process.cwd to md file`
 * and creates files named `0.${ext}` in that directory. **It expects a `VFile` with `path`
 * defined and will not behave as expected if it is not defined.**
 *
 * It replaces the code blocks with language `d2` into image links:
 *
 * \```d2
 *
 * 1->2
 *
 * \```
 *
 * Is compiled into a file static/d2/some/relative/path/0.svg, and the code block becomes:
 *
 * `![](/d2/some/relative/path/0.svg)`
 *
 * @param {Object} opts Plugin options
 *
 * `blockLang` -- which block lang will get replaced, default: `d2`
 *
 * `compilePath` -- where compiled d2 paths are, default: `static/d2`
 *
 * `ext` -- d2 export file type, default: `svg` (note: `png` is slower)
 *
 * `linkPath` -- dir prepended to relative file path when constructing image URL for markdown,
 * e.g. `linkPath: /path/ex/` -> `[](/path/ex/some/relative/path/0.svg)`. default: `/d2`
 *
 * @returns Modified AST
 */
export default function remarkD2(opts) {
  opts = { ...DEFAULT_OPTIONS, ...opts };

  return function transformer(tree, file) {
    // number of d2 images
    let count = 0;

    let imgDir = opts.compilePath;
    let fPath = "";
    if (file.path !== undefined || file.path !== null) {
      const { dir, name } = path.parse(file.path);
      fPath = path.join(dir, name);
      if (path.isAbsolute(file.path)) {
        // convert to relative
        imgDir = path.join(imgDir, path.relative(process.cwd(), fPath));
      } else {
        imgDir = path.join(imgDir, fPath);
      }
    }

    if (!existsSync(imgDir)) {
      mkdirSync(imgDir, { recursive: true });
    }

    visit(tree, "code", (node) => {
      const { lang, value } = node;
      if (!lang || lang !== opts.blockLang) return;

      const imgCompilePath = path.join(imgDir, `${count}.${opts.ext}`);

      const d2 = spawn("d2", ["-", `${imgCompilePath}`]);
      d2.stdin.write(value);
      d2.stdin.end();

      node.type = "image";
      const urlPath = path.join(
        opts.linkPath,
        path.relative(process.cwd(), fPath),
        `${count}.${opts.ext}`,
      );
      node.url = urlPath;
      count++;
    });
    return tree;
  };
}
