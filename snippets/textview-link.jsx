import {TextView, contentView, app} from 'tabris';

contentView.append(
  <TextView markupEnabled font='24px' padding={12} onTapLink={e => app.launch(e.url)}>
    View <a href='http://docs.tabris.com'>documentation</a><br/><br/>
    View <a href='http://github.com/eclipsesource/tabris-js'>source code</a><br/><br/>
    Write us <a href='mailto:info@tabris.com'>an email</a>
  </TextView>
);
