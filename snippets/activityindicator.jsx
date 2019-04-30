import {ActivityIndicator, Button, contentView, $} from 'tabris';

contentView.append(
  <$>
    <ActivityIndicator layoutData='center'/>
    <Button onSelect={executeLongRunningTask} layoutData='center'>Run Task</Button>
  </$>
);

const activityIndicator = $(ActivityIndicator).only();
const button = $(Button).only();

function executeLongRunningTask() {
  activityIndicator.visible = true;
  button.visible = false;
  setTimeout(() => {
    activityIndicator.visible = false;
    button.visible = true;
  }, 2500);
}

executeLongRunningTask();
