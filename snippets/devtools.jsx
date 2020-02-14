import {Button, contentView, devTools} from 'tabris';

contentView.append(
  <Button center onSelect={toggleUi}>Toggle Developer Tools</Button>
);

function toggleUi() {
  if (!devTools.isUiVisible()) {
    devTools.showUi();
  } else {
    devTools.hideUi();
  }
}
