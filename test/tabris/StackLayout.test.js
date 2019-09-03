import ClientMock from './ClientMock';
import {expect, mockTabris, restore, stub} from '../test';
import Composite from '../../src/tabris/widgets/Composite';
import Stack from '../../src/tabris/widgets/Stack';
import TextView from '../../src/tabris/widgets/TextView';
import StackLayout from '../../src/tabris/StackLayout';
import {LayoutQueue, ConstraintLayout} from '../../src/tabris/Layout';
import {toXML} from '../../src/tabris/Console';

describe('StackLayout', function() {

  /** @type {Composite} */
  let parent;

  /** @type {ClientMock} */
  let client;

  /** @type {LayoutQueue} */
  let queue;

  beforeEach(function() {
    client = new ClientMock();
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

    /** @type {TextView[]} */
    let children;

    /** @type {string[]} */
    let cid;

    function render(stackProps) {
      parent = new Composite({layout: new StackLayout(stackProps, queue)});
      parent.append(children);
      client.resetCalls();
      parent.layout.render(parent);
      tabris.trigger('flush');
      return parent.children().toArray().map(child => client.properties(child.cid).layoutData);
    }

    beforeEach(function() {
      children = [];
      for (let i = 0; i < 6; i++) {
        children.push(new TextView());
      }
      cid = children.map(child => child.cid);
    });

    describe('with alignment left', function() {

      it('renders children layoutData', function() {
        const all = render({alignment: 'left'});

        expect(all[0]).to.deep.equal({top: 0, left: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 0], left: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 0], left: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 0], left: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 0], left: 0});
        expect(all[5]).to.deep.equal({top: [cid[4], 0], left: 0});
      });

      it('renders children layoutData with spacing', function() {
        const all = render({spacing: 16, alignment: 'left'});

        expect(all[0]).to.deep.equal({top: 0, left: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], left: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], left: 0});
        expect(all[5]).to.deep.equal({top: [cid[4], 16], left: 0});
      });

      it('renders children layoutData with dimension', function() {
        children[0].width = 100;
        children[1].height = 200;
        children[2].set({width: 300, height: 400});

        const all = render({spacing: 16, alignment: 'left'});

        expect(all[0]).to.deep.equal({top: 0, left: 0, width: 100});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 0, height: 200});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], left: 0, width: 300, height: 400});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 0});
      });

      it('renders children layoutData with alternate alignment', function() {
        children[0].width = 100;
        children[1].left = 10;
        children[2].right = 10;
        children[3].set({left: 0, right: 0});
        children[4].set({centerX: 10});

        const all = render({spacing: 16, alignment: 'left'});

        expect(all[0]).to.deep.equal({top: 0, left: 0, width: 100});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 10});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], right: 10});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 0, right: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], centerX: 10});
      });

      it('normalizes invalid layoutData with warning', function() {
        stub(console, 'warn');
        children[0].set({baseline: children[1], width: 100});
        children[1].left = [children[0], 10];
        children[2].right = [children[0], 10];
        children[3].set({left: ['10%', 0], right: ['10%', 0], width: 0});
        children[4].set({centerX: 10, centerY: 10, left: 10});

        const all = render({spacing: 16, alignment: 'left'});

        expect(all[0]).to.deep.equal({top: 0, left: 0, width: 100});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 10});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], right: 10});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 0, right: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], centerX: 10});
        expect(console.warn).to.have.been.called.callCount(8);
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

      it('renders children layoutData with dimension', function() {
        children[0].width = 100;
        children[1].height = 200;
        children[2].set({width: 300, height: 400});

        const all = render({spacing: 16, alignment: 'centerX'});

        expect(all[0]).to.deep.equal({top: 0, centerX: 0, width: 100});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], centerX: 0, height: 200});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], centerX: 0, width: 300, height: 400});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], centerX: 0});
      });

      it('renders children layoutData with alternate alignment', function() {
        children[0].width = 100;
        children[1].left = 10;
        children[2].right = 10;
        children[3].set({left: 0, right: 0});
        children[4].set({centerX: 10});

        const all = render({spacing: 16, alignment: 'centerX'});

        expect(all[0]).to.deep.equal({top: 0, centerX: 0, width: 100});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 10});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], right: 10});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 0, right: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], centerX: 10});
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

      it('renders children layoutData with dimension', function() {
        children[0].width = 100;
        children[1].height = 200;
        children[2].set({width: 300, height: 400});

        const all = render({spacing: 16, alignment: 'stretchX'});

        expect(all[0]).to.deep.equal({top: 0, left: 0, width: 100});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 0, right: 0, height: 200});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], left: 0, width: 300, height: 400});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 0, right: 0});
      });

      it('renders children layoutData with alternate alignment', function() {
        children[0].width = 100;
        children[1].left = 10;
        children[2].right = 10;
        children[3].set({left: 0, right: 0});
        children[4].set({centerX: 10});

        const all = render({spacing: 16, alignment: 'stretchX'});

        expect(all[0]).to.deep.equal({top: 0, left: 0, width: 100});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 10});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], right: 10});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 0, right: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], centerX: 10});
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

      it('renders children layoutData with dimension', function() {
        children[0].width = 100;
        children[1].height = 200;
        children[2].set({width: 300, height: 400});

        const all = render({spacing: 16, alignment: 'right'});

        expect(all[0]).to.deep.equal({top: 0, right: 0, width: 100});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], right: 0, height: 200});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], right: 0, width: 300, height: 400});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], right: 0});
      });

      it('renders children layoutData with alternate alignment', function() {
        children[0].width = 100;
        children[1].left = 10;
        children[2].right = 10;
        children[3].set({left: 0, right: 0});
        children[4].set({centerX: 10});

        const all = render({spacing: 16, alignment: 'right'});

        expect(all[0]).to.deep.equal({top: 0, right: 0, width: 100});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 10});
        expect(all[2]).to.deep.equal({top: [cid[1], 16], right: 10});
        expect(all[3]).to.deep.equal({top: [cid[2], 16], left: 0, right: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], centerX: 10});
      });

    });

    describe('with layoutData properties top/bottom', function() {

      it('top replaces spacing', function() {
        children[0].top = 20;
        children[1].top = 10;
        children[2].top = 0;
        children[3].top = -20;
        children[4].top = 'auto';

        const all = render({spacing: 16, alignment: 'left'});

        expect(all[0]).to.deep.equal({top: 20, left: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 10], left: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 0], left: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 0], left: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], left: 0});
        expect(all[5]).to.deep.equal({top: [cid[4], 16], left: 0});
      });

      it('bottom replaces spacing', function() {
        children[0].bottom = 10;
        children[1].bottom = 0;
        children[2].bottom = -20;
        children[3].bottom = 'auto';

        const all = render({spacing: 16, alignment: 'left'});

        expect(all[0]).to.deep.equal({top: 0, left: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 10], left: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 0], left: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 0], left: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], left: 0});
        expect(all[5]).to.deep.equal({top: [cid[4], 16], left: 0});
      });

      it('uses larger value to replace spacing', function() {
        children[0].bottom = 10;
        children[1].top = 20;
        children[2].bottom = 20;
        children[3].top = -10;

        const all = render({spacing: 16, alignment: 'left'});

        expect(all[0]).to.deep.equal({top: 0, left: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 20], left: 0});
        expect(all[3]).to.deep.equal({top: [cid[2], 0], left: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 16], left: 0});
      });

      it('supports height', function() {
        children[1].set({top: 10, bottom: 11, height: 12});

        const all = render({spacing: 16, alignment: 'left'});

        expect(all[0]).to.deep.equal({top: 0, left: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 10], height: 12, left: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 11], left: 0});
      });

      it('stretches first child to have top and bottom offset, but not height', function() {
        children[2].top = 0;
        children[2].bottom = 0;
        children[2].height = 10;
        children[4].top = 0;
        children[4].bottom = 0;

        const all = render({spacing: 16, alignment: 'left'});

        expect(all[0]).to.deep.equal({top: 0, left: 0});
        expect(all[1]).to.deep.equal({top: [cid[0], 16], left: 0});
        expect(all[2]).to.deep.equal({top: [cid[1], 0], left: 0, height: 10});
        expect(all[3]).to.deep.equal({top: [cid[2], 0], left: 0});
        expect(all[4]).to.deep.equal({top: [cid[3], 0], bottom: [cid[5], 0], left: 0});
        expect(all[5]).to.deep.equal({bottom: 0, left: 0});
      });

    });

  });

  describe('on Stack widget', function() {

    it('is the default layout', function() {
      expect(new Stack().layout).to.be.instanceof(StackLayout);
    });

    it('can be replaced in constructor', function() {
      const layout = new StackLayout();
      expect(new Stack({layout}).layout).to.equal(layout);
    });

    it('can not be replaced with ConstraintLayout in constructor', function() {
      const layout = new ConstraintLayout();
      expect(() => new Stack({layout})).to.throw();
    });

    it('can not be replaced later', function() {
      const layout = new StackLayout();
      const stack = new Stack({layout});

      stack.layout = layout;

      expect(stack.layout).to.equal(layout);
    });

    it('can be created by spacing parameter', function() {
      const layout = new Stack({spacing: 2}).layout;
      expect(layout.spacing).to.equal(2);
      expect(layout.alignment).to.equal('left');
    });

    it('can be created by alignment parameter', function() {
      const layout = new Stack({alignment: 'right'}).layout;
      expect(layout.spacing).to.equal(0);
      expect(layout.alignment).to.equal('right');
    });

    it('can be merged with spacing parameter', function() {
      const layout = new Stack({layout: new StackLayout(), spacing: 4}).layout;
      expect(layout.spacing).to.equal(4);
    });

    it('can be merged with alignment parameter', function() {
      const layout = new Stack({layout: new StackLayout(), alignment: 'right'}).layout;
      expect(layout.spacing).to.equal(0);
      expect(layout.alignment).to.deep.equal('right');
    });

    it('spacing can not be set later', function() {
      const stack = new Stack({spacing: 4});

      stack.spacing = 10;

      expect(stack.spacing).to.equal(4);
    });

    it('alignment can not be set later', function() {
      const stack = new Stack({alignment: 'right'});

      stack.alignment = 'left';

      expect(stack.alignment).to.equal('right');
    });

    it('alignment is included in toXML result', function() {
      stub(client, 'get').returns({});
      expect(new Stack()[toXML]())
        .to.match(/<Stack .* alignment='left'\/>/);
      expect(new Stack({alignment: 'right'})[toXML]())
        .to.match(/<Stack .* alignment='right'\/>/);
    });

  });

});
