import ClientStub from './ClientStub';
import {expect, mockTabris, restore} from '../test';
import Layout from '../../src/tabris/Layout';
import Composite from '../../src/tabris/widgets/Composite';
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

  describe('constructor', function() {

    it('is private', function() {
      expect(() => new ColumnLayout()).to.throw();
    });

  });

  describe('Layout.column()', function() {

    it('always returns same ColumnLayout', function() {
      expect(Layout.column()).to.be.instanceof(ColumnLayout);
      expect(Layout.column()).to.equal(Layout.column());
    });

    it('renders existing children layoutData with default settings', function() {
      parent.layout = Layout.column();
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

});
