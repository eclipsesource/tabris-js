import {Button, TextInput, Switch, Slider, Picker, CheckBox, TextView, ImageView, ProgressBar, ActivityIndicator, Composite, ScrollView, Page, TabFolder, Tab, Canvas, WebView, CollectionView, contentView, drawer, StackLayout, RowLayout} from 'tabris';

// Accessibility Properties Visualization Snippet

function getAccessibilityPropsText(id) {
  const widget = contentView.find('#' + id).only();
  if (!widget) {
    return id + ': not found';
  }
  return (
    id + ' props:\n' +
    'accessibilityLabel: ' + widget.accessibilityLabel + '\n' +
    'accessibilityHidden: ' + widget.accessibilityHidden + '\n' +
    'isAccessibilityElement: ' + widget.isAccessibilityElement
  );
}

function logAccessibilityProps(id, name) {
  setTimeout(() => {
    const widget = contentView.find('#' + id).only();
    if (widget) {
      console.log(`${name} [id=${id}]:`, {
        accessibilityLabel: widget.accessibilityLabel,
        accessibilityHidden: widget.accessibilityHidden,
        isAccessibilityElement: widget.isAccessibilityElement
      });
    } else {
      console.log(`${name} [id=${id}]: not found`);
    }
  }, 0);
}

function updateAllAccessibilityTextViews() {
  const textViews = contentView.find(TextView).toArray();
  textViews.forEach(tv => {
    if (tv.id && tv.id.startsWith('accessibility-')) {
      const widgetId = tv.id.replace('accessibility-', '');
      tv.text = getAccessibilityPropsText(widgetId);
    }
  });
}

contentView.append(
  <ScrollView stretch>
    <Composite stretch layout={new StackLayout({alignment: 'stretchX', spacing: 12})} padding={16}>
      <TextView text='Accessibility Properties (default values)' font='bold 18px' textColor='navy' padding={8}/>
      <Button id='btn' text='Button'/>
      <TextView id='accessibility-btn' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <TextInput id='txt' message='TextInput'/>
      <TextView id='accessibility-txt' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <Switch id='switch'/>
      <TextView id='accessibility-switch' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <Slider id='slider'/>
      <TextView id='accessibility-slider' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <Picker id='picker' message='Picker' itemCount={2} itemText={i => ['One', 'Two'][i]}/>
      <TextView id='accessibility-picker' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <CheckBox id='chk' text='CheckBox'/>
      <TextView id='accessibility-chk' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <TextView id='txtview' text='TextView'/>
      <TextView id='accessibility-txtview' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <ImageView id='img' image={{src: 'resources/landscape.jpg', width: 300, height: 200}}/>
      <TextView id='accessibility-img' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <ProgressBar id='progress' selection={50}/>
      <TextView id='accessibility-progress' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <ActivityIndicator id='spinner'/>
      <TextView id='accessibility-spinner' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <Button id='btn-spinner' text='Start/Stop Spinner' onSelect={() => {
        const spinner = contentView.find('#spinner').only();
        spinner.visible = !spinner.visible;
        updateAllAccessibilityTextViews();
      }}/>
      <Composite id='comp' background='#eee' height={32}/>
      <TextView id='accessibility-comp' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <ScrollView id='scrollh' stretchX height={72}
          layout={new RowLayout({alignment: 'stretchY'})}
          direction='horizontal'>
        <TextView id='scroll1' background='red' text='scroll 1' width={300}/>
        <TextView id='scroll2' background='green' text='scroll 2' width={300}/>
        <TextView id='scroll3' background='blue' text='scroll 3' width={300}/>
        <TextView id='scroll4' background='orange' text='scroll 4' width={300}/>
        <TextView id='scroll5' background='purple' text='scroll 5' width={300}/>
      </ScrollView>
      <TextView id='accessibility-scrollh' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <Canvas id='canvas' width={100} height={50}
        onResize={({target: canvas, width, height}) => {
          const ctx = canvas.getContext('2d', width, height);
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = '#e0e0e0';
          ctx.fillRect(0, 0, width, height);
          ctx.beginPath();
          ctx.arc(20, 20, 15, 0, 2 * Math.PI);
          ctx.fillStyle = '#fed100';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(60, 30, 10, Math.PI * 0.5, Math.PI * 1.5);
          ctx.arc(70, 30, 10, Math.PI * 1.5, Math.PI * 0.5);
          ctx.closePath();
          ctx.fillStyle = '#b0c4de';
          ctx.fill();
          ctx.fillStyle = '#8dbd00';
          ctx.fillRect(0, 40, width, 10);
          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = '#333';
          ctx.textAlign = 'center';
          ctx.fillText('Canvas!', width / 2, height - 5);
        }}/>
      <TextView id='accessibility-canvas' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <WebView id='web' url='https://tabrisjs.com' width={320} height={240}/>
      <TextView id='accessibility-web' font='12px' textColor='gray' padding={4} text='Loading...'/>
      <CollectionView id='colview' width={320} height={120} itemCount={5} cellType={() => 'default'}
        createCell={() => (
          <Composite background='#f0f0f0' padding={8} cornerRadius={8} elevation={2}>
            <TextView centerX centerY font='18px' textColor='#333'/>
          </Composite>
        )}
        updateCell={(cell, index) => {
          cell.find(TextView).only().text = `Item ${index + 1}`;
          cell.background = ['#f0f0f0', '#e0f7fa', '#ffe0b2', '#c8e6c9', '#f8bbd0'][index % 5];
        }}/>
      <TextView id='accessibility-colview' font='12px' textColor='gray' padding={4} text='Loading...'/>
    </Composite>
  </ScrollView>
);

drawer.set({enabled: true});

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
