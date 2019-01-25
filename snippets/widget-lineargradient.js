import {TextView, Composite, ScrollView, WebView, contentView} from 'tabris';

const BACKGROUNDS = [
  'linear-gradient(#f00, #00f)',
  'linear-gradient(red, blue, green, white, yellow)',
  'linear-gradient(to left, red, blue 50%, red, purple, green 100%)',
  'linear-gradient(0deg, red 50%, green, white, blue)',
  'linear-gradient(-90deg, red, green 15%, white, blue 70%)',
  'linear-gradient(200deg, yellow 0%, silver 30%, blue 150%)',
  'linear-gradient(145deg, red 0%, fuchsia 50%, blue 150%)',
  'linear-gradient(145deg, red 0%, green 50%, lime 150%)',
  'linear-gradient(145deg, lime -50%, purple 50%, yellow 150%)',
  'linear-gradient(80deg, red -20%, blue 50%, green 180%)',
  'linear-gradient(400deg, red, blue 50%)',
  'linear-gradient(to right, red -30%, blue 50%)',
  'linear-gradient(0deg, red 0%, red 25%, teal 25%, teal 50%, black 50%, black 75%, green 75%)',
  'linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%)'
];

const scrollView = new ScrollView({
  left: 0, right: 0, top: 0, bottom: 0
}).appendTo(contentView);

new TextView({
  left: 16, top: 16, right: ['50%', 16],
  text: 'Native',
  alignment: 'center',
  font: 'black 16px'
}).appendTo(scrollView);

new TextView({
  left: ['50%', 16], top: 16, right: 16,
  text: 'WebView',
  alignment: 'center',
  font: 'black 16px'
}).appendTo(scrollView);

BACKGROUNDS.forEach((gradient) => {
  const composite = new Composite({
    left: 0, right: 0, top: 'prev() 16',
    padding: {bottom: 8}
  }).appendTo(scrollView);
  new Composite({
    left: 16, top: 0, right: ['50%', 8], height: 96,
    background: gradient
  }).appendTo(composite);
  new WebView({
    left: ['50%', 8], top: 0, right: 16, height: 96,
    html: `<html>
             <head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
             <body style="background:${gradient}" />
           </html>`
  }).appendTo(composite);
  new TextView({
    left: 16, top: 'prev() 8', right: 16,
    alignment: 'center',
    text: gradient,
    font: '10px monospace'
  }).appendTo(composite);
});
