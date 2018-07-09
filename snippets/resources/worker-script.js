console.log('Worker running...');

onmessage = e => {
  console.log('Message received from main script. ' + JSON.stringify(e));
  let number1 = e.data[0];
  let number2 = e.data[1];
  console.log(`Adding numbers ${number1} and ${number2}`);
  let result = number1 + number2;
  console.log('Posting result of ' + result + ' to main script');
  postMessage(result);
};
