import ClientStub from './ClientStub';
import {expect, mockTabris, restore} from '../test';
import Composite from '../../src/tabris/widgets/Composite';
import Column from '../../src/tabris/widgets/Column';
import TextView from '../../src/tabris/widgets/TextView';
import ColumnLayout from '../../src/tabris/ColumnLayout';
import {LayoutQueue, ConstraintLayout} from '../../src/tabris/Layout';

describe('ColumnLayout', function() {

  afterEach(restore);

  describe('ColumnLayout.default', function() {

    it('has padding', function() {
      expect(ColumnLayout.default.padding).to.deep.equal({
        left: 16, top: 16, right: 16, bottom: 16,
      });
    });

    it('has spacing', function() {
      expect(ColumnLayout.default.spacing).to.equal(16);
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
      expect(all[1]).to.deep.equal({top: [cid[0], 0], left: 17, right: 19});
      expect(all[2]).to.deep.equal({top: [cid[1], 0], left: 17, right: 19});
      expect(all[3]).to.deep.equal({top: [cid[2], 0], left: 17, right: 19});
      expect(all[4]).to.deep.equal({top: [cid[3], 0], left: 17, right: 19});
      expect(all[5]).to.deep.equal({top: [cid[4], 0], left: 17, right: 19});
    });

    it('renders children layoutData with spacing', function() {
      const all = render({spacing: 16});
      const cid = parent.children().toArray().map(child => child.cid);

      expect(all[0]).to.deep.equal({top: 0, left: 0, right: 0});
      expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 0, right: 0});
      expect(all[2]).to.deep.equal({top: [cid[1], 16], left: 0, right: 0});
      expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 0, right: 0});
      expect(all[4]).to.deep.equal({top: [cid[3], 16], left: 0, right: 0});
      expect(all[5]).to.deep.equal({top: [cid[4], 16], left: 0, right: 0});
    });

  });

  describe('on Column widget', function() {

    it('is the default layout', function() {
      expect(new Column().layout).to.be.instanceof(ColumnLayout);
    });

    it('can be replaced in constructor', function() {
      const layout = new ColumnLayout();
      expect(new Column({layout}).layout).to.equal(layout);
    });

    it('can not be replaced with ConstraintLayout in constructor', function() {
      const layout = new ConstraintLayout();
      expect(() => new Column({layout})).to.throw();
    });

    it('can not be replaced later', function() {
      const layout = new ColumnLayout();
      const column = new Column({layout});

      column.layout = layout;

      expect(column.layout).to.equal(layout);
    });

    it('can be created by spacing parameter', function() {
      const layout = new Column({spacing: 2}).layout;
      expect(layout.spacing).to.equal(2);
      expect(layout.padding).to.deep.equal({left: 16, top: 16, right: 16, bottom: 16});
    });

    it('can be merged with spacing parameter', function() {
      const layout = new Column({layout: new ColumnLayout({padding: 3}), spacing: 4}).layout;
      expect(layout.spacing).to.equal(4);
      expect(layout.padding).to.deep.equal({left: 3, top: 3, right: 3, bottom: 3});
    });

    it('spacing can not be set later', function() {
      const column = new Column({spacing: 4});

      column.spacing = 10;

      expect(column.spacing).to.equal(4);
    });

  });

});
