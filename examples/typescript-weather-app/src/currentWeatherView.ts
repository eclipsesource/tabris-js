import {Composite, CompositeProperties, ImageView, TextView} from 'tabris';
import {omit} from './util';
import {WeatherData} from './weatherService';

const TEXT_COLOR = 'rgb(255, 255, 255)';
const BIG_FONT = 'thin 28px sans-serif';
const FONT = 'thin 100px sans-serif';
const ICON_SIZE = 100;

interface CurrentWeatherViewProperties extends CompositeProperties {
  weatherData: WeatherData;
}

export default class CurrentWeatherView extends Composite {

  constructor(properties: CurrentWeatherViewProperties) {
    super(omit(properties, 'weatherData'));
    let data = properties.weatherData;
    let centerBox = new Composite({ top: 0, centerX: 0 }).appendTo(this);
    this.createWeatherIcon(data.list[0].weatherIcon).appendTo(centerBox);
    this.createTemperatureText(Math.round(data.list[0].temperature)).appendTo(centerBox);
    this.createWeatherText(data.list[0].weatherDetailed).appendTo(this);
  }

  private createWeatherIcon(icon: string) {
    return new ImageView({
      centerY: 0, width: ICON_SIZE, height: ICON_SIZE,
      scaleMode: 'stretch',
      image: '/icons/' + icon + '.png'
    });
  }

  private createTemperatureText(temperature: number) {
    return new TextView({
      centerY: 0, left: 'prev()',
      text: Math.round(temperature) + '°C',
      textColor: TEXT_COLOR,
      font: FONT
    });
  }

  private createWeatherText(text: string) {
    return new TextView({
      top: 'prev()', centerX: 0,
      text,
      textColor: TEXT_COLOR,
      font: BIG_FONT
    });
  }

}

