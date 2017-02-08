import {Composite, ImageView, Tab, TabFolder, TabFolderProperties, TextView} from 'tabris';
import {omit} from './util';
import {WeatherData, WeatherDatum} from './weatherService';

const TEXT_COLOR = 'rgb(255, 255, 255)';
const HEADER_TEXT_COLOR = 'rgb(255, 255, 255)';
const INFO_BOX_COLOR = 'rgba(0, 0, 0, 0.2)';
const HEADER_BOX_COLOR = 'rgba(0,0,0,0.4)';
const MARGIN = 5;
const INNER_MARGIN = 6;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SMALL_FONT = 'thin 19px sans-serif';
const SMALL_FONT_ITALIC = 'italic thin 19px sans-serif';
const BIG_FONT = 'thin 28px sans-serif';

const HEADER_HEIGHT = 50;
const FORECAST_BOX_HEIGHT = 45;
const WEATHER_ICON_SIZE = 35;

interface ForecastTabViewProperties extends TabFolderProperties {
  data: WeatherData;
}

export default class ForecastTabView extends TabFolder {
  private data: WeatherData;
  private tabs: Tab[];

  constructor(properties: ForecastTabViewProperties) {
    properties.tabBarLocation = 'hidden';
    properties.paging = true;
    super(omit(properties, 'data'));
    this.data = properties.data;
    this.tabs = [this.createTab(0, 'today')];
    this.append(this.tabs[0]);
    for (let index = 1; index < this.data.days.length; index++) {
      let headerName = DAY_NAMES[this.data.days[index][0].date.getDay()];
      this.tabs.push(this.createTab(index, headerName));
      this.append(this.tabs[index]);
    }
  }

  public getTabIndex(tab: Tab) {
    return this.tabs.indexOf(tab);
  }

  public getTab(index: number) {
    return this.tabs[index];
  }

  private createTab(dayIndex: number, text: string) {
    let tab = new Tab();
    this.createHeader(text, dayIndex).appendTo(tab);
    for (let forecast of this.data.days[dayIndex]) {
      this.createForecastBox(forecast).appendTo(tab);
    }
    return tab;
  }

  private createHeader(text: string, tabIndex: number) {
    let container = new Composite({top: 0, left: 0, right: 0, height: HEADER_HEIGHT});
    let background = new Composite({
      top: 0, left: MARGIN, right: MARGIN,
      background: HEADER_BOX_COLOR
     }).appendTo(container);
    new TextView({
      centerY: 0, centerX: 0,
      text,
      textColor: HEADER_TEXT_COLOR,
      font: BIG_FONT
    }).appendTo(background);
    if (tabIndex !== 0) {
      this.createArrowImage('left').appendTo(background);
    }
    if (tabIndex !== this.data.days.length - 1) {
      this.createArrowImage('right').appendTo(background);
    }
    return container;
  }

  private createArrowImage(direction: 'left' | 'right') {
    return new ImageView({
      centerY: 0, height: 50,
      opacity: 0.6,
      image: './icons/arrow' + direction + '.png',
      highlightOnTouch: true,
      [direction]: 0
    }).on('tap', () => {
      let nextTab = this.tabs[this.getTabIndex(this.selection) + ((direction === 'right') ? 1 : -1)];
      this.selection = nextTab;
    });
  }

  private createForecastBox(forecast: WeatherDatum) {
    let container = new Composite({ top: 'prev()', left: 0, right: 0, height: FORECAST_BOX_HEIGHT});
    let forecastBox = new Composite({
      top: MARGIN, left: MARGIN, right: MARGIN,
      background: INFO_BOX_COLOR
    }).appendTo(container);
    this.createTimeText(forecast.date).appendTo(forecastBox);
    this.createWeatherText(forecast.weatherDetailed).appendTo(forecastBox);
    this.createTemperatureText(forecast.temperature).appendTo(forecastBox);
    this.createWeatherIcon(forecast.weatherIcon).appendTo(forecastBox);
    return container;
  }

  private createTimeText(date: Date) {
    let minutes = date.getMinutes();
    let hours = date.getHours();
    let hoursString = (hours < 10) ? '0' + hours : hours;
    let minutesString = (minutes < 10) ? '0' + minutes : minutes;
    return new TextView({
      top: INNER_MARGIN, bottom: INNER_MARGIN, left: INNER_MARGIN,
      text: hoursString + ':' + minutesString,
      textColor: TEXT_COLOR,
      font: SMALL_FONT
    });
  }

  private createWeatherText(text: string) {
    return new TextView({
      centerY: 0, left: 'prev() 10',
      text,
      textColor: TEXT_COLOR,
      font: SMALL_FONT_ITALIC
    });
  }

  private createTemperatureText(temperature: number) {
    return new TextView({
      right: MARGIN, centerY: 0,
      text: Math.round(temperature) + '°C',
      textColor: TEXT_COLOR,
      font: BIG_FONT
    });
  }

  private createWeatherIcon(icon: string) {
    return new ImageView({
      right: 80, width: WEATHER_ICON_SIZE, height: WEATHER_ICON_SIZE, centerY: 0,
      image: '/icons/' + icon + '.png'
    });
  }

}
