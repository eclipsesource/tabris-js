import {TextView, app, contentView} from 'tabris';

contentView.append(
  <TextView padding={16} markupEnabled font='16px' lineSpacing={1.4}>
    <b>Id:</b> {app.id}<br/>
    <b>Version:</b> {app.version}<br/>
    <b>Version Code:</b> {app.versionCode}<br/>
  </TextView>
);
