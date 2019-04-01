import {Button, CheckBox, contentView, Stack, device} from 'tabris';

// Create multiple buttons with various styles

contentView.append(
  <Stack spacing={4} alignment='centerX' top={16} left={16} right={16}>
    <Button style='default' text='Default'/>
    <Button style='elevate' text='Elevate'/>
    <Button style='outline' text='Outline'/>
    <Button style='flat' text='Flat'/>
    <Button style='text' text='Text'/>
  </Stack>,
  <Stack top='prev() 16' left='0' right='0' alignment='stretchX' padding={16}>
    <CheckBox text='Tint background' onCheckedChanged={tintBackground}/>
    <CheckBox text='Tint textColor' onCheckedChanged={tintTextColor}/>
    <CheckBox text='Tint stroke' onCheckedChanged={tintStrokeColor}/>
    <CheckBox text='Wider stroke' onCheckedChanged={toggleStrokeWidth}/>
    <CheckBox text='Wider corner radius' onCheckedChanged={toggleCornerRadius}/>
    <CheckBox text='Buttons enabled' checked onCheckedChanged={toggleEnablement}/>
    <CheckBox text='Show icons' onCheckedChanged={toggleImage}/>
  </Stack>
);

function tintBackground({value: checked}) {
  contentView.find(Button).forEach((button) => button.background = checked ? 'red' : 'initial');
}

function tintTextColor({value: checked}) {
  contentView.find(Button).forEach((button) => button.textColor = checked ? 'blue' : 'initial');
}

function tintStrokeColor({value: checked}) {
  contentView.find(Button).forEach((button) => button.strokeColor = checked ? 'green' : 'initial');
}

function toggleStrokeWidth({value: checked}) {
  contentView.find(Button).forEach((button) => button.strokeWidth = checked ? 4 : 1);
}

function toggleEnablement({value: checked}) {
  contentView.find(Button).forEach((button) => button.enabled = checked);
}

function toggleCornerRadius({value: checked}) {
  contentView.find(Button).forEach((button) => button.cornerRadius = checked ? 20 : 4);
}

function toggleImage({value: checked}) {
  contentView.find(Button).forEach((button) => {
    button.image = checked ? device.platform === 'Android'
      ? 'resources/settings-white-24dp@3x.png'
      : 'resources/settings-black-24dp@3x.png' : null;
  });
}
