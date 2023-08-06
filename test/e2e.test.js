import { assert } from "chai";
import * as fs from "node:fs";
import { VFile } from "vfile";
import { remark } from "remark";
import remarkD2 from "../src/index.js";
import path from "node:path";
import { execSync } from "node:child_process";
import { DEFAULT_OPTIONS } from "../src/defaults.js";

describe("E2E", function () {
  beforeEach(function () {
    execSync("rm -rf static");
  });

  describe("multi.md", function () {
    it("should compile a file normally", function () {
      standardRun("multi", "standard");
    });

    it("should respect linkPath", function () {
      standardRun("multi", "linkPath", { linkPath: "/a/link/path" });
    });

    it("should translate .. in linkPath and compilePath", function () {
      standardRun("multi", "linkPath", {
        compilePath: "static/d2/cool/dream/..",
        linkPath: "/a/link/super/../path",
      });
    });

    it("should convert all images to html if given htmlImage", function () {
      standardRun("multi", "htmlImage", { htmlImage: true });
    });
  });

  describe("attributes.md", function () {
    it("should selectively turn code blocks into html vs markdown images", function () {
      standardRun("attributes", "standard");
    });
  });

  describe("Edge Cases", function () {
    it("should compile file without path");
    it("should announce error if d2 can't compile");
    it("should error cleanly if d2 not installed");
    it("should not allow for an absolute compilePath unless unsafe is true");
  });
});

function sanitize(s) {
  s = s.replace(/(\r\n|\n|\r)/gm, "");
  return s;
}

function standardRun(fname, expected, plugOpts = {}) {
  const inputPath = `test/resources/${fname}.md`;
  const inputPathNoExt = `test/resources/${fname}`;
  const outputPath = `test/resources/${fname}.ex.${expected}.md`;

  const input = new VFile({
    path: inputPath,
    value: fs.readFileSync(inputPath),
  });

  const plugOutput = remark()
    .use(remarkD2, plugOpts)
    .processSync(input)
    .toString();

  plugOpts = { ...DEFAULT_OPTIONS, ...plugOpts };

  assert.isTrue(
    fs.existsSync(path.join(plugOpts.compilePath, inputPathNoExt)),
    "image compile path exists",
  );

  // TODO: why doesn't this work?
  // assert.isTrue(
  //   fs.existsSync(path.join(plugOpts.compilePath, inputPathNoExt, "0.svg")),
  //   "image exists",
  // );

  assert.strictEqual(
    sanitize(plugOutput),
    sanitize(fs.readFileSync(outputPath).toString("utf-8")),
    "markdown replacement correct",
  );
}
