import {Composite, TextView, Button, app, contentView, device, Stack} from 'tabris';

contentView.append(
  <Stack stretch spacing={16} padding={16} alignment='stretchX'>
    <TextView top={0} font='italic 14px'>
      You can press home and reopen the app to it to see how long you were away
    </TextView>
    <Composite top={0} bottom={0}/>
    <Button bottom={0} text='Reload app' onSelect={() => app.reload()}/>
    <Button excludeFromLayout={device.platform !== 'Android'}
        bottom={0} text='Close app' onSelect={() => app.close()}/>
  </Stack>
);

const label = $(TextView).only();

app.onPause(async () => {
  const paused = Date.now();
  await app.onResume.promise();
  const diff = Date.now() - paused;
  label.text = `Welcome back!\nYou were gone for ${(diff / 1000).toFixed(1)} seconds.`;
});

app.onBackNavigation(async event => {
  event.preventDefault();
  label.set({opacity: 0, text: 'Back navigation prevented.'});
  await label.animate({opacity: 1}, {duration: 300});
});
