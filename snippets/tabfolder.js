import {Tab, TabFolder, TextView, contentView} from 'tabris';

// Create a swipe enabled tab folder with 3 tabs

const tabFolder = new TabFolder({
  left: 0, top: 0, right: 0, bottom: 0,
  paging: true // enables swiping. To still be able to open the developer console in iOS, swipe from the bottom right.
}).appendTo(contentView);

createTab('Cart', 'resources/cart.png', 'resources/cart-filled.png');
createTab('Pay', 'resources/card.png', 'resources/card-filled.png');
createTab('Statistic', 'resources/chart.png', 'resources/chart-filled.png');

tabFolder.onSelectionChanged(({value: tab}) => console.log(`selectionChanged to ${tab.title}`));
tabFolder.onSelect(() => console.log(`select event`));

function createTab(title, image, seletedImage) {
  const tab = new Tab({
    title, // converted to upper-case on Android
    image: {src: image, scale: 2},
    selectedImage: {src: seletedImage, scale: 2}
  }).onAppear(({target}) => console.log(`${target.title} appeared`))
    .onDisappear(({target}) => console.log(`${target.title} disappeared`))
    .appendTo(tabFolder);
  new TextView({
    centerX: 0, centerY: 0,
    text: 'Content of Tab ' + title
  }).appendTo(tab);
}
