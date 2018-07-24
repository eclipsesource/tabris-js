import {ActivityIndicator, Color, ActivityIndicatorProperties, Properties} from 'tabris';

let widget: ActivityIndicator = new ActivityIndicator();

// Properties
let tintColor: Color;

tintColor = widget.tintColor;

widget.tintColor = tintColor;

let properties: ActivityIndicatorProperties = {tintColor};
widget = new ActivityIndicator(properties);
widget.set(properties);

class CustomComponent extends ActivityIndicator {
  public foo: string;
  constructor(props: Properties<CustomComponent>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
