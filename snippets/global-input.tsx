import {CollectionView, Composite, contentView, input, TextView} from 'tabris';

const items: string[] = ['Touch on the screen.'];

contentView.append(
  <CollectionView
      stretch
      cellHeight='auto'
      itemCount={items.length}
      createCell={() => (
        <Composite padding={16}>
          <TextView centerY markupEnabled/>
        </Composite>
      )}
      updateCell={(cell, index) => cell.find(TextView).only().text = items[index]}/>);

input.onPointerDown(({touches}) => renderPointerEvent('pointerDown', touches))
  .onPointerMove(({touches}) => renderPointerEvent('pointerMove', touches))
  .onPointerUp(({touches}) => renderPointerEvent('pointerUp', touches))
  .onPointerCancel(({touches}) => renderPointerEvent('pointerCancel', touches));

function renderPointerEvent(eventName: string, touches: [{ x: number, y: number }]) {
  items.push(`${eventName}: <b>${Math.round(touches[0].x)}</b> X - <b>${Math.round(touches[0].y)}</b> Y`);
  const collectionView = contentView.find(CollectionView).only();
  collectionView.load(items.length);
  collectionView.reveal(items.length - 1);
}
