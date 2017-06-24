import './load-polyfill';

import {checkVersion} from './version';
import Tabris from './Tabris';
import Device, {create as createDevice, publishDeviceProperties} from './Device';
import App, {create as createApp} from './App';
import Ui, {create as createUi} from './widgets/Ui';
import FileSystem, {create as createFileSystem} from './FileSystem';
import {addDOMDocument} from './Document';
import {addDOMEventTargetMethods} from './Event';
import {addWindowTimerMethods} from './WindowTimers';
import addAnimationFrame from './addAnimationFrame';
import addSVGSupport from './SVGSupport';
import {addDocSupport} from './dummyDoc';
import Storage, {create as createStorage} from './Storage';
import * as JSX from './JSX';
import Action from './widgets/Action';
import ActivityIndicator from './widgets/ActivityIndicator';
import AlertDialog from './AlertDialog';
import Button from './widgets/Button';
import Canvas from './widgets/Canvas';
import CheckBox from './widgets/CheckBox';
import CollectionView from './widgets/CollectionView';
import Composite from './widgets/Composite';
import View from './widgets/View';
import ContentView from './widgets/ContentView';
import Component from './Component';
import Crypto from './Crypto';
import Drawer from './widgets/Drawer';
import Event from './Event';
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
import ToggleButton from './widgets/ToggleButton';
import Video from './widgets/Video';
import WebView from './widgets/WebView';
import WebSocket from './WebSocket';
import Widget from './Widget';
import WidgetCollection from './WidgetCollection';
import XMLHttpRequest from './XMLHttpRequest';
import {Tween, Easing, Interpolation} from './Tweening';

import {fetch} from './fetch/fetch';
import Headers from './fetch/Headers';
import Request from './fetch/Request';
import Response from './fetch/Response';



const window = global.window;

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

const tabris = global.tabris = Object.assign(new Tabris(), {
  Action,
  ActivityIndicator,
  AlertDialog,
  App,
  Button,
  Canvas,
  CheckBox,
  CollectionView,
  Composite,
  Component,
  ContentView,
  View,
  Crypto,
  Device,
  Drawer,
  Event,
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
  ToggleButton,
  ui: Ui,
  Video,
  WebSocket,
  WebView,
  Widget,
  WidgetCollection,
  XMLHttpRequest,
  fetch,
  Headers,
  Request,
  Response,
  Tween,
  Easing,
  Interpolation,
  window: window
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
  tabris.pkcs5 = new Pkcs5();
});

addDOMDocument(window);
addDOMEventTargetMethods(window);
addWindowTimerMethods(window);
addAnimationFrame(window);
addSVGSupport(window);
addDocSupport(window);
addDocSupport(global);

export default tabris;