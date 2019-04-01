// Create a collection view, initialize its cells and fill it with items
import {CollectionView, Composite, ImageView, TextView, contentView, AlertDialog} from 'tabris';

const people = [
  {firstName: 'Holger', lastName: 'Staudacher'},
  {firstName: 'Ian', lastName: 'Bull'},
  {firstName: 'Jochen', lastName: 'Krause'},
  {firstName: 'Jordi', lastName: 'Böhme López'},
  {firstName: 'Markus', lastName: 'Knauer'},
  {firstName: 'Moritz', lastName: 'Post'},
  {firstName: 'Ralf', lastName: 'Sternberg'},
  {firstName: 'Tim', lastName: 'Buschtöns'}
];

contentView.append(
  <CollectionView
      stretch
      itemCount={people.length}
      cellHeight={256}
      createCell={createCell}
      updateCell={updateCell}/>
);

function createCell() {
  return (
    <Composite onTap={handleTap}>
      <ImageView top={16} centerX={0} width={200} height={200} />
      <TextView left={30} top='prev() 16' right={30} alignment='center' />
    </Composite>
  );
}

function updateCell(cell, index) {
  cell.find(ImageView).set({image: `resources/${people[index].firstName.toLocaleLowerCase()}.jpg`});
  cell.find(TextView).set({text: people[index].firstName});
}

function handleTap({target}) {
  const index = target.parent(CollectionView).itemIndex(target);
  AlertDialog.open(people[index].firstName + ' ' + people[index].lastName);
}
