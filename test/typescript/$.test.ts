import { WidgetCollection, TextView, NativeObject } from 'tabris';

// See also JSX.test.tsx

let collection: WidgetCollection = $(null, [new TextView(), new TextView()]);
collection = $(null, new TextView());
collection = $('#foo');
collection = $(TextView);
collection = $((x: tabris.Widget) => x.cid === '$0');
let str: string = $(null, ['foo', 'bar']);
str = $(null, 'foo bar');
str = $(null, [null, 'bar', 23, true]);
str = $(null, 34);
const nativeObject: NativeObject = $(0);
