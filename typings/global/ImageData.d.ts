/**
 * Represents pixel data of a `Canvas` widget.
 */
declare class ImageData {

  constructor(data: Uint8ClampedArray, width: number, height?: number);
  constructor(width: number, height: number);

  /**
   * A one-dimensional array containing the data in RGBA order, with integer values between 0 and 255 (inclusive).
   */
  readonly data: Uint8ClampedArray;

  /**
   * The actual height of the ImageData, in pixels.
   */
  readonly width: number;

  /**
   * The actual height of the ImageData, in pixels.
   */
  readonly height: number;

}