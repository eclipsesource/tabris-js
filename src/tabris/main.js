import "./load-polyfill.js";
import "./Tabris.js";
import "./GestureRecognizer.js";
import "./Device.js";
import "./Widget.js";
import "./Crypto.js";
import "./WindowTimers.js";
import "./App.js";
import "./UI.js";
import "./WebStorage.js";
import "./XMLHttpRequest.js";
import "./widgets/Action.js";
import "./widgets/ActivityIndicator.js";
import "./widgets/Button.js";
import "./widgets/Canvas.js";
import "./widgets/CheckBox.js";
import "./widgets/CollectionView.js";
import "./widgets/Composite.js";
import "./widgets/Drawer.js";
import "./widgets/ImageView.js";
import "./widgets/Page.js";
import "./widgets/PageSelector.js";
import "./widgets/Picker.js";
import "./widgets/ProgressBar.js";
import "./widgets/RadioButton.js";
import "./widgets/ScrollView.js";
import "./widgets/SearchAction.js";
import "./widgets/Slider.js";
import "./widgets/Switch.js";
import "./widgets/TabFolder.js";
import "./widgets/TabFolder-legacy.js";
import "./widgets/TextInput.js";
import "./widgets/TextView.js";
import "./widgets/ToggleButton.js";
import "./widgets/Video.js";
import "./widgets/WebView.js";

import ImageData from "./ImageData";
import {addDOMDocument} from "./DOMDocument";

module.exports = global.tabris;
window.ImageData = ImageData;
addDOMDocument(window);

// TODO: Temporary code to keep tests alive

import * as util from "./util";
import Events from "./Events.js";
import Properties from "./Properties.js";
import Layout from "./Layout.js";
import CanvasContext from "./CanvasContext";
import LegacyCanvasContext from "./LegacyCanvasContext";
import NativeBridge from "./NativeBridge";
import Proxy from "./Proxy.js";
import ProxyCollection from "./ProxyCollection.js";
import {types} from "./property-types.js";

tabris.util = util;
tabris.Properties = Properties;
tabris.Events = Events;
tabris.Layout = Layout;
tabris.ImageData = ImageData;
tabris.CanvasContext = CanvasContext;
tabris.LegacyCanvasContext = LegacyCanvasContext;
tabris.NativeBridge = NativeBridge;
tabris.Proxy = Proxy;
tabris.ProxyCollection = ProxyCollection;
tabris.PropertyTypes = types;
