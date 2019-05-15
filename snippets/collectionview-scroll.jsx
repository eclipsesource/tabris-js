import {$, CollectionView, contentView, TextView} from 'tabris';

/** @param {tabris.Attributes<TextView>=} attributes */
const SectionCell = attributes =>
  <TextView background='#aaaaaa' textColor='white' font='bold 24px' alignment='centerX' {...attributes}/>;

/** @param {tabris.Attributes<TextView>=} attributes */
const ItemCell = attributes =>
  <TextView padding={[2, 5]} font='14px' alignment='left' {...attributes} />;

const items = createItems();

contentView.append(
  <$>
    <CollectionView stretch
                    itemCount={items.length}
                    cellType={index => items[index].type}
                    cellHeight={(_, type) => type === 'section' ? 48 : 32}
                    createCell={type => type === 'section' ? SectionCell() : ItemCell()}
                    updateCell={(cell, index) => cell.text = items[index].name}
                    onScroll={handleScroll}/>
    <SectionCell stretchX height={48} id='floatingSection' text={items[0].name}/>
  </$>
);

/** @param {tabris.CollectionViewScrollEvent<CollectionView<TextView>>} ev */
function handleScroll({target}) {
  const splitIndex = target.firstVisibleIndex + 1;
  const currentSection = items.slice(0, splitIndex).filter(item => item.type === 'section').pop();
  const nextSection = items.slice(splitIndex).filter(item => item.type === 'section')[0];
  const nextSectionCell = target.cellByItemIndex(items.indexOf(nextSection));
  const bounds = nextSectionCell ? nextSectionCell.absoluteBounds : null;
  $('#floatingSection').only(SectionCell).set({
    text: currentSection ? currentSection.name : items[0].name,
    transform: bounds ? {translationY: Math.min(bounds.top - bounds.height, 0)} : {}
  });
}

function createItems() {
  let itemCount = 1;
  /** @type {Array<{name: string, type: 'section' | 'item'}>} */
  const result = [];
  for (let j = 1; j <= 10; j++) {
    result.push({name: 'Section ' + j, type: 'section'});
    for (let i = 0; i < 5; i++) {
      result.push({name: 'Item ' + itemCount++, type: 'item'});
    }
  }
  return result;
}
