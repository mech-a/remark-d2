"use strict";

import { visit } from "unist-util-visit";
import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";

export const DEFAULT_OPTIONS = {
  compilePath: "static/d2",
  ext: "svg",
  linkPath: "/d2",
};

/**
 * Plugin for remark that replaces d2 code blocks with compiled d2 images.
 *
 * **NOTE: remarkD2 expects a `VFile` with `path` defined and will not behave as expected if it is not defined.**
 *
 * `remarkD2` creates a directory `${compilePath}/relative path from process.cwd() to md file`.
 * The relative path includes the name of the markdown file itself, but not the extension.
 * Then, it compiles and saves all d2 diagrams with the specified extension `ext` in that directory. It will then replace
 * the code blocks with a Image nodes: `![](${linkPath}/relative path from process.cwd() to md file/0.${ext})`
 *
 * For example, assuming we have a file `some/path/ex.md` containing:
 *
 * \```d2
 *
 * 1->2
 *
 * \```
 *
 * `remarkD2` compiles this into a file static/d2/some/path/ex/0.svg, and the code block becomes:
 *
 * `![](/d2/a/path/ex/0.svg)`
 *
 * @param {Object} opts Plugin options
 *
 * `compilePath` -- where compiled d2 paths are, default: `static/d2`
 *
 * `ext` -- d2 export file type, default: `svg` (note: `png` is slower)
 *
 * `linkPath` -- path prepended to relative file path when constructing image URL for markdown,
 * e.g. `linkPath: /path/ex/` -> `[](/path/ex/some/relative/path/0.svg)`. default: `/d2`
 *
 *
 * @returns Modified AST
 */
export default function remarkD2(opts) {
  opts = { ...DEFAULT_OPTIONS, ...opts };
  opts.compilePath = path.normalize(opts.compilePath);
  opts.linkPath = path.normalize(opts.linkPath);

  return function transformer(tree, file) {
    let count = 0;
    let relDir = "";
    if (file.path !== undefined || file.path !== null) {
      const { dir, name } = path.parse(file.path);
      relDir = path.join(dir, name);
      relDir = path.isAbsolute(file.path)
        ? path.relative(process.cwd(), relDir)
        : relDir;
    }
    relDir = path.normalize(relDir);
    const compileDir = path.join(opts.compilePath, relDir);
    const linkDir = path.join(opts.linkPath, relDir);

    if (!existsSync(compileDir)) {
      mkdirSync(compileDir, { recursive: true });
    }

    visit(tree, "code", (node) => {
      const { lang, value } = node;
      if (!lang || lang !== "d2") return;

      const image = `${count}.${opts.ext}`;

      const d2 = spawn("d2", ["-", `${path.join(compileDir, image)}`]);
      d2.stdin.write(value);
      d2.stdin.end();

      node.type = "image";
      const urlPath = path.join(linkDir, image);
      node.url = urlPath;
      count++;
    });
    return tree;
  };
}
