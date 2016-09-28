var IMAGE_PATH = 'images/';

var people = [
  ['Holger', 'Staudacher', 'holger.jpg'],
  ['Ian', 'Bull', 'ian.jpg'],
  ['Jochen', 'Krause', 'jochen.jpg'],
  ['Jordi', 'Böhme López', 'jordi.jpg'],
  ['Markus', 'Knauer', 'markus.jpg'],
  ['Moritz', 'Post', 'moritz.jpg'],
  ['Ralf', 'Sternberg', 'ralf.jpg'],
  ['Tim', 'Buschtöns', 'tim.jpg']
].map(function(element) {
  return {firstName: element[0], lastName: element[1], image: IMAGE_PATH + element[2]};
});

new tabris.CollectionView({
  layoutData: {left: 0, top: 0, right: 0, bottom: 0},
  items: people,
  itemHeight: 256,
  initializeCell: function(cell) {
    var imageView = new tabris.ImageView({
      layoutData: {top: 16, centerX: 0, width: 200, height: 200}
    }).appendTo(cell);
    var nameTextView = new tabris.TextView({
      layoutData: {left: 30, top: [imageView, 16], right: 30},
      alignment: 'center'
    }).appendTo(cell);
    cell.on('change:item', function(widget, person) {
      imageView.set('image', {src: person.image});
      nameTextView.set('text', person.firstName);
    });
  }
}).on('select', function(target, value) {
  console.log('selected', value.firstName);
}).appendTo(tabris.ui.contentView);
