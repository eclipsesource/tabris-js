import {TextView, contentView} from 'tabris';

['normal', 'interactive', 'prio-high', 'missing', 'prio-high missing'].forEach((style) => {
  new TextView({
    left: 10, top: 'prev() 10',
    class: style,
    text: 'class "' + style + '"'
  }).appendTo(contentView);
});

contentView.find(TextView).set({font: '24px Arial, sans-serif', textColor: '#333'});
contentView.find(TextView).filter('.interactive').set({textColor: 'blue'});
contentView.find(TextView).filter('.prio-high').set({font: 'bold 24px Arial, Sans-Serif'});
contentView.find(TextView).filter('.missing').set({textColor: '#ccc'});
