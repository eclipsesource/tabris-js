import ClientStub from './ClientStub';
import {expect, mockTabris, restore} from '../test';
import Composite from '../../src/tabris/widgets/Composite';
import StackComposite from '../../src/tabris/widgets/StackComposite';
import TextView from '../../src/tabris/widgets/TextView';
import StackLayout from '../../src/tabris/StackLayout';
import {LayoutQueue, ConstraintLayout} from '../../src/tabris/Layout';

describe('StackLayout', function() {

  afterEach(restore);

  describe('StackLayout.default', function() {

    it('has padding', function() {
      expect(StackLayout.default.padding).to.deep.equal({
        left: 16, top: 16, right: 16, bottom: 16,
      });
    });

    it('has spacing', function() {
      expect(StackLayout.default.spacing).to.equal(16);
    });

    it('always returns same StackLayout', function() {
      expect(StackLayout.default).to.be.instanceof(StackLayout);
      expect(StackLayout.default).to.equal(StackLayout.default);
    });

  });

  describe('instance', function() {

    let parent, client, queue;

    function render(stackProps) {
      parent = new Composite({layout: new StackLayout(stackProps, queue)});
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

  describe('on Stack widget', function() {

    it('is the default layout', function() {
      expect(new StackComposite().layout).to.be.instanceof(StackLayout);
    });

    it('can be replaced in constructor', function() {
      const layout = new StackLayout();
      expect(new StackComposite({layout}).layout).to.equal(layout);
    });

    it('can not be replaced with ConstraintLayout in constructor', function() {
      const layout = new ConstraintLayout();
      expect(() => new StackComposite({layout})).to.throw();
    });

    it('can not be replaced later', function() {
      const layout = new StackLayout();
      const stack = new StackComposite({layout});

      stack.layout = layout;

      expect(stack.layout).to.equal(layout);
    });

    it('can be created by spacing parameter', function() {
      const layout = new StackComposite({spacing: 2}).layout;
      expect(layout.spacing).to.equal(2);
      expect(layout.padding).to.deep.equal({left: 16, top: 16, right: 16, bottom: 16});
    });

    it('can be merged with spacing parameter', function() {
      const layout = new StackComposite({layout: new StackLayout({padding: 3}), spacing: 4}).layout;
      expect(layout.spacing).to.equal(4);
      expect(layout.padding).to.deep.equal({left: 3, top: 3, right: 3, bottom: 3});
    });

    it('spacing can not be set later', function() {
      const stack = new StackComposite({spacing: 4});

      stack.spacing = 10;

      expect(stack.spacing).to.equal(4);
    });

  });

});
