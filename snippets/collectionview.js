// Create a collection view, initialize its cells and fill it with items
import {CollectionView, Composite, ImageView, TextView, contentView} from 'tabris';
const IMAGE_PATH = 'resources/';

const people = [
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
    const cell = new Composite();
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
    const person = people[index];
    cell.find(ImageView).set({image: person.image});
    cell.find(TextView).set({text: person.firstName});
  }
}).onSelect(({index}) => console.log('selected', people[index].firstName))
  .appendTo(contentView);
