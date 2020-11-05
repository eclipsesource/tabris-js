import {Composite, contentView, Setter} from 'tabris';

contentView.append(
  <$>
    <Composite id='red' background='red'/>
    <Composite id='green' background='green'/>
  </$>
);

contentView.apply(
  {mode: 'strict', trigger: 'onBoundsChanged'},
  ({bounds}) => (bounds.height > bounds.width) ? {
    '#red': Setter(Composite, {layoutData: {left: 16, top: 16, right: 16, height: 192}}),
    '#green': Setter(Composite, {layoutData: {left: 16, top: '#red 16', right: 16, bottom: 16}})
  } : {
    '#red': Setter(Composite, {layoutData: {left: 16, top: 16, bottom: 16, width: 192}}),
    '#green': Setter(Composite, {layoutData: {left: '#red 16', top: 16, right: 16, bottom: 16}})
  }
);
