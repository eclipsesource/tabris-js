import {Composite, contentView, ImageView, ScrollView, Stack, statusBar, TextView} from 'tabris';

const TITLE_VIEW_OPACITY = 0.85;
const primaryColor = (opacity = 1) => `rgba(255, 152, 0, ${opacity})`;

let titleViewY = 0;

statusBar.set({
  background: primaryColor(),
  theme: 'dark'
});

contentView.append(
  <ScrollView stretch onResize={updateInitialPosition} onScrollY={updateCurrentPosition}>
    <ImageView stretchX image='resources/salad.jpg' scaleMode='fill'/>
    <Composite id='recipe' stretchX top='next()' height={800} padding={16} background='white'>
      <TextView stretchX>
        Make a dressing of the yolks of 3 hard-boiled eggs pounded fine, equal quantities of mustard and paprika, a
        pinch of powdered sugar, 4 tablespoonfuls of oil, 2 tablespoonfuls of vinegar. Simmer over the fire, but do not
        allow to boil. Take the white meat of two chickens, and separate into flakes; pile it in the middle of a dish,
        and pour the dressing over it. Cut up two heads of lettuce, and arrange around the chicken. On top of the
        lettuce place the whites of the eggs, cut into rings, and lay so as to form a chain.
      </TextView>
    </Composite>
    <Stack stretchX alignment='stretchX' padding={16} background={primaryColor(TITLE_VIEW_OPACITY)}>
      <TextView text='The perfect side dish' font='bold 16px' textColor='black'/>
      <TextView text='INDIAN SUMMER SALAD' font='medium 24px' textColor='white'/>
    </Stack>
  </ScrollView>
);

const imageView = $(ImageView).only();
const titleView = $(Stack).only();
const recipeView = $(Composite).only('#recipe');

function updateInitialPosition({height}) {
  imageView.height = height / 2;
  recipeView.height = height * 1.5;
  const titleViewHeight = titleView.bounds.height;
  // We need the offset of the title composite in each scroll event.
  // As it can only change on resize, we assign it here.
  titleViewY = Math.min(imageView.height - titleViewHeight, height / 2);
  titleView.top = titleViewY;
}

function updateCurrentPosition({offset}) {
  imageView.transform = {translationY: Math.max(0, offset * 0.4)};
  titleView.transform = {translationY: Math.max(0, offset - titleViewY)};
  titleView.background = primaryColor(calculateTitleViewOpacity(offset));
}

function calculateTitleViewOpacity(scrollViewOffsetY) {
  const titleViewDistanceToTop = titleViewY - scrollViewOffsetY;
  const opacity = 1 - (titleViewDistanceToTop * (1 - TITLE_VIEW_OPACITY)) / titleViewY;
  return Math.min(opacity, 1);
}
