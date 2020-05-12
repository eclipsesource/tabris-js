import {ColorResources, FontResources, TextResources} from 'tabris';
import * as colorData from './colors.json';
import * as fontData from './fonts.json';
import * as textData from './texts.json';

export const colors = ColorResources.from(colorData);
export const fonts = FontResources.from(fontData);
export const texts = TextResources.from(textData);
