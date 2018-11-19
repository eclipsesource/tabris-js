import ClientStub from './ClientStub';
import {expect, mockTabris, restore} from '../test';
import Composite from '../../src/tabris/widgets/Composite';
import Column from '../../src/tabris/widgets/Column';
import TextView from '../../src/tabris/widgets/TextView';
import ColumnLayout from '../../src/tabris/ColumnLayout';

describe('ColumnLayout', function() {

  let parent, client;

  function render() {
    client.resetCalls();
    parent.layout.render(parent);
    return parent.children().toArray().map(child => client.properties(child.cid).layoutData);
  }

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    parent = new Composite();
    for (let i = 0; i < 6; i++) {
      parent.append(new TextView());
    }
  });

  afterEach(restore);

  describe('ColumnLayout.default', function() {

    it('always returns same ColumnLayout', function() {
      expect(ColumnLayout.default).to.be.instanceof(ColumnLayout);
      expect(ColumnLayout.default).to.equal(ColumnLayout.default);
    });

    it('renders existing children layoutData with default settings', function() {
      parent.layout = ColumnLayout.default;
      const all = render();
      const cid = parent.children().toArray().map(child => child.cid);

      expect(all[0]).to.deep.equal({top: [0, 16], left: 16, right: 16});
      expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 16, right: 16});
      expect(all[2]).to.deep.equal({top: [cid[1], 16], left: 16, right: 16});
      expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 16, right: 16});
      expect(all[4]).to.deep.equal({top: [cid[3], 16], left: 16, right: 16});
      expect(all[5]).to.deep.equal({top: [cid[4], 16], left: 16, right: 16});
    });

  });

  describe('on Column widget', function() {

    it('is the default layout', function() {
      expect(new Column().layout).to.be.instanceof(ColumnLayout);
    });

    it('can not be replaced', function() {
      expect(() => new Column({layout: ColumnLayout.create()})).to.throw();
      expect(() => new Column().layout = ColumnLayout.create()).to.throw();
    });

  });

});
