import ClientMock from './ClientMock';
import {expect, mockTabris, restore, stub} from '../test';
import Composite from '../../src/tabris/widgets/Composite';
import TextView from '../../src/tabris/widgets/TextView';
import RowLayout from '../../src/tabris/RowLayout';
import Row from '../../src/tabris/widgets/Row';
import {LayoutQueue, ConstraintLayout} from '../../src/tabris/Layout';
import {toXML} from '../../src/tabris/Console';
import Constraint from '../../src/tabris/Constraint';

describe('RowLayout', function() {

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

  describe('RowLayout.default', function() {

    it('has defaults', function() {
      expect(RowLayout.default.spacing).to.equal(0);
      expect(RowLayout.default.alignment).to.equal('top');
    });

  });

  describe('constructor', function() {

    it('sets defaults', function() {
      const layout = new RowLayout();

      expect(layout.spacing).to.equal(0);
      expect(layout.alignment).to.equal('top');
    });

    it('override defaults', function() {
      const layout = new RowLayout({spacing: 2, alignment: 'bottom'});

      expect(layout.spacing).to.equal(2);
      expect(layout.alignment).to.equal('bottom');
    });

  });

  describe('instance', function() {

    /** @type {TextView[]} */
    let children;

    /** @type {string[]} */
    let cid;

    function render(rowProps) {
      parent = new Composite({layout: new RowLayout(rowProps, queue)});
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

    describe('with alignment top', function() {

      it('renders children layoutData', function() {
        const all = render({alignment: 'top'});

        expect(all[0]).to.deep.equal({top: 0, left: 0});
        expect(all[1]).to.deep.equal({top: 0, left: [cid[0], 0]});
        expect(all[2]).to.deep.equal({top: 0, left: [cid[1], 0]});
        expect(all[3]).to.deep.equal({top: 0, left: [cid[2], 0]});
        expect(all[4]).to.deep.equal({top: 0, left: [cid[3], 0]});
        expect(all[5]).to.deep.equal({top: 0, left: [cid[4], 0]});
      });

      it('renders children layoutData with spacing', function() {
        const all = render({spacing: 16, alignment: 'top'});

        expect(all[0]).to.deep.equal({top: 0, left: 0});
        expect(all[1]).to.deep.equal({top: 0, left: [cid[0], 16]});
        expect(all[2]).to.deep.equal({top: 0, left: [cid[1], 16]});
        expect(all[3]).to.deep.equal({top: 0, left: [cid[2], 16]});
        expect(all[4]).to.deep.equal({top: 0, left: [cid[3], 16]});
        expect(all[5]).to.deep.equal({top: 0, left: [cid[4], 16]});
      });

      it('renders children layoutData with dimension', function() {
        children[0].width = 100;
        children[1].height = 200;
        children[2].set({width: 300, height: 400});

        const all = render({spacing: 16, alignment: 'top'});

        expect(all[0]).to.deep.equal({top: 0, left: 0, width: 100});
        expect(all[1]).to.deep.equal({top: 0, left: [cid[0], 16], height: 200});
        expect(all[2]).to.deep.equal({top: 0, left: [cid[1], 16], width: 300, height: 400});
        expect(all[3]).to.deep.equal({top: 0, left: [cid[2], 16]});
      });

      it('renders children layoutData with alternate alignment', function() {
        children[0].height = 100;
        children[1].top = 10;
        children[2].bottom = 10;
        children[3].set({top: 0, bottom: 0});
        children[4].set({centerY: 10});
        children[5].set({baseline: Constraint.prev});

        const all = render({spacing: 16, alignment: 'top'});

        expect(all[0]).to.deep.equal({left: 0, top: 0, height: 100});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], top: 10});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], bottom: 10});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], top: 0, bottom: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], centerY: 10});
        expect(all[5]).to.deep.equal({left: [cid[4], 16], baseline: cid[4]});
      });

      it('normalizes invalid layoutData with warning', function() {
        stub(console, 'warn');
        children[0].set({top: children[1], height: 100});
        children[1].top = [children[0], 10];
        children[2].bottom = [children[0], 10];
        children[3].set({top: ['10%', 0], bottom: ['10%', 0], height: 0});
        children[4].set({centerX: 10, centerY: 10, top: 10, baseline: Constraint.prev});
        children[5].set({top: 10, baseline: Constraint.prev});

        const all = render({spacing: 16, alignment: 'left'});

        expect(all[0]).to.deep.equal({left: 0, top: 0, height: 100});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], top: 10});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], bottom: 10});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], top: 0, bottom: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], centerY: 10});
        expect(all[5]).to.deep.equal({left: [cid[4], 16], baseline: cid[4]});
        expect(console.warn).to.have.been.called.callCount(9);
      });

    });

    describe('with alignment centerY', function() {

      it('renders children layoutData with spacing', function() {
        const all = render({spacing: 16, alignment: 'centerY'});
        cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({left: 0, centerY: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], centerY: 0});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], centerY: 0});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], centerY: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], centerY: 0});
        expect(all[5]).to.deep.equal({left: [cid[4], 16], centerY: 0});
      });

      it('renders children layoutData with dimension', function() {
        children[0].width = 100;
        children[1].height = 200;
        children[2].set({width: 300, height: 400});

        const all = render({spacing: 16, alignment: 'centerY'});

        expect(all[0]).to.deep.equal({left: 0, centerY: 0, width: 100});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], centerY: 0, height: 200});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], centerY: 0, width: 300, height: 400});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], centerY: 0});
      });

      it('renders children layoutData with alternate alignment', function() {
        children[0].height = 100;
        children[1].top = 10;
        children[2].bottom = 10;
        children[3].set({top: 0, bottom: 0});
        children[4].set({centerY: 10});

        const all = render({spacing: 16, alignment: 'centerY'});

        expect(all[0]).to.deep.equal({left: 0, centerY: 0, height: 100});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], top: 10});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], bottom: 10});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], top: 0, bottom: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], centerY: 10});
      });

    });

    describe('with alignment stretchY', function() {

      it('renders children layoutData', function() {
        const all = render({alignment: 'stretchY'});
        cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({left: 0, top: 0, bottom: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 0], top: 0, bottom: 0});
        expect(all[2]).to.deep.equal({left: [cid[1], 0], top: 0, bottom: 0});
        expect(all[3]).to.deep.equal({left: [cid[2], 0], top: 0, bottom: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 0], top: 0, bottom: 0});
        expect(all[5]).to.deep.equal({left: [cid[4], 0], top: 0, bottom: 0});
      });

      it('renders children layoutData with spacing', function() {
        const all = render({spacing: 16, alignment: 'stretchY'});
        cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({left: 0, top: 0, bottom: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], top: 0, bottom: 0});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], top: 0, bottom: 0});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], top: 0, bottom: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], top: 0, bottom: 0});
        expect(all[5]).to.deep.equal({left: [cid[4], 16], top: 0, bottom: 0});
      });

      it('renders children layoutData with dimension', function() {
        children[0].height = 100;
        children[1].width = 200;
        children[2].set({width: 300, height: 400});

        const all = render({spacing: 16, alignment: 'stretchY'});

        expect(all[0]).to.deep.equal({left: 0, top: 0, height: 100});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], top: 0, bottom: 0, width: 200});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], top: 0, width: 300, height: 400});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], top: 0, bottom: 0});
      });

      it('renders children layoutData with alternate alignment', function() {
        children[0].height = 100;
        children[1].top = 10;
        children[2].bottom = 10;
        children[3].set({top: 0, bottom: 0});
        children[4].set({centerY: 10});

        const all = render({spacing: 16, alignment: 'stretchY'});

        expect(all[0]).to.deep.equal({left: 0, top: 0, height: 100});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], top: 10});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], bottom: 10});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], top: 0, bottom: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], centerY: 10});
      });

    });

    describe('with alignment bottom', function() {

      it('renders children layoutData', function() {
        const all = render({alignment: 'bottom'});
        cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({left: 0, bottom: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 0], bottom: 0});
        expect(all[2]).to.deep.equal({left: [cid[1], 0], bottom: 0});
        expect(all[3]).to.deep.equal({left: [cid[2], 0], bottom: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 0], bottom: 0});
        expect(all[5]).to.deep.equal({left: [cid[4], 0], bottom: 0});
      });

      it('renders children layoutData with spacing', function() {
        const all = render({spacing: 16, alignment: 'bottom'});
        cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({left: 0, bottom: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], bottom: 0});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], bottom: 0});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], bottom: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], bottom: 0});
        expect(all[5]).to.deep.equal({left: [cid[4], 16], bottom: 0});
      });

      it('renders children layoutData with dimension', function() {
        children[0].height = 100;
        children[1].width = 200;
        children[2].set({width: 300, height: 400});

        const all = render({spacing: 16, alignment: 'bottom'});

        expect(all[0]).to.deep.equal({left: 0, bottom: 0, height: 100});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], bottom: 0, width: 200});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], bottom: 0, width: 300, height: 400});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], bottom: 0});
      });

      it('renders children layoutData with alternate alignment', function() {
        children[0].width = 100;
        children[1].top = 10;
        children[2].bottom = 10;
        children[3].set({top: 0, bottom: 0});
        children[4].set({centerY: 10});

        const all = render({spacing: 16, alignment: 'bottom'});

        expect(all[0]).to.deep.equal({left: 0, bottom: 0, width: 100});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], top: 10});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], bottom: 10});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], top: 0, bottom: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], centerY: 10});
      });

    });

    describe('with alignment baseline', function() {

      it('renders children layoutData', function() {
        const all = render({alignment: 'baseline'});
        cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({left: 0, top: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 0], baseline: cid[0]});
        expect(all[2]).to.deep.equal({left: [cid[1], 0], baseline: cid[1]});
        expect(all[3]).to.deep.equal({left: [cid[2], 0], baseline: cid[2]});
        expect(all[4]).to.deep.equal({left: [cid[3], 0], baseline: cid[3]});
        expect(all[5]).to.deep.equal({left: [cid[4], 0], baseline: cid[4]});
      });

      it('renders children layoutData with spacing', function() {
        const all = render({spacing: 16, alignment: 'baseline'});
        cid = parent.children().toArray().map(child => child.cid);

        expect(all[0]).to.deep.equal({left: 0, top: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], baseline: cid[0]});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], baseline: cid[1]});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], baseline: cid[2]});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], baseline: cid[3]});
        expect(all[5]).to.deep.equal({left: [cid[4], 16], baseline: cid[4]});
      });

      it('renders children layoutData with dimension', function() {
        children[0].height = 100;
        children[1].width = 200;
        children[2].set({width: 300, height: 400});

        const all = render({spacing: 16, alignment: 'baseline'});

        expect(all[0]).to.deep.equal({left: 0, top: 0, height: 100});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], baseline: cid[0], width: 200});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], baseline: cid[1], width: 300, height: 400});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], baseline: cid[2]});
      });

      it('renders children layoutData with alternate alignment', function() {
        children[0].centerY = 0;
        children[2].bottom = 10;
        children[4].baseline = children[0];

        const all = render({spacing: 16, alignment: 'baseline'});

        expect(all[0]).to.deep.equal({left: 0, centerY: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], baseline: cid[0]});
        expect(all[2]).to.deep.equal({left: [cid[1], 16], bottom: 10});
        expect(all[3]).to.deep.equal({left: [cid[2], 16], baseline: cid[2]});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], baseline: cid[0]});
      });

    });

    describe('with layoutData properties top/bottom', function() {

      it('left replaces spacing', function() {
        children[0].left = 20;
        children[1].left = 10;
        children[2].left = 0;
        children[3].left = -20;
        children[4].left = 'auto';

        const all = render({spacing: 16, alignment: 'top'});

        expect(all[0]).to.deep.equal({left: 20, top: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 10], top: 0});
        expect(all[2]).to.deep.equal({left: [cid[1], 0], top: 0});
        expect(all[3]).to.deep.equal({left: [cid[2], 0], top: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], top: 0});
        expect(all[5]).to.deep.equal({left: [cid[4], 16], top: 0});
      });

      it('right replaces spacing', function() {
        children[0].right = 10;
        children[1].right = 0;
        children[2].right = -20;
        children[3].right = 'auto';

        const all = render({spacing: 16, alignment: 'top'});

        expect(all[0]).to.deep.equal({left: 0, top: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 10], top: 0});
        expect(all[2]).to.deep.equal({left: [cid[1], 0], top: 0});
        expect(all[3]).to.deep.equal({left: [cid[2], 0], top: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], top: 0});
        expect(all[5]).to.deep.equal({left: [cid[4], 16], top: 0});
      });

      it('uses larger value to replace spacing', function() {
        children[0].right = 10;
        children[1].left = 20;
        children[2].right = 20;
        children[3].left = -10;

        const all = render({spacing: 16, alignment: 'top'});

        expect(all[0]).to.deep.equal({left: 0, top: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 20], top: 0});
        expect(all[3]).to.deep.equal({left: [cid[2], 0], top: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 16], top: 0});
      });

      it('supports width', function() {
        children[1].set({left: 10, right: 11, width: 12});

        const all = render({spacing: 16, alignment: 'top'});

        expect(all[0]).to.deep.equal({left: 0, top: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 10], width: 12, top: 0});
        expect(all[2]).to.deep.equal({left: [cid[1], 11], top: 0});
      });

      it('stretches first child to have left and right offset, but not width', function() {
        children[2].left = 0;
        children[2].right = 0;
        children[2].width = 10;
        children[4].left = 0;
        children[4].right = 0;

        const all = render({spacing: 16, alignment: 'top'});

        expect(all[0]).to.deep.equal({left: 0, top: 0});
        expect(all[1]).to.deep.equal({left: [cid[0], 16], top: 0});
        expect(all[2]).to.deep.equal({left: [cid[1], 0], top: 0, width: 10});
        expect(all[3]).to.deep.equal({left: [cid[2], 0], top: 0});
        expect(all[4]).to.deep.equal({left: [cid[3], 0], right: [cid[5], 0], top: 0});
        expect(all[5]).to.deep.equal({right: 0, top: 0});
      });

    });

  });

  describe('on Row widget', function() {

    it('is the default layout', function() {
      expect(new Row().layout).to.be.instanceof(RowLayout);
    });

    it('can be replaced in constructor', function() {
      const layout = new RowLayout();
      expect(new Row({layout}).layout).to.equal(layout);
    });

    it('can not be replaced with ConstraintLayout in constructor', function() {
      const layout = new ConstraintLayout();
      expect(() => new Row({layout})).to.throw();
    });

    it('can not be replaced later', function() {
      const layout = new RowLayout();
      const stack = new Row({layout});

      stack.layout = layout;

      expect(stack.layout).to.equal(layout);
    });

    it('can be created by spacing parameter', function() {
      const layout = new Row({spacing: 2}).layout;
      expect(layout.spacing).to.equal(2);
      expect(layout.alignment).to.equal('top');
    });

    it('can be created by alignment parameter', function() {
      const layout = new Row({alignment: 'bottom'}).layout;
      expect(layout.spacing).to.equal(0);
      expect(layout.alignment).to.equal('bottom');
    });

    it('can be merged with spacing parameter', function() {
      const layout = new Row({layout: new RowLayout(), spacing: 4}).layout;
      expect(layout.spacing).to.equal(4);
    });

    it('can be merged with alignment parameter', function() {
      const layout = new Row({layout: new RowLayout(), alignment: 'bottom'}).layout;
      expect(layout.spacing).to.equal(0);
      expect(layout.alignment).to.deep.equal('bottom');
    });

    it('spacing can not be set later', function() {
      const stack = new Row({spacing: 4});

      stack.spacing = 10;

      expect(stack.spacing).to.equal(4);
    });

    it('alignment can not be set later', function() {
      const stack = new Row({alignment: 'bottom'});

      stack.alignment = 'top';

      expect(stack.alignment).to.equal('bottom');
    });

    it('alignment is included in toXML result', function() {
      stub(client, 'get').returns({});
      expect(new Row()[toXML]())
        .to.match(/<Row .* alignment='top'\/>/);
      expect(new Row({alignment: 'bottom'})[toXML]())
        .to.match(/<Row .* alignment='bottom'\/>/);
    });

  });

});
