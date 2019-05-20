import {Action, CheckBox, NavigationView, Page, Picker, TextView, contentView, drawer, device, StackLayout} from 'tabris';

const colors = ['initial', 'red', 'green', 'blue', 'rgba(0, 0, 0, 0.25)'];
const isAndroid = device.platform === 'Android';
const controlsLayout = new StackLayout({alignment: 'stretchX', spacing: 4});
const colorPickerAttributes = {
  itemCount: colors.length,
  selectionIndex: 0,
  itemText: index => colors[index],
  bottom: 12
};

drawer.set({enabled: true});
contentView.append(
  <NavigationView drawerActionVisible stretch>
    <Action title='Search'/>
    <Action title='Share' image={getImage('share')}/>
    <Page title='NavigationView' padding={16} layout={controlsLayout}>
      <CheckBox checked text='Show toolbar'
          onCheckedChanged={ev => toggleToolbar(ev.value)}/>
      <CheckBox checked text='Show drawer action'
          onCheckedChanged={ev => toggleDrawerAction(ev.value)}/>
      <TextView>Toolbar color</TextView>
      <Picker itemCount={colors.length} selectionIndex={0} itemText={index => colors[index]}
          onSelect={ev => navigationView.toolbarColor = colors[ev.index]}/>
      <TextView>Title text color</TextView>
      <Picker {...colorPickerAttributes}
          onSelect={ev => navigationView.titleTextColor = colors[ev.index]}/>
      <TextView>Action color</TextView>
      <Picker {...colorPickerAttributes}
          onSelect={ev => navigationView.actionColor = colors[ev.index]}/>
      <TextView excludeFromLayout={!isAndroid}>Action text color</TextView>
      <Picker excludeFromLayout={!isAndroid} {...colorPickerAttributes}
          onSelect={ev => navigationView.actionTextColor = colors[ev.index]}/>
      <TextView id='toolbarInfo'/>
    </Page>
  </NavigationView>
);

const navigationView = $(NavigationView).only();
const toolbarInfo = $(TextView).only('#toolbarInfo')
  .set({text: 'Toolbar height: ' + navigationView.toolbarHeight});

/** @param {boolean} visible */
function toggleToolbar(visible) {
  navigationView.toolbarVisible = visible;
  toolbarInfo.text = 'Toolbar height: ' + navigationView.toolbarHeight;
}

/** @param {boolean} visible */
function toggleDrawerAction(visible) {
  navigationView.drawerActionVisible = visible;
}

/** @param {string} base */
function getImage(base) {
  return `resources/${base}-${isAndroid ? 'white' : 'black'}-24dp@3x.png`;
}
