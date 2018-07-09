const {Button, TextInput, TextView, ui} = require('tabris');

// Create a worker that receives two numbers, adds them and sends the result back to the main script

console.log('hello worker');
let number1 = new TextInput({centerX: -65, top: 24, width: '32', alignment: 'center', text: '2'})
  .appendTo(ui.contentView);
new TextView({left: 'prev() 16', baseline: 'prev()', text: '+'})
  .appendTo(ui.contentView);
let number2 = new TextInput({left: 'prev() 16', baseline: 'prev()', width: '32', alignment: 'center', text: '3'})
  .appendTo(ui.contentView);
new TextView({left: 'prev() 16', baseline: 'prev()', text: '='})
  .appendTo(ui.contentView);
let result = new TextView({left: 'prev() 24', baseline: 'prev()', text: '?'})
  .appendTo(ui.contentView);

new Button({
  left: 16, right: 16, top: [number1, '16'],
  text: 'Add numbers in Worker'
}).on('select', () => {
  let worker = new Worker('resources/worker-script.js');
  worker.onmessage = (event) => {
    result.text = event.data;
    worker.terminate();
  };
  worker.onerror = (error) => {
    console.log(`onerror: ${JSON.stringify(error)}`);
    worker.terminate();
  };
  worker.postMessage([parseInt(number1.text), parseInt(number2.text)]);
}).appendTo(ui.contentView);
