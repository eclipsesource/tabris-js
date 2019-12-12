`ItemPicker` is a high-level extension of the low-level `Picker` widget. It provides additional API to make usage more convenient, but does not add any new features.

In contrast to `Picker`, it has an [`items`](#items) property (taking either an array or a [`List`](./List.md)) and does not necessarily require a callback to determine the text of a list entry. Instead the items can be strings themselves, implement a `toString()` method, or provide a specific property containing the text. This item property may be given via [`textSource`](#textsource).

**ListView is not exported by the `tabris` module, but by `tabris-decorators`, which needs to be installed separately.**
