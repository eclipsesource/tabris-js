var page = new tabris.Page({
  title: "Storing data on the device",
  topLevel: true
});

var keyTextView = new tabris.TextView({
  layoutData: {left: 10, top: 20},
  text: "Key:"
}).appendTo(page);

var keyField = new tabris.TextInput({
  layoutData: {left: 60, baseline: keyTextView, right: 10},
  text: "foo"
}).appendTo(page);

var valueTextView = new tabris.TextView({
  layoutData: {left: 10, top: [keyField, 20]},
  text: "Value:"
}).appendTo(page);

var valueField = new tabris.TextInput({
  layoutData: {left: 60, baseline: valueTextView, right: 10},
  text: localStorage.getItem("foo") || "bar"
}).appendTo(page);

new tabris.Button({
  layoutData: {left: 10, right: "66% 5", top: [valueTextView, 20]},
  text: "Set"
}).on("select", function() {
  if (!keyField.text) {
    console.error("The key cannot be empty.");
  } else if (!valueField.text) {
    console.error("The value cannot be empty.");
  } else {
    localStorage.setItem(keyField.text, valueField.text);
    valueField.set("text", "");
  }
}).appendTo(page);

new tabris.Button({
  layoutData: {left: "33% 5", right: "33% 5", top: [valueTextView, 20]},
  text: "Get"
}).on("select", function() {
  if (!keyField.text) {
    console.error("The key cannot be empty.");
  } else {
    valueField.set("text", "");
    valueField.set("text", localStorage.getItem(keyField.text));
  }
}).appendTo(page);

new tabris.Button({
  layoutData: {left: "66% 5", right: 10, top: [valueTextView, 20]},
  text: "Remove"
}).on("select", function() {
  localStorage.removeItem(keyField.text);
  valueField.set("text", "");
}).appendTo(page);

page.open();
