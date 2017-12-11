import {App, app, EventObject, AppBackNavigationEvent} from 'tabris';

// Properties
let id: string;
let pinnedCertificates: any[];
let version: string;
let versionCode: number;

id = app.id;
pinnedCertificates = app.pinnedCertificates;
version = app.version;
versionCode = app.versionCode;

app.pinnedCertificates = pinnedCertificates;

// Methods
let path: string = '';
let url: string = '';
let alias = '';
let file = '';
let callback: (error: Error|null, patch: any|null) => void = () => {};
let voidReturnValue: void;
let voidPromiseReturnValue: Promise<void>;
let stringReturnValue: string;

stringReturnValue = app.getResourceLocation(path);
voidReturnValue = app.installPatch(url, callback);
voidReturnValue = app.reload();
voidReturnValue = app.registerFont(alias, file);
voidPromiseReturnValue = app.launch(url);

// Events
let target: App = app;
let timeStamp: number = 0;
let type: string = 'foo';
let preventDefault: () => void = () => {};

let backgroundEvent: EventObject<App> = {target, timeStamp, type};
let backNavigationEvent: AppBackNavigationEvent = {target, timeStamp, type, preventDefault};
let foregroundEvent: EventObject<App> = {target, timeStamp, type};
let pauseEvent: EventObject<App> = {target, timeStamp, type};
let resumeEvent: EventObject<App> = {target, timeStamp, type};
let terminateEvent: EventObject<App> = {target, timeStamp, type};

app.on({
  background: (event: EventObject<App>) => {},
  backNavigation: (event: EventObject<App>) => {},
  foreground: (event: EventObject<App>) => {},
  pause: (event: EventObject<App>) => {},
  resume: (event: EventObject<App>) => {},
  terminate: (event: EventObject<App>) => {}
});
