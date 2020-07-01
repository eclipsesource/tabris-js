import {contentView, Stack, TextView, format} from 'tabris';

const view = new Stack({
  layoutData: 'stretch', alignment: 'stretchX', spacing: 8, padding: 8
}).appendTo(contentView);

const log = (...args) => {
  console.log(...args);
  view.append(new TextView({text: format(...args)}));
};

log('This is printed on screen and to console');
log('Placeholders are filled:');
log('Data: (%d %i %f %s %j %%)', 23, 42, 3.14, 'foo', {foo: 'bar'});
log('Formats long arrays...');
log(new Array(500));
log('Formats plain objects...');
log({foo: 1, bar: 2, baz: 3});
log('Formats other stuff...');
log('Dates: ', new Date());
log('Functions:', () => 23);
log('Widgets:', contentView);
log('WidgetCollection:', contentView.children().children());
log('Errors:', new TypeError('error message'));
