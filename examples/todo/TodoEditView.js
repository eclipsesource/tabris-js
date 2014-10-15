/* global todo: true, Backbone: false */

todo = window.todo || {};

todo.TodoEditView = Backbone.View.extend({

  events: {
    "Selection confirmationButton": "close"
  },

  attributes: {title: todo.texts.editItem, topLevel: false},

  initialize: function() {
    this.createWidgets();
  },

  createWidgets: function() {
    this.confirmationButton = tabris.create("Button", {text: "OK"});
    this.priorityCombo = tabris.create("Combo", {
      items: [todo.texts.priorityLow, todo.texts.priorityMedium, todo.texts.priorityHigh],
      selectionIndex: this.model.get("priority")
    });
    this.priorityLabel = tabris.create("Label", {
      text: todo.texts.priorityLabel,
      markupEnabled: true
    });
    this.inputText = tabris.create("Text", {text: this.model.get("title")});
    this.widget.append(this.confirmationButton, this.priorityCombo, this.priorityLabel,
      this.inputText);
    this.layout();
  },

  layout: function() {
    this.inputText.set("layoutData", {left: 10, right: 10, top: 5});
    this.priorityLabel.set("layoutData", {left: 15, width: 100, top: [this.inputText, 15]});
    this.priorityCombo.set("layoutData", {
      left: [this.priorityLabel, 5],
      right: 10,
      top: [this.inputText, 5]
    });
    this.confirmationButton.set("layoutData", {left: 10, right: 10, top: [this.priorityCombo, 5]});
  },

  close: function() {
    var editedTodo = this.inputText.get("text");
    if (editedTodo) {
      this.model.save({
        title: this.inputText.get("text"),
        priority: this.priorityCombo.get("selectionIndex")
      });
    } else {
      this.model.clear();
    }
    this.remove();
  }

});
