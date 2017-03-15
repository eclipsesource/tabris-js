
export function checkVersion(tabrisVersionString, clientVersionString) {
  let tabrisVersion = tabrisVersionString.split('.').map(toInt);
  let clientVersion = clientVersionString.split('.').map(toInt);
  if (tabrisVersion[0] !== clientVersion[0]) {
    console.error(createVersionMessage(clientVersion, tabrisVersion, 'incompatible with'));
  } else if (tabrisVersion[1] > clientVersion[1]) {
    console.warn(createVersionMessage(clientVersion, tabrisVersion, 'newer than'));
  }
}

function toInt(string) {
  return parseInt(string);
}

function createVersionMessage(clientVersion, tabrisVersion, versionComp) {
  let from = clientVersion[0] + '.0';
  let to = clientVersion[0] + '.' + clientVersion[1];
  return `Version mismatch: JavaScript module "tabris" (version ${tabrisVersion.join('.')}) ` +
         `is ${versionComp} the native tabris platform. ` +
         `Supported module versions: ${from} to ${to}.`;
}
