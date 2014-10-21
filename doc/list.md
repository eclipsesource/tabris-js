tabris.js list
===============

Tabris.js lists provide a convenient way to create lists using an array as the
data source and a template.

This is how a list can look like:

```javascript
var PAGE_MARGIN = 12;

var books = [
  ["Schroder: A Novel", "Amity Gaige"],
  ["Vampires in the Lemon Grove: Stories", "Karen Russell"],
  ["After Visiting Friends: A Son's Story", "Michael Hainey"]
].map(function(array) {
  return {
    title: array[0],
    author: array[1]
  };
});

tabris.create("List", {
  linesVisible: true,
  layoutData: {left: 0, right: 0, top: 0, bottom: 0},
  itemHeight: 72,
  template: [
    {
      type: "image",
      binding: "image",
      scaleMode: "FIT",
      left: [0, PAGE_MARGIN], top: [0, PAGE_MARGIN], width: 32, height: 48
    },
    {
      type: "text",
      binding: "title",
      left: [0, 56], right: [0, PAGE_MARGIN], top: [0, PAGE_MARGIN], bottom: [0, 0],
      foreground: "rgb(74, 74, 74)"
    },
    {
      type: "text",
      binding: "author",
      left: [0, 56], right: [0, PAGE_MARGIN], top: [0, 36], bottom: [0, 0],
      foreground: "rgb(123, 123, 123)"
    }
  ],
  items: books
}).appendTo(parent);
```

Lists have several list-specific properties which are explained below.

* `items` - an array of data items and each data item can be either an array or
an object. For each data item a list item will be created.
* `template` - optional, makes it possible to separate layout from the data
(If `template` was not set, the data items are set as list item texts). Template
 is documented in the [property types reference](propertyTypes).
* `linesVisible` - allows showing lines between list items to make different
list items better visually separated from each other.
* `itemHeight` - defines the height of a list item in pixels.
* `markupEnabled` - allows HTML to be rendered in the list data.

Updating the list data
---------

When the data array changes, the items array must be set again. This will
dispose of all the items and create new items for the updated data.

List events
-----------

The *Selection* event gets fired when a list item gets selected. It contains the
item itself and its index.
