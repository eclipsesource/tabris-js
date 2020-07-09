import './load-polyfill';

import {checkVersion} from './version';
import Tabris from './Tabris';
import Device, {create as createDevice, publishDeviceProperties} from './Device';
import CanvasContext from './CanvasContext';
import Printer, {create as createPrinter} from './Printer';
import Permission, {create as createPermission} from './Permission';
import App, {create as createApp} from './App';
import FileSystem, {create as createFileSystem} from './FileSystem';
import DevTools, {create as createDevTools} from './DevTools';
import Console, {createConsole} from './Console';
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
import Blob from './Blob';
import Button from './widgets/Button';
import Canvas from './widgets/Canvas';
import CheckBox from './widgets/CheckBox';
import CollectionView from './widgets/CollectionView';
import Color from './Color';
import ColorResources from './ColorResources';
import {format} from './Formatter';
import Row from './widgets/Row';
import RowLayout from './RowLayout';
import Stack from './widgets/Stack';
import StackLayout from './StackLayout';
import Composite from './widgets/Composite';
import ContentView, {create as createContentView} from './widgets/ContentView';
import Camera from './Camera';
import CameraView from './widgets/CameraView';
import Crypto from './Crypto';
import Drawer, {create as createDrawer} from './widgets/Drawer';
import DateDialog from './DateDialog';
import EventObject from './EventObject';
import File from './File';
import FormData from './FormData';
import Font from './Font';
import FontResources from './FontResources';
import Image from './Image';
import ImageData from './ImageData';
import ImageBitmap from './ImageBitmap';
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
import Process, {create as createProcess} from './Process';
import ProgressEvent from './ProgressEvent';
import ProgressBar from './widgets/ProgressBar';
import Popover from './Popover';
import NativeObject from './NativeObject';
import NavigationView from './widgets/NavigationView';
import NavigationBar, {create as createNavigationBar} from './widgets/NavigationBar';
import RadioButton from './widgets/RadioButton';
import RefreshComposite from './widgets/RefreshComposite';
import Resources from './Resources';
import ScrollView from './widgets/ScrollView';
import SearchAction from './widgets/SearchAction';
import SizeMeasurement, {create as createSizeMeasurement} from './SizeMeasurement';
import Slider from './widgets/Slider';
import StatusBar, {create as createStatusBar} from './widgets/StatusBar';
import Switch from './widgets/Switch';
import Tab from './widgets/Tab';
import TabFolder from './widgets/TabFolder';
import TextInput from './widgets/TextInput';
import TextResources from './TextResources';
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
import checkType from './checkType';
import XMLHttpRequest from './XMLHttpRequest';
import $ from './$';

import {fetch} from './fetch/fetch';
import Headers from './fetch/Headers';
import Request from './fetch/Request';
import Response from './fetch/Response';
import {omit} from './util';

// @ts-ignore
if (global.tabris && global.tabris.version) {
  throw new Error('tabris module already loaded. Ensure the module is installed only once.');
}

const WIDGETS = Object.freeze({
  Action,
  ActivityIndicator,
  Button,
  Canvas,
  ContentView,
  CheckBox,
  CollectionView,
  CameraView,
  Composite,
  Drawer,
  ImageView,
  NavigationView,
  Page,
  Picker,
  ProgressBar,
  RadioButton,
  RefreshComposite,
  Row,
  ScrollView,
  SearchAction,
  Slider,
  Stack,
  Switch,
  Tab,
  TabFolder,
  TextInput,
  TextView,
  ToggleButton,
  Video,
  WebView,
  Widget
});

const POPUPS = Object.freeze({
  ActionSheet,
  ActionSheetItem,
  AlertDialog,
  DateDialog,
  Popover,
  TimeDialog
});

const WHATWG = Object.freeze({
  Blob,
  Crypto,
  Event,
  File,
  FormData,
  ImageData,
  ImageBitmap,
  ProgressEvent,
  Storage,
  WebSocket,
  XMLHttpRequest,
  fetch,
  Headers,
  Request,
  Response,
  Worker,
  createImageBitmap: ImageBitmap.createImageBitmap
});

const NATIVE_OBJECT = Object.freeze({
  App,
  Camera,
  NavigationBar,
  Device,
  DevTools,
  FileSystem,
  InactivityTimer,
  NativeObject,
  Printer,
  SizeMeasurement,
  StatusBar
});

const UTILS = {
  checkType,
  format,
  asFactory: arg => tabrisMain.JSX.processor.makeFactory(arg)
};

const OTHER = Object.freeze({
  CanvasContext,
  ChangeListeners,
  Color,
  ColorResources,
  ConstraintLayout,
  Constraint,
  Console,
  EventObject,
  Font,
  FontResources,
  Image,
  JsxProcessor,
  JSX,
  Layout,
  LayoutData,
  Listeners,
  LinearGradient,
  Percent,
  Permission,
  Process,
  Resources,
  RowLayout,
  StackLayout,
  TextResources,
  WidgetCollection,
  $
});

const tabrisMain = Object.assign(new Tabris(), WIDGETS, POPUPS, WHATWG, NATIVE_OBJECT, UTILS, OTHER);

/** @typedef {typeof tabrisMain} TabrisMain */
module.exports = tabrisMain;
// @ts-ignore
global.tabris = tabrisMain;
// @ts-ignore
global.tabris.tabris = tabrisMain;

Object.assign(global, WHATWG, {$});

tabrisMain.on('start', (options) => {
  // @ts-ignore
  if (global.console.print) {
    global.console = createConsole(global.console);
  }
  patchError(Error);
  patchError(EvalError);
  patchError(RangeError);
  patchError(ReferenceError);
  patchError(SyntaxError);
  patchError(TypeError);
  patchError(URIError);
  tabris.$app = createApp();
  checkVersion(tabris.version, tabris.app._nativeGet('tabrisJsVersion'));
  if (!options || !options.headless) {
    tabris.$contentView = createContentView();
    tabris._nativeSet('contentView', tabris.contentView.cid);
    tabris.$drawer = createDrawer();
    tabris.$navigationBar = createNavigationBar();
    tabris.$statusBar = createStatusBar();
    tabris.$printer = createPrinter();
    tabris.$permission = createPermission();
    tabris.JSX.install(createJsxProcessor());
    tabris.widgets = omit(WIDGETS, ['Widget', 'Drawer', 'ContentView']);
    Object.assign(tabris, tabris.JSX.processor.makeFactories(tabris.widgets));
  }
  tabris.$devTools = createDevTools();
  tabris.$sizeMeasurement = createSizeMeasurement();
  tabris.$device = createDevice();
  tabris.$fs = createFileSystem();
  publishDeviceProperties(tabris.device, global);
  tabris.$localStorage = createStorage();
  tabris.$secureStorage = createStorage(true);
  tabris.$crypto = new Crypto();
  if ('print' in global.console) {
    global.console = createConsole(global.console);
  }
  tabris.$pkcs5 = new Pkcs5();
  tabris.$process = createProcess(tabrisMain);
  // @ts-ignore
  global.localStorage = tabrisMain.localStorage;
  // @ts-ignore
  global.secureStorage = tabrisMain.secureStorage;
  // @ts-ignore
  global.crypto = tabrisMain.crypto;
  // @ts-ignore
  global.JSX = tabrisMain.JSX;
  if (!global.process) { // Prevent damaging test environment
    global.process = tabrisMain.process;
  }
});

addDOMDocument(global);
addDOMEventTargetMethods(global);
addWindowTimerMethods(global);
