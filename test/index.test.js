import { assert } from "chai";
import * as fs from "node:fs";
import { VFile } from "vfile";
import { remark } from "remark";
import remarkD2, { DEFAULT_OPTIONS } from "../index.js";
import path from "node:path";
import { execSync } from "node:child_process";

describe("remark-d2", function () {
  describe("multi.md", function () {
    beforeEach(function () {
      execSync("rm -rf static/");
    });

    it("should compile a file normally", function () {
      const inputPath = "test/resources/multi.md";
      const inputPathNoExt = "test/resources/multi";
      const outputPath = "test/resources/multi.ex.standard.md";

      const input = new VFile({
        path: inputPath,
        value: fs.readFileSync(inputPath),
      });

      const plugOutput = remark().use(remarkD2).processSync(input).toString();

      assert.isTrue(
        fs.existsSync(path.join(DEFAULT_OPTIONS.compilePath, inputPathNoExt)),
        "image compile path exists",
      );

      assert.strictEqual(
        sanitize(plugOutput),
        sanitize(fs.readFileSync(outputPath).toString("utf-8")),
        "markdown replacement correct",
      );
    });

    it("should respect linkPath", function () {
      const inputPath = "test/resources/multi.md";
      const inputPathNoExt = "test/resources/multi";
      const outputPath = "test/resources/multi.ex.linkPath.md";

      const input = new VFile({
        path: inputPath,
        value: fs.readFileSync(inputPath),
      });

      const plugOutput = remark()
        .use(remarkD2, { linkPath: "/a/link/path" })
        .processSync(input)
        .toString();

      assert.isTrue(
        fs.existsSync(path.join(DEFAULT_OPTIONS.compilePath, inputPathNoExt)),
        "image compile path exists",
      );

      assert.strictEqual(
        sanitize(plugOutput),
        sanitize(fs.readFileSync(outputPath).toString("utf-8")),
        "markdown replacement correct",
      );
    });

    it("should translate .. in linkPath and compilePath", function () {
      const inputPath = "test/resources/multi.md";
      const inputPathNoExt = "test/resources/multi";
      const outputPath = "test/resources/multi.ex.linkPath.md";
      const compPath = "static/d2/cool/dream/..";

      const input = new VFile({
        path: inputPath,
        value: fs.readFileSync(inputPath),
      });

      const plugOutput = remark()
        .use(remarkD2, {
          compilePath: "static/d2/cool/dream/..",
          linkPath: "/a/link/super/../path",
        })
        .processSync(input)
        .toString();

      assert.isTrue(
        fs.existsSync(path.normalize(path.join(compPath, inputPathNoExt))),
        "image compile path exists",
      );

      assert.strictEqual(
        sanitize(plugOutput),
        sanitize(fs.readFileSync(outputPath).toString("utf-8")),
        "markdown replacement correct",
      );
    });
  });
});

function sanitize(s) {
  s = s.replace(/(\r\n|\n|\r)/gm, "");
  return s;
}
