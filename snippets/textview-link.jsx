import {TextView, contentView, app} from 'tabris';

contentView.append(
  <TextView markupEnabled font='24px' padding={16} onTapLink={e => app.launch(e.url)}>
    <span>View <a href='http://docs.tabris.com'>documentation</a></span><br/><br/>
    <span>View <a href='http://github.com/eclipsesource/tabris-js'>source code</a></span><br/><br/>
    <span>Write us <a href='mailto:info@tabris.com'>an email</a></span>
  </TextView>
);
