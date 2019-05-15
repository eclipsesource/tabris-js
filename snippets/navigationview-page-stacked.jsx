import {Button, NavigationView, Page, contentView, StackLayout} from 'tabris';

contentView.append(
  <NavigationView stretch>
    <CustomPage title='Initial Page'/>
  </NavigationView>
);

const navigationView = $(NavigationView).only();
let pageCount = 0;

/** @param {tabris.Attributes<Page>} attributes */
function CustomPage(attributes) {
  const pageLayout = new StackLayout({alignment: 'stretchX', spacing: 16});
  return (
    <Page padding={16} layout={pageLayout} {...attributes}>
      <Button onSelect={addPage}>Create another page</Button>
      <Button onSelect={goBack}>Go back</Button>
      <Button onSelect={goToInitialPage}>Go to initial page</Button>
    </Page>
  );
}

function goToInitialPage() {
  navigationView.pages().slice(1).dispose();
}

function goBack() {
  if (navigationView.pages().length > 1) {
    navigationView.pages().last().dispose();
  }
}

function addPage() {
  navigationView.append(
    <CustomPage title={`Page ${++pageCount}`}/>
  );
}
