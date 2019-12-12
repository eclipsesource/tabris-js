The `List` class provides an API that is a strict subset of [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array). In its behavior it differs from `Array` only  when used with the `items` properties of `ListView` or `ItemPicker`. Unlike a normal `Array`, any changes to a `List` instance (add, remove, replace) will be detected and applied by these widgets automatically.

**ListView is not exported by the `tabris` module, but by `tabris-decorators`, which needs to be installed separately.**

## Creation and Conversion

A `List` can be created via [constructor](#constructor), [`List.of`](#static-methods) or [`List.from`](#static-methods).

The `List.from` method in particular provides a convenient way to create a `List` using an array literal:

```js
const list = List.from([1, 2, 3]);
```

A `List` can be converted back to a conventional array using [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from):

```js
const array = Array.from(list);
```

## Loops

Just like with array, any entry in a `List` can be accessed via it's index:

```js
const list = new List('a', 'b', 'c');
list[0] = "foo";
const foo = list[0];
```

The length of the list is provided in the `length` property. Therefore it can be used with traditional `for` loops:

```js
for (let i = 0; i < list.length; i++) {
  console.log(list[i]); // "a", "b", "c"
}
```

But it also works with `for...of`:

```js
for (const entry of list) {
  console.log(entry); // "a", "b", "c"
}
```

And with `forEach`:

```js
list.forEach(entry =>
  console.log(entry); // "a", "b", "c"
);
```

The `map` method is *not* supported.

## TypeScript

`List` is meant to be used in TypeScript.

It is generic.

```ts
const numbers: List<number> = new List(1, 2, 3);
const a: number = numbers[0]; // OK
const b: string = numbers[0]; // compile error
```

And only the implemented `Array` API is declared:

```ts
// Compile error since `map` does not belong to the
// subset of Array methods implemented by List:
const result = list.map(entry => entry + 1);
```

Therefore it can not be assigned to the `Array` type:

```ts
const list: List<number> = new List(1, 2, 3);
const array: number[] = list; // error
```

However, due to implementation details an `Array` can not be assigned to the `List` type either. The `ArrayLike` type, which is a built into TypeScript, can contain both. However, this makes most of the common API unaccessible. Because of this the `tabris-decorators` module exports the interface `ListLike`, which provides the exact subset of `List` and `Array` API:

```ts
let array: number[] = [1,2,3];
let list: List<number> = new List(1, 2, 3);
let number: number;

list = array; // compile error

// ArrayLike works for both...
let arrayLike: ArrayLike<number>;
arrayLike = array;
arrayLike = list;

// ...but provides only minimal API:
number = arrayLike[0];
number = arrayLike.length;
number = arrayLike.indexOf(2); // compile error :-(

// ListLike declares the entire common API subset:
let listLike: ListLike<number>;
listLike = array;
listLike = list;
number = listLike[0];
number = listLike.length;
number = listLike.indexOf(2); // works :-)

```

## API Reference

All `List` API is compatible with the respective `Array` counterpart. More of the `Array` API may be implemented in the future, but some methods will never be added to prevent ambiguities. To use these methods simply convert the list to an array using [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from).

### Constructor

The `List` constructor can be called with the same arguments as the [array constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Array).

### Static Methods

`List` implements the following static `Array` methods:
* [`from<T>(arrayLike: ArrayLike<T> | Iterable<T>): ListLike<T>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of)
* [`from<T, U>(arrayLike: ArrayLike<T>, mapfn?: (v: T, k: number) => U, thisArg?: any): ListLike<U>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)
* [`of<T>(...items: T[]): ListLike<T>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of)

### Properties

The [`length`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length) property is fully supported. This means it indicates the current length of the list, and can also be set to change it.

```js
const list = List.from([1, 2]);
console.log(list.length); // "2"
list.length = 5; // extends list with 3 empty slots
console.log(list.length); // "5"
console.log(list[3]); // "undefined"
```

All list entries can be accessed and set via their **index**. An entry can be set at an position that is outside the current list bounds. In this case the length will be increased accordingly. The in-between slots will be empty.

```js
list.length = 2; // truncate to 2 items
list[5] = 3;
console.log(list.length); // "6"
console.log(list[4]); // "undefined"
console.log(list[5]); // "3"
```

### Methods

The following `Array` instance methods are implemented by `List`:

* [`entries()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/entries)
* [`find((value, index, obj) => boolean)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
* [`findIndex((value, index, obj) => unknown)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex)
* [`forEach((value, index, array) => void)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
* [`indexOf(searchElement, fromIndex)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
* [`join(separator)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
* [`keys()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/keys)
* [`lastIndexOf(searchElement, fromIndex)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
* [`pop()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
* [`push(...items)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
* [`shift()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
* [`splice(start, deleteCount, ...items)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
* [`unshift(...items)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
* [`values()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/values)
