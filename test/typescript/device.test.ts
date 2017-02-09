import {device} from 'tabris';

// Properties
let language: string;
let model: string;
let orientation: 'landscape-primary' | 'landscape-secondary' | 'portrait-primary' | 'portrait-secondary';
let platform: 'Android' | 'iOS';
let scaleFactor: number;
let screenHeight: number;
let screenWidth: number;
let version: string;

device.language = language;
device.model = model;
device.orientation = orientation;
device.platform = platform;
device.scaleFactor = scaleFactor;
device.screenHeight = screenHeight;
device.screenWidth = screenWidth;
device.version = version;

language = device.language;
model = device.model;
orientation = device.orientation;
platform = device.platform;
scaleFactor = device.scaleFactor;
screenHeight = device.screenHeight;
screenWidth = device.screenWidth;
version = device.version;
