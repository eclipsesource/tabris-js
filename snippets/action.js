var page = new tabris.Page({
  title: 'Actions',
  topLevel: true
});

new tabris.Action({
  title: 'Action',
  image: 'images/share.png'
}).on('select', function() {
  console.log('Action selected.');
});

page.open();
