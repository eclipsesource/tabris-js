/* global todo: true, Backbone: false */

todo = window.todo || {};

todo.TodoItem = Backbone.Model.extend({

  defaults: function() {
    return {
      order: this.collection.nextOrder(),
      priority: todo.PRIORITY_MEDIUM,
      done: false
    };
  },

  getPrevious: function() {
    return this.collection.at(this.collection.indexOf(this) - 1);
  },

  getNext: function() {
    return this.collection.at(this.collection.indexOf(this) + 1);
  },

  clear: function() {
    this.trigger("clear"); // needed to exclude todoItemView from layout before destroy
    this.destroy();
  }

});

todo.PRIORITY_LOW = 0;
todo.PRIORITY_MEDIUM = 1;
todo.PRIORITY_HIGH = 2;