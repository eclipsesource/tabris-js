import {Composite, contentView, Set} from 'tabris';

contentView.onResize(applyLayout).append(
  <$>
    <Composite id='red' background='red'/>
    <Composite id='green' background='green'/>
  </$>
);

applyLayout();

function applyLayout() {
  const {width, height} = contentView.bounds;
  contentView.apply('strict', height > width ? {
    '#red': Set(Composite, {layoutData: {left: 16, top: 16, right: 16, height: 192}}),
    '#green': Set(Composite, {layoutData: {left: 16, top: '#red 16', right: 16, bottom: 16}})
  } : {
    '#red': Set(Composite, {layoutData: {left: 16, top: 16, bottom: 16, width: 192}}),
    '#green': Set(Composite, {layoutData: {left: '#red 16', top: 16, right: 16, bottom: 16}})
  });
}
