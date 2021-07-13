import {ObservableData, Observable, PropertyChangedEvent, } from 'tabris';

let data = {foo: 1, bar: 'baz'};
let observableData: ObservableData;
let observable: Observable<PropertyChangedEvent<MyData, unknown>>;
let extended: ObservableData & typeof data;

observableData = new ObservableData();
observableData = new ObservableData({any: 'prop'});
observableData = ObservableData();
observableData = ObservableData({any: 'prop'});
data = ObservableData(data);
extended = ObservableData(data);

class MyData extends ObservableData {

  foo: number;
  bar: string;

  someMethod(value: string) {
    this.bar = value;
  }

}

const myData = new MyData();
myData.someMethod('foo');
extended = new MyData();
observable = myData[Symbol.observable]();
observable.subscribe(ev => {
  if (ev.originalEvent && typeof ev.value === 'string') {
    ev.target.someMethod(ev.value);
  }
});
