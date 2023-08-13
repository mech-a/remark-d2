import { SHORT_HAND } from "./defaults.js";

/**
 * Returns HTML Image representation from image description string
 *
 * Will expand tokens using {@link SHORT_HAND}:
 *
 * `w=30px;h=20px` -> `{ width: '30px', height: '20px' }`
 *
 * @param {string} s
 * @returns {Object} HTML Image Object with keys as attributes
 */
export function parseImageAttributeString(s) {
  if (!s) {
    return {};
  }

  let image = {};
  let tokens = String(s).split(";");
  tokens = tokens.map((e) => {
    return e.split("=");
  });
  for (let [attr, val] of tokens) {
    attr = attr in SHORT_HAND ? SHORT_HAND[attr] : attr;
    image[attr] = val;
  }
  return image;
}

/**
 * Return an HTML image string populated with `attrs`
 *
 * @param {*} attrs
 * @returns HTML image string
 */
export function createImage(attrs) {
  let s = [];
  for (const [k, v] of Object.entries(attrs)) {
    s.push(`${k}="${v}"`);
  }
  return `<img ${s.join(" ")} />`;
}
