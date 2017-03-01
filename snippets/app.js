// React to application hibernation, resume and back navigation

var paused = 0;

createTextView('Id', tabris.app.id);
createTextView('Version', tabris.app.version);
createTextView('Version Code', tabris.app.versionCode);

new tabris.Composite({
  left: 0, top: 'prev() 16', right: 0,
  height: 1,
  background: '#E8E8E8'
}).appendTo(tabris.ui.contentView);

var label = new tabris.TextView({
  left: 16, top: 'prev() 16', right: 16,
  font: 'italic 14px',
  text: 'You can press home and reopen the app to it to see how long you were away.'
}).appendTo(tabris.ui.contentView);

new tabris.Button({
  left: 16, right: 16, bottom: 16,
  text: 'Reload app'
}).on('select', function() {
  tabris.app.reload();
}).appendTo(tabris.ui.contentView);


tabris.app.on('pause', function() {
  paused = Date.now();
}).on('resume', function() {
  if (paused > 0) {
    var diff = Date.now() - paused;
    label.text = ' Welcome back!\n You were gone for ' + (diff / 1000).toFixed(1) + ' seconds.';
  }
});

tabris.app.on('backnavigation', function(event) {
  event.preventDefault();
  label.text = 'Back navigation prevented.';
});

function createTextView(key, value) {
  var composite = new tabris.Composite({left: 16, top: 'prev() 8', right: 16}).appendTo(tabris.ui.contentView);
  new tabris.TextView({text: key}).appendTo(composite);
  new tabris.TextView({text: value, left: 128}).appendTo(composite);
}
