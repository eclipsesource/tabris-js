const androidStackLineRegex = /^ +at +(.+) +\((.*):([0-9]+):([0-9]+)\)/;
const androidStackLineNoNameRegex = /^ +at +(.*):([0-9]+):([0-9]+)/;
const iosStackLineRegex = /^(.+)@(.*):([0-9]+):([0-9]+)/;
const iosStackLineNoNameRegex = /(.*):([0-9]+):([0-9]+)/;
const urlBaseRegEx = /^[a-z]+:\/\/[^/]+\//;

export function getStackTrace(error) {
  let stack = error.stack.split('\n');
  stack = stack.filter(filterStackLine);
  stack = stack.map(normalizeStackLine);
  return stack.join('\n');
}

function filterStackLine(line) {
  if (tabris.device.platform === 'Android' && !androidStackLineNoNameRegex.test(line)) {
    return false;
  }
  return line.indexOf('tabris/tabris.min.js:') === -1 && line.indexOf('@[native code]') === -1;
}

function normalizeStackLine(line) {
  const regex = tabris.device.platform === 'Android' ? androidStackLineRegex : iosStackLineRegex;
  const noNameRegex = tabris.device.platform === 'Android' ? androidStackLineNoNameRegex : iosStackLineNoNameRegex;
  const fullMatch = line.match(regex);
  const noNameMatch = line.match(noNameRegex);
  if (fullMatch && fullMatch.length === 5) {
    let [, fn, url, line, column] = fullMatch;
    return `${fn.split('.').pop()} (${fixUrl(url)}:${line}:${column})`;
  } else if (noNameMatch && noNameMatch.length === 4) {
    let [, url, line, column] = noNameMatch;
    return `${fixUrl(url)}:${line}:${column}`;
  } else {
    return line;
  }
}

function fixUrl(url) {
  const urlBase = url.match(urlBaseRegEx);
  if (urlBase) {
    return './' + url.slice(urlBase[0].length);
  }
  return url;
}
