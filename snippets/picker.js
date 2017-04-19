// Create a picker widget to select a string from a list

const airports = [
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

new tabris.Picker({
  left: 20, top: 20, right: 20,
  itemCount: airports.length,
  itemText: (index) => airports[index].name,
  selectionIndex: 1
}).on('selectionIndexChanged', ({value: index}) => {
  console.log('Selected ' + airports[index].id);
}).appendTo(tabris.ui.contentView);
