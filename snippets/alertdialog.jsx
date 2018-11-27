import {AlertDialog, Button, StackComposite, TextInput, TextView, contentView} from 'tabris';

contentView.append(
  <StackComposite layoutData='fill'>
    <Button onSelect={showSimpleDialog}>Simple dialog</Button>
    <Button onSelect={showDialogWithButtons}>Dialog with multiple buttons</Button>
    <Button onSelect={showSelfClosingDialog}>Self-closing dialog</Button>
    <Button onSelect={showTextInputDialog}>Dialog with text fields</Button>
    <TextView/>
  </StackComposite>
);

const textView =  contentView.find(TextView).first();

async function showSimpleDialog() {
  await AlertDialog.open('Comment saved');
  textView.text = 'Dialog closed';
}

async function showDialogWithButtons() {
  const buttons = {ok: 'Replace', cancel: 'Discard', neutral: 'Keep editing'};
  const dialog = AlertDialog.open(
    <AlertDialog title='Conflict while saving' buttons={buttons}>
      How do you want to resolve the conflict?
    </AlertDialog>
  );
  const {button} = await dialog.onClose.promise();
  textView.text = `You pressed the ${button} button`;
}

async function showSelfClosingDialog() {
  const dialog = AlertDialog.open('This dialogs closes in 3 seconds.');
  await new Promise(resolve => setTimeout(resolve, 3000));
  dialog.close();
  textView.text = 'Dialog closed';
}

async function showTextInputDialog() {
  const dialog = AlertDialog.open(
    <AlertDialog title='Sign-in required' buttons={{ok: 'Sign-in', cancel: 'Cancel'}}>
      Provide sign-in credentials to access your personalized content.
      <TextInput message='Username' />
      <TextInput type='password' message='Password' />
    </AlertDialog>
  );
  const {texts, button} = await dialog.onClose.promise();
  if (button === 'ok') {
    textView.text = 'Input: ' + texts.join(' / ');
  } else {
    textView.text = 'Canceled';
  }
}
