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

    it('has defaults', function() {
      expect(StackLayout.default.spacing).to.equal(0);
      expect(StackLayout.default.alignment).to.equal('left');
    });

  });

  describe('constructor', function() {

    it('sets defaults', function() {
      const layout = new StackLayout();

      expect(layout.spacing).to.equal(0);
      expect(layout.alignment).to.equal('left');
    });

    it('override defaults', function() {
      const layout = new StackLayout({spacing: 2, alignment: 'right'});

      expect(layout.spacing).to.equal(2);
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

      it('renders children layoutData', function() {
        const all = render({alignment: 'left'});
        const cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({top: 0, left: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 0], left: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 0], left: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 0], left: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 0], left: 0});
        expect(all[5]).to.deep.equal({top: [cid[4], 0], left: 0});
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

      it('renders children layoutData', function() {
        const all = render({alignment: 'stretchX'});
        const cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({top: 0, left: 0, right: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 0], left: 0, right: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 0], left: 0, right: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 0], left: 0, right: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 0], left: 0, right: 0});
        expect(all[5]).to.deep.equal({top: [cid[4], 0], left: 0, right: 0});
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

      it('renders children layoutData', function() {
        const all = render({alignment: 'right'});
        const cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({top: 0, right: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 0], right: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 0], right: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 0], right: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 0], right: 0});
        expect(all[5]).to.deep.equal({top: [cid[4], 0], right: 0});
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
      expect(layout.alignment).to.equal('left');
    });

    it('can be created by alignment parameter', function() {
      const layout = new StackComposite({alignment: 'right'}).layout;
      expect(layout.spacing).to.equal(0);
      expect(layout.alignment).to.equal('right');
    });

    it('can be merged with spacing parameter', function() {
      const layout = new StackComposite({layout: new StackLayout(), spacing: 4}).layout;
      expect(layout.spacing).to.equal(4);
    });

    it('can be merged with alignment parameter', function() {
      const layout = new StackComposite({layout: new StackLayout(), alignment: 'right'}).layout;
      expect(layout.spacing).to.equal(0);
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
