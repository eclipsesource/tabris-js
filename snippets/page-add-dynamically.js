var page = new tabris.Page({
  title: 'Creating a new page dynamically',
  topLevel: true
});

new tabris.Button({
  left: 10, top: 10, right: 10,
  text: 'Create and open a new page'
}).on('select', function() {
  new tabris.Page({
    title: 'Dynamically created page'
  }).open();
}).appendTo(page);

page.open();
