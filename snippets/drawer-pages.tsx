import {
  Attributes,
  Button,
  CollectionView,
  Composite,
  contentView,
  drawer,
  ImageView,
  NavigationView,
  Page,
  TextView
} from 'tabris';

const CELL_FONT = {iOS: '17px', Android: 'medium 14px'}[device.platform];

const ITEMS = [
  {title: 'Basket', image: 'resources/card-filled@2x.png'},
  {title: 'Checkout', image: 'resources/cart-filled@2x.png'}
];

let pages = ITEMS.map((item) => <MyPage title={item.title}/>);

contentView.append(
  <NavigationView stretch drawerActionVisible pageAnimation='none'>
    {pages[0]}
  </NavigationView>
);

drawer.enabled = true;
drawer.append(
  <$>
    <Composite stretchX height={128} background='linear-gradient(45deg, #0288d1 10%, #00dfff)'>
      <ImageView center image={{src: 'resources/cloud-check.png', scale: 3}} tintColor='white'/>
    </Composite>
    <CollectionView stretchX bottom top='prev() 8'
      itemCount={ITEMS.length}
      cellHeight={48}
      createCell={createCell}
      updateCell={updateCell}/>
  </$>
);

const cv = drawer.find(CollectionView).only();

function createCell() {
  return (
    <Composite highlightOnTouch onTap={ev => showPage(cv.itemIndex(ev.target))}>
      <ImageView left={16} width={24} height={24} centerY tintColor='#777777'/>
      <TextView left={72} centerY font={CELL_FONT} textColor='#212121'/>
    </Composite>
  );
}

function updateCell(cell: Composite, index: number) {
  const item = ITEMS[index];
  cell.find(TextView).only().text = item ? item.title : pages[index].title;
  cell.find(ImageView).only().image = item ? item.image : 'resources/close-black-24dp@3x.png';
}

function addPage() {
  pages = pages.concat(<MyPage title='Another Page'/>);
  cv.insert(pages.length - 1);
}

function showPage(index: number) {
  drawer.close();
  const navigationView = $(NavigationView).only();
  navigationView.pages().detach();
  navigationView.append(pages[index]);
}

function MyPage(attributes: Attributes<Page>) {
  return (
    <Page  {...attributes}>
      <Button left={16} right={16} top={16} stretchX onSelect={addPage}>Create page in drawer</Button>
    </Page>
  );
}
