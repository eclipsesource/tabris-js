import {Composite, ImageView, Tab, TabFolder, TextView, contentView} from 'tabris';

const PARALLAX = 0.1;
const PEOPLE = [
  {name: 'Ian Bull', image: 'resources/ian.jpg'},
  {name: 'Jochen Krause', image: 'resources/jochen.jpg'},
  {name: 'Markus Knauer', image: 'resources/markus.jpg'},
  {name: 'Moritz Post', image: 'resources/moritz.jpg'},
  {name: 'Tim Buschtöns', image: 'resources/tim.jpg'}
];

const imageContainer = new Composite({
  left: 0, top: 0, right: 0, bottom: 0,
  background: 'white'
}).appendTo(contentView);

const tabFolder = new TabFolder({
  left: 0, top: 0, right: 0, bottom: 0,
  paging: true,
  tabBarLocation: 'hidden'
}).onScroll(({selection, offset}) => {
  const imageViews = imageContainer.children();
  const tabIndex = tabFolder.children().indexOf(selection);
  const tabFolderWidth = tabFolder.bounds.width;
  const offsetPercent = offset / tabFolderWidth;
  imageViews[tabIndex].set({
    opacity: 1 - Math.abs(offsetPercent),
    transform: {translationX: -offset * PARALLAX}
  });
  if (offsetPercent < 0 && tabIndex - 1 >= 0) {
    imageViews[tabIndex - 1].set({
      opacity: Math.abs(offsetPercent),
      transform: {translationX: -(1 - Math.abs(offsetPercent)) * tabFolderWidth * PARALLAX}
    });
  }
  if (offsetPercent > 0 && tabIndex + 1 < tabFolder.children().length) {
    imageViews[tabIndex + 1].set({
      opacity: offsetPercent,
      transform: {translationX: Math.abs(1 - offsetPercent) * tabFolderWidth * PARALLAX}
    });
  }
}).appendTo(contentView);

for (let i = 0; i < PEOPLE.length; i++) {
  const person = PEOPLE[i];
  new Tab().appendTo(tabFolder)
    .append(
      new TextView({
        left: 0, right: 0, bottom: 0, height: 56,
        alignment: 'center',
        background: 'rgba(0, 0, 0, 0.3)',
        font: 'bold 24px',
        textColor: 'white',
        text: person.name
      }));
  new ImageView({
    left: 0, top: 0, right: 0, bottom: 0,
    scaleMode: 'fill',
    opacity: i === 0 ? 1 : 0,
    image: person.image
  }).appendTo(imageContainer);
}
