"use strict";

import { visit } from "unist-util-visit";
import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";

const DEFAULT_OPTIONS = {
  compilePath: "static/d2",
  ext: "svg",
};

/**
 * Plugin for remark that compiles d2 code blocks in markdown.
 *
 * It creates a directory `${d2Path}/relative path from process.cwd to md file`
 * and creates files named `0.${d2Ext}` in that directory. **It expects a `VFile` with `path`
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
 * Becomes:
 *
 * `![](static/d2/some/relative/path/0.svg)`
 *
 * @param {Object} opts Plugin options accepting `d2Path` and `d2Ext`
 *
 * `d2Path` is by default `static/d2` (for Docusaurus) and `d2Ext` is by default `svg`
 *
 * @returns Modified AST
 */
export default function remarkD2(opts) {
  opts = { ...DEFAULT_OPTIONS, ...opts };
  let count = 0;

  return function transformer(tree, file) {
    let imgDir = opts.compilePath;
    if (file.path !== undefined || file.path !== null) {
      const { dir, name } = path.parse(file.path);
      const fPath = path.join(dir, name);
      if (path.isAbsolute(file.path)) {
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
      if (!lang || lang !== "d2") return;

      const imgPath = path.join(imgDir, `${count++}.${opts.ext}`);

      const d2 = spawn("d2", ["-", `${imgPath}`]);
      d2.stdin.write(value);
      d2.stdin.end();

      node.type = "image";
      node.url = imgPath;
    });
    return tree;
  };
}
