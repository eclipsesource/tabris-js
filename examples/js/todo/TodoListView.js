/* global todo: true, Backbone: false, _: false */

todo = window.todo || {};

todo.TodoListView = Backbone.View.extend({

  events: {
    "DefaultSelection input": "createItem",
    "Selection clearCompletedButton": "clearCompleted",
    "Selection markAllCheckbox": "toggleAllComplete"
  },

  completedTemplate: _.template(todo.texts.clearCompleted, {variable: "done"}),

  remainingTemplate: _.template(todo.texts.remaining, {variable: "remaining"}),

  attributes: {title: todo.texts.listTitle, topLevel: true, background: "white"},

  initialize: function() {
    this.itemViews = {};
    this.createWidgets();
    this.listenTo(this.model, "add", this.addOne)
        .listenTo(this.model, "reset", this.addAll)
        .listenTo(this.model, "all", this.render);
    this.addAll();
    this.render();
  },

  createWidgets: function() {
    this.input = this.widget.append("Text", {
      style: ["SINGLE", "BORDER"],
      message: todo.texts.inputMessage
    });
    this.markAllCheckbox = this.widget.append("CheckBox", {
      text: todo.texts.markAllCheckbox,
      font: [[""], 16, true, false]
    });
    this.scrolledComposite = this.widget.append("ScrolledComposite", {style: ["V_SCROLL"]});
    this.container = this.scrolledComposite.append("Composite");
    this.clearCompletedButton = this.widget.append("Button");
    this.todoCountLabel = this.widget.append("Label", {markupEnabled: true});
    this.layout();
  },

  layout: function() {
    this.input.set("layoutData", {left: 10, right: 10, top: 10});
    this.markAllCheckbox.set("layoutData", {left: 10, right: 10, top: [this.input, 10]});
    this.clearCompletedButton.set("layoutData", {bottom: 10, left: [45, 0], right: 10});
    this.todoCountLabel.set("layoutData", {
      bottom: 10,
      left: 10,
      right: [this.clearCompletedButton, 0]
    });
    this.scrolledComposite.set("layoutData", {
      top: [this.markAllCheckbox, 10],
      left: 0,
      right: 0,
      bottom: [this.clearCompletedButton, 10]
    });
  },

  render: function() {
    var done = this.model.done().length;
    var remaining = this.model.remaining().length;
    var todoCountStr = this.remainingTemplate(remaining);
    var completedStr = this.completedTemplate(done);
    this.markAllCheckbox.set({visibility: !!this.model.length, selection: !remaining});
    this.todoCountLabel.set({visibility: !!this.model.length, text: todoCountStr});
    this.clearCompletedButton.set({text: completedStr, visibility: done > 0});
  },

  addOne: function(todoItem) {
    var previousView = this.getItemView(todoItem.getPrevious());
    var view = new todo.TodoItemView({
      model: todoItem,
      parentView: this,
      layoutData: {left: 0, top: previousView ? [previousView.widget, 0] : 0, right: 0}
    });
    this.itemViews[todoItem.cid] = view.render();
  },

  getItemView: function(todoItem) {
    return todoItem ? this.itemViews[todoItem.cid] : null;
  },

  addAll: function() {
    this.model.each(this.addOne, this);
  },

  createItem: function() {
    var inputText = this.input.get("text");
    if(inputText) {
      this.model.create({title: inputText});
      this.input.set("text", "");
    }
  },

  clearCompleted: function() {
    _.invoke(this.model.done(), "clear");
  },

  toggleAllComplete: function() {
    var checked = this.markAllCheckbox.get("selection");
    this.model.invoke("set", "done", checked);
  }

});
