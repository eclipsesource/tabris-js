## Related Types

### ImageData

* JavaScript Type: `tabris.ImageData`
* TypeScript Type: `tabris.ImageData`

```ts
declare class ImageData {
  constructor(data: Uint8ClampedArray, width: number, height?: number);
  constructor(width: number, height: number);
  readonly data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}
```

Represents the underlying pixel data of an area of a `Canvas` widget. It is created using the methods `createImageData()` and `getImageData()`. It can also be used to set a part of the canvas by using `putImageData()`.


Explanation:

Property | Description
---------|-------------
`data`   | One-dimensional array containing the data in the RGBA order, with integer values between `0` and `255`.
`width`  | Width in pixels of the ImageData.
`height` | Height in pixels of the ImageData.
