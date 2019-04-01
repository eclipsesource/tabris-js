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
import JsxProcessor, {createJsxProcessor, JSX} from './JsxProcessor';
import Action from './widgets/Action';
import ActionSheet, {ActionSheetItem} from './ActionSheet';
import ActivityIndicator from './widgets/ActivityIndicator';
import AlertDialog from './AlertDialog';
import Button from './widgets/Button';
import Canvas from './widgets/Canvas';
import CheckBox from './widgets/CheckBox';
import CollectionView from './widgets/CollectionView';
import Color from './Color';
import Console from './Console';
import {format} from './Formatter';
import Stack from './widgets/Stack';
import StackLayout from './StackLayout';
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
import InactivityTimer from './InactivityTimer';
import Layout, {ConstraintLayout} from './Layout';
import LayoutData from './LayoutData';
import Listeners, {ChangeListeners} from './Listeners';
import LinearGradient from './LinearGradient';
import Page from './widgets/Page';
import Percent from './Percent';
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
import {patchError} from './util-stacktrace';
import Video from './widgets/Video';
import WebView from './widgets/WebView';
import WebSocket from './WebSocket';
import Widget from './Widget';
import WidgetCollection from './WidgetCollection';
import Worker from './Worker';
import XMLHttpRequest from './XMLHttpRequest';
import $ from './$';

import {fetch} from './fetch/fetch';
import Headers from './fetch/Headers';
import Request from './fetch/Request';
import Response from './fetch/Response';

if (global.tabris && global.tabris.version) {
  throw new Error('tabris module already loaded. Ensure the module is installed only once.');
}

const tabrisMain = Object.assign(new Tabris(), {
  Action,
  ActionSheet,
  ActionSheetItem,
  ActivityIndicator,
  AlertDialog,
  App,
  Button,
  Canvas,
  ChangeListeners,
  CheckBox,
  CollectionView,
  Color,
  ConstraintLayout,
  StackLayout,
  Stack,
  Composite,
  Constraint,
  Console,
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
  JSX,
  Layout,
  LayoutData,
  Listeners,
  LinearGradient,
  NativeObject,
  NavigationView,
  NavigationBar,
  Popover,
  Page,
  Percent,
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
  $,
  XMLHttpRequest,
  Worker,
  fetch,
  format,
  Headers,
  Request,
  Response,
});

/** @typedef {typeof tabrisMain} TabrisMain */

// @ts-ignore
module.exports = tabrisMain;
global.tabris = tabrisMain;

Object.assign(global, {
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
  Worker,
  $
});

tabrisMain.on('start', (options) => {
  patchError(Error);
  tabris.app = createApp();
  checkVersion(tabris.version, tabris.app._nativeGet('tabrisJsVersion'));
  if (!options || !options.headless) {
    tabris.contentView = createContentView();
    tabris.drawer = createDrawer();
    tabris.navigationBar = createNavigationBar();
    tabris.statusBar = createStatusBar();
    tabris.printer = createPrinter();
    tabris.JSX.install(createJsxProcessor());
  }
  tabris.device = createDevice();
  tabris.fs = createFileSystem();
  publishDeviceProperties(tabris.device, global);
  tabris.localStorage = createStorage();
  if (tabris.device.platform === 'iOS') {
    tabris.secureStorage = createStorage(true);
  }
  tabris.crypto = new Crypto();
  if (global.console['print']) {
    global.console = createConsole(global.console);
  }
  tabris.pkcs5 = new Pkcs5();
  global.localStorage = tabrisMain.localStorage;
  global.secureStorage = tabrisMain.secureStorage;
  global.crypto = tabrisMain.crypto;
  global.JSX = tabrisMain.JSX;
});
addDOMDocument(global);
addDOMEventTargetMethods(global);
addWindowTimerMethods(global);
