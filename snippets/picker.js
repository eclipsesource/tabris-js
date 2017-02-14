// Create a picker widget to select a string from a list

var airports = [
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
  items: airports,
  itemText: function(airport) {
    return airport.name;
  },
  selection: airports[1]
}).on('change:selection', function({value: airport}) {
  console.log('Selected ' + airport.id);
}).appendTo(tabris.ui.contentView);
