// Create a collection view, initialize its cells and fill it with items
import {CollectionView, Composite, ImageView, TextView, ui} from 'tabris';
const IMAGE_PATH = 'resources/';

let people = [
  ['Holger', 'Staudacher', 'holger.jpg'],
  ['Ian', 'Bull', 'ian.jpg'],
  ['Jochen', 'Krause', 'jochen.jpg'],
  ['Jordi', 'Böhme López', 'jordi.jpg'],
  ['Markus', 'Knauer', 'markus.jpg'],
  ['Moritz', 'Post', 'moritz.jpg'],
  ['Ralf', 'Sternberg', 'ralf.jpg'],
  ['Tim', 'Buschtöns', 'tim.jpg']
].map(([firstName, lastName, image]) => ({firstName, lastName, image: IMAGE_PATH + image}));

new CollectionView({
  left: 0, top: 0, right: 0, bottom: 0,
  itemCount: people.length,
  cellHeight: 256,
  createCell: () => {
    let cell = new Composite();
    new ImageView({
      top: 16, centerX: 0, width: 200, height: 200
    }).appendTo(cell);
    new TextView({
      left: 30, top: 'prev() 16', right: 30,
      alignment: 'center'
    }).appendTo(cell);
    return cell;
  },
  updateCell: (cell, index) => {
    let person = people[index];
    cell.apply({
      ImageView: {image: person.image},
      TextView: {text: person.firstName}
    });
  }
}).on('select', ({index}) => console.log('selected', people[index].firstName))
  .appendTo(ui.contentView);
