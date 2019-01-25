import {Composite, ImageView, TextView, contentView} from 'tabris';

// Create recursively nested layout hierarchy

const MARGIN = 8;

function createLayout(depth) {
  const composite = new Composite({
    left: MARGIN, top: ['prev()', MARGIN], right: MARGIN,
    background: '#f3f3f3'
  });

  const imageView = new ImageView({
    left: MARGIN, top: MARGIN, width: 56,
    image: 'resources/target_200.png',
    background: '#aaaaaa'
  }).appendTo(composite);

  const innerComposite = new Composite({
    left: imageView, right: MARGIN, centerY: 0
  }).appendTo(composite);

  new TextView({
    left: MARGIN, right: 0,
    text: 'Title Text',
    font: 'bold 16px'
  }).appendTo(innerComposite);

  new TextView({
    left: MARGIN, right: 0, top: 'prev()',
    text: 'Body Text'
  }).appendTo(innerComposite);

  if (depth > 0) {
    createLayout(depth - 1).appendTo(innerComposite);
  }

  return composite;
}

createLayout(2).appendTo(contentView);
