import {app, CheckBox, contentView, Stack, TextView} from 'tabris';

contentView.append(
  <Stack padding={16}>
    <TextView markupEnabled font='16px' lineSpacing={1.4}>
      <b>Id:</b> {app.id}<br/>
      <b>Version:</b> {app.version}<br/>
      <b>Version Code:</b> {app.versionCode}<br/>
    </TextView>
    <CheckBox text='Idle Timout Enabled' font='16px' checked={app.idleTimeoutEnabled}
      onCheckedChanged={({value: checked}) => app.idleTimeoutEnabled = checked}/>
  </Stack>
);
