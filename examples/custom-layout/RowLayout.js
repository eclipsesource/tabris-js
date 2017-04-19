var RowLayout = function(options) {
  this.margin = options.margin || 0;
  this.spacing = options.spacing || 0;
};

RowLayout.prototype = {

  attachTo: function(parent) {
    this.parent = parent;
    this.parent.on('addChild', onAddChild, this);
    this.parent.on('removeChild', onRemoveChild, this);
    return this;
  },

  layout: function() {
    var children = this.parent.children();
    children.forEach(this.layoutChild.bind(this));
  },

  layoutChild: function(child, index, children) {
    var prev = children[index - 1];
    child.left = this.margin;
    child.right = this.margin;
    child.top =  prev ? [prev, this.spacing] : this.margin;
  }

};

function onAddChild({target, child}) {
  var children = target.children();
  this.layoutChild(child, children.length - 1, children);
}

function onRemoveChild({target, index}) {
  var children = target.children();
  var next = children[index];
  if (next) {
    this.layoutChild(next, index, children);
  }
}

module.exports = RowLayout;
