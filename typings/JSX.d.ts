import * as tabris from 'tabris';

declare global {

  namespace JSX {

    function createElement(type: string|Function, properties: Object, ...children: Array<ElementClass>): ElementClass;

    interface ElementClass extends tabris.Widget { }

    type Element = any;

    interface ElementAttributesProperty {
      jsxProperties: any;
    }

    interface IntrinsicElements {
      action: tabris.ActionProperties,
      activityIndicator: tabris.ActivityIndicatorProperties,
      button: tabris.ButtonProperties,
      canvas: tabris.CanvasProperties,
      checkBox: tabris.CheckBoxProperties,
      collectionView: tabris.CollectionViewProperties,
      composite: tabris.CompositeProperties,
      imageView: tabris.ImageViewProperties,
      navigationView: tabris.NavigationViewProperties,
      page: tabris.PageProperties,
      picker: tabris.PickerProperties,
      progressBar: tabris.ProgressBarProperties,
      radioButton: tabris.RadioButtonProperties,
      scrollView: tabris.ScrollViewProperties,
      searchAction: tabris.SearchActionProperties,
      slider: tabris.SliderProperties,
      switch: tabris.SwitchProperties,
      tab: tabris.TabProperties,
      tabFolder: tabris.TabFolderProperties,
      textInput: tabris.TextInputProperties,
      textView: tabris.TextViewProperties,
      toggleButton: tabris.ToggleButtonProperties,
      video: tabris.VideoProperties,
      webView: tabris.WebViewProperties
    }

  }

}
