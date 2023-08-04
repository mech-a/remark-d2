import { assert } from "chai";
import * as fs from "node:fs";
import { VFile } from "vfile";
import { remark } from "remark";
import remarkD2, { DEFAULT_OPTIONS } from "../index.js";
import path from "node:path";

describe("remark-d2", function () {
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
});

function sanitize(s) {
  s = s.replace(/(\r\n|\n|\r)/gm, "");
  return s;
}
