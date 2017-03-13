var MARGIN = 12;

var trayHeight;
var trayState = 'down';
var dragOffset;

var text = 'There was nothing so very remarkable in that; nor did Alice ' +
  'think it so very much out of the way to hear the Rabbit say to itself, ‘Oh ' +
  'dear! Oh dear! I shall be late!’ (when she thought it over afterwards, it ' +
  'occurred to her that she ought to have wondered at this, but at the time ' +
  'it all seemed quite natural); but when the Rabbit actually took a watch ' +
  'out of its waistcoat-pocket, and looked at it, and then hurried on, Alice ' +
  'started to her feet, for it flashed across her mind that she had never ' +
  'before seen a rabbit with either a waistcoat-pocket, or a watch to take ' +
  'out of it, and burning with curiosity, she ran across the field after it, ' +
  'and fortunately was just in time to see it pop down a large rabbit-hole ' +
  'under the hedge.';

var page = new tabris.Page({
  title: 'Tray',
  autoDispose: false
});

new tabris.TextView({
  left: MARGIN, right: MARGIN, top: MARGIN,
  text: text,
  textColor: '#777'
}).appendTo(page);

var shade = new tabris.Composite({
  left: 0, right: 0, top: 0, bottom: 0,
  background: 'black',
  opacity: 0
}).appendTo(page);

var tray = new tabris.Composite({
  left: 0, right: 0, top: '30%', bottom: 0
}).appendTo(page);

var strap = new tabris.Composite({
  left: '40%', right: '40%', top: 0, height: 65,
  background: '#259b24'
}).appendTo(tray);

var strapIcon = new tabris.TextView({
  left: MARGIN, right: MARGIN, top: 20,
  alignment: 'center',
  text: '⇧',
  font: 'bold 24px',
  textColor: 'white'
}).appendTo(strap);

var trayContent = new tabris.Composite({
  left: MARGIN, right: MARGIN, top: [strap, 0], bottom: 0,
  background: '#8bc34a'
}).appendTo(tray);

new tabris.TextView({
  left: MARGIN, right: MARGIN, top: MARGIN,
  alignment: 'center',
  text: 'Tray content',
  font: 'bold 24px',
  textColor: 'white'
}).appendTo(trayContent);

trayContent.on('resize', function() {
  var bounds = trayContent.bounds;
  trayHeight = bounds.height;
  if (trayState === 'dragging') {
    positionTrayInRestingState(2000);
  } else {
    tray.transform = {translationY: trayHeight};
  }
});

strap.on('pan:vertical', function({state, translation, velocity}) {
  if (state === 'start' && (trayState === 'up' || trayState === 'down')) {
    trayState = 'dragging';
    dragOffset = tray.transform.translationY - translation.y;
  }
  if (trayState === 'dragging') {
    var offsetY = Math.min(Math.max(translation.y + dragOffset, 0), trayHeight);
    tray.transform = {translationY: offsetY};
    shade.opacity = getShadeOpacity(offsetY);
    strapIcon.transform = getStrapIconTransform(offsetY);
  }
  if (state === 'end' && trayState === 'dragging') {
    positionTrayInRestingState(velocity.y);
  }
});

strap.on('tap', function() {
  if (trayState === 'up' || trayState === 'down') {
    positionTrayInRestingState(trayState === 'down' ? -1000 : 1000);
  }
});

module.exports = page;

function positionTrayInRestingState(velocity) {
  trayState = 'animating';
  var translationY = velocity > 0 ? trayHeight : 0;
  var options = {
    duration: Math.min(Math.abs(trayHeight / velocity * 1000), 800),
    easing: Math.abs(velocity) >= 1000 ? 'ease-out' : 'ease-in-out'
  };
  shade.animate({opacity: getShadeOpacity(translationY)}, options);
  strapIcon.animate({transform: getStrapIconTransform(translationY)}, options);
  tray
    .animate({transform: {translationY: translationY}}, options)
    .then(function() {
      trayState = velocity > 0 ? 'down' : 'up';
    });
}

function getShadeOpacity(translationY) {
  var traveled = translationY / trayHeight;
  return Math.max(0, 0.75 - traveled);
}

function getStrapIconTransform(translationY) {
  var traveled = translationY / trayHeight;
  return {rotation: traveled * Math.PI - Math.PI};
}
