var textView = new tabris.TextView({
  left: 16, top: 16, right: 16,
  text: 'Lorem ipsum etiam maecenas lorem nunc tristique suscipit ligula mattis'  +
    'amet, metus fringilla dapibus cubilia eros curae egestas tincidunt pellentesque, ' +
    'consectetur inceptos scelerisque interdum quisque ligula cubilia ipsum eros' +
    'pulvinar magna curabitur ligula vehicula primis arcu dolor ut volutpat fusce' +
    'sit porta malesuada.\n\nLectus neque arcu imperdiet pulvinar varius lobortis' +
    'aenean cursus lacus rutrum viverra morbi, ligula cubilia proin malesuada ' +
    'tristique etiam blandit platea primis malesuada leo.'
}).appendTo(tabris.ui.contentView);

var spacingView = new tabris.TextView({
  bottom: 16, right: 16, width: 32
}).appendTo(tabris.ui.contentView);

var slider = new tabris.Slider({
  left: 16, bottom: 16, right: [spacingView, 16],
  minimum: 2,
  maximum: 50
}).on('change:selection', function(slider, selection) {
  var lineSpacing = selection / 10;
  textView.lineSpacing = lineSpacing;
  spacingView.text = lineSpacing;
}).appendTo(tabris.ui.contentView);

slider.selection = 15;
