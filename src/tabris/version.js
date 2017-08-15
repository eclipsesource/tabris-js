
export function checkVersion(tabrisVersionString, clientVersionString) {
  if (!clientVersionString) {
    return;
  }
  let tabrisVersion = tabrisVersionString.split('.');
  let clientVersion = clientVersionString.split('.');
  if (tabrisVersion[0] !== clientVersion[0] || tabrisVersion[1] !== clientVersion[1]) {
    printError(`Version mismatch: JavaScript module "tabris" (version ${tabrisVersionString}) ` +
    `is incompatible with the native tabris platform (version ${clientVersionString}).`);
  }
}

// At this point the wrapped console object may not be available
function printError(msg) {
  console.print ? console.print('error', msg) : console.error(msg);
}
