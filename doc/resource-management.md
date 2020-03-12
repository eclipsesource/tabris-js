---
---
Resource Management
===================

## Introduction

Tabris.js provides a convenience API to create "resource dictionaries", which are simple objects containing only properties of one type, for example strings, [fonts](./api/Font.md), or [colors](./api/Color.md). These dictionaries are meant to be referenced in UI code, as opposed to hard-coding the values in place. Moving all static data of a given type to one central place can make your code more readable, flexible and maintainable.

To get a first impression of the mechanism, we look at the following layout definition with hard-coded values:

```jsx
import {contentView, TextView, Stack, CheckBox} from 'tabris';

contentView.set({background: 'rgb(200, 100, 100)').append(
  <Stack>
    <TextView font='22px Arial' textColor='rgb(0, 10, 10)'>
      These are the user settings. What you change here will affect
      all devices that use this log-in.
    <CheckBox font='22px Arial'>
      Show account overview on main screen
    </CheckBox>
  </Stack>
);
```
By leveraging the resource dictionaries we can turn it into:

```jsx
import {contentView, TextView, Stack, CheckBox} from 'tabris';
import {colors, fonts, texts} from './resources';

contentView.set({background: colors.settingsBackground}).append(
  <Stack>
    <TextView font={fonts.default} textColor={colors.foreground} text={texts.settings}/>
    <CheckBox font={fonts.default} text={texts.settingShowOverview}/>
  </Stack>
);
```

This approach does not necessarily require any Tabris.js specific API, plain object literals can work just fine. However, using `Resources` and its sublasses helps with selecting values based on criteria such as platform and language, converting between different data types and avoiding unnecessary duplicates. They are type-safe and while technically not immutable, do not change their values by themselves once created.

## Basics

Resource dictionaries are instances of the class `Resources`, which contains the logic for selecting and converting its values. However, instances are not created by calling its constructor but via various factories. These always take one raw "data" object (see [Selector Syntax Reference](#selector-syntax-reference)) and optionally an existing "base" resource dictionary object to inherit from. The "base" object, if present, will be the first parameter and "data" the second. The raw data consists of a plain object containing one entry for each of the resource values, plus some configuration keys prefixed with `'$'`. Entries must start with a lower case letter.

For [font](#fontresources), [color](#colorresources) or [string](#textresources) dictionaries, use the pre-defined [`FontResources.from()`](./api/FontResources.md#fromdata), [`ColorResources.from()`](./api/ColorResources.md#fromdata) and [`TextResources.from()`](./api/TextResources.md#fromdata) methods. Tabris.js also provides corresponding JSON schema for the data object parameters. This makes it convenient to extract the object in to a separate _.json_ file with comprehensive IDE tooling support. The [FontResources](#fontresources) section below exemplifies this for all explicitly supported resource types.

For creating dictionaries of arbitrary resource types the `Resources.build()` method is used. This is covered in the section [Custom Resource Dictionaries](#custom-resource-dictionaries).

## Setup

Create a separate directory dedicated to your resource dictionaries. The examples below assume a project structure like this:

```
|-src
| |-resources
| | |-fonts.json
| | |-colors.json
| | |-texts.json
| | |-index.js
| |-app.js
|-package.json
```

If your project has a `tsconfig.json` or `jsconfig.json` make sure it contains the compiler option `"resolveJsonModule": true`. This makes it possible to consume the _.json_ files as modules without loosing type safety.

The `index.js` (or `index.ts`) module will take care of converting the raw data to resources dictionaries and exporting them from the `resources` directory. (Hint: A file named "index.js" allows [treating an entire directory as a single module](https://nodejs.org/api/modules.html#modules_folders_as_modules).) An example for this can be found [here](https://github.com/eclipsesource/tabris-js/blob/v${doc:moduleversion}/snippets/resources/index.ts).

> Note: You don't need to follow this exact layout of course, but it is the assumed configuration used in all examples below.

## FontResources

A font may be defined as a [string or object](${doc:FontValueUrl}). In the resource dictionary both will be converted to an instance of [Font](./api/Font.md).

The following snippet shows an example _fonts.json_ file that defines two fonts aliased as "buttonLabel" and "counter". It also showcases selecting a resource based on the platform (operating system) of the device:

```json
{
  "$schema": "../node_modules/tabris/schema/fonts.json",
  "buttonLabel": "medium 22px 'serif'",
  "counter": {
    "android": {
      "size": 22,
      "family": ["sans-serif"],
      "style": "italic"
    },
    "ios": {
      "size": 22,
      "family": ["sans-serif"],
      "weight": "black"
    },
  }
}
```

The optional `$schema` key may be used by the IDE to provide tooling support. It should point to the `fonts.json` schema file that is installed with the tabris npm module.

The file can be converted to a runtime resource dictionary with the following code in the `index.js` module:

```js
import {FontResources} from 'tabris';
import * as fontData from './fonts.json';

export const fonts = FontResources.from(fontData);
```

The fonts can then by used in any module that imports the resource dictionary like this:

```js
import {contentView, TextView} from 'tabris';
import {fonts} from './resources';

//...

myTextView.font = fonts.counter;
```

## ColorResources

A color may be defined as a [string or array](${doc:ColorValueUrl}). In the resource dictionary both will be converted to an instance of [Color](./api/Color.md).

The following snippet shows an example _colors.json_ file that defines colors via hex notation, in some cases based on the device platform. It also shows how to [back reference](#resource-reference) an already defined resource in the case of the `tint` entry.

```json
{
  "$schema": "../node_modules/tabris/schema/colors.json",
  "myBackground": "#DFFF94",
  "myBlue": "#435FBD",
  "myRed": {
    "android": "#8F0B12",
    "ios": "#EC2121"
  },
  "tint": {
    "android": {"ref": "myBlue"},
    "ios": {"ref": "myRed"}
  }
}
```

The optional `$schema` key may be used be the IDE to provide tooling support. It should point to the `color.json` schema file that is installed with the tabris npm module.

The file can be converted to a runtime resource dictionary with the following code in the `index.js` module:

```js
import {ColorResources} from 'tabris';
import * as colorData from './colors.json';

export const colors = ColorResources.from(colorData);
```

The fonts can then by used in any module that imports the resource dictionary like this:

```js
import {contentView, TextView} from 'tabris';
import {colors} from './resources';

//...

myTextView.textColor = colors.tint;
```

## TextResources

The following snippet shows an example _texts.json_ file that defines strings based on the device language setting. It also defines American English as the default language (`$fallbackLanguage`) in case there is no string resource defined for the actual device language.

```json
{
  "$schema": "../node_modules/tabris/schema/texts.json",
  "$fallbackLanguage": "en-US",
  "emphasisFontLabel": {
    "en": "Emphasis Font",
    "de": "Hervorgehobene Schrift"
  },
  "tintColorLabel": {
    "en-us": "Tint Color",
    "en-gb": "Tint Colour",
    "de": "Akzentfarbe"
  }
}
```

The optional `$schema` key may be used be the IDE to provide tooling support. It should point to the `texts.json` schema file that is installed with the tabris npm module.

The file can be converted to a runtime resource dictionary with the following code in the `index.js` module:

```js
import {TextResources} from 'tabris';
import * as textData from './texts.json';

export const texts = TextResources.from(textData);
```

The strings can then by used in any module that imports the resource dictionary like this:

```jsx
import {contentView, TextView} from 'tabris';
import {texts} from './resources';

//...

myTextView.text = texts.tintColorLabel;
```

## Custom Resource Dictionaries

The [`ResourceBuilder`](./api/ResourceBuilder.md) allows the creation of dictionaries of arbitrary resource types. An instance of this class is a factory configured for a specific type of resources, just as the pre-defined factories featured above.

A `ResourceBuilder` can be obtained from [`Resources.build()`](./api/Resources.md#buildoptions) (a "factory factory"), which may then be used once or multiple times to created resource dictionaries. The build method expects an "options" object that determines the type of the resource, as well as the "raw" data type from which to create the resource values from. It can have the following entries, of which at least one has to be present:

Option | Description
-|-
`validator` | A function that receives a raw resource value (unconverted, as provided in the input data object) and must return a boolean indicating whether it is accepted. This means it either is a value that will be accepted by the converter, or - if no converter is present - it must be the final format of the resource value.
`converter` | A function that receives the raw input value and returns the value as it will be present on the final resource dictionary. If no converter is given the raw type is the same as the resource type.
`type` | A constructor of the type of the final resource value as returned by the converter. For primitives this option must not be given.

Since the [`Image`](./api/Image.md) class already provides a validator (`Image.isValidImageValue()`) and converter (`Image.from`), an Image resource dictionary can be built like this:

```js
const imageResourceBuilder = Resources.build({
  type: Image,
  validator: Image.isValidImageValue,
  converter: Image.from
});
```
The resulting `ResourceBuilder` has only one method `from()`, which takes either just the raw resource data, or a "base" dictionary and the resource data. It will create a dictionary of `Image` objects, where the input object may take any valid ${doc:ImageValue} such as strings.

Since there is no JSON schema provided by Tabris.js for this data type there is not much benefit to extracting a _.json_ file. If we don't want to re-used the builder either the entire process of creating an image resource dictionary can be condensed like this:

```js
export const images = Resources.build({
  type: Image, validator: Image.isValidImageValue, converter: Image.from
}).from({
  arrow: {
    '1x': 'resources/arrow@1x.png',
    '3x': 'resources/arrow@3x.png'
  }
});
```

## Selector Syntax Reference

A resource selector is a plain object containing at least two entries containing the raw resource value, or another resource selector. The type of the selector is determined by the name of the keys (["duck typing"](https://en.wikipedia.org/wiki/Duck_typing)). Therefore the resource itself - if it is a plain object - can not have any keys that overlap with those of a potential selector, otherwise it would be impossible to distinguish the two. The following keys are reserved for selectors:

Language tags, `'[number]x'`, `'android'`, `'ios'`, `'small'`, `'normal'`, `'large'`, `'xlarge'`, `'horizontal'`, `'vertical'`, `'landscape'`, `'portrait'`, `'debug'`, `'production'`, `'phone'`, `'tablet'`, `'browser'`, `'online'`, `'offline'`, `'wifi'`, `'cell'`, `'other'`, `'long'`, `'notlong'`, `'ldrtl'`, `'ldltr'`, keys tarting with `'mcc'`,  and any key containing special characters such as `'*'`.

Selector keys are always case-insensitive.

### Platform Selector

An object with exactly two entries "android" and "ios". Example:

```json
{
  "android": "red",
  "ios": "blue"
}
```

### Language Selector

An object with two or more keys that are [RFC 4646](http://tools.ietf.org/html/rfc4646) compliant language tags. Region subtags such as "en-us" are supported but optional. The entry that best matches the current value of `device.language` will be selected, so an entry of `'en'` matches both `'en-us'` and `'en-gb'`, while `'en-us'` only matches itself.

Every language selector requires requires at least one entry that matches the current designated "fallback language", which is defined in the root of the data object by the entry "$fallbackLanguage". If no such fallback is defined it defaults to "en".

Example:

```json
{
  "$fallbackLanguage": "en-US",
  "text1": {
    "en-us": "This is the fallback value",
    "en-gb": "This is for british english",
    "de": "This is for german"
  },
  "text2": {
    "en": "This is also a valid fallback value",
    "de": "German again"
  },
}
```

### Scale Selector

An object with two or more keys that match the pattern of `'[scaleFactor]x'`. The value with the number that best matches the current value of `device.scaleFactor` is selected.

If the current scale factor of the device is lower than the lowest available entry in the selector, the lowest one is chosen. If it is higher, the highest one is chosen. If it falls between two of the entries, the lower value is selected by default. This behavior can be changed  with the configuration key `'$scaleFactor'` at the root of the data object. It can have a value of `'nearest'`, `'lower'` or `'higher'`. Example:

```json
{
  "scaleFactor": "nearest",
  "myValue": {
    "1x": "selected for a scale factor below 1.5",
    "2x": "selected for a scale factor between 1.5 and 2.75",
    "3.5x": "selected for a scale factor above 2.75"
  }
}
```

### Nested Selectors

Resource selectors of different types can be nested as needed. This is a platform selector within a language selector:

```json
{
  "myValue": {
    "en": {
      "android": "English on android",
      "ios": "English on iOS",
    },
    "de": "German on any platform"
  }
}
```

### Resource Reference

A selector may point to another resource defined or inherited by the resource dictionary. That way the same value may have different usages, but does not have to be defined more than once. The format of such a resource reference is a plain object with a single entry "ref" that contains a string matching the name of another resource entry:

```json
{
  "myBlue": "#435FBD",
  "myRed": {
    "android": "#8F0B12",
    "ios": "#EC2121"
  },
  "tint": {
    "android": {"ref": "myBlue"},
    "ios": {"ref": "myRed"}
  }
}
```

### Inherit Marker

Resources values inherited from a "base" object are overwritten if the name is used again. However, it is possible to make exceptions by selecting an object that is exactly `{"inherit": true}`. Assuming the "base" object already contains an entry `myValue`, this example will override it only on devices set to German:

```json
{
  "myValue": {
    "en": {"inherit": true},
    "de": "Overrides 'myValue'"
  }
}
```
