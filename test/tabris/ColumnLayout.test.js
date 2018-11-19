import ClientStub from './ClientStub';
import {expect, mockTabris, restore} from '../test';
import Composite from '../../src/tabris/widgets/Composite';
import Column from '../../src/tabris/widgets/Column';
import TextView from '../../src/tabris/widgets/TextView';
import ColumnLayout from '../../src/tabris/ColumnLayout';
import {LayoutQueue} from '../../src/tabris/Layout';

describe('ColumnLayout', function() {

  afterEach(restore);

  describe('ColumnLayout.default', function() {

    it('has padding', function() {
      expect(ColumnLayout.default.padding).to.deep.equal({left: 16, top: 16, right: 16, bottom: 16});
    });

    it('always returns same ColumnLayout', function() {
      expect(ColumnLayout.default).to.be.instanceof(ColumnLayout);
      expect(ColumnLayout.default).to.equal(ColumnLayout.default);
    });

  });

  describe('instance', function() {

    let parent, client, queue;

    function render(columnProps) {
      parent = new Composite({layout: new ColumnLayout(columnProps, queue)});
      for (let i = 0; i < 6; i++) {
        parent.append(new TextView());
      }
      client.resetCalls();
      parent.layout.render(parent);
      tabris.trigger('flush');
      return parent.children().toArray().map(child => client.properties(child.cid).layoutData);
    }

    beforeEach(function() {
      client = new ClientStub();
      mockTabris(client);
      queue = new LayoutQueue();
    });

    it('renders children layoutData with padding', function() {
      const all = render({padding: {left: 17, top: 18, right: 19, bottom: 20}});
      const cid = parent.children().toArray().map(child => child.cid);

      expect(all[0]).to.deep.equal({top: 18, left: 17, right: 19});
      expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 17, right: 19});
      expect(all[2]).to.deep.equal({top: [cid[1], 16], left: 17, right: 19});
      expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 17, right: 19});
      expect(all[4]).to.deep.equal({top: [cid[3], 16], left: 17, right: 19});
      expect(all[5]).to.deep.equal({top: [cid[4], 16], left: 17, right: 19});
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
