import {ColorResources, FontResources} from 'tabris';
import * as colorData from './colors.json';
import * as fontData from './fonts.json';

export const colors = ColorResources.from(colorData);
export const fonts = FontResources.from(fontData);
