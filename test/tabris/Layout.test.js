import ClientStub from './ClientStub';
import {expect, mockTabris, stub, spy, restore} from '../test';
import Layout, {LayoutQueue, ConstraintLayout} from '../../src/tabris/Layout';
import LayoutData from '../../src/tabris/LayoutData';
import WidgetCollection from '../../src/tabris/WidgetCollection';
import Composite from '../../src/tabris/widgets/Composite';
import Page from '../../src/tabris/widgets/Page';
import NavigationView from '../../src/tabris/widgets/NavigationView';

describe('Layout', function() {

  class TestWidget extends Composite {

    get _nativeType() {
      return 'TestType';
    }

    set layout(value) {
      this._layout = value;
    }

    get layout() {
      return this._layout;
    }

    _acceptChild() {
      return true;
    }

  }

  class TestLayout extends Layout {

    getLayoutData(child) {
      return this._getLayoutData(child);
    }

    resolveReferences(layoutData, targetWidget) {
      return this._resolveReferences(layoutData, targetWidget);
    }

  }

  let parent, widget, other, layout, client, queue;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    queue = new LayoutQueue();
    layout = new TestLayout(queue);
    spy(layout, 'render');
    parent = new TestWidget();
    widget = new TestWidget().appendTo(parent);
    other = new TestWidget({id: 'other'}).appendTo(parent);
    parent.layout = layout;
    queue.flush();
  });

  afterEach(restore);

  describe('render', function() {

    it('SETs layoutData on children', function() {
      widget.layoutData = {left: 23, top: 42};
      client.resetCalls();

      layout.render(parent);

      let call = client.calls({op: 'set', id: widget.cid})[0];
      expect(call.properties.layoutData).to.eql({left: 23, top: 42});
    });

    it('does not fail when there are no children', function() {
      expect(() => {
        layout.render(widget);
      }).not.to.throw();
    });

  });

  describe('add', function() {

    beforeEach(function() {
      layout.add(parent);
    });

    it('ignores being called twice', function() {
      expect(() => layout.add(parent)).not.to.throw();
    });

    it('ignores being called twice', function() {
      expect(() => layout.add(parent)).not.to.throw();
    });

    it('throws being called with null', function() {
      expect(() => layout.add(null)).to.throw();
    });

    it('throws if layout is not set', function() {
      parent.layout = null;
      expect(() => layout.add(parent)).to.throw();
    });

    it('triggers render after flush', function() {
      queue.flush();
      expect(layout.render).to.have.been.calledWith(parent);
    });

    it('triggers render when appending a child', function() {
      queue.flush();
      layout.render.resetHistory();

      parent.append(new TestWidget());
      queue.flush();

      expect(layout.render).to.have.been.calledWith(parent);
    });

    it('triggers render when detaching a child', function() {
      queue.flush();
      layout.render.resetHistory();

      widget.detach();
      queue.flush();

      expect(layout.render).to.have.been.calledWith(parent);
    });

    it('triggers render when disposing a child', function() {
      queue.flush();
      layout.render.resetHistory();

      widget.dispose();
      queue.flush();

      expect(layout.render).to.have.been.calledWith(parent);
    });

    describe('followed by remove', function() {

      beforeEach(function() {
        queue.flush();
        layout.render.resetHistory();
        layout.remove(parent);
        queue.flush();
      });

      it('ignores being called twice', function() {
        expect(() => layout.remove(parent)).not.to.throw();
      });

      it('no longer triggers render when appending a child', function() {
        parent.append(new TestWidget());
        queue.flush();

        expect(layout.render).not.to.have.been.called;
      });

      it('no longer triggers render when detaching a child', function() {
        widget.detach();
        queue.flush();

        expect(layout.render).not.to.have.been.called;
      });

    });

  });

  describe('getLayoutData', function() {

    let parent;

    function check(layoutData) {
      const widget = new TestWidget({layoutData: LayoutData.from(layoutData), layout: null})
        .appendTo(parent);
      return layout.getLayoutData(widget);
    }

    beforeEach(function() {
      stub(console, 'warn');
      parent = new Page({layout: null}).appendTo(new NavigationView({id: 'root', layout: null}));
    });

    it('raises a warning for inconsistent layoutData (width)', function() {
      check({top: 0, left: 0, right: 0, width: 100});

      let warning = 'Inconsistent layoutData: left and right are set, ignore width.\n';
      warning += 'Target: NavigationView[cid="$5"]#root > Page[cid="$4"] > TestWidget[cid="$6"]';
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it('overrides properties from layoutData (width)', function() {
      let result = check({top: 0, left: 0, right: 0, width: 100});

      expect(result).to.deep.equal(LayoutData.from({top: 0, left: 0, right: 0}));
    });

    it('raises a warning for inconsistent layoutData (height)', function() {
      check({top: 0, left: 0, bottom: 0, height: 100});

      let warning = 'Inconsistent layoutData: top and bottom are set, ignore height.\n';
      warning += 'Target: NavigationView[cid="$5"]#root > Page[cid="$4"] > TestWidget[cid="$6"]';
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it('skips overridden properties from layoutData (height)', function() {
      let result = check({top: 0, left: 0, bottom: 0, height: 100});

      expect(result).to.deep.equal(LayoutData.from({top: 0, left: 0, bottom: 0}));
    });

    it('raises a warning for inconsistent layoutData (centerX)', function() {
      check({top: 0, left: 0, centerX: 0});

      let warning = 'Inconsistent layoutData: centerX overrides left and right.\n';
      warning += 'Target: NavigationView[cid="$5"]#root > Page[cid="$4"] > TestWidget[cid="$6"]';
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it('skips overridden properties from layoutData (centerX)', function() {
      let result = check({top: 1, left: 2, right: 3, centerX: 4});

      expect(result).to.deep.equal(LayoutData.from({top: 1, centerX: 4}));
    });

    it('raises a warning for inconsistent layoutData (centerY)', function() {
      check({left: 0, top: 0, centerY: 0});

      let warning = 'Inconsistent layoutData: centerY overrides top and bottom.\n';
      warning += 'Target: NavigationView[cid="$5"]#root > Page[cid="$4"] > TestWidget[cid="$6"]';
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it('skips overridden properties from layoutData (centerY)', function() {
      let result = check({left: 1, top: 2, bottom: 3, centerY: 4});

      expect(result).to.deep.equal(LayoutData.from({left: 1, centerY: 4}));
    });

    it('raises a warning for inconsistent layoutData (baseline)', function() {
      check({left: 0, top: 0, baseline: '#other'});

      let warning = 'Inconsistent layoutData: baseline overrides top, bottom, and centerY.\n';
      warning += 'Target: NavigationView[cid="$5"]#root > Page[cid="$4"] > TestWidget[cid="$6"]';
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it('skips overridden properties from layoutData (baseline)', function() {
      let result = check({left: 1, top: 2, bottom: 3, centerY: 4, baseline: 'Other'});

      expect(result).to.deep.equal(LayoutData.from({left: 1, baseline: 'Other'}));
    });

  });

  describe('resolveReferences', function() {

    function resolve(layoutData, targetWidget) {
      return layout.resolveReferences(LayoutData.from(layoutData), targetWidget);
    }

    it('translates widget to ids', function() {
      let input = {right: other, left: [other, 42]};
      let expected = {right: [other.cid, 0], left: [other.cid, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('translates selectors to ids', function() {
      let input = {baseline: '#other', left: ['#other', 42]};
      let expected = {baseline: other.cid, left: [other.cid, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it("translates 'prev()' selector to id", function() {
      let input = {baseline: 'prev()', left: ['prev()', 42]};
      let expected = {baseline: widget.cid, left: [widget.cid, 42]};

      expect(resolve(input, other)).to.deep.equal(expected);
    });

    it("translates 'prev()' when parent children() is overwritten", function() {
      parent.children = () => new WidgetCollection([]);
      let input = {baseline: 'prev()', left: ['prev()', 42]};
      let expected = {baseline: widget.cid, left: [widget.cid, 42]};

      expect(resolve(input, other)).to.deep.equal(expected);
    });

    it("translates 'prev()' selector to 0 on first widget", function() {
      let input = {baseline: 'prev()', left: ['prev()', 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it("translates 'next()' selector to id", function() {
      let input = {baseline: 'next()', left: ['next()', 42]};
      let expected = {baseline: other.cid, left: [other.cid, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it("translates 'next()' selector to id when parent children() is overwritten", function() {
      parent.children = () => new WidgetCollection([]);
      let input = {baseline: 'next()', left: ['next()', 42]};
      let expected = {baseline: other.cid, left: [other.cid, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it("translates 'next()' selector to 0 on last widget", function() {
      let input = {baseline: 'next()', left: ['next()', 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, other)).to.deep.equal(expected);
    });

    it('does not modify numbers', function() {
      let input = {centerX: 23, left: ['30%', 42]};
      let expected = {centerX: 23, left: [30, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('replaces unresolved selector (due to missing sibling) with 0', function() {
      other.dispose();

      let input = {baseline: '#other', left: ['#other', 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('replaces unresolved selector (due to missing parent) with 0', function() {
      widget = new TestWidget();

      let input = {baseline: '#other', left: ['#other', 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('replaces widget itself with 0', function() {
      let input = {baseline: widget, left: [widget, 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('replaces ref to widget itself with 0', function() {
      widget.id = 'myself';

      let input = {baseline: '#myself', left: ['#myself', 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('replaces non-siblings with 0', function() {
      let child = new TestWidget().appendTo(widget);

      let input = {baseline: parent, left: [child, 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('replaces refs to non-siblings with 0', function() {
      new TestWidget({id: 'child'}).appendTo(widget);

      let input = {baseline: '#parent', left: ['#child', 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

  });

});

describe('ConstraintLayout.create()', function() {

  it('returns ConstraintLayout', function() {
    expect(ConstraintLayout.create()).to.be.instanceof(ConstraintLayout);
  });

  it('always returns same layout', function() {
    expect(ConstraintLayout.create()).to.equal(ConstraintLayout.create());
  });

});

describe('LayoutQueue', function() {

  let queue;

  beforeEach(function() {
    queue = new LayoutQueue();
  });

  it('calls layout.render on registered composite once', function() {
    let composite = {
      layout: {render: spy()}
    };
    queue.add(composite);

    queue.flush();
    queue.flush();

    expect(composite.layout.render).to.have.been.calledOnce;
  });

});
