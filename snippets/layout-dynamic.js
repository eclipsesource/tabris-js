new tabris.Composite({id: 'red', background: 'red'}).appendTo(tabris.ui.contentView);
new tabris.Composite({id: 'green', background: 'green'}).appendTo(tabris.ui.contentView);
new tabris.Composite({id: 'blue', background: 'blue'}).appendTo(tabris.ui.contentView);
new tabris.Composite({id: 'yellow', background: 'yellow'}).appendTo(tabris.ui.contentView);
new tabris.Composite({id: 'purple', background: 'purple'}).appendTo(tabris.ui.contentView);

applyLayout(tabris.ui.contentView.bounds);
tabris.ui.contentView.on('resize', function(contentView, bounds) {
  applyLayout(bounds);
});

function applyLayout(bounds) {
  tabris.ui.contentView.apply(require('./layout-' + (bounds.width > bounds.height ? 'landscape' : 'portrait')));
}
