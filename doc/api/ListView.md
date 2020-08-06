`ListView` is a high-level extension of the low-level `CollectionView` widget. It provides additional API to make usage more convenient, but does not add any new features.

`ListView` is optimized for [JSX](../declarative-ui.md) and [data binding](../databinding/index.md). It *can* be used in plain JavaScript, but in this case some features do not work, as noted below.

In contrast to `CollectionView` it features an [`items`](#items) property and requires no callbacks to create or populate cells, and no explicit item position/content updates: The `load()`, `insert()`, `remove()` and `refresh()`) methods are called implicitly when the `items` property value changes or mutates. For this to work as expected the [`items`](#items) property must either be set a [`List`](./List.md) instance, or to a series of immutable arrays. Any change to a `List` will be recognized immediately, while an items array must to be entirely *replaced without modifying the previous one*. `ListView` will then compute the difference between the old and new array automatically.

To define the look of a `ListView` it requires one or more [`<Cell>`](./Cell.md) child elements containing widgets that [bind](../databinding/@component#one-way-bindings) themselves to the cell's [`item`](./Cell.md#item). These cells act as templates for all `Cell` instances needed by `ListView` to display the items. If multiple cell templates are present, their `itemType` and/or `itemCheck` properties are used to determine which cell template to use for which item.

Note that this mechanism ONLY works in JSX, but `ListView` can still be used without templates by setting the `createCell`, `cellType` and `cellHeight` properties instead. You may want to do this if you are using plain JavaScript project setup. In this scenario the `Cell` properties `itemType`, `itemCheck` and `selectable` are not supported.

**ListView is not exported by the `tabris` module, but by `tabris-decorators`, which needs to be installed separately.**
