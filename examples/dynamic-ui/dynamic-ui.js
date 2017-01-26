var topLevelPages = [];
var pages = [];
var actions = [];

new tabris.Drawer().append(new tabris.PageSelector());
createPage('Dynamic UI Start', true).open();

function createPage(pageTitle, pageIsTopLevel) {

  var page = new tabris.Page({
    title: pageTitle,
    topLevel: pageIsTopLevel
  });

  new tabris.Button({
    id: 'addRootPage',
    left: 5, right: 5, top: 5,
    text: 'Add Root Page',
    background: 'green',
    textColor: 'white',
    image: {src: 'images/add_root_page.png', width: 24, height: 24}
  }).on('select', function() {
    var page = createPage('Root Page: ' + createRandomPageId(), true);
    topLevelPages.push(page);
    page.open();
  }).appendTo(page);

  new tabris.Button({
    id: 'addPage',
    left: 5, right: 5, top: '#addRootPage 5',
    text: 'Add Page',
    background: 'green',
    textColor: 'white',
    image: {src: 'images/add_page.png', width: 24, height: 24}
  }).on('select', function() {
    var page = createPage('Page: ' + createRandomPageId(), false);
    pages.push(page);
    page.open();
  }).appendTo(page);

  new tabris.Button({
    left: 5, right: 5, top: '#addPage 5',
    text: 'Add Global Action',
    background: 'green',
    textColor: 'white',
    image: {src: 'images/global_action.png', width: 24, height: 24}
  }).on('select', function() {
    var action = new tabris.Action({
      title: 'Share',
      image: {src: 'images/action_share.png', width: 24, height: 24}
    });
    // TODO: implement action
    actions.push(action);
  }).appendTo(page);

  // TODO: add page actions to demo when implemented. See tabris-js issue #8.

  new tabris.Button({
    id: 'removeLastGlobalAction',
    left: 5, right: 5, bottom: 5,
    text: 'Remove Last Global Action',
    background: 'red',
    textColor: 'white',
    image: {src: 'images/global_action.png', width: 24, height: 24}
  }).on('select', function() {
    if (actions.length - 1 >= 0) {
      actions[actions.length - 1].dispose();
      actions.pop();
    }
  }).appendTo(page);

  new tabris.Button({
    left: 5, right: 5, bottom: '#removeLastGlobalAction 5',
    text: 'Remove Last Root Page',
    background: 'red',
    textColor: 'white',
    image: {src: 'images/remove_root_page.png', width: 24, height: 24}
  }).on('select', function() {
    if (topLevelPages.length - 1 >= 0) {
      topLevelPages[topLevelPages.length - 1].close();
      topLevelPages.pop();
    }
  }).appendTo(page);

  return page;

}

function createRandomPageId() {
  return Math.floor(Math.random() * (99999) + 10000);
}
