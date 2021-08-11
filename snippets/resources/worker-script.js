console.log('Worker running...');

tabris.onMessage(e => {
  const number1 = e.data[0];
  const number2 = e.data[1];
  console.log(`Adding numbers ${number1} and ${number2}`);
  const result = number1 + number2;
  setTimeout(() => {
    console.log('Posting result of ' + result + ' to main script');
    tabris.postMessage(result);
  }, 2000);
});
