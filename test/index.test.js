import { remark } from "remark";
import remarkD2 from "../index.js";
import * as fs from "node:fs";
import { VFile } from "vfile";

const fPath = "test/resources/multi.md";

const file = new VFile({
  path: fPath,
  value: fs.readFileSync(fPath),
});

const output = remark().use(remarkD2).processSync(file).toString();

console.log(output);
