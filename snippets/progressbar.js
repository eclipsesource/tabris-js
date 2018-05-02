import {ProgressBar, ui} from 'tabris';

// A progress bar that is animated using a timer

let progressBar = new ProgressBar({
  left: 15, right: 15, centerY: 0,
  maximum: 300,
  selection: 100
}).appendTo(ui.contentView);

setInterval(() => {
  let selection = progressBar.selection + 1;
  progressBar.selection = selection > 300 ? 0 : selection;
}, 20);
