import './load-polyfill';

import {extend} from './util';
import Tabris from './Tabris';
import Device, {create as createDevice, publishDeviceProperties} from './Device';
import App from './App';
import Ui, {create as createUi} from './widgets/Ui';
import ContentView from './widgets/ContentView';
import ImageData from './ImageData';
import {addDOMDocument} from './DOMDocument';
import {addWindowTimerMethods} from './WindowTimers';
import ProgressEvent from './DOMProgressEvent';
import Storage, {create as createStorage} from './WebStorage';
import WebSocket from './WebSocket';
import XMLHttpRequest from './XMLHttpRequest';
import Action from './widgets/Action';
import ActivityIndicator from './widgets/ActivityIndicator';
import Button from './widgets/Button';
import Canvas from './widgets/Canvas';
import CheckBox from './widgets/CheckBox';
import Cell from './widgets/Cell';
import CollectionView from './widgets/CollectionView';
import Composite from './widgets/Composite';
import Crypto from './Crypto';
import Drawer from './widgets/Drawer';
import ImageView from './widgets/ImageView';
import InactivityTimer from './InactivityTimer.js';
import Page from './widgets/Page';
import PageSelector from './widgets/PageSelector';
import Picker from './widgets/Picker';
import ProgressBar from './widgets/ProgressBar';
import NativeObject from './NativeObject';
import NavigationView from './widgets/NavigationView';
import RadioButton from './widgets/RadioButton';
import ScrollView from './widgets/ScrollView';
import SearchAction from './widgets/SearchAction';
import Slider from './widgets/Slider';
import Switch from './widgets/Switch';
import Tab from './widgets/Tab';
import TabFolder from './widgets/TabFolder';
import TextInput from './widgets/TextInput';
import TextView from './widgets/TextView';
import ToggleButton from './widgets/ToggleButton';
import Video from './widgets/Video';
import WebView from './widgets/WebView';
import Widget from './Widget';
import WidgetCollection from './WidgetCollection';

const window = global.window;

module.exports = global.tabris = extend(new Tabris(), {
  Action,
  ActivityIndicator,
  App,
  Button,
  Canvas,
  Cell,
  CheckBox,
  CollectionView,
  Composite,
  ContentView,
  Crypto,
  Drawer,
  Device,
  ImageData,
  InactivityTimer,
  ImageView,
  Page,
  PageSelector,
  Picker,
  ProgressBar,
  ProgressEvent,
  NativeObject,
  NavigationView,
  RadioButton,
  ScrollView,
  SearchAction,
  Slider,
  Storage,
  Switch,
  Tab,
  TabFolder,
  TextInput,
  TextView,
  ToggleButton,
  Ui,
  Video,
  WebView,
  WebSocket,
  Widget,
  WidgetCollection,
  XMLHttpRequest
});

extend(window, {
  Crypto,
  ImageData,
  ProgressEvent,
  Storage,
  WebSocket,
  XMLHttpRequest
});

addDOMDocument(window);
addWindowTimerMethods(window);

// TODO: ensure tabris is set up before load functions, remove when merged with tabris module
tabris._loadFunctions.unshift(() => {
  tabris.app = new App();
  tabris.ui = createUi();
  tabris.device = createDevice();
  publishDeviceProperties(tabris.device, window);
  window.localStorage = tabris.localStorage = createStorage();
  if (tabris.device.platform === 'iOS') {
    window.secureStorage = tabris.secureStorage = createStorage(true);
  }
  window.crypto = tabris.crypto = new Crypto();
});
