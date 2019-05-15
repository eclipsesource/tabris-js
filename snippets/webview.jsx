import {TextInput, WebView, contentView} from 'tabris';

contentView.append(
  <$>
    <TextInput left={8} right={8} message='Enter URL...' onAccept={loadUrl}>
      http://en.wikipedia.org
    </TextInput>
    <WebView stretchX bottom top='prev()' />
  </$>
);

function loadUrl() {
  $(WebView).only().url = $(TextInput).only().text;
}

loadUrl();
