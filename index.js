"use strict";

import { visit } from "unist-util-visit";
import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";

const DEFAULT_OPTIONS = {
  d2Path: "static/d2",
  d2Ext: "png",
};

export default function remarkD2(opts) {
  opts = { ...DEFAULT_OPTIONS, ...opts };
  let count = 0;

  return function transformer(tree, file) {
    const baseCompilePath = path.join(process.cwd(), opts.d2Path);
    let imgDir;
    if (file.path !== undefined || file.path !== null) {
      const { dir, name } = path.parse(file.path);
      const fPath = path.join(dir, name);
      if (path.isAbsolute(file.path)) {
        imgDir = path.join(
          baseCompilePath,
          path.relative(process.cwd(), fPath),
        );
      } else {
        imgDir = path.join(baseCompilePath, fPath);
      }
    } else {
      imgDir = baseCompilePath;
    }

    if (!existsSync(imgDir)) {
      mkdirSync(imgDir, { recursive: true });
    }

    visit(tree, "code", (node) => {
      const { lang, value } = node;
      if (!lang || lang !== "d2") return;

      const imgPath = path.join(imgDir, `${count++}.${opts.d2Ext}`);

      const d2 = spawn("d2", ["-", `${imgPath}`]);
      d2.stdin.write(value);
      d2.stdin.end();

      node.type = "image";
      node.url = imgPath;
    });
    return tree;
  };
}
