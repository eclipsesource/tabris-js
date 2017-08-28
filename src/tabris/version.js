import {error} from './Console';

export function checkVersion(tabrisVersionString, clientVersionString) {
  if (!clientVersionString) {
    return;
  }
  let tabrisVersion = tabrisVersionString.split('.');
  let clientVersion = clientVersionString.split('.');
  if (tabrisVersion[0] !== clientVersion[0] || tabrisVersion[1] !== clientVersion[1]) {
    error(`Version mismatch: JavaScript module "tabris" (version ${tabrisVersionString}) ` +
    `is incompatible with the native tabris platform (version ${clientVersionString}).`);
  }
}
