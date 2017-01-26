var RowLayout = function(options) {
  this.margin = options.margin || 0;
  this.spacing = options.spacing || 0;
};

RowLayout.prototype = {

  attachTo: function(parent) {
    this.parent = parent;
    this.parent.on('addchild', onAddChild, this);
    this.parent.on('removechild', onRemoveChild, this);
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

function onAddChild(parent, child) {
  var children = parent.children();
  this.layoutChild(child, children.length - 1, children);
}

function onRemoveChild(parent, child, options) {
  var children = parent.children();
  var next = children[options.index];
  if (next) {
    this.layoutChild(next, options.index, children);
  }
}

module.exports = RowLayout;
