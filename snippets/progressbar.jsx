import {ProgressBar, contentView} from 'tabris';

contentView.set({padding: 16}).append(
  <ProgressBar stretchX centerY maximum={300}/>
);

const progressBar = $(ProgressBar).only();

setInterval(() => {
  const selection = progressBar.selection + 1;
  progressBar.selection = selection > 300 ? 0 : selection;
}, 20);

throw new Error(
  <$>
    Foo Bar Foo
    Foo Bar Foo
    Foo Bar Foo
    Foo Bar Foo
  </$>
);
