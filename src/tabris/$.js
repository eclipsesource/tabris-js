import {joinTextContent, normalizeChildren} from './JsxProcessor';
import WidgetCollection from './WidgetCollection';
import Widget from './Widget';
import TextView from './widgets/TextView';

/**
 * @param {any} param
 * @param {Array=} arr
 * @returns {any}
 */
export default function $(param, arr) {
  if (param && arr) {
    throw new Error('$ does not support attributes');
  }
  if (arguments.length === 0) {
    throw new Error('$ is missing arguments or content');
  }
  if (arguments.length === 1 && typeof param === 'number') {
    // @ts-ignore
    return tabris._nativeObjectRegistry.find('$' + param);
  }
  if (arguments.length === 1) {
    // @ts-ignore
    return tabris.contentView.find(param);
  }
  if (arr instanceof Array && arr.length) {
    const flat = normalizeChildren(arr);
    if (flat.some(entry => entry instanceof Widget)) {
      const result = [];
      let str = [];
      flat.forEach(entry => {
        if (entry instanceof Widget) {
          if (str.length) {
            result.push(new TextView({text: joinTextContent(str, true)}));
            str = [];
          }
          result.push(entry);
        } else {
          str.push(entry);
        }
      });
      if (str.length) {
        result.push(new TextView({text: joinTextContent(str, true)}));
      }
      return new WidgetCollection(result);
    }
    return joinTextContent(flat, true);
  }
  return '';
}
