import {Button, TextView, TextInput, contentView, ColumnLayout, WidgetCollection} from 'tabris';

contentView.set({layout: ColumnLayout.create()}).append(
  <WidgetCollection>
    <TextInput id='key' message='Key' text='Key'/>
    <TextInput id='value' message='Value' text='Value' onAccept={setValue}/>
    <Button text='Set' onSelect={setValue}/>
    <Button text='Get' onSelect={getValue}/>
    <Button text='Remove' onSelect={removeValue}/>
    <Button text='Clear' onSelect={clearAll}/>
    <Button text='List Keys' onSelect={showKeys}/>
    <TextView id='output'/>
  </WidgetCollection>
);

const keyField = contentView.find('#key').first(TextInput);
const valueField = contentView.find('#value').first(TextInput);
const output = contentView.find('#output').first(TextView);

function setValue() {
  localStorage.setItem(keyField.text, valueField.text);
  output.text = `"${keyField.text}" set to "${valueField.text}"`;
}

function getValue() {
  output.text = `"${keyField.text}" is "${localStorage.getItem(keyField.text)}"`;
}

function removeValue() {
  localStorage.removeItem(keyField.text);
  output.text = `Removed "${valueField.text}"`;
}

function clearAll() {
  localStorage.clear();
  output.text = 'localStorage is now empty';
}

function showKeys() {
  const keys = [];
  for (var i = 0; i < localStorage.length; i++) {
    keys.push(`"${localStorage.key(i)}"`);
  }
  output.text = keys.join(', ');
}
