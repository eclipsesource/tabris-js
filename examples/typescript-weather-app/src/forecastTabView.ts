import {TabFolderProperties, TabFolder, Tab, ScrollView, Composite, ImageView, TextView} from "tabris";
import {WeatherData, WeatherDatum} from "./weatherService";

const textColor = "rgb(255, 255, 255)";
const headerTextColor = "rgb(255, 255, 255)";
const infoBoxColor = "rgba(0, 0, 0, 0.2)";
const headerBoxColor = "rgba(0,0,0,0.4)";
const margin = 5;
const innerMargin = 6;
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const smallFont = "thin 19px sans-serif";
const smallFontItalic = "italic thin 19px sans-serif";
const bigFont = "thin 28px sans-serif";

const headerHeight = 50;
const forecastBoxHeight = 45;
const weatherIconSize = 35;
const navigationIconSize = 50;

interface ForecastTabViewProperties extends TabFolderProperties {
  data: WeatherData;
}

export default class ForecastTabView extends TabFolder {
  private data: WeatherData;
  private tabs: Tab[];
  private scrollView: ScrollView;

  constructor(properties: ForecastTabViewProperties) {
    properties.tabBarLocation = "hidden";
    properties.paging = true;
    super(properties);
    this.data = properties.data;
    this.tabs = [this.createTab(0, "today")];
    this.append(this.tabs[0]);
    for (let index = 1; index < this.data.days.length; index++) {
      let headerName = dayNames[this.data.days[index][0].date.getDay()];
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
    let container = new Composite({ top: 0, left: 0, right: 0, height: headerHeight, });
    let background = new Composite({ top: 0, left: margin, right: margin, background: headerBoxColor })
      .appendTo(container)
    new TextView({ text: text, centerY: 0, centerX: 0, font: bigFont, textColor: headerTextColor })
      .appendTo(background);
    if (tabIndex !== 0) {
      this.createArrowImage("left").appendTo(background);
    }
    if (tabIndex !== this.data.days.length - 1) {
      this.createArrowImage("right").appendTo(background);
    }
    return container;
  }

  private createArrowImage(direction: string) {
    return new ImageView({
      image: "./icons/arrow" + direction + ".png",
      centerY: 0,
      height: 50,
      opacity: 0.6,
      highlightOnTouch: true
    }).set(direction, 0).on("tap", () => {
      let nextTab = this.tabs[this.getTabIndex(this.get("selection")) + ((direction === "right") ? 1 : -1)];
      this.set("selection", nextTab);
    });
  }

  private createForecastBox(forecast: WeatherDatum) {
    let container = new Composite({
      top: "prev()",
      left: 0,
      right: 0,
      height: forecastBoxHeight
    });
    let forecastBox = new Composite({
      top: margin,
      left: margin,
      right: margin,
      background: infoBoxColor
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
    let hoursString = (hours < 10) ? "0" + hours : hours;
    let minutesString = (minutes < 10) ? "0" + minutes : minutes;
    return new TextView({
      top: innerMargin,
      bottom: innerMargin,
      left: innerMargin,
      text: hoursString + ":" + minutesString,
      textColor: textColor,
      font: smallFont
    });
  }

  private createWeatherText(text: string) {
    return new TextView({
      centerY: 0,
      left: "prev() 10",
      text: text,
      textColor: textColor,
      font: smallFontItalic
    });
  }

  private createTemperatureText(temperature: number) {
    return new TextView({
      right: margin,
      centerY: 0,
      text: Math.round(temperature) + "°C",
      textColor: textColor,
      font: bigFont
    });
  }

  private createWeatherIcon(icon: string) {
    return new ImageView({
      right: 80,
      width: weatherIconSize,
      height: weatherIconSize,
      centerY: 0,
      image: "/icons/" + icon + ".png"
    });
  }

}
