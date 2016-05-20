import {CompositeProperties, Composite, ImageView, TextView} from "tabris";
import {WeatherData, WeatherDatum} from "./weatherService";

const textColor = "rgb(255, 255, 255)";
const minTempColor = "rgb(245, 245, 255)";
const infoBoxColor = "rgba(0, 0, 0, 0.2)";

const margin = 5;
const innerMargin = 6;
const daysAbbreviations = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const smallFont = "thin 19px sans-serif";
const bigFont = "thin 28px sans-serif";
const smallFontItalic = "italic thin 22px sans-serif";

interface ForecastOverviewProperties extends CompositeProperties {
  data: WeatherData;
}

export default class ForecastOverview extends Composite {
  private days: WeatherDatum[][];

  constructor(properties: ForecastOverviewProperties) {
    super(properties);
    this.days = properties.data.days;
    for (let index = 0; index < this.days.length; index++) {
      this.createDayInformationBox(index).appendTo(this);
    }
  }

  private createDayInformationBox(dayIndex: number) {
    let dayForecasts = this.days[dayIndex];
    let container = new Composite({
      top: this.children().length === 0 ? 0 : "prev()",
      left: margin,
      right: margin,
    });
    let infoBox = new Composite({
      top: margin,
      left: margin,
      right: margin,
      background: infoBoxColor,
      highlightOnTouch: true
    }).on("tap", () => this.trigger("daySelect", dayIndex)).appendTo(container);
    let minTemp = Math.min(...dayForecasts.map((forecast) => forecast.temperature));
    let maxTemp = Math.max(...dayForecasts.map((forecast) => forecast.temperature));
    this.createDayText(dayForecasts[0]).appendTo(infoBox);
    this.createWeatherText(WeatherData.getAverageWeatherDescription(dayForecasts)).appendTo(infoBox);
    this.createTemperatureRangeText(maxTemp, minTemp).appendTo(infoBox);
    return container;
  }

  private createDayText(forecast: WeatherDatum) {
    return new TextView({
      top: innerMargin,
      bottom: innerMargin,
      left: innerMargin,
      text: daysAbbreviations[forecast.date.getDay()],
      textColor: textColor,
      font: bigFont
    });
  }

  private createTemperatureRangeText(maxTemp: number, minTemp: number) {
    let container = new Composite({
      right: margin,
      centerY: 0
    });
    let maxTempText = new TextView({
      text: Math.round(maxTemp) + "°C /",
      textColor: textColor,
      font: bigFont
    }).appendTo(container);
    new TextView({
      left: "prev()",
      text: Math.round(minTemp) + "°C",
      textColor: minTempColor,
      baseline: maxTempText,
      font: smallFont
    }).appendTo(container);
    return container;
  }

  private createWeatherText(text: string) {
    return new TextView({
      left: "prev() 8",
      centerY: 0,
      text: text,
      textColor: textColor,
      font: smallFontItalic
    });
  }

}
