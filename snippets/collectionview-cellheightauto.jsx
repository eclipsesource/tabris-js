import {TextView, CollectionView, contentView} from 'tabris';

const TEXT = (
  <$>
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem
    accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
    illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
    sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
    Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
    adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et
    dolore magnam aliquam quaerat voluptatem.';
  </$>
);

const items = createItems();

contentView.append(
  <CollectionView stretch
      itemCount={items.length}
      createCell={() => new TextView({padding: 12})}
      updateCell={(cell, index) => cell.text = items[index]}/>
);

function createItems() {
  const result = [];
  for (let i = 0; i < 30; i++) {
    result[i] = TEXT.substring(0, (i + 1) * 50);
  }
  return result;
}
