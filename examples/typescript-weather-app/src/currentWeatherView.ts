import {CompositeProperties, Composite, ImageView, TextView} from "tabris";
import {WeatherData} from "./weatherService";

const textColor = "rgb(255, 255, 255)";
const margin = 8;
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const smallFont = "thin 19px sans-serif";
const smallFontItalic = "italic thin 19px sans-serif";
const bigFont = "thin 28px sans-serif";
const font = "thin 100px sans-serif";
const iconSize = 100;

interface CurrentWeatherViewProperties extends CompositeProperties {
  data: WeatherData;
}

export default class CurrentWeatherView extends Composite {

  constructor(properties: CurrentWeatherViewProperties) {
    super(properties);
    let data = properties.data;
    let centerBox = new Composite({ top: 0, centerX: 0 }).appendTo(this);
    this.createWeatherIcon(data.list[0].weatherIcon).appendTo(centerBox);
    this.createTemperatureText(Math.round(data.list[0].temperature)).appendTo(centerBox);
    this.createWeatherText(data.list[0].weatherDetailed).appendTo(this);
  }

  private createWeatherIcon(icon: string) {
    return new ImageView({
      centerY: 0,
      width: iconSize,
      height: iconSize,
      scaleMode: "stretch",
      image: "/icons/" + icon + ".png"
    });
  }

  private createTemperatureText(temperature: number) {
    return new TextView({
      centerY: 0,
      left: "prev()",
      text: Math.round(temperature) + "°C",
      textColor: textColor,
      font: font
    });
  }

  private createWeatherText(text: string) {
    return new TextView({
      top: "prev()",
      centerX: 0,
      text: text,
      textColor: textColor,
      font: bigFont
    });
  }

}

