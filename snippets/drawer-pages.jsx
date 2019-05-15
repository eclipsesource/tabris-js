import {
  Button, CollectionView, Composite, ImageView, NavigationView, Page, TextView, contentView, drawer
} from 'tabris';

const CELL_FONT = {iOS: '17px .HelveticaNeueInterface-Regular', Android: '14px Roboto Medium'}[device.platform];

/** @type {tabris.WidgetCollection<Page>} */
let pages = (
  <$>
    <MyPage title='Basket' image='resources/cart-filled@2x.png'/>
    <MyPage title='Checkout' image='resources/card-filled@2x.png'/>
  </$>
);

contentView.append(
  <NavigationView stretch drawerActionVisible pageAnimation='none'>
    {pages[0]}
  </NavigationView>
);

drawer.set({enabled: true}).append(
  <$>
    <ImageView stretchX height={200} image='resources/landscape.jpg' scaleMode='stretch'/>
    <CollectionView stretch top='prev()'
        itemCount={pages.length}
        cellHeight={48}
        createCell={createCell}
        updateCell={updateCell}/>
  </$>
);

const cv = drawer.find(CollectionView).only();

function createCell() {
  return (
    <Composite highlightOnTouch onTap={ev => showPage(cv.itemIndex(ev.target))}>
      <Composite left={60} right={0} bottom={0} height={1} background='#e7e7e7'/>
      <ImageView left={14} top={10} bottom={10}/>
      <TextView centerY left={60} font={CELL_FONT} textColor='#212121'/>
    </Composite>
  );
}

/**
 * @param {Composite} cell
 * @param {number} index
 */
function updateCell(cell, index) {
  cell.find(ImageView).only().image = pages[index].image;
  cell.find(TextView).only().text = pages[index].title;
}

function addPage() {
  pages = pages.concat(<MyPage title='Another Page' image='resources/page.png'/>);
  cv.insert(pages.length - 1);
}

/** @param {number} index */
function showPage(index) {
  drawer.close();
  const navigationView = $(NavigationView).only();
  navigationView.pages().detach();
  navigationView.append(pages[index]);
}

/** @param {tabris.Attributes<Page>=} attributes */
function MyPage(attributes) {
  return (
    <Page padding={20} {...attributes}>
      <Button stretchX onSelect={addPage}>Create page in drawer</Button>
    </Page>
  );
}
