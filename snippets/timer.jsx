import {Button, Composite, contentView, Slider, Switch, TextView} from 'tabris';

let cpsCount;
let startTime;
let incrementTime;
let taskId;

contentView.set({padding: 16});
contentView.append(
  <$>
    <TextView top={8} left right='next() 16' text='Calls per second'/>
    <TextView id='cps' baseline='prev()' right text='none'/>
    <TextView top='prev() 8' left right='next() 16' text='Last update'/>
    <TextView id='time' baseline='prev()' right text='none'/>
    <Composite top='prev() 24' stretchX height={1} background='#dddddd'/>
    <Composite id='controls' top='prev() 24' stretchX>
      <Composite stretchX>
        <TextView centerY text='Delay (ms)'/>
        <Slider id='delay' left='prev() 8' right={64} centerY maximum={3000} selection={1000}
            onSelectionChanged={e => { e.target.siblings(TextView).last().text = `${e.value} ms`; }}/>
        <TextView right={0} centerY text='1000 ms'/>
      </Composite>
      <Composite top='prev() 16' stretchX>
        <TextView left right='next() 16' centerY text='Repeat'/>
        <Switch id='repeat' right centerY checked/>
      </Composite>
    </Composite>
    <Button top='prev() 24' left right text='Start timer' onSelect={updateTimer}/>
  </$>
);

function updateTimer() {
  if (taskId === undefined) {
    startTimer();
  } else {
    stopTimer();
  }
  updateControls();
}

function startTimer() {
  const curTime = new Date().getTime();
  cpsCount = 0;
  startTime = curTime;
  incrementTime = curTime;
  const delay = $(Slider).only().selection;
  if ($(Switch).only().checked) {
    taskId = setInterval(updateTimerStatus, delay);
  } else {
    taskId = setTimeout(() => {
      taskId = undefined;
      updateTimerStatus();
      updateControls();
    }, delay);
  }
}

function stopTimer() {
  clearTimeout(taskId);
  taskId = undefined;
}

function updateTimerStatus() {
  cpsCount++;
  const curTime = new Date().getTime();
  const startDiff = curTime - startTime;
  if (startDiff >= 1000) {
    $(TextView).only('#cps').text = (cpsCount / (startDiff / 1000)).toFixed(3).toString();
    cpsCount = 0;
    startTime = curTime;
  }
  const incrementDiff = curTime - incrementTime;
  $(TextView).only('#time').text = `${incrementDiff} ms ago`;
  incrementTime = curTime;
}

function updateControls() {
  const timerRunning = taskId !== undefined;
  $(Button).only().text = timerRunning ? 'Stop timer' : 'Start timer';
  $('#controls').only().enabled = !timerRunning;
}
