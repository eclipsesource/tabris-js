const {Canvas, CheckBox, Page, device} = require('tabris');
const AnimationExample = require('./AnimationExample');

const animationExample = new AnimationExample();

const page = new Page({
  title: 'Animation',
  autoDispose: false
}).on('disappear', () => {
  page.children('#animateCheckBox').set({checked: false});
});

new Canvas({
  left: 10, top: 10, right: 10, bottom: '#animateCheckBox 10'
}).on('resize', ({target, width, height}) => {
  const scaleFactor = device.scaleFactor;
  const ctx = target.getContext('2d', width * scaleFactor, height * scaleFactor);
  ctx.scale(scaleFactor, scaleFactor);
  animationExample.draw(ctx, width, height);
}).appendTo(page);

new CheckBox({
  centerX: 0, bottom: 10,
  text: 'Animate',
  id: 'animateCheckBox'
}).on('checkedChanged', ({value: checked}) => animationExample.animating = checked)
  .appendTo(page);

module.exports = page;
