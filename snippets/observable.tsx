import {Button, Observable, contentView, TextView, Stack} from 'tabris';

let seq = 0;

contentView.append(
  <Stack stretch padding={16} alignment='stretchX' spacing={8}>
    <Button id='next' text='next'/>
    <Button id='error' text='error'/>
    <Button id='complete' text='complete'/>
    <Button id='unsubscribe' text='unsubscribe'/>
    <TextView top={16} font='18px'/>
  </Stack>
);

const nextButton = $(Button).only('#next');
const errorButton = $(Button).only('#error');
const completeButton = $(Button).only('#complete');
const textView = $(TextView).only();

const observable = new Observable<number>(sub => {
  const callNext = () => sub.next(++seq);
  const callError = () => sub.error(new Error(String(++seq)));
  const callComplete = () => sub.complete();
  nextButton.onSelect(callNext);
  errorButton.onSelect(callError);
  completeButton.onSelect(callComplete);
  return {
    unsubscribe() {
      nextButton.onSelect.removeListener(callNext);
      errorButton.onSelect.removeListener(callError);
      completeButton.onSelect.removeListener(callComplete);
    }
  };
});

const subscription = observable.subscribe({
  next(observedValue) {
    textView.text = 'next: ' + observedValue;
  },
  error(ex) {
    textView.text = 'error: ' + ex;
  },
  complete() {
    textView.text = 'complete';
  }
});

$(Button).only('#unsubscribe').onSelect(() => {
  subscription.unsubscribe();
});
