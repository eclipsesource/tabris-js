import './load-polyfill';

import {checkVersion} from './version';
import Tabris from './Tabris';
import Device, {create as createDevice, publishDeviceProperties} from './Device';
import App, {create as createApp} from './App';
import Ui, {create as createUi} from './widgets/Ui';
import FileSystem, {create as createFileSystem} from './FileSystem';
import {createConsole} from './Console';
import {addDOMDocument} from './Document';
import Event, {addDOMEventTargetMethods} from './Event';
import {addWindowTimerMethods} from './WindowTimers';
import Storage, {create as createStorage} from './Storage';
import * as JSX from './JSX';
import Action from './widgets/Action';
import ActionSheet from './ActionSheet';
import ActivityIndicator from './widgets/ActivityIndicator';
import AlertDialog from './AlertDialog';
import Button from './widgets/Button';
import Canvas from './widgets/Canvas';
import CheckBox from './widgets/CheckBox';
import CollectionView from './widgets/CollectionView';
import Composite from './widgets/Composite';
import ContentView from './widgets/ContentView';
import Crypto from './Crypto';
import Drawer from './widgets/Drawer';
import DateDialog from './DateDialog';
import EventObject from './EventObject';
import ImageData from './ImageData';
import ImageView from './widgets/ImageView';
import InactivityTimer from './InactivityTimer.js';
import Page from './widgets/Page';
import Picker from './widgets/Picker';
import Pkcs5 from './Pkcs5';
import ProgressEvent from './ProgressEvent';
import ProgressBar from './widgets/ProgressBar';
import NativeObject from './NativeObject';
import NavigationView from './widgets/NavigationView';
import NavigationBar from './widgets/NavigationBar';
import RadioButton from './widgets/RadioButton';
import ScrollView from './widgets/ScrollView';
import SearchAction from './widgets/SearchAction';
import Slider from './widgets/Slider';
import StatusBar from './widgets/StatusBar';
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
  ActivityIndicator,
  AlertDialog,
  App,
  Button,
  Canvas,
  CheckBox,
  CollectionView,
  Composite,
  ContentView,
  Crypto,
  DateDialog,
  Device,
  Drawer,
  Event,
  EventObject,
  FileSystem,
  ImageData,
  ImageView,
  InactivityTimer,
  NativeObject,
  NavigationView,
  NavigationBar,
  Page,
  Picker,
  ProgressBar,
  ProgressEvent,
  RadioButton,
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
  Ui,
  Video,
  WebSocket,
  WebView,
  Widget,
  WidgetCollection,
  XMLHttpRequest,
  fetch,
  Headers,
  Request,
  Response
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
  JSX
});

tabris.on('start', () => {
  tabris.app = createApp();
  checkVersion(tabris.version, tabris.app._nativeGet('tabrisJsVersion'));
  tabris.ui = createUi();
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
