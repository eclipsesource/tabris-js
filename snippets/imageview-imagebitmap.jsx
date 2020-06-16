import {ImageView, contentView} from 'tabris';

(async () => {

  const response = await fetch('resources/target_200.png');
  const image = await createImageBitmap(
    await response.blob(),
    25, 50, 150, 125,
    {
      resizeWidth: 100,
      resizeHeight: 150,
      resizeQuality: 'high'
    }
  );
  contentView.append(<ImageView stretch image={image}/>);

})().catch(ex => console.error(ex));
