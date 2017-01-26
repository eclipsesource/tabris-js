import {expect} from '../test';
import StorageEvent from '../../src/tabris/StorageEvent';

describe('StorageEvent', function() {

  it('sets default values', function() {
    let event = new StorageEvent();
    expect(event.bubbles).to.equal(false);
    expect(event.cancelable).to.equal(false);
    expect(event.key).to.equal('');
    expect(event.oldValue).to.equal(null);
    expect(event.newValue).to.equal(null);
    expect(event.url).to.equal('');
    expect(event.storageArea).to.equal(null);
  });

  it('sets type from parameter', function() {
    let event = new StorageEvent('type');
    expect(event.type).to.equal('type');
  });

});
