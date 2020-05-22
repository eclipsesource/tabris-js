import {app, Button, contentView, Row, Stack, Switch, TextInput} from 'tabris';

const ShareInput = ({text, message, ...attributes}) =>
  <Row alignment='centerY' {...attributes}>
    <TextInput stretchX right={8} message={message} text={text}/>
    <Switch checked onCheckedChanged={(e) => e.target.parent().find(TextInput).only().enabled = e.value}/>
  </Row>;

contentView.append(
  <Stack stretch padding={16} spacing={16} alignment='stretchX'>
    <ShareInput id='title' message='Title' text='Share "Title"'/>
    <ShareInput id='text' message='Text' text='Share "text"'/>
    <ShareInput id='url' message='Url' text='http://example.com'/>
    <ShareInput class='file' message='File 1' text='resources/salad.jpg'/>
    <ShareInput class='file' message='File 2' text='resources/cover.jpg'/>
    <Button onSelect={share} text='Share'/>
  </Stack>
);

async function share() {
  try {
    const data = {};
    addText(data, 'title', '#title');
    addText(data, 'text', '#text');
    addText(data, 'url', '#url');
    await addFiles(data, 'files', '.file');
    const target = await app.share(data);
    console.log('Successfully shared', data, 'to', target);
  } catch (e) {
    console.error(e);
  }
}

function addText(data, id, selector) {
  const shareInput = $(selector).only(ShareInput);
  if (shareInput.find(Switch).only().checked) {
    data[id] = shareInput.find(TextInput).only().text;
  }
}

async function addFiles(data, id, selector) {
  const files = await Promise.all(
    $(selector)
      .filter(ShareInput)
      .filter(shareInput => shareInput.find(Switch).only().checked)
      .map(shareInput => shareInput.find(TextInput).only().text)
      .map(async path => {
        const blob = await (await fetch(path)).blob();
        const fileName = path.substring(path.lastIndexOf('/') + 1);
        return new File([blob], fileName, {type: blob.type});
      })
  );
  if (files.length > 0) {
    data[id] = files;
  }
}
