import {expect, mockTabris, stub} from '../../test';
import ClientMock from '../ClientMock';
import Tab from '../../../src/tabris/widgets/Tab';
import Composite from '../../../src/tabris/widgets/Composite';
import {toXML} from '../../../src/tabris/Console';

describe('Tab', function() {

  let client;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    client.resetCalls();
  });

  describe('when created', function() {

    let tab, create;

    beforeEach(function() {
      tab = new Tab({
        title: 'foo',
        image: {src: 'bar'},
        selectedImage: {src: 'selectedBar'},
        badge: '1',
        background: '#010203',
        visible: false
      });
      create = client.calls({op: 'create', id: tab.cid})[0];
    });

    it('creates a Tab', function() {
      expect(create.type).to.equal('tabris.Tab');
      expect(create.id).to.equal(tab.cid);
      expect(create.properties.title).to.equal('foo');
    });

    it('getter returns initial properties', function() {
      tab = new Tab();
      expect(tab.title).to.equal('');
      expect(tab.image).to.equal(null);
      expect(tab.selectedImage).to.equal(null);
      expect(tab.badge).to.equal('');
      expect(tab.visible).to.equal(true);
    });

    it('throws when appended to an illegal parent', function() {
      expect(() => {
        tab.appendTo(new Composite());
      }).to.throw('Tab could not be appended to Composite');
    });

    it('toXML prints xml element with title', function() {
      stub(client, 'get').returns({});
      expect(tab[toXML]()).to.match(/<Tab .* title='foo'\/>/);
    });

  });

});
