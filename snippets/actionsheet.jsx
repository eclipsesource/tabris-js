import {ActionSheet, ActionSheetItem, TextView, Button, WidgetCollection, ui} from 'tabris';

ui.contentView.append(
  <WidgetCollection>
    <Button left={16} right={16} top={16} onSelect={showActionSheet}>Show ActionSheet</Button>
    <TextView left={16} right={16} top='prev() 16' alignment='center'/>
  </WidgetCollection>
);

async function showActionSheet() {
  const actionSheet = ActionSheet.open(
    <ActionSheet title='Actions'>
      Select any of the actions below to proceed.
      <ActionSheetItem title='Search' image='resources/search-black-24dp@3x.png' />
      <ActionSheetItem title='Share' image='resources/share-black-24dp@3x.png' />
      <ActionSheetItem title='Settings' image='resources/settings-black-24dp@3x.png' />
      <ActionSheetItem title='Delete' style='destructive' image='resources/delete-black-24dp@3x.png' />
      <ActionSheetItem title='Cancel' style='cancel' image='resources/close-black-24dp@3x.png' />
    </ActionSheet>
  );
  const {action} = await actionSheet.onClose.promise();
  ui.contentView.find(TextView).first().text = `${action || 'Nothing'} selected`;
}
