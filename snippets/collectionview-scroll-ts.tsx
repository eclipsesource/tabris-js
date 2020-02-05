import {CollectionView, Composite, contentView, Properties, TextView} from 'tabris';

type Item = {name: string, type: 'section' | 'item'};

class ItemsView extends Composite {

  private _items: Item[];
  private _cv: CollectionView<TextView>;
  private _floatingSection: TextView;

  constructor(properties: Properties<ItemsView>) {
    super();
    this._cv = new CollectionView({
      layoutData: 'stretch',
      cellType: index => this._items[index].type,
      cellHeight: (_, type) => type === 'section' ? 48 : 32,
      createCell: this.createCell,
      updateCell: (cell, index) => cell.text = this._items[index].name
    }).onScroll(this.updateFloatingSection)
      .appendTo(this);
    this._floatingSection = this.createCell('section').set({
      left: 0, height: 48, right: 0
    }).appendTo(this);
    this.set(properties);
  }

  public set items(value: Item[]) {
    this._items = value;
    this._cv.load(this._items.length);
    this.updateFloatingSection();
  }

  public get items() {
    return this._items;
  }

  private createCell(type: 'section' | 'item'): TextView {
    return type === 'section'
      ? new TextView({background: '#aaaaaa', textColor: 'white', font: 'bold 24px', alignment: 'centerX'})
      : new TextView({padding: [2, 5], font: '14px', alignment: 'left'});
  }

  private updateFloatingSection = () => {
    const splitIndex = this._cv.firstVisibleIndex + 1;
    const currentSection = this._items.slice(0, splitIndex).filter(item => item.type === 'section').pop();
    const nextSection = this._items.slice(splitIndex).filter(item => item.type === 'section')[0];
    const nextSectionCell = this._cv.cellByItemIndex(this._items.indexOf(nextSection));
    const bounds = nextSectionCell ? nextSectionCell.absoluteBounds : null;
    this._floatingSection.text = currentSection ? currentSection.name : this._items[0].name;
    this._floatingSection.transform = bounds ? {translationY: Math.min(bounds.top - bounds.height, 0)} : {};
  };

}

contentView.append(<ItemsView stretch items={createItems()}/>);

function createItems() {
  let count = 1;
  const result: Item[] = [];
  for (let j = 1; j <= 10; j++) {
    result.push({name: 'Section ' + j, type: 'section'});
    for (let i = 0; i < 5; i++) {
      result.push({name: 'Item ' + count++, type: 'item'});
    }
  }
  return result;
}
