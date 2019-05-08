import {AlertDialog, Button, contentView, Picker, Stack, TextView} from 'tabris';

const cities = ['San Francisco', 'Berlin', 'Shanghai'];
const getCity = index => index >= 0 ? cities[index] : 'empty';

contentView.append(
  <Stack stretch padding={[24, 16]} spacing={16} alignment='stretchX'>
    <Picker message='City' itemCount={cities.length} itemText={(index) => cities[index]}
        onSelect={(e) => AlertDialog.open(`You selected ${getCity(e.index)}`)}
        onSelectionIndexChanged={(e) => textView.text = `Selection changed to ${getCity(e.value)}`}/>
    <TextView text='Empty selection' alignment='centerX'/>
    <Button text='Select Shanghai' onTap={() => picker.selectionIndex = 2}/>
    <Button text='Get selection' onTap={() => textView.text = `Current selection is ${cities[picker.selectionIndex]}`}/>
    <Button text='Clear selection' onTap={() => picker.selectionIndex = -1}/>
  </Stack>
);

const textView = $(TextView).only();
const picker = $(Picker).only();
