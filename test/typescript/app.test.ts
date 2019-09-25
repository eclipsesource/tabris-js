import {App, app, EventObject, AppKeyPressEvent, AppBackNavigationEvent} from 'tabris';

// Properties
let id: string;
let pinnedCertificates: any[];
let version: string;
let versionCode: number;
let debugBuild: boolean;

id = app.id;
pinnedCertificates = app.pinnedCertificates;
version = app.version;
versionCode = app.versionCode;
debugBuild = app.debugBuild;

app.pinnedCertificates = pinnedCertificates;

// Methods
let path: string = '';
let url: string = '';
let alias = '';
let file = '';
let voidReturnValue: void;
let voidPromiseReturnValue: Promise<void>;
let stringReturnValue: string;

stringReturnValue = app.getResourceLocation(path);
voidReturnValue = app.reload();
voidReturnValue = app.close();
voidReturnValue = app.registerFont(alias, file);
voidPromiseReturnValue = app.launch(url);

// Events
let target: App = app;
let timeStamp: number = 0;
let type: string = 'foo';
let keyCode: number = 29;
let character: string = 'A';
let shiftKey: boolean = true;
let ctrlKey: boolean = false;
let altKey: boolean = false;
let functionKey: boolean = false;
let action: 'up' | 'down' = 'down';
let time: number = 1569420619987;
let deviceId: number = 0;
let preventDefault: () => void = () => {};

let backgroundEvent: EventObject<App> = {target, timeStamp, type};
let keyPressEvent: AppKeyPressEvent = {
  target, timeStamp, type, preventDefault, keyCode, character,
  shiftKey, ctrlKey, altKey, functionKey, action, time, deviceId
};
let backNavigationEvent: AppBackNavigationEvent = {target, timeStamp, type, preventDefault};
let foregroundEvent: EventObject<App> = {target, timeStamp, type};
let pauseEvent: EventObject<App> = {target, timeStamp, type};
let resumeEvent: EventObject<App> = {target, timeStamp, type};
let terminateEvent: EventObject<App> = {target, timeStamp, type};

app
  .onBackground((event: EventObject<App>) => {})
  .onKeyPress((event: AppKeyPressEvent) => event.preventDefault())
  .onBackNavigation((event: AppBackNavigationEvent) => event.preventDefault())
  .onForeground((event: EventObject<App>) => {})
  .onPause((event: EventObject<App>) => {})
  .onResume((event: EventObject<App>) => {})
  .onTerminate((event: EventObject<App>) => {});
