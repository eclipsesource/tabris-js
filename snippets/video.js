import {Button, contentView, Video} from 'tabris';

const button = new Button({
  id: 'button',
  centerX: 0, bottom: 16,
  text: '❚❚'
}).onSelect(() => video.state === 'play' ? video.pause() : video.play())
  .appendTo(contentView);

const video = new Video({
  left: 0, top: 0, right: 0, bottom: '#button 16',
  url: 'http://peach.themazzone.com/durian/movies/sintel-1280-stereo.mp4',
  controlsVisible: false
}).onStateChanged(({value: state}) => button.text = state !== 'pause' && state !== 'finish' ? '❚❚' : '▶')
  .appendTo(contentView);
