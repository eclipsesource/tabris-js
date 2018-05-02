import {Composite, ui} from 'tabris';

['red', 'green', 'blue'].forEach((color, index) => {
  let offset = 50 + index * 50;
  new Composite({
    left: offset, top: offset, width: 100, height: 100,
    background: color
  }).appendTo(ui.contentView);
});
