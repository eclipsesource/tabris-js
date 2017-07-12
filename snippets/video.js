const {Button, Video, ui} = require('tabris');

let button = new Button({
  id: 'button',
  centerX: 0, bottom: 16,
  text: '❚❚'
}).on('select', () => video.state === 'play' ? video.pause() : video.play())
  .appendTo(ui.contentView);

let video = new Video({
  left: 0, top: 0, right: 0, bottom: '#button 16',
  url: 'http://peach.themazzone.com/durian/movies/sintel-1280-stereo.mp4',
  controlsVisible: false
}).on('stateChanged', event => button.text = event.value !== 'pause' ? '❚❚' : '▶')
  .appendTo(ui.contentView);
