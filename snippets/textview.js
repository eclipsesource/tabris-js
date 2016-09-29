// Create text views with different alignments

new tabris.TextView({
  layoutData: {left: 10, top: 10, right: 10},
  text: 'Left',
  alignment: 'left'
}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  layoutData: {left: 10, top: 'prev() 10', right: 10},
  text: 'Center',
  alignment: 'center'
}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  layoutData: {left: 10, top: 'prev() 10', right: 10},
  text: 'Right',
  alignment: 'right'
}).appendTo(tabris.ui.contentView);
