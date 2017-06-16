const document = {};

document.createElement = function(tagName) {
  return {tagName};
};

export default document;

export function addDocSupport (target) {
  target.document = document;
}
