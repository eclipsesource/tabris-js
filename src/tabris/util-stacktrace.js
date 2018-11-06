import {normalizePath, dirname} from './util';
import {warn} from './Console';

const androidStackLineRegex = /^ +at +(.+) +\((.*):([0-9]+):([0-9]+)\)/;
const androidStackLineNoNameRegex = /^ +at +(.*):([0-9]+):([0-9]+)/;
const iosStackLineRegex = /^(.+)@(.*):([0-9]+):([0-9]+)/;
const iosStackLineNoNameRegex = /(.*):([0-9]+):([0-9]+)/;
const urlBaseRegEx = /^[a-z]+:\/\/[^/]+\//;

export function getStackTrace(error) {
  try {
    let stack = error.stack.split('\n');
    stack = stack.filter(filterStackLine);
    stack = stack.map(normalizeStackLine);
    return stack.join('\n');
  } catch (ex) {
    warn(`Could not process stack trace (${ex.message}), delivering original.`);
    return error.stack;
  }
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
    const  [, fn, url, line, column] = fullMatch;
    const mapped = applySourceMap({
      fn: fn.split('.').pop(),
      url: fixUrl(url),
      line: parseInt(line, 10),
      column: parseInt(column, 10)
    });
    return `${mapped.fn} (${mapped.url}:${mapped.line}:${mapped.column})`;
  } else if (noNameMatch && noNameMatch.length === 4) {
    const [, url, line, column] = noNameMatch;
    const mapped = applySourceMap({
      url: fixUrl(url),
      line: parseInt(line, 10),
      column: parseInt(column, 10)
    });
    return `${mapped.url}:${mapped.line}:${mapped.column}`;
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

function applySourceMap(stackLineData) {
  let {fn, url, line, column} = stackLineData;
  const sourceMap = tabris.Module.getSourceMap(url);
  if (sourceMap) {
    if (!sourceMap.decodedMappings) {
      sourceMap.decodedMappings = decodeMappings(sourceMap.mappings);
    }
    const match = findMapping(sourceMap.decodedMappings, line, column);
    if (match && match.length >= 4) {
      // TODO: use name index (match[4] if present) to rename "fn"
      const [generatedColumn, orgFile, orgLine, orgColumn] = match;
      url = './' + normalizePath(dirname(url) + '/' + sourceMap.sources[orgFile]);
      line = orgLine + 1;
      column = column + (orgColumn - generatedColumn);
    }
  }
  return {fn, url, line, column};
}

function findMapping(mappings, line, column) {
  const lineMappings = mappings ? mappings[line - 1] : null;
  if (!lineMappings || !lineMappings.length) {
    return null;
  }
  return lineMappings.find((mapping, index) => {
    if (!mapping) {
      return false;
    }
    const next = lineMappings[index + 1];
    const startColumn = mapping[0] + 1;
    const endColumn = next ? next[0] + 1 : Infinity;
    return column >= startColumn && column < endColumn;
  });
}

/**
 * All code below
 * based on https://github.com/Rich-Harris/vlq/blob/b7093c21ec6c9bbfed454d2785909b53cec4bd98/src/vlq.ts
 * Copyright (c) 2017 Rich-Harris and MattiasBuelens
 * MIT licensed: https://github.com/Rich-Harris/vlq/blob/b7093c21ec6c9bbfed454d2785909b53cec4bd98/LICENSE
 */
const charToInteger = {};
const integerToChar = {};

'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('')
  .forEach((char, i) => {
    charToInteger[char] = i;
    integerToChar[i] = char;
  });

function decodeMappings(mappings) {
  let sourceFileIndex = 0;
  let sourceCodeLine = 0;
  let sourceCodeColumn = 0;
  let nameIndex = 0;
  return mappings.split(';')
    .map(line => line.split(',').map(decodeVLQ))
    .map(line => {
      let generatedCodeColumn = 0;
      return line.map(segment => {
        let result;
        if (segment.length === 0) {
          return null;
        }
        generatedCodeColumn += segment[0];
        result = [generatedCodeColumn];
        if (segment.length === 1) {
          return result;// ???
        }
        sourceFileIndex += segment[1];
        sourceCodeLine += segment[2];
        sourceCodeColumn += segment[3];
        result.push(sourceFileIndex, sourceCodeLine, sourceCodeColumn);
        if (segment.length === 5) {
          nameIndex += segment[4];
          result.push(nameIndex);
        }
        return result;
      });
    });

}

function decodeVLQ(string) {
  const result = [];
  let shift = 0;
  let value = 0;
  for (let i = 0; i < string.length; i++) {
    let integer = charToInteger[ string[i] ];
    if (integer === undefined) {
      throw new Error('Invalid character (' + string[i] + ')');
    }
    const hasContinuationBit = integer & 32;
    integer &= 31;
    value += integer << shift;
    if (hasContinuationBit) {
      shift += 5;
    } else {
      const shouldNegate = value & 1;
      value >>= 1;
      result.push(shouldNegate ? -value : value);
      value = shift = 0;
    }
  }
  return result;
}
