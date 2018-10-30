import {Drawer, drawer, EventObject, Properties, ContentView} from 'tabris';

const object: Drawer = drawer;
const conentView: ContentView = drawer;

// Propeties
let enabled: boolean;

enabled = drawer.enabled;

drawer.enabled = enabled;

let properties: Properties<Drawer> = {enabled};
drawer.set(properties);

// Methods
let thisReturnValue: Drawer;

thisReturnValue = drawer.close();
thisReturnValue = drawer.open();

// Events
let target: Drawer = drawer;
let timeStamp: number = 0;
let type: string = 'foo';

let drawerCloseEvent: EventObject<Drawer> = {target, timeStamp, type};

drawer.onClose((event: EventObject<Drawer>) => {});
