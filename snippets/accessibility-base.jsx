import {
  Button,
  TextInput,
  Switch,
  Slider,
  Picker,
  CheckBox,
  TextView,
  ImageView,
  ProgressBar,
  ActivityIndicator,
  Composite,
  ScrollView,
  Canvas,
  WebView,
  CollectionView,
  contentView,
  drawer,
  StackLayout,
  RowLayout,
} from 'tabris';

// Accessibility Properties Visualization Snippet (base, now with all properties)

function getAccessibilityPropsText(id: string) {
  const widget = contentView.find('#' + id).only();
  if (!widget) {
    return id + ': not found';
  }
  return (
    id +
    ' props:\n' +
    'accessibilityLabel: ' +
    widget.accessibilityLabel +
    '\n' +
    'accessibilityHint: ' +
    widget.accessibilityHint +
    '\n' +
    'accessibilityValue: ' +
    widget.accessibilityValue +
    '\n' +
    'accessibilityTraits: ' +
    (widget.accessibilityTraits ? widget.accessibilityTraits.join(', ') : '') +
    '\n' +
    'accessibilityHidden: ' +
    widget.accessibilityHidden +
    '\n' +
    'isAccessibilityElement: ' +
    widget.isAccessibilityElement
  );
}

function updateAllAccessibilityTextViews() {
  const textViews = contentView.find(TextView).toArray();
  textViews.forEach((tv) => {
    if (tv.id && tv.id.startsWith('accessibility-')) {
      const widgetId = tv.id.replace('accessibility-', '');
      tv.text = getAccessibilityPropsText(widgetId);
    }
  });
}

function logAccessibilityProps(id: string, name: string) {
  setTimeout(() => {
    const widget = contentView.find('#' + id).only();
    if (widget) {
      console.log(`${name} [id=${id}]:`, {
        accessibilityLabel: widget.accessibilityLabel,
        accessibilityHint: widget.accessibilityHint,
        accessibilityValue: widget.accessibilityValue,
        accessibilityTraits: widget.accessibilityTraits,
        accessibilityHidden: widget.accessibilityHidden,
        isAccessibilityElement: widget.isAccessibilityElement,
      });
    } else {
      console.log(`${name} [id=${id}]: not found`);
    }
  }, 0);
}

contentView.append(
  <ScrollView stretch>
    <Composite
      stretch
      layout={new StackLayout({ alignment: 'stretchX', spacing: 12 })}
      padding={16}
    >
      <TextView
        text='Accessibility Properties (default labels)'
        font='bold 18px'
        textColor='navy'
        padding={8}
      />
      <Button id='btn' text='Button' />
      <TextView
        id='accessibility-btn'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <TextInput
        id='txt'
        message='TextInput'
        onTextChanged={() => {
          updateAllAccessibilityTextViews();
          logAccessibilityProps('txt', 'TextInput');
        }}
      />
      <TextView
        id='accessibility-txt'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <Switch
        id='switch'
        onSelect={() => {
          updateAllAccessibilityTextViews();
          logAccessibilityProps('switch', 'Switch');
        }}
      />
      <TextView
        id='accessibility-switch'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <Slider
        id='slider'
        onSelectionChanged={({ value }) => {
          const slider = contentView.find(Slider).only();
          const progress = contentView.find(ProgressBar).only();
          const min = slider.minimum ?? 0;
          const max = slider.maximum ?? 100;
          if (progress) {
            progress.minimum = min;
            progress.maximum = max;
            progress.selection = value;
          }
          updateAllAccessibilityTextViews();
          logAccessibilityProps('slider', 'Slider');
          logAccessibilityProps('progress', 'ProgressBar');
        }}
      />
      <TextView
        id='accessibility-slider'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <Picker
        id='picker'
        message='Picker'
        itemCount={2}
        itemText={(i) => ['One', 'Two'][i]}
        onSelect={() => {
          updateAllAccessibilityTextViews();
          logAccessibilityProps('picker', 'Picker');
        }}
      />
      <TextView
        id='accessibility-picker'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <CheckBox
        id='chk'
        text='CheckBox'
        onSelect={() => {
          updateAllAccessibilityTextViews();
          logAccessibilityProps('chk', 'CheckBox');
        }}
      />
      <TextView
        id='accessibility-chk'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <TextView id='txtview' text='TextView' />
      <TextView
        id='accessibility-txtview'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <ImageView id='img' image={{ src: 'resources/landscape.jpg' }} />
      <TextView
        id='accessibility-img'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <ProgressBar id='progress' minimum={0} maximum={100} selection={50} />
      <TextView
        id='accessibility-progress'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <ActivityIndicator id='spinner' />
      <TextView
        id='accessibility-spinner'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <Button
        id='btn-spinner'
        text='Start/Stop Spinner'
        onSelect={() => {
          const spinner = contentView.find('#spinner').only();
          spinner.visible = !spinner.visible;
          updateAllAccessibilityTextViews();
        }}
      />
      <Composite id='comp' background='#eee' height={32} />
      <TextView
        id='accessibility-comp'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <ScrollView
        id='scrollh'
        stretchX
        height={72}
        layout={new RowLayout({ alignment: 'stretchY' })}
        direction='horizontal'
      >
        <TextView id='scroll1' background='red' text='scroll 1' width={300} />
        <TextView id='scroll2' background='green' text='scroll 2' width={300} />
        <TextView id='scroll3' background='blue' text='scroll 3' width={300} />
        <TextView
          id='scroll4'
          background='orange'
          text='scroll 4'
          width={300}
        />
        <TextView
          id='scroll5'
          background='purple'
          text='scroll 5'
          width={300}
        />
      </ScrollView>
      <TextView
        id='accessibility-scrollh'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <Canvas id='canvas' width={100} height={50} />
      <TextView
        id='accessibility-canvas'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <WebView id='web' url='https://tabrisjs.com' width={320} height={240} />
      <TextView
        id='accessibility-web'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
      <CollectionView
        id='colview'
        width={320}
        height={120}
        itemCount={5}
        cellType={() => 'default'}
        createCell={() => (
          <Composite
            background='#f0f0f0'
            padding={8}
            cornerRadius={8}
            elevation={2}
          >
            <TextView centerX centerY font='18px' textColor='#333' />
          </Composite>
        )}
        updateCell={(cell, index) => {
          cell.find(TextView).only().text = `Item ${index + 1}`;
          cell.background = [
            '#f0f0f0',
            '#e0f7fa',
            '#ffe0b2',
            '#c8e6c9',
            '#f8bbd0',
          ][index % 5];
        }}
      />
      <TextView
        id='accessibility-colview'
        font='12px'
        textColor='gray'
        padding={4}
        text='Loading...'
      />
    </Composite>
  </ScrollView>
);

drawer.set({ enabled: true, accessibilityLabel: 'Drawer' });

setTimeout(updateAllAccessibilityTextViews, 0);

// Log all accessibility props for each widget
logAccessibilityProps('btn', 'Button');
logAccessibilityProps('txt', 'TextInput');
logAccessibilityProps('switch', 'Switch');
logAccessibilityProps('slider', 'Slider');
logAccessibilityProps('picker', 'Picker');
logAccessibilityProps('chk', 'CheckBox');
logAccessibilityProps('txtview', 'TextView');
logAccessibilityProps('img', 'ImageView');
logAccessibilityProps('progress', 'ProgressBar');
logAccessibilityProps('spinner', 'ActivityIndicator');
logAccessibilityProps('btn-spinner', 'Start/Stop Spinner Button');
logAccessibilityProps('comp', 'Composite');
logAccessibilityProps('scrollh', 'ScrollView (horizontal)');
logAccessibilityProps('canvas', 'Canvas');
logAccessibilityProps('web', 'WebView');
logAccessibilityProps('colview', 'CollectionView');
