import {Composite, CompositeProperties, TextView} from 'tabris';
import {omit} from './util';
import {WeatherData, WeatherDatum} from './weatherService';

const TEXT_COLOR = 'rgb(255, 255, 255)';
const MIN_TEMP_COLOR = 'rgb(245, 245, 255)';
const INFO_BOX_COLOR = 'rgba(0, 0, 0, 0.2)';

const MARGIN = 5;
const INNER_MARGIN = 6;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SMALL_FONT = 'thin 19px sans-serif';
const BIG_FONT = 'thin 28px sans-serif';
const SMALL_FONT_ITALIC = 'italic thin 22px sans-serif';

interface ForecastOverviewProperties extends CompositeProperties {
  data: WeatherData;
}

export default class ForecastOverview extends Composite {
  private days: WeatherDatum[][];

  constructor(properties: ForecastOverviewProperties) {
    super(omit(properties, 'data'));
    this.days = properties.data.days;
    for (let index = 0; index < this.days.length; index++) {
      this.createDayInformationBox(index).appendTo(this);
    }
  }

  private createDayInformationBox(dayIndex: number) {
    let dayForecasts = this.days[dayIndex];
    let container = new Composite({
      top: this.children().length === 0 ? 0 : 'prev()',
      left: MARGIN,
      right: MARGIN,
    });
    let infoBox = new Composite({
      top: MARGIN,
      left: MARGIN,
      right: MARGIN,
      background: INFO_BOX_COLOR,
      highlightOnTouch: true
    }).on('tap', () => this.trigger('daySelect', dayIndex)).appendTo(container);
    let minTemp = Math.min(...dayForecasts.map((forecast) => forecast.temperature));
    let maxTemp = Math.max(...dayForecasts.map((forecast) => forecast.temperature));
    this.createDayText(dayForecasts[0]).appendTo(infoBox);
    this.createWeatherText(WeatherData.getAverageWeatherDescription(dayForecasts)).appendTo(infoBox);
    this.createTemperatureRangeText(maxTemp, minTemp).appendTo(infoBox);
    return container;
  }

  private createDayText(forecast: WeatherDatum) {
    return new TextView({
      top: INNER_MARGIN,
      bottom: INNER_MARGIN,
      left: INNER_MARGIN,
      text: DAY_NAMES[forecast.date.getDay()],
      textColor: TEXT_COLOR,
      font: BIG_FONT
    });
  }

  private createTemperatureRangeText(maxTemp: number, minTemp: number) {
    let container = new Composite({right: MARGIN, centerY: 0});
    let maxTempText = new TextView({
      text: Math.round(maxTemp) + '°C /',
      textColor: TEXT_COLOR,
      font: BIG_FONT
    }).appendTo(container);
    new TextView({
      left: 'prev()',
      text: Math.round(minTemp) + '°C',
      textColor: MIN_TEMP_COLOR,
      baseline: maxTempText,
      font: SMALL_FONT
    }).appendTo(container);
    return container;
  }

  private createWeatherText(text: string) {
    return new TextView({
      left: 'prev() 8', centerY: 0,
      text,
      textColor: TEXT_COLOR,
      font: SMALL_FONT_ITALIC
    });
  }

}
