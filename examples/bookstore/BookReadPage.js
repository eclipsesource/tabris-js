const {Page, TextView, ScrollView} = require('tabris');

const EXCERPT = '"And thus the first man of the Pequod that mounted the mast to look out for ' +
  'the White Whale, on the White Whale\'s own peculiar ground; that man was ' +
  'swallowed up in the deep. But few, perhaps, thought of that at the time. ' +
  'Indeed, in some sort, they were not grieved at this event, at least as a ' +
  'portent; for they regarded it, not as a foreshadowing of evil in the ' +
  'future, but as the fulfilment of an evil already presaged. They declared ' +
  'that now they knew the reason of those wild shrieks they had heard the ' +
  'night before. But again the old Manxman said nay."';

module.exports = class BookReadPage extends Page {

  constructor(properties) {
    super(properties);
    this._createUI();
    this._applyLayout();
    this._applyStyles();
  }

  _createUI() {
    this.append(
      new ScrollView().append(
        new TextView({id: 'titleLabel', text: this.title}),
        new TextView({id: 'excerptLabel', text: EXCERPT})
      )
    );
  }

  _applyLayout() {
    this.apply({
      '#titleLabel': {left: 16, top: 16, right: 16},
      'ScrollView': {left: 0, right: 0, top: 0, bottom: 0}
    });
  }

  _applyStyles() {
    this.apply({
      '#titleLabel': {textColor: 'rgba(0, 0, 0, 0.5)', font: 'bold 14px sans-serif'},
      '#excerptLabel': {left: 16, right: 16, top: 'prev() 16', font: '14px', lineSpacing: 1.5}
    });
  }

};
