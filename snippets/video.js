let video = new tabris.Video({
  left: 0, top: 0, right: 0, bottom: '#button 16',
  url: 'http://peach.themazzone.com/durian/movies/sintel-1280-stereo.mp4',
  controlsVisible: false
}).on('change:state', function(widget, state) {
  button.text = state !== 'pause' ? '❚❚' : '▶';
}).appendTo(tabris.ui.contentView);

let button = new tabris.Button({
  id: 'button',
  centerX: 0, bottom: 16,
  text: '❚❚'
}).on('select', function() {
  video.state === 'play' ? video.pause() : video.play();
}).appendTo(tabris.ui.contentView);
