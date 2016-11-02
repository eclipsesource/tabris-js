var PARALLAX = 0.1;
var PEOPLE = [
  {name: 'Ian Bull', image: 'images/ian.jpg'},
  {name: 'Jochen Krause', image: 'images/jochen.jpg'},
  {name: 'Markus Knauer', image: 'images/markus.jpg'},
  {name: 'Moritz Post', image: 'images/moritz.jpg'},
  {name: 'Tim Buschtöns', image: 'images/tim.jpg'}
];

var imageContainer = new tabris.Composite({
  left: 0, top: 0, right: 0, bottom: 0,
  background: 'white'
}).appendTo(tabris.ui.contentView);

var tabFolder = new tabris.TabFolder({
  left: 0, top: 0, right: 0, bottom: 0,
  paging: true,
  tabBarLocation: 'hidden'
}).on('scroll', function(tabFolder, event) {
  var imageViews = imageContainer.children();
  var tabIndex = tabFolder.children().indexOf(event.selection);
  var tabFolderWidth = tabFolder.bounds.width;
  var offsetPercent = event.offset / tabFolderWidth;
  imageViews[tabIndex].set({
    opacity: 1 - Math.abs(offsetPercent),
    transform: {translationX: -event.offset * PARALLAX}
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
}).appendTo(tabris.ui.contentView);

PEOPLE.forEach(function(person) {
  new tabris.Tab().appendTo(tabFolder)
    .append(
      new tabris.TextView({
        left: 0, right: 0, bottom: 0, height: 56,
        alignment: 'center',
        background: 'rgba(0, 0, 0, 0.3)',
        font: 'bold 24px',
        textColor: 'white',
        text: person.name
      }));
  new tabris.ImageView({
    left: 0, top: 0, right: 0, bottom: 0,
    scaleMode: 'fill',
    opacity: 0,
    image: person.image
  }).appendTo(imageContainer);
});
