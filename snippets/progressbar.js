var progressBar = new tabris.ProgressBar({
  layoutData: {left: 15, right: 15, centerY: 0},
  maximum: 300,
  selection: 100
}).appendTo(tabris.ui.contentView);

setInterval(function() {
  var selection = progressBar.selection + 1;
  progressBar.set('selection', selection > 300 ? 0 : selection);
}, 20);
