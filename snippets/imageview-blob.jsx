import {ImageView, contentView} from 'tabris';

(async () => {

  const response = await fetch('resources/target_200.png');
  const blob = await response.blob();
  contentView.append(<ImageView stretch image={blob}/>);

})().catch(ex => console.error(ex));
