import {contentView, Picker, Stack} from 'tabris';

const items = ['San Francisco', 'Berlin', 'Shanghai'];

/** @param {tabris.Attributes<Picker>} attributes */
const CityPicker = attributes =>
  <Picker itemCount={items.length} itemText={index => items[index]} {...attributes}/>;

contentView.append(
  <Stack stretch spacing={16} padding={16} alignment='stretchX'>
    <CityPicker style='outline' message='outline'/>
    <CityPicker style='fill' message='fill'/>
    <CityPicker style='underline' message='underline'/>
    <CityPicker style='none' message='none'/>
  </Stack>
);
