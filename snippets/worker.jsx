import {Button, TextInput, TextView, contentView} from 'tabris';

contentView.append(
  <$>
    <TextInput centerX={-65} top={24} width={64} alignment='centerX' text='2'/>
    <TextView left='prev() 16' baseline='prev()' text='+'/>
    <TextInput left='prev() 16' baseline='prev()' width={64} alignment='centerX' text='3'/>
    <TextView left='prev() 16' baseline='prev()' text='='/>
    <TextView left='prev() 24' baseline='prev()' text='?'/>
    <Button left={16} right={16} top='prev() 16' onSelect={addNumbers}>
      Add numbers in Worker
    </Button>
  </$>
);

const number1 = $(TextInput).first();
const number2 = $(TextInput).last();
const result = $(TextView).last();

/**
 * Creates a worker that adds two numbers and sends the result back
 * to the main script after a few seconds. The worker also prints
 * information to the console.
 */
function addNumbers() {
  result.text = 'Working...';
  const worker = new Worker('resources/worker-script.js');
  worker.postMessage([parseInt(number1.text, 10), parseInt(number2.text, 10)]);
  worker.addEventListener('message', event => {
    result.text = event.data;
    worker.terminate();
  });
}
