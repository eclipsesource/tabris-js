/*globals RowLayout: true */

(function() {

  RowLayout = function(options) {
    this.margin = options.margin || 0;
    this.spacing = options.spacing || 0;
  };

  RowLayout.prototype = {

    attachTo: function(parent) {
      this.parent = parent;
      this.parent.on("addchild", onAddChild, this);
      this.parent.on("removechild", onRemoveChild, this);
      return this;
    },

    layout: function() {
      var children = this.parent.children();
      children.forEach(this.layoutChild.bind(this));
    },

    layoutChild: function(child, index, children) {
      var prev = children[index - 1];
      child.set("layoutData", {
        left: this.margin,
        right: this.margin,
        top: prev ? [prev, this.spacing] : this.margin
      });
    }

  };

  function onAddChild(child, parent) {
    var children = parent.children();
    this.layoutChild(child, children.length - 1, children);
  }

  function onRemoveChild(child, parent, options) {
    var children = parent.children();
    var next = children[options.index];
    if (next) {
      this.layoutChild(next, options.index, children);
    }
  }

}());
