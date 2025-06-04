import {Button, TextInput, Switch, Slider, Picker, CheckBox, TextView, ImageView, ProgressBar, ActivityIndicator, Composite, ScrollView, Page, TabFolder, Tab, Canvas, WebView, CollectionView, contentView, drawer, StackLayout, RowLayout} from 'tabris';

// Accessibility Features Test Snippet

// High-Priority Interactive Controls
contentView.append(
  <ScrollView stretch>
    <Composite stretch layout={new StackLayout({alignment: 'stretchX', spacing: 12})} padding={16}>
      <Button text='Button' accessibilityLabel='Press me for action!'/>
      <TextInput message='TextInput' accessibilityLabel='Type your secret message here.'/>
      <Switch accessibilityLabel='Toggle the magic switch.'/>
      <Slider accessibilityLabel='Slide to adjust the awesomeness.'/>
      <Picker
          message='Picker'
          itemCount={2}
          itemText={i => ['One', 'Two'][i]}
          accessibilityLabel='Pick your favorite number.'/>
      <CheckBox text='CheckBox' accessibilityLabel='Check this if you agree with the universe.'/>
      {/* Display Widgets */}
      <TextView text='TextView' accessibilityLabel='Here is some very important text.'/>
      <ImageView image={{src: 'resources/landscape.jpg', width: 300, height: 200}} accessibilityLabel='A beautiful landscape to brighten your day.'/>
      <ProgressBar accessibilityLabel='Progress bar showing your progress to greatness.' selection={50}/>
      <ActivityIndicator id='spinner' accessibilityLabel='Loading... Please wait for the magic.'/>
      <Button text='Start/Stop Spinner' onSelect={() => {
        const spinner = contentView.find('#spinner').only();
        spinner.visible = !spinner.visible;
      }}/>
      {/* Container Widgets */}
      <Composite accessibilityLabel='A mysterious container for widgets.' background='#eee' height={32}/>
      <ScrollView
          stretchX
          height={72}
          accessibilityLabel='Scroll horizontally to discover hidden treasures.'
          layout={new RowLayout({alignment: 'stretchY'})}
          direction='horizontal'>
        <TextView background='red' text='scroll 1' width={300} accessibilityLabel='First scrollable item: red.'/>
        <TextView background='green' text='scroll 2' width={300} accessibilityLabel='Second scrollable item: green.'/>
        <TextView background='blue' text='scroll 3' width={300} accessibilityLabel='Third scrollable item: blue.'/>
        <TextView background='orange' text='scroll 4' width={300} accessibilityLabel='Fourth scrollable item: orange.'/>
        <TextView background='purple' text='scroll 5' width={300} accessibilityLabel='Fifth scrollable item: purple.'/>
      </ScrollView>
      {/* Additional Widgets */}
      <Canvas
          isAccessibilityElement={true}
          accessibilityLabel='A tiny canvas with sun, cloud, and grass. Imagine the rest!'
          width={100}
          height={50}
          onResize={({target: canvas, width, height}) => {
            const ctx = canvas.getContext('2d', width, height);
            ctx.clearRect(0, 0, width, height);
            // Tło
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(0, 0, width, height);
            // Słońce
            ctx.beginPath();
            ctx.arc(20, 20, 15, 0, 2 * Math.PI);
            ctx.fillStyle = '#fed100';
            ctx.fill();
            // Chmurka
            ctx.beginPath();
            ctx.arc(60, 30, 10, Math.PI * 0.5, Math.PI * 1.5);
            ctx.arc(70, 30, 10, Math.PI * 1.5, Math.PI * 0.5);
            ctx.closePath();
            ctx.fillStyle = '#b0c4de';
            ctx.fill();
            // Trawa
            ctx.fillStyle = '#8dbd00';
            ctx.fillRect(0, 40, width, 10);
            // Tekst
            ctx.font = 'bold 10px sans-serif';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.fillText('Canvas!', width / 2, height - 5);
          }}/>
      <WebView url='https://tabrisjs.com' accessibilityLabel='Official Tabris.js website. The gateway to awesome.' width={320} height={240}/>
      <CollectionView
          accessibilityLabel='A list of colorful items. Swipe through the rainbow!'
          width={320}
          height={120}
          itemCount={5}
          cellType={() => 'default'}
          createCell={() => (
            <Composite background='#f0f0f0' padding={8} cornerRadius={8} elevation={2}>
              <TextView centerX centerY font='18px' textColor='#333'/>
            </Composite>
          )}
          updateCell={(cell, index) => {
            cell.find(TextView).only().text = `Item ${index + 1}`;
            cell.background = ['#f0f0f0', '#e0f7fa', '#ffe0b2', '#c8e6c9', '#f8bbd0'][index % 5];
            cell.accessibilityLabel = `Colorful item number ${index + 1}`;
          }}/>
    </Composite>
  </ScrollView>
);

// Special Case: Drawer
// Drawer is a singleton, not a widget, so we set accessibilityLabel directly
// and enable it for testing

drawer.set({enabled: true, accessibilityLabel: 'Drawer'});
