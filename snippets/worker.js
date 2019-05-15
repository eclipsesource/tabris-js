const {Button, TextInput, TextView, contentView} = require('tabris');

// Create a worker that receives two numbers, adds them and sends the result back to the main script

console.log('hello worker');
const number1 = new TextInput({centerX: -65, top: 24, width: 32, alignment: 'centerX', text: '2'})
  .appendTo(contentView);
new TextView({left: 'prev() 16', baseline: 'prev()', text: '+'})
  .appendTo(contentView);
const number2 = new TextInput({left: 'prev() 16', baseline: 'prev()', width: 32, alignment: 'centerX', text: '3'})
  .appendTo(contentView);
new TextView({left: 'prev() 16', baseline: 'prev()', text: '='})
  .appendTo(contentView);
const result = new TextView({left: 'prev() 24', baseline: 'prev()', text: '?'})
  .appendTo(contentView);

new Button({
  left: 16, right: 16, top: [number1, 16],
  text: 'Add numbers in Worker'
}).onSelect(() => {
  const worker = new Worker('resources/worker-script.js');
  worker.onmessage = (event) => {
    result.text = event.data;
    worker.terminate();
  };
  worker.onerror = (error) => {
    console.log(`onerror: ${JSON.stringify(error)}`);
    worker.terminate();
  };
  worker.postMessage([parseInt(number1.text, 10), parseInt(number2.text, 10)]);
}).appendTo(contentView);
