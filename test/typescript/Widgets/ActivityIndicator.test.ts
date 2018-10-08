import {ActivityIndicator, ColorValue, Properties} from 'tabris';

let widget: ActivityIndicator = new ActivityIndicator();

// Properties
let tintColor: ColorValue;

tintColor = widget.tintColor;

widget.tintColor = tintColor;

let properties: Properties<typeof ActivityIndicator> = {tintColor};
widget = new ActivityIndicator(properties);
widget.set(properties);

class CustomComponent extends ActivityIndicator {
  public foo: string;
  constructor(props: Properties<typeof ActivityIndicator> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
