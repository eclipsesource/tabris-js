import Ui from './widgets/Ui';

const document = {};

document.createElement = function(tagName) {
  return {tagName};
};

document.querySelector = function (find) {
  return Ui.contentView.find(find);
};

export default document;

export function addDocSupport (target) {
  target.document = document;
}
