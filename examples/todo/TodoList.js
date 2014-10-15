/* global todo: true, Backbone: false */

todo = window.todo || {};

todo.TodoList = Backbone.Collection.extend({

  url: "http://192.168.x.xxx:3000",

  model: todo.TodoItem,

  done: function() {
    return this.where({
      done: true
    });
  },

  remaining: function() {
    return this.where({
      done: false
    });
  },

  nextOrder: function() {
    if (!this.length) {
      return 1;
    }
    return this.last().get("order") + 1;
  },

  comparator: "order"

});
