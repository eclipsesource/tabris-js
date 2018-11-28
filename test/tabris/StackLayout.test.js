import ClientStub from './ClientStub';
import {expect, mockTabris, restore, stub} from '../test';
import Composite from '../../src/tabris/widgets/Composite';
import StackComposite from '../../src/tabris/widgets/StackComposite';
import TextView from '../../src/tabris/widgets/TextView';
import StackLayout from '../../src/tabris/StackLayout';
import {LayoutQueue, ConstraintLayout} from '../../src/tabris/Layout';
import {toXML} from '../../src/tabris/Console';

describe('StackLayout', function() {

  let parent, client, queue;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    queue = new LayoutQueue();
  });

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

    it('has alignment', function() {
      expect(StackLayout.default.alignment).to.equal('left');
    });

    it('always returns same StackLayout', function() {
      expect(StackLayout.default).to.be.instanceof(StackLayout);
      expect(StackLayout.default).to.equal(StackLayout.default);
    });

  });

  describe('constructor', function() {

    it('sets defaults', function() {
      const layout = new StackLayout();

      expect(layout.spacing).to.equal(0);
      expect(layout.padding).to.deep.equal({left: 0, top: 0, right: 0, bottom: 0});
      expect(layout.alignment).to.equal('left');
    });

    it('override defaults', function() {
      const layout = new StackLayout({padding: 1, spacing: 2, alignment: 'right'});

      expect(layout.spacing).to.equal(2);
      expect(layout.padding).to.deep.equal({left: 1, top: 1, right: 1, bottom: 1});
      expect(layout.alignment).to.equal('right');
    });

  });

  describe('instance', function() {

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

    describe('with alignment left', function() {

      it('renders children layoutData with padding', function() {
        const all = render({padding: {left: 17, top: 18, right: 19, bottom: 20}, alignment: 'left'});
        const cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({top: 18, left: 17});
        expect(all[1]).to.deep.equal({top: [cid[0], 0], left: 17});
        expect(all[2]).to.deep.equal({top: [cid[1], 0], left: 17});
        expect(all[3]).to.deep.equal({top: [cid[2], 0], left: 17});
        expect(all[4]).to.deep.equal({top: [cid[3], 0], left: 17});
        expect(all[5]).to.deep.equal({top: [cid[4], 0], left: 17});
      });

      it('renders children layoutData with spacing', function() {
        const all = render({spacing: 16, alignment: 'left'});
        const cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({top: 0, left: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], left: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], left: 0});
        expect(all[5]).to.deep.equal({top: [cid[4], 16], left: 0});
      });

    });

    describe('with alignment centerX', function() {

      it('renders children layoutData with padding', function() {
        const all = render({padding: {left: 17, top: 18, right: 19, bottom: 20}, alignment: 'centerX'});
        const cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({top: 18, centerX: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 0], centerX: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 0], centerX: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 0], centerX: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 0], centerX: 0});
        expect(all[5]).to.deep.equal({top: [cid[4], 0], centerX: 0});
      });

      it('renders children layoutData with spacing', function() {
        const all = render({spacing: 16, alignment: 'centerX'});
        const cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({top: 0, centerX: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], centerX: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], centerX: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], centerX: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], centerX: 0});
        expect(all[5]).to.deep.equal({top: [cid[4], 16], centerX: 0});
      });

    });

    describe('with alignment stretchX', function() {

      it('renders children layoutData with padding', function() {
        const all = render({padding: {left: 17, top: 18, right: 19, bottom: 20}, alignment: 'stretchX'});
        const cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({top: 18, left: 17, right: 19});
        expect(all[1]).to.deep.equal({top: [cid[0], 0], left: 17, right: 19});
        expect(all[2]).to.deep.equal({top: [cid[1], 0], left: 17, right: 19});
        expect(all[3]).to.deep.equal({top: [cid[2], 0], left: 17, right: 19});
        expect(all[4]).to.deep.equal({top: [cid[3], 0], left: 17, right: 19});
        expect(all[5]).to.deep.equal({top: [cid[4], 0], left: 17, right: 19});
      });

      it('renders children layoutData with spacing', function() {
        const all = render({spacing: 16, alignment: 'stretchX'});
        const cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({top: 0, left: 0, right: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 0, right: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], left: 0, right: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 0, right: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], left: 0, right: 0});
        expect(all[5]).to.deep.equal({top: [cid[4], 16], left: 0, right: 0});
      });

    });

    describe('with alignment right', function() {

      it('renders children layoutData with padding', function() {
        const all = render({padding: {left: 17, top: 18, right: 19, bottom: 20}, alignment: 'right'});
        const cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({top: 18, right: 19});
        expect(all[1]).to.deep.equal({top: [cid[0], 0], right: 19});
        expect(all[2]).to.deep.equal({top: [cid[1], 0], right: 19});
        expect(all[3]).to.deep.equal({top: [cid[2], 0], right: 19});
        expect(all[4]).to.deep.equal({top: [cid[3], 0], right: 19});
        expect(all[5]).to.deep.equal({top: [cid[4], 0], right: 19});
      });

      it('renders children layoutData with spacing', function() {
        const all = render({spacing: 16, alignment: 'right'});
        const cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({top: 0, right: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], right: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], right: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], right: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], right: 0});
        expect(all[5]).to.deep.equal({top: [cid[4], 16], right: 0});
      });

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
      expect(layout.alignment).to.equal('left');
    });

    it('can be created by alignment parameter', function() {
      const layout = new StackComposite({alignment: 'right'}).layout;
      expect(layout.spacing).to.equal(16);
      expect(layout.padding).to.deep.equal({left: 16, top: 16, right: 16, bottom: 16});
      expect(layout.alignment).to.equal('right');
    });

    it('can be merged with spacing parameter', function() {
      const layout = new StackComposite({layout: new StackLayout({padding: 3}), spacing: 4}).layout;
      expect(layout.spacing).to.equal(4);
      expect(layout.padding).to.deep.equal({left: 3, top: 3, right: 3, bottom: 3});
    });

    it('can be merged with alignment parameter', function() {
      const layout = new StackComposite({layout: new StackLayout({padding: 3}), alignment: 'right'}).layout;
      expect(layout.spacing).to.equal(0);
      expect(layout.padding).to.deep.equal({left: 3, top: 3, right: 3, bottom: 3});
      expect(layout.alignment).to.deep.equal('right');
    });

    it('spacing can not be set later', function() {
      const stack = new StackComposite({spacing: 4});

      stack.spacing = 10;

      expect(stack.spacing).to.equal(4);
    });

    it('alignment can not be set later', function() {
      const stack = new StackComposite({alignment: 'right'});

      stack.alignment = 'left';

      expect(stack.alignment).to.equal('right');
    });

    it('alignment is included in toXML result', function() {
      stub(client, 'get').returns({});
      expect(new StackComposite()[toXML]())
        .to.match(/<StackComposite .* alignment='left'\/>/);
      expect(new StackComposite({alignment: 'right'})[toXML]())
        .to.match(/<StackComposite .* alignment='right'\/>/);
    });

  });

});
