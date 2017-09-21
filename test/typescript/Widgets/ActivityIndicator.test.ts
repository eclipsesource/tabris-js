import {ActivityIndicator, Color, ActivityIndicatorProperties} from 'tabris';

let widget: ActivityIndicator = new ActivityIndicator();

// Properties
let tintColor: Color;

tintColor = widget.tintColor;

widget.tintColor = tintColor;

let properties: ActivityIndicatorProperties = {tintColor};
widget = new ActivityIndicator(properties);
widget.set(properties);
