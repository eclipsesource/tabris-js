// Download HTTP content using the fetch API
// See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

import {Button, TextView, ui} from 'tabris';

new Button({
  left: 16, right: 16, top: 'prev() 12',
  text: 'load'
}).on('select', loadData).appendTo(ui.contentView);

const textView = new TextView({
  left: 16, right: 16, top: 'prev() 12'
}).appendTo(ui.contentView);

function loadData() {
  fetch('https://freegeoip.net/json/')
    .then(response => checkStatus(response) && response.json())
    .then(json => textView.text = `You appear to be in ${json.city ? json.city : json.country_name}`)
    .catch(err => console.error(err)); // Never forget the final catch!
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}
