import {RefreshComposite, TextView, contentView} from 'tabris';

contentView.append(
  <RefreshComposite stretch refreshEnabled onRefresh={handleRefresh}>
    <TextView stretchX top={32} alignment='centerX' font='black 24px'>
      Pull to refresh
    </TextView>
    <TextView id='log' stretchX top='prev() 32' alignment='centerX' lineSpacing={1.4}/>
  </RefreshComposite>
);

const refreshComposite = $(RefreshComposite).only();
const log = $(TextView).only('#log');

function handleRefresh() {
  setTimeout(() => {
    refreshComposite.refreshIndicator = false;
    log.text = `last refresh: ${new Date()}\n${log.text}`;
  }, 1000);
}
