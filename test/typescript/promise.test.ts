let promise1 = new Promise<any>((resolve, reject) => {
  if (1 === 1) {
    resolve('result');
  } else {
    reject('reason');
  }
});

promise1.then((result) => {
  return 'nextResult';
}).then((result) => {
  return 'nextResult';
}).catch((reason) => {
  // handle error
});

let promise2 = new Promise<any>((resolve, reject) => {
  if (1 === 1) {
    resolve('result');
  } else {
    reject('reason');
  }
});

let allPromise: Promise<any> = Promise.race([promise1, promise2]).then((results) => {
  let result1 = results[0];
  let result2 = results[1];
});

let racePromise: Promise<any> = Promise.race([promise1, promise2]).then((result) => {
  result.doSomething();
});

let rejectedPromise: Promise<any> = Promise.reject<any>('reason');
let resolvedPromise: Promise<any> = Promise.resolve<any>('value');

