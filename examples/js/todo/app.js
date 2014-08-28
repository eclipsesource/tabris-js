/*
 * Adapted from the original Todo example: http://documentcloud.github.io/backbone/docs/todos.html
 */

/* global todo: true */
/* jshint nonew: false */

(function(){

  tabris.load(function() {
    new todo.TodoListView({model: createModel()});
  });

  var createModel = function() {
    var todos = new todo.TodoList();
    todos.create({title: "Buy milk"});
    todos.create({title: "Buy carrots"});
    todos.create({title: "Buy tomatoes"});
    todos.create({title: "Drink beer", priority: todo.PRIORITY_HIGH});
    todos.create({title: "Go to sleep", priority: todo.PRIORITY_LOW});
    return todos;
  };

}());