const {Button, Page, TextView} = require('tabris');

const MARGIN = 12;

let page = new Page({
  title: 'Simple Animation',
  autoDispose: false
});

new Button({
  left: MARGIN, right: MARGIN, top: MARGIN,
  id: 'animateButton',
  text: 'Animate'
}).on('select', ({target: button}) => {
  button.enabled = false;
  page.children('#helloLabel').first().animate({
    opacity: 0.25,
    transform: {
      rotation: 0.75 * Math.PI,
      scaleX: 2.0,
      scaleY: 2.0,
      translationX: 100,
      translationY: 200
    }
  }, {
    delay: 0,
    duration: 1000,
    repeat: 1,
    reverse: true,
    easing: 'ease-out' // "linear", "ease-in", "ease-out", "ease-in-out"
  }).then(() => button.enabled = true);
}).appendTo(page);

new TextView({
  left: MARGIN, top: ['#animateButton', MARGIN],
  id: 'helloLabel',
  background: '#6aa',
  textColor: 'white',
  font: '20px',
  text: 'Hello World!'
}).appendTo(page);

module.exports = page;
