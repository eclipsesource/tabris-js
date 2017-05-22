const {Composite, ImageView, Page, TextView} = require('tabris');

const IMAGE_PATH = 'images/';
const IMAGE_SIZE = 128;
const THUMB_SIZE = 48;
const MARGIN_SMALL = 4;
const MARGIN = 12;
const MARGIN_LARGE = 24;
const ANIMATION_START_DELAY = 500;

const PEOPLE = [
  ['Ian', 'Bull', 'ian.jpg'],
  ['Jochen', 'Krause', 'jochen.jpg'],
  ['Markus ', 'Knauer', 'markus.jpg'],
  ['Moritz', 'Post', 'moritz.jpg'],
  ['Tim', 'Buschtöns', 'tim.jpg']
].map(([firstName, lastName, image]) => ({firstName, lastName, image: IMAGE_PATH + image}));

let page = new Page({
  title: 'People',
  autoDispose: false
});

let detailsParent = new Composite({
  left: MARGIN, top: MARGIN_LARGE, right: MARGIN
}).appendTo(page);

let detailView = createPersonDetail(detailsParent, PEOPLE[2], ANIMATION_START_DELAY);

new Composite({
  left: 0, top: [detailsParent, MARGIN], right: 0, height: 96
}).on('resize', ({target: container, width}) => {
  container.children().dispose();
  let thumbsize = Math.min(64, width / PEOPLE.length - MARGIN);
  PEOPLE.forEach((person, index) => {
    let personThumb = createPersonThumb(person, thumbsize).appendTo(container);
    animateInFromBottom(personThumb, index);
  });
}).appendTo(page);

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
  let composite = new Composite({
    left: 0, right: 0, top: 0, height: IMAGE_SIZE + MARGIN_LARGE
  }).appendTo(parent);
  let personImage = new ImageView({
    left: 0, top: 0, width: IMAGE_SIZE, height: IMAGE_SIZE,
    image: {src: person.image, width: IMAGE_SIZE, height: IMAGE_SIZE},
    opacity: 0.0
  }).on('resize', () => {
    personImage.transform = {
      scaleX: 0.75,
      scaleY: 0.75
    };
    animateInScaleUp(personImage, delay);
  }).appendTo(composite);
  let nameTextView = new TextView({
    left: [personImage, MARGIN], top: 0,
    text: person.firstName + ' ' + person.lastName,
    font: 'bold 18px'
  }).appendTo(composite);
  let professionTextView = new TextView({
    left: [personImage, MARGIN], top: [nameTextView, MARGIN],
    text: 'Software developer'
  }).appendTo(composite);
  let companyTextView = new TextView({
    left: [personImage, MARGIN], top: [professionTextView, MARGIN_SMALL],
    text: 'EclipseSource'
  }).appendTo(composite);
  let mailTextView = new TextView({
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
  let font = (thumbsize < 48) ? '9px' : '12px';
  let composite = new Composite({
    left: ['prev()', MARGIN], top: 0
  });
  let personView = new ImageView({
    left: 0, top: 0, width: thumbsize, height: thumbsize,
    image: {src: person.image, width: thumbsize, height: thumbsize},
    highlightOnTouch: true
  }).on('tap', () => animateOutLeftCreateCurrentPerson(person))
    .appendTo(composite);
  new TextView({
    alignment: 'center',
    left: 0, top: personView, width: thumbsize,
    text: person.firstName,
    font: font
  }).appendTo(composite);
  return composite;
}

module.exports = page;
