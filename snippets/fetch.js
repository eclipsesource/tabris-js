// Download HTTP content using the fetch API
// See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

import {Button, TextView, contentView} from 'tabris';

new Button({
  left: 16, right: 16, top: 'prev() 12',
  text: 'Show my location'
}).on('select', loadData).appendTo(contentView);

const textView = new TextView({
  left: 16, right: 16, top: 'prev() 12'
}).appendTo(contentView);

function loadData() {
  fetch('http://ip-api.com/json')
    .then(response => checkStatus(response) && response.json())
    .then(json => textView.text = `You appear to be in ${json.city ? json.city : json.country}`)
    .catch(err => console.error(err)); // Never forget the final catch!
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}
