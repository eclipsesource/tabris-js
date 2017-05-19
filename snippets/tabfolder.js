const {Tab, TabFolder, TextView, ui} = require('tabris');

// Create a swipe enabled tab folder with 3 tabs

let tabFolder = new TabFolder({
  left: 0, top: 0, right: 0, bottom: 0,
  paging: true // enables swiping. To still be able to open the developer console in iOS, swipe from the bottom right.
}).appendTo(ui.contentView);

createTab('Cart', 'images/cart.png', 'images/cart-filled.png');
createTab('Pay', 'images/card.png', 'images/card-filled.png');
createTab('Statistic', 'images/chart.png', 'images/chart-filled.png');

tabFolder.on('selectionChanged', ({value: tab}) => console.log(tab.title));

function createTab(title, image, seletedImage) {
  let tab = new Tab({
    title: title, // converted to upper-case on Android
    image: {src: image, scale: 2},
    selectedImage: {src: seletedImage, scale: 2}
  }).appendTo(tabFolder);
  new TextView({
    centerX: 0, centerY: 0,
    text: 'Content of Tab ' + title
  }).appendTo(tab);
}
