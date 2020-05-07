import {joinTextContent, flattenChildren} from './JsxProcessor';
import WidgetCollection from './WidgetCollection';
import Widget from './Widget';
import TextView from './widgets/TextView';

/**
 * @param {any=} param
 * @param {Array=} arr
 * @returns {any}
 */
export default function $(param) {
  if (typeof param === 'number') {
    // @ts-ignore
    return tabris._nativeObjectRegistry.find('$' + param);
  }
  if (typeof param === 'string' || param instanceof Function || arguments.length === 0) {
    // @ts-ignore
    return tabris.contentView.find(param || '*');
  }
  if (!(param instanceof Object)) {
    return '' + param;
  }
  if (!Object.keys(param).length) {
    return new WidgetCollection();
  }
  if (Object.keys(param).length > 1 || !('children' in param)) {
    throw new Error('$ does not support attributes');
  }
  const flat = flattenChildren(param.children);
  if (flat.some(entry => entry instanceof Widget) || flat.length < 1) {
    return toWidgetCollection(flat);
  }
  return joinTextContent(flat, false);
}

function toWidgetCollection(flat) {
  const result = [];
  let str = [];
  flat.forEach(entry => {
    if (entry instanceof Widget) {
      if (str.length) {
        result.push(new TextView({text: joinTextContent(str, false)}));
        str = [];
      }
      result.push(entry);
    } else {
      str.push(entry);
    }
  });
  if (str.length) {
    result.push(new TextView({text: joinTextContent(str, false)}));
  }
  return new WidgetCollection(result);
}
