import {ImageView, TextView, contentView} from 'tabris';

let counter = 0;

contentView.append(
  <$>
    <ImageView center highlightOnTouch image='resources/target_200.png'
        onTap={() => $(TextView).only().text = `touched ${++counter} times`}/>
    <TextView centerX top='prev() 12'/>
  </$>
);
