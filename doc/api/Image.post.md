## Related Types

### ImageValue

* JavaScript Type: `tabris.Image`, `Object`, `string`, `Blob`, `ImageBitmap`
* TypeScript Type: `tabris.ImageValue`

`ImageValue` describes any value that can be used to as an image in Tabris.js, which includes [`Image`](#class-image) instances, [`ImageLikeObject`](#imagelikeobject) and [`ImageSource`](#imagesource).

In TypeScript `ImageValue` is available as a union type exported by the `tabris` module.

### ImageLikeObject

* JavaScript Type: `Object`
* TypeScript Type: `tabris.ImageLikeObject`

```ts
interface ImageLikeObject {
  src: string | ImageBitmap | Blob;
  scale?: number | "auto";
  width?: number | "auto";
  height?: number | "auto";
}
```

A plain object implementing the same properties as [`Image`](#class-image).

Examples:

```js
{src: "images/catseye.jpg", width: 300, height: 200}
{src: blob, scale: 2}
```

### ImageSource

* JavaScript Type: `string`, `Blob`, `ImageBitmap`
* TypeScript Type: `tabris.ImageSource`

This is just the [source](#src) value of an `Image` by itself.

```js
"images/catseye.jpg"  // same as:
{src: "images/catseye.jpg"}
```
