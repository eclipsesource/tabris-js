import {Picker, contentView} from 'tabris';

// Create a picker widget to select a string from a list

const AIRPORTS = [
  {
    id: 'SFO',
    name: 'San Francisco'
  },
  {
    id: 'TXL',
    name: 'Berlin Tegel'
  },
  {
    id: 'FRA',
    name: 'Frankfurt'
  }
];

const picker = new Picker({
  left: 20, top: 20, right: 20,
  itemCount: AIRPORTS.length,
  itemText: (index) => AIRPORTS[index].name,
  selectionIndex: 1
}).appendTo(contentView);

picker.on('select', ({index}) => console.log('Selected ' + AIRPORTS[index].id));
