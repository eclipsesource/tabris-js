import {joinTextContent, normalizeChildren} from './JsxProcessor';
import WidgetCollection from './WidgetCollection';
import Widget from './Widget';
import TextView from './widgets/TextView';

/**
 * @param {any} param
 * @param {Array=} arr
 * @returns {any}
 */
export default function $(param) {
  if (arguments.length === 0) {
    throw new Error('$ is missing arguments or content');
  }
  if (typeof param === 'number') {
    // @ts-ignore
    return tabris._nativeObjectRegistry.find('$' + param);
  }
  if (typeof param === 'string' || param instanceof Function) {
    // @ts-ignore
    return tabris.contentView.find(param);
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
  const flat = normalizeChildren(param.children);
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
