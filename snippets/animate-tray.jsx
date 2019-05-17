import {Composite, contentView, ImageView, TextView} from 'tabris';

let trayState = 'down';
let trayHeight;
let dragOffset;

contentView.append(
  <$>
    <TextView left={16} right={16} top={16} textColor='#777' lineSpacing={1.4}>
      There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the
      Rabbit say to itself, ‘Oh dear! Oh dear! I shall be late!’ (when she thought it over afterwards, it occurred to
      her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit
      actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her
      feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a
      watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just
      in time to see it pop down a large rabbit-hole under the hedge.
    </TextView>
    <Composite id='shade' stretch background='black' opacity={0}/>
    <Composite id='tray' stretchX top='50%' bottom>
      <Composite id='strap' top centerX width={72} height={56} background='#259b24' elevation={8}
        onPanVertical={moveTray} onTap={toggleTrayState}>
        <ImageView id='strapIcon' stretchX bottom top={4} image='resources/arrow-upward-white-24pt@3x.png'/>
      </Composite>
      <Composite id='trayContent' left={16} right={16} top='prev()' bottom background='#8bc34a' elevation={8}
        onResize={doSomething} onPanVertical={moveTray}>
        <TextView padding={16} center text='Tray content' font='bold 24px' textColor='white'/>
      </Composite>
    </Composite>
  </$>
);

const tray = $('#tray').only();
const shade = $('#shade').only();
const trayContent = $('#trayContent').only();
const strapIcon = $('#strapIcon').only();

function doSomething() {
  const bounds = trayContent.bounds;
  trayHeight = bounds.height;
  if (trayState === 'dragging') {
    positionTrayInRestingState(2000);
  } else {
    tray.transform = {translationY: trayHeight};
  }
}

function moveTray({state, translationY, velocityY}) {
  if (state === 'start' && (trayState === 'up' || trayState === 'down')) {
    trayState = 'dragging';
    dragOffset = tray.transform.translationY - translationY;
  }
  if (trayState === 'dragging') {
    const offsetY = Math.min(Math.max(translationY + dragOffset, 0), trayHeight);
    tray.transform = {translationY: offsetY};
    shade.opacity = getShadeOpacity(offsetY);
    strapIcon.transform = getStrapIconTransform(offsetY);
  }
  if (state === 'end' && trayState === 'dragging') {
    positionTrayInRestingState(velocityY);
  }
}

function toggleTrayState() {
  if (trayState === 'up' || trayState === 'down') {
    positionTrayInRestingState(trayState === 'down' ? -1000 : 1000);
  }
}

async function positionTrayInRestingState(velocity) {
  trayState = 'animating';
  const translationY = velocity > 0 ? trayHeight : 0;
  const options = {duration: Math.min(Math.abs(trayHeight / velocity * 1000), 800)};
  shade.animate({opacity: getShadeOpacity(translationY)}, options);
  strapIcon.animate({transform: getStrapIconTransform(translationY)}, options);
  await tray.animate({transform: {translationY: translationY}}, options);
  trayState = velocity > 0 ? 'down' : 'up';
}

function getShadeOpacity(translationY) {
  const traveled = translationY / trayHeight;
  return Math.max(0, 0.6 - traveled);
}

function getStrapIconTransform(translationY) {
  const traveled = translationY / trayHeight;
  return {rotation: traveled * Math.PI - Math.PI};
}
