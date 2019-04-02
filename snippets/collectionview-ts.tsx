// Create a collection view, initialize its cells and fill it with items
import { CollectionView, Composite, $, ImageView, TextView, contentView, AlertDialog, Properties } from 'tabris';

type Person = {firstName: string, lastName: string};

const people: Person[] = [
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
  <CollectionView layoutData='stretch' itemCount={people.length} cellHeight={256}
      createCell={() => new Cell()}
      updateCell={(cell, index) => cell.person = people[index]} />
);

class Cell extends Composite {

  private _person: Person;

  constructor(properties?: Properties<Cell>) {
    super(properties);
    this.append(
      <$>
        <ImageView top={16} centerX={0} width={200} height={200} />
        <TextView left={30} top='prev() 16' right={30} alignment='center'/>
      </$>
    );
    this.onTap(this._handleTap);
  }

  set person(value: Person) {
    this._person = value;
    this.find(ImageView).set({image: `resources/${this._person.firstName.toLowerCase()}.jpg`});
    this.find(TextView).set({text: this._person.lastName});
  }

  get person() {
    return this._person;
  }

  private _handleTap() {
    AlertDialog.open(this._person.firstName + ' ' + this._person.lastName);
  }

}
