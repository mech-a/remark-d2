import { assert } from "chai";
import { parseImageAttributeString } from "../src/util.js";

describe("utils.js", function () {
  it("#parseImageAttributeString(s)", function () {
    assert.deepEqual(
      parseImageAttributeString("width=30px;height=20px"),
      {
        width: "30px",
        height: "20px",
      },
      "normally makes object",
    );

    assert.deepEqual(
      parseImageAttributeString("w=30px;h=20px"),
      {
        width: "30px",
        height: "20px",
      },
      "expands short hand terms",
    );

    assert.deepEqual(
      parseImageAttributeString("w=30px;h=20px;abra=cadabra"),
      {
        width: "30px",
        height: "20px",
        abra: "cadabra",
      },
      "allows for any keys",
    );
  });
});
