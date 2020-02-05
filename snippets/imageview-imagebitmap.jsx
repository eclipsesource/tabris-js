import {ImageView, contentView} from 'tabris';

(async () => {

  const response = await fetch('resources/target_200.png');
  const image = await createImageBitmap(await response.blob());
  contentView.append(<ImageView stretch image={image}/>);

})().catch(ex => console.error(ex));
