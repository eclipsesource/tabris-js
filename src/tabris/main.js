import './load-polyfill';

import Tabris from './Tabris';
import Device, {create as createDevice, publishDeviceProperties} from './Device';
import App, {create as createApp} from './App';
import Ui, {create as createUi} from './widgets/Ui';
import {addDOMDocument} from './Document';
import {addDOMEventTargetMethods} from './Event';
import {addWindowTimerMethods} from './WindowTimers';
import Storage, {create as createStorage} from './Storage';
import Action from './widgets/Action';
import ActivityIndicator from './widgets/ActivityIndicator';
import AlertDialog from './AlertDialog';
import Button from './widgets/Button';
import Canvas from './widgets/Canvas';
import CheckBox from './widgets/CheckBox';
import Cell from './widgets/Cell';
import CollectionView from './widgets/CollectionView';
import Composite from './widgets/Composite';
import ContentView from './widgets/ContentView';
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

const window = global.window;

module.exports = global.tabris = Object.assign(new Tabris(), {
  Action,
  ActivityIndicator,
  AlertDialog,
  App,
  Button,
  Canvas,
  Cell,
  CheckBox,
  CollectionView,
  Composite,
  ContentView,
  Crypto,
  Device,
  Drawer,
  Event,
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
  Ui,
  Video,
  WebSocket,
  WebView,
  Widget,
  WidgetCollection,
  XMLHttpRequest
});

Object.assign(window, {
  Crypto,
  ImageData,
  ProgressEvent,
  Storage,
  WebSocket,
  XMLHttpRequest
});

addDOMDocument(window);
addDOMEventTargetMethods(window);
addWindowTimerMethods(window);

// TODO: ensure tabris is set up before load functions, remove when merged with tabris module
tabris._loadFunctions.unshift(() => {
  tabris.app = createApp();
  tabris.ui = createUi();
  tabris.device = createDevice();
  publishDeviceProperties(tabris.device, window);
  window.localStorage = tabris.localStorage = createStorage();
  if (tabris.device.platform === 'iOS') {
    window.secureStorage = tabris.secureStorage = createStorage(true);
  }
  window.crypto = tabris.crypto = new Crypto();
  tabris.pkcs5 = new Pkcs5();
});
