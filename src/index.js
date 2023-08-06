"use strict";

import { visit } from "unist-util-visit";
import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { createImage, parseImageAttributeString } from "./util.js";
import { DEFAULT_OPTIONS } from "./defaults.js";

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
 * Example: assume we have a file `some/path/ex.md` containing:
 * ````
 * # Sample Markdown
 *
 * ```d2
 * 1->2
 * ```
 * ````
 *
 * `remarkD2` compiles the d2 code block into a file `static/d2/some/path/ex/0.svg`, and the code block becomes:
 *
 * ````
 * # Sample Markdown
 *
 * ![](/d2/some/path/ex/0.svg)
 * ````
 *
 * @param {Object} opts Plugin options.
 *
 * `compilePath` -- relative path where compiled d2 files are, default: `static/d2`
 *   - **NOTE: this is passed into the shell and can cause arbitrary command execution.**
 *   - Thus, if `compilePath` is an absolute path, it will error unless `unsafe` is set to true.
 *
 * `unsafe` -- allows for `compilePath` to be an absolute path, default: `false`
 *
 * `ext` -- d2 export file type, default: `svg`
 *   - Note: `png` is slower and doesn't support automatic light mode/dark mode rendering
 *
 * `linkPath` -- path prepended to relative file path when constructing image URL for markdown, default: `/d2`
 *   - Example: `linkPath: /path/ex/` -> `![](/path/ex/some/relative/path/0.svg)`
 *
 * `defaultD2Opts` -- options passed to d2 CLI, default: `["-t=100", "--dark-theme=200"]`
 *   - **NOTE: this is passed into the shell and can cause arbitrary command execution.**
 *
 * `htmlImage` -- replace code blocks with `<img /> tag` instead of `![]()`, default: `false`
 *   - Is ignored on a code block if the code block has any metadata (content after language selection)
 *
 * `defaultImageAttrs` -- default attributes for the image, default: `{alt: "d2 diagram"}`
 *   - The keys `title` and `alt`, if defined, are used for both the Markdown and HTML image types
 *   - All other attributes are only used if it is an HTML image
 *
 *
 * @returns Modified AST
 */
export default function remarkD2(opts) {
  opts = { ...DEFAULT_OPTIONS, ...opts };
  // Verify options
  if (path.isAbsolute(opts.compilePath) && !opts.unsafe) {
    console.error(
      "remark-d2: compilePath is an absolute path and unsafe is false. No transformation done",
    );
    return (tree) => {
      tree;
    };
  }

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
      const { lang, value, meta } = node;
      if (!lang || lang !== "d2") return;
      const image = `${count}.${opts.ext}`;

      // TODO: if failing, report!
      // if errcode 1, dump stdout
      const d2 = spawn("d2", [
        ...opts.defaultD2Opts,
        "-",
        `${path.join(compileDir, image)}`,
      ]);
      d2.stdin.write(value);
      d2.stdin.end();

      const htmlImage = opts.htmlImage || meta;
      const urlPath = path.join(linkDir, image);

      if (htmlImage) {
        const htmlImgObj = {
          ...opts.defaultImageAttrs,
          ...parseImageAttributeString(meta),
          src: urlPath,
        };
        node.type = "html";
        node.value = createImage(htmlImgObj);
      } else {
        node.type = "image";
        node.url = urlPath;
        node.alt = opts.defaultImageAttrs.alt;
        node.title = opts.defaultImageAttrs.title;
      }
      count++;
    });
    return tree;
  };
}
