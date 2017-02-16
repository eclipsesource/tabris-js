var IMAGE_PATH = 'images/';
var IMAGE_SIZE = 128;
var THUMB_SIZE = 48;
var MARGIN_SMALL = 4;
var MARGIN = 12;
var MARGIN_LARGE = 24;
var ANIMATION_START_DELAY = 500;

var people = [
  ['Holger', 'Staudacher', 'holger.jpg'],
  ['Ian', 'Bull', 'ian.jpg'],
  ['Jochen', 'Krause', 'jochen.jpg'],
  ['Jordi ', 'Böhme López', 'jordi.jpg'],
  ['Markus ', 'Knauer', 'markus.jpg'],
  ['Moritz', 'Post', 'moritz.jpg'],
  ['Tim', 'Buschtöns', 'tim.jpg']
].map(function(element) {
  return {firstName: element[0], lastName: element[1], image: IMAGE_PATH + element[2]};
});

var page = new tabris.Page({
  title: 'People',
  autoDispose: false
});

var detailsParent = new tabris.Composite({
  left: MARGIN, top: MARGIN_LARGE, right: MARGIN
}).appendTo(page);

var detailView = createPersonDetail(detailsParent, people[2], ANIMATION_START_DELAY);

new tabris.Composite({
  left: 0, top: [detailsParent, MARGIN], right: 0, height: 96
}).on('resize', function({target: container, width}) {
  this.children().dispose();
  var thumbsize = Math.min(64, width / people.length - MARGIN);
  people.forEach(function(person, index) {
    var personThumb = createPersonThumb(person, thumbsize).appendTo(container);
    animateInFromBottom(personThumb, index);
  });
}).appendTo(page);

module.exports = page;

function animateInFromBottom(widget, index) {
  widget.set({
    opacity: 0.0,
    transform: {translationY: THUMB_SIZE / 2}
  });
  widget.animate({
    opacity: 1.0,
    transform: {translationY: 0}
  }, {
    delay: index * 100 + 800 + ANIMATION_START_DELAY,
    duration: 200,
    easing: 'ease-in-out'
  });
}

function animateInFromRight(widget, delay) {
  widget.set({
    opacity: 0.0,
    transform: {translationX: 32}
  });
  widget.animate({
    opacity: 1.0,
    transform: {translationX: 0}
  }, {
    duration: 500,
    delay: delay,
    easing: 'ease-out'
  });
}

function animateInScaleUp(widget, delay) {
  widget.opacity = 0.0;
  widget.animate({
    opacity: 1.0,
    transform: {scaleX: 1.0, scaleY: 1.0}
  }, {
    delay: delay,
    duration: 400,
    easing: 'ease-out'
  });
}

function animateOutLeftCreateCurrentPerson(person) {
  detailView
    .animate({opacity: 0.0, transform: {translationX: -64}}, {duration: 500, easing: 'ease-out'})
    .then(function() {
      detailView.dispose();
      detailView = createPersonDetail(detailsParent, person, 0);
    });
}

function createPersonDetail(parent, person, delay) {
  var composite = new tabris.Composite({
    left: 0, right: 0, top: 0, height: IMAGE_SIZE + MARGIN_LARGE
  }).appendTo(parent);
  var personImage = new tabris.ImageView({
    left: 0, top: 0, width: IMAGE_SIZE, height: IMAGE_SIZE,
    image: {src: person.image, width: IMAGE_SIZE, height: IMAGE_SIZE},
    opacity: 0.0
  }).on('resize', function() {
    this.transform = {
      scaleX: 0.75,
      scaleY: 0.75
    };
    animateInScaleUp(this, delay);
  }).appendTo(composite);
  var nameTextView = new tabris.TextView({
    left: [personImage, MARGIN], top: 0,
    text: person.firstName + ' ' + person.lastName,
    font: 'bold 18px'
  }).appendTo(composite);
  var professionTextView = new tabris.TextView({
    left: [personImage, MARGIN], top: [nameTextView, MARGIN],
    text: 'Software developer'
  }).appendTo(composite);
  var companyTextView = new tabris.TextView({
    left: [personImage, MARGIN], top: [professionTextView, MARGIN_SMALL],
    text: 'EclipseSource'
  }).appendTo(composite);
  var mailTextView = new tabris.TextView({
    left: [personImage, MARGIN], top: [companyTextView, MARGIN],
    text: 'mail@eclipsesource.com',
    font: 'italic 14px'
  }).appendTo(composite);
  animateInFromRight(nameTextView, delay);
  animateInFromRight(professionTextView, 100 + delay);
  animateInFromRight(companyTextView, 200 + delay);
  animateInFromRight(mailTextView, 300 + delay);
  return composite;
}

function createPersonThumb(person, thumbsize) {
  var font = (thumbsize < 48) ? '9px' : '12px';
  var composite = new tabris.Composite({
    left: ['prev()', MARGIN], top: 0
  });
  var personView = new tabris.ImageView({
    left: 0, top: 0, width: thumbsize, height: thumbsize,
    image: {src: person.image, width: thumbsize, height: thumbsize},
    highlightOnTouch: true
  }).on('tap', function() {
    animateOutLeftCreateCurrentPerson(person);
  }).appendTo(composite);
  new tabris.TextView({
    alignment: 'center',
    left: 0, top: personView, width: thumbsize,
    text: person.firstName,
    font: font
  }).appendTo(composite);
  return composite;
}
