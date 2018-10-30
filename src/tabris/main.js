import './load-polyfill';

import {checkVersion} from './version';
import Tabris from './Tabris';
import Device, {create as createDevice, publishDeviceProperties} from './Device';
import Printer, {create as createPrinter} from './Printer';
import App, {create as createApp} from './App';
import FileSystem, {create as createFileSystem} from './FileSystem';
import {createConsole} from './Console';
import Constraint from './Constraint';
import {addDOMDocument} from './Document';
import Event, {addDOMEventTargetMethods} from './Event';
import {addWindowTimerMethods} from './WindowTimers';
import Storage, {create as createStorage} from './Storage';
import JsxProcessor, {createJsxProcessor} from './JsxProcessor';
import Action from './widgets/Action';
import ActionSheet, {ActionSheetItem} from './ActionSheet';
import ActivityIndicator from './widgets/ActivityIndicator';
import AlertDialog from './AlertDialog';
import Button from './widgets/Button';
import Canvas from './widgets/Canvas';
import CheckBox from './widgets/CheckBox';
import CollectionView from './widgets/CollectionView';
import Color from './Color';
import ColumnLayout from './ColumnLayout';
import Composite from './widgets/Composite';
import ContentView, {create as createContentView} from './widgets/ContentView';
import Crypto from './Crypto';
import Drawer, {create as createDrawer} from './widgets/Drawer';
import DateDialog from './DateDialog';
import EventObject from './EventObject';
import Font from './Font';
import Image from './Image';
import ImageData from './ImageData';
import ImageView from './widgets/ImageView';
import InactivityTimer from './InactivityTimer.js';
import Listeners from './Listeners.js';
import Layout from './Layout.js';
import LayoutData from './LayoutData.js';
import Page from './widgets/Page';
import Picker from './widgets/Picker';
import Pkcs5 from './Pkcs5';
import ProgressEvent from './ProgressEvent';
import ProgressBar from './widgets/ProgressBar';
import Popover from './Popover';
import NativeObject from './NativeObject';
import NavigationView from './widgets/NavigationView';
import NavigationBar, {create as createNavigationBar} from './widgets/NavigationBar';
import RadioButton from './widgets/RadioButton';
import RefreshComposite from './widgets/RefreshComposite';
import ScrollView from './widgets/ScrollView';
import SearchAction from './widgets/SearchAction';
import Slider from './widgets/Slider';
import StatusBar, {create as createStatusBar} from './widgets/StatusBar';
import Switch from './widgets/Switch';
import Tab from './widgets/Tab';
import TabFolder from './widgets/TabFolder';
import TextInput from './widgets/TextInput';
import TextView from './widgets/TextView';
import TimeDialog from './TimeDialog';
import ToggleButton from './widgets/ToggleButton';
import Video from './widgets/Video';
import WebView from './widgets/WebView';
import WebSocket from './WebSocket';
import Widget from './Widget';
import WidgetCollection from './WidgetCollection';
import Worker from './Worker';
import XMLHttpRequest from './XMLHttpRequest';

import {fetch} from './fetch/fetch';
import Headers from './fetch/Headers';
import Request from './fetch/Request';
import Response from './fetch/Response';

const window = global.window;

if (global.tabris && global.tabris.version) {
  throw new Error('tabris module already loaded. Ensure the module is installed only once.');
}

module.exports = global.tabris = Object.assign(new Tabris(), {
  Action,
  ActionSheet,
  ActionSheetItem,
  ActivityIndicator,
  AlertDialog,
  App,
  Button,
  Canvas,
  CheckBox,
  CollectionView,
  Color,
  ColumnLayout,
  Composite,
  Constraint,
  ContentView,
  Crypto,
  DateDialog,
  Device,
  Drawer,
  Event,
  EventObject,
  FileSystem,
  Font,
  Image,
  ImageData,
  ImageView,
  InactivityTimer,
  JsxProcessor,
  Listeners,
  Layout,
  LayoutData,
  NativeObject,
  NavigationView,
  NavigationBar,
  Popover,
  Page,
  Picker,
  Printer,
  ProgressBar,
  ProgressEvent,
  RadioButton,
  RefreshComposite,
  ScrollView,
  SearchAction,
  Slider,
  Storage,
  StatusBar,
  Switch,
  Tab,
  TabFolder,
  TextInput,
  TextView,
  TimeDialog,
  ToggleButton,
  Video,
  WebSocket,
  WebView,
  Widget,
  WidgetCollection,
  XMLHttpRequest,
  Worker,
  fetch,
  Headers,
  Request,
  Response,
});

Object.assign(window, {
  Crypto,
  ImageData,
  ProgressEvent,
  Storage,
  WebSocket,
  XMLHttpRequest,
  fetch,
  Headers,
  Request,
  Response,
  JSX: createJsxProcessor(),
  Worker
});

tabris.on('start', (options) => {
  tabris.app = createApp();
  checkVersion(tabris.version, tabris.app._nativeGet('tabrisJsVersion'));
  if (!options || !options.headless) {
    tabris.contentView = createContentView();
    createLegacyDelegate('contentView');
    tabris.drawer = createDrawer();
    createLegacyDelegate('drawer');
    tabris.navigationBar = createNavigationBar();
    createLegacyDelegate('navigationBar');
    tabris.statusBar = createStatusBar();
    createLegacyDelegate('statusBar');
    tabris.printer = createPrinter();
  }
  tabris.device = createDevice();
  tabris.fs = createFileSystem();
  publishDeviceProperties(tabris.device, window);
  window.localStorage = tabris.localStorage = createStorage();
  if (tabris.device.platform === 'iOS') {
    window.secureStorage = tabris.secureStorage = createStorage(true);
  }
  window.crypto = tabris.crypto = new Crypto();
  if (window.console.print) {
    window.console = createConsole(window.console);
  }
  tabris.pkcs5 = new Pkcs5();
});

addDOMDocument(window);
addDOMEventTargetMethods(window);
addWindowTimerMethods(window);

function createLegacyDelegate(property) {
  Object.defineProperty(tabris.ui = tabris.ui || {}, property, {
    configurable: true,
    get() {
      console.warn(`ui.${property} is deprecated and will be removed in 3.0.0!`);
      return tabris[property];
    }
  });
}
