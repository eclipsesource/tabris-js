import {WidgetCollection, TextInput, Composite, Widget} from 'tabris';

class Foo extends Composite {
  public bar: string;
}

const textInputCallback: (widget: Widget, index: number, collection: WidgetCollection<TextInput>) => void = () => {};
let textInput = new TextInput();
let widgetCollection: WidgetCollection = new WidgetCollection([new Composite()]);
let textInputCollection: WidgetCollection<TextInput> = new WidgetCollection([new TextInput()]);
let fooCollection: WidgetCollection<Foo> = new WidgetCollection([new Foo()]);

// Untyped WidgetCollection refuses to set readonly property
widgetCollection.set({cid: 'cid'});

// Foo is not TextInput
fooCollection.set({text: 'text'});
textInputCollection = fooCollection.appendTo(new Composite());
textInputCollection = widgetCollection.off('event', function() {});
textInputCollection = widgetCollection.on('event', function() {});
textInputCollection = widgetCollection.once('event', function() {});
fooCollection.forEach(textInputCallback);
textInput = fooCollection.last();
textInput = fooCollection.last('selector');

/*Expected
(14,
(18,
(19,
(20,
(21,
(22,
(23,
(24,
Type 'Foo' is not assignable to type 'TextInput'.
*/