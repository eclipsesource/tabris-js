---
---
Resource Management
===================

## Introduction

Tabris.js provides a convenience API to create "resource dictionaries", which are simple objects containing only properties of one type, for example strings, [fonts](./api/Font.md), or [colors](./api/Color.md). These dictionaries are meant to be referenced in UI code, as opposed to hard-coding the values in place. By referencing resource values your code will be more readable, flexible and maintainable by moving all static data of a given type to one central place.

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

This approach does not require any Tabris.js specific API, plain object literals would work just fine. However, using `Resources` and its sublasses helps with selecting values based on criteria such as platform and language, converting between different data types and avoiding unnecessary duplicates. They are type-safe and while technically not immutable, do not change their values by themselves once created.

## Basics

Resource dictionaries are instances of the class `Resources`, which contains the logic for selecting and converting its values. However, instances are not created by calling its constructor but via various factories. These always take either one raw data object (see [Selector Syntax Reference](#selectorsyntaxreference)), or a `Resources` object to inherit from. When inheriting from a `Resources` object, the second parameter contains the additional data object which overwrites the "base" `Resources`. The raw data consists of a plain object containing one entry for each of the resource values, plus some configuration keys prefixed with `'$'`. Entries must start with a lower case letter.

For [font](#fontresources), [color](#colorresources) or [string](#textresources) dictionaries, use the pre-defined `FontResources.from()`, `ColorResources.from()` and `TextResources.from()` methods. Tabris.js also provides corresponding JSON schema for the data object parameters. This makes it convenient to extract the object in to a separate _.json_ file with comprehensive IDE tooling support. The [FontResources](#fontresources) section below exemplifies this for all explicitly supported resource types.

For creating dictionaries of arbitrary resource types the `Resources.build()` method is used. It creates a type-specific intermediate object `ResourceBuilder` (it's a "factory factory"), which may then be used once or multiple times to created resource dictionaries. This is covered in the section [Custom Resource Dictionaries](#customresourcedictionaries).


## FontResources

The following snippet shows how to define a font resource:

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

## ColorResources

The following snippet shows how to define a font resource using references in the definition:

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

## TextResources

The following snippet shows how to define a text resource:

```json
{
  "$schema": "../node_modules/tabris/schema/texts.json",
  "$fallbackLanguage": "en-US",
  "emphasisFont": {
    "en": "Emphasis Font",
    "de": "Hervorgehobene Schrift"
  },
  "tintColor": {
    "en-us": "Tint Color",
    "en-gb": "Tint Colour",
    "de": "Akzentfarbe"
  }
}
```

## Selector Syntax Reference

A resource selector is a plain object containing at least two entries with the raw resource value, or another resource selector. The type of the selector is determined by the name of the keys ("duck typing"). Therefore the resource itself - if it is a plain object - can not have any keys that overlap with those of a potential selector, otherwise it would be impossible to distinguish the two. The following keys are reserved for selectors:

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

An object with two or more keys that are [RFC 4646](http://tools.ietf.org/html/rfc4646) compliant language tags. Region subtags such as "en-us" are supported but optional. The entry that best matches the current value of `device.language` will be selected, so an entry of `'en'` matches both `'en-us'` and `'en-gb'`, while `'en-us'` only matches  itself.

Every language selector requires requires at least entry that matches the current designated "fallback language", which is defined in the root of the data object by the entry "$fallbackLanguage". If no such fallback is defined it defaults to "en". Example:

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
