import {Composite, contentView, Set, ContentView} from 'tabris';

contentView.append(
  <$>
    <Composite id='red' background='red'/>
    <Composite id='green' background='green'/>
  </$>
);

(function applyLayout() {
  contentView.apply('strict', contentView.bounds.height > contentView.bounds.width ? {
    ':host': Set(ContentView, {onResize: applyLayout}),
    '#red': Set(Composite, {layoutData: {left: 16, top: 16, right: 16, height: 192}}),
    '#green': Set(Composite, {layoutData: {left: 16, top: '#red 16', right: 16, bottom: 16}})
  } : {
    ':host': Set(ContentView, {onResize: applyLayout}),
    '#red': Set(Composite, {layoutData: {left: 16, top: 16, bottom: 16, width: 192}}),
    '#green': Set(Composite, {layoutData: {left: '#red 16', top: 16, right: 16, bottom: 16}})
  });
})();
