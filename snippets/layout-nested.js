// Create recursively nested layout hierarchy

var MARGIN = 8;

function createLayout(depth) {
  var composite = new tabris.Composite({
    left: MARGIN, top: ['prev()', MARGIN], right: MARGIN,
    background: '#f3f3f3'
  });

  var imageView = new tabris.ImageView({
    left: MARGIN, top: MARGIN, width: 56,
    image: 'images/target_200.png',
    background: '#aaaaaa'
  }).appendTo(composite);

  var innerComposite = new tabris.Composite({
    left: imageView, right: MARGIN, centerY: 0
  }).appendTo(composite);

  new tabris.TextView({
    left: MARGIN, right: 0,
    text: 'Title Text',
    font: 'bold 16px'
  }).appendTo(innerComposite);

  new tabris.TextView({
    left: MARGIN, right: 0, top: 'prev()',
    text: 'Body Text'
  }).appendTo(innerComposite);

  if (depth > 0) {
    createLayout(depth - 1).appendTo(innerComposite);
  }

  return composite;
}

createLayout(2).appendTo(tabris.ui.contentView);
