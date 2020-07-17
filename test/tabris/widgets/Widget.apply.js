/* eslint-disable camelcase */
import {expect, mockTabris, restore, spy} from '../../test';
import WidgetCollection from '../../../src/tabris/WidgetCollection';
import ClientMock from '../ClientMock';
import Composite from '../../../src/tabris/widgets/Composite';

describe('Widget', function() {

  class TestWidget extends Composite {

    constructor(props) {
      super(Object.assign({layout: null}, props));
    }

    get _nativeType() {
      return 'TestWidget';
    }
  }

  /** @type {ClientMock} */
  let client;

  /** @type {TestWidget} */
  let widget;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    widget = new TestWidget();
    client.resetCalls();
  });

  afterEach(restore);

  describe('apply', function() {

    /** @type {TestWidget} */
    let child1;
    /** @type {TestWidget} */
    let child2;
    /** @type {TestWidget} */
    let child1_1;
    /** @type {TestWidget[]} */
    let targets;

    beforeEach(function() {
      child1 = new TestWidget({id: 'foo', class: 'myclass'}).appendTo(widget);
      child2 = new TestWidget({id: 'bar'}).appendTo(widget);
      child1_1 = new TestWidget().appendTo(child1);
      targets = [widget, child1, child2, child1_1];
      targets.forEach((target) => {
        target.set = spy();
      });
    });

    it('returns self', function() {
      expect(widget.apply({})).to.equal(widget);
    });

    it('applies properties to all children', function() {
      const props = {prop1: 'v1', prop2: 'v2'};
      widget.apply({'*': props});

      expect(widget.set).to.have.been.calledWith(props);
      expect(child1.set).to.have.been.calledWith(props);
      expect(child2.set).to.have.been.calledWith(props);
      expect(child1_1.set).to.have.been.calledWith(props);
    });

    it('applies properties to children with specific id', function() {
      widget.apply({'#foo': {prop1: 'v1'}, '#bar': {prop2: 'v2'}});

      expect(widget.set).not.to.have.been.called;
      expect(child1.set).to.have.been.calledWith({prop1: 'v1'});
      expect(child2.set).to.have.been.calledWith({prop2: 'v2'});
      expect(child1_1.set).not.to.have.been.called;
    });

    it('applies properties to children with specific class', function() {
      widget.apply({'.myclass': {prop1: 'v1'}});

      expect(widget.set).not.to.have.been.called;
      expect(child1.set).to.have.been.calledWith({prop1: 'v1'});
      expect(child2.set).not.to.have.been.called;
      expect(child1_1.set).not.to.have.been.called;
    });

    it('applies properties to :host', function() {
      widget.apply({':host': {prop1: 'v1'}});

      expect(widget.set).to.have.been.calledWith({prop1: 'v1'});
      expect(child1.set).not.to.have.been.called;
      expect(child2.set).not.to.have.been.called;
      expect(child1_1.set).not.to.have.been.called;
    });

    it('applies properties to children with specific type', function() {
      const composite = new Composite();
      composite.set = spy();
      widget.append(composite);
      widget.apply({Composite: {prop1: 'v1'}});

      expect(composite.set).to.have.been.calledWith({prop1: 'v1'});
      expect(widget.set).not.to.have.been.called;
      expect(child1.set).not.to.have.been.called;
      expect(child2.set).not.to.have.been.called;
      expect(child1_1.set).not.to.have.been.called;
    });

    it('applies properties to children with specific depth', function() {
      widget.apply({':host': {prop1: 'v1'}});
      widget.apply({':host > *': {prop1: 'v2'}});
      widget.apply({':host > * > *': {prop1: 'v3'}});

      expect(widget.set).to.have.been.calledWith({prop1: 'v1'});
      expect(child1.set).to.have.been.calledWith({prop1: 'v2'});
      expect(child2.set).to.have.been.calledWith({prop1: 'v2'});
      expect(child1_1.set).to.have.been.calledWith({prop1: 'v3'});
    });

    it('applies properties in order *, Type, (pseudo-)class, id', function() {
      widget.apply({
        'TestWidget': {prop1: 'v2'},
        '#foo': {prop1: 'v4'},
        '.myclass': {prop1: 'v3'},
        ':host': {prop1: 'v3'},
        '*': {prop1: 'v1'}
      });

      expect(child1.set.args.map(args => args[0].prop1)).to.eql(['v1', 'v2', 'v3', 'v4']);
      expect(widget.set.args.map(args => args[0].prop1)).to.eql(['v1', 'v2', 'v3']);
    });

    it('applies properties in order of combined weight', function() {
      widget.apply({
        'TestWidget > #foo': {prop1: 'v4'},
        'TestWidget > .myclass': {prop1: 'v3'},
        ':host > TestWidget': {prop1: 'v3'},
        'TestWidget': {prop1: 'v2'},
        '* > *': {prop1: 'v1'}
      });

      expect(child1.set.args.map(args => args[0].prop1)).to.eql(['v1', 'v2', 'v3', 'v3', 'v4']);
    });

    it('does not fail on empty widget', function() {
      expect(() => {
        new TestWidget().apply({foo: {bar: 23}});
      }).not.to.throw();
    });

    it('exclude children if children() is overwritten to return empty collection', function() {
      widget.children = () => new WidgetCollection();
      const props = {prop1: 'v1', prop2: 'v2'};

      widget.apply({'*': props});

      expect(widget.set).to.have.been.calledWith(props);
      expect(child1.set).not.to.have.been.calledWith(props);
      expect(child2.set).not.to.have.been.calledWith(props);
      expect(child1_1.set).not.to.have.been.calledWith(props);
    });

    it('exclude children if children() is overwritten to return empty array', function() {
      widget.children = () => [];
      const props = {prop1: 'v1', prop2: 'v2'};

      widget.apply({'*': props});

      expect(widget.set).to.have.been.calledWith(props);
      expect(child1.set).not.to.have.been.calledWith(props);
      expect(child2.set).not.to.have.been.calledWith(props);
      expect(child1_1.set).not.to.have.been.calledWith(props);
    });

    it('exclude children if children() is overwritten to return null', function() {
      widget.children = () => null;
      const props = {prop1: 'v1', prop2: 'v2'};

      widget.apply({'*': props});

      expect(widget.set).to.have.been.calledWith(props);
      expect(child1.set).not.to.have.been.calledWith(props);
      expect(child2.set).not.to.have.been.calledWith(props);
      expect(child1_1.set).not.to.have.been.calledWith(props);
    });

    it('applies partially if children() on child is overwritten to return empty collection', function() {
      child1.children = () => new WidgetCollection();
      const props = {prop1: 'v1', prop2: 'v2'};

      widget.apply({'*': props});

      expect(widget.set).to.have.been.calledWith(props);
      expect(child1.set).to.have.been.calledWith(props);
      expect(child2.set).to.have.been.calledWith(props);
      expect(child1_1.set).not.to.have.been.calledWith(props);
    });

    it('applies partially if children() on child is overwritten to return empty array', function() {
      child1.children = () => [];
      const props = {prop1: 'v1', prop2: 'v2'};

      widget.apply({'*': props});

      expect(widget.set).to.have.been.calledWith(props);
      expect(child1.set).to.have.been.calledWith(props);
      expect(child2.set).to.have.been.calledWith(props);
      expect(child1_1.set).not.to.have.been.calledWith(props);
    });

    it('applies partially if children() on child is overwritten to return null', function() {
      child1.children = () => null;
      const props = {prop1: 'v1', prop2: 'v2'};

      widget.apply({'*': props});

      expect(widget.set).to.have.been.calledWith(props);
      expect(child1.set).to.have.been.calledWith(props);
      expect(child2.set).to.have.been.calledWith(props);
      expect(child1_1.set).not.to.have.been.calledWith(props);
    });

    it('"protected" version still works if children() is overwritten', function() {
      widget.children = () => new WidgetCollection();
      const props = {prop1: 'v1', prop2: 'v2'};

      widget._apply({'*': props});

      expect(widget.set).to.have.been.calledWith(props);
      expect(child1.set).to.have.been.calledWith(props);
      expect(child2.set).to.have.been.calledWith(props);
      expect(child1_1.set).to.have.been.calledWith(props);
    });

    it('"protected" variant applies partially if children() on child is overwritten', function() {
      child1.children = () => new WidgetCollection();
      const props = {prop1: 'v1', prop2: 'v2'};

      widget._apply({'*': props});

      expect(widget.set).to.have.been.calledWith(props);
      expect(child1.set).to.have.been.calledWith(props);
      expect(child2.set).to.have.been.calledWith(props);
      expect(child1_1.set).not.to.have.been.calledWith(props);
    });

    describe('in strict mode', function() {

      const testRules = {
        '#foo': {prop1: 'v1'},
        '#bar': {prop2: 'v2'}
      };

      it('throws if mode is not of expected value', function() {
        expect(() => widget.apply('strict', testRules)).not.to.throw(Error);
        expect(() => widget.apply('default', testRules)).not.to.throw(Error);
        expect(() => widget.apply('foo', testRules)).to.throw(Error, 'Value "foo" is not a valid mode.');

      });

      it('applies properties to only match with given id', function() {
        widget.apply('strict', testRules);

        expect(widget.set).not.to.have.been.called;
        expect(child1.set).to.have.been.calledWith({prop1: 'v1'});
        expect(child2.set).to.have.been.calledWith({prop2: 'v2'});
        expect(child1_1.set).not.to.have.been.called;
      });

      it('throws if more than one widget matches a given id', function() {
        widget.append(new Composite({id: 'foo'}));
        expect(() => widget.apply('strict', testRules)).to.throw(Error,
          'More than one widget matches the given selector "#foo"'
        );
      });

      it('throws if more than one widget matches a given child selector ending with id', function() {
        widget.append(new Composite({id: 'foo'}));
        expect(() => widget.apply('strict', {':host > #foo': {prop1: 'v1'}})).to.throw(Error,
          'More than one widget matches the given selector ":host > #foo"'
        );
      });

      it('throws if no widget matches a given id', function() {
        child1.dispose();
        expect(() => widget.apply('strict', testRules)).to.throw(Error,
          'No widget matches the given selector "#foo"'
        );
      });

      it('throws if only widget matching a given id is the host widget', function() {
        widget.id = 'baz';
        expect(() => widget.apply('strict', {'#baz': {prop1: 'v1'}})).to.throw(Error,
          'The only widget that matches the given selector "#baz" is the host widget'
        );
      });

      it('applies properties to multiple children with given class', function() {
        child2.class = 'baz';
        child1_1.class = 'baz';

        widget.apply('strict', {'.baz': {prop2: 'v3'}});
        expect(widget.set).not.to.have.been.called;
        expect(child1.set).not.to.have.been.called;
        expect(child2.set).to.have.been.calledWith({prop2: 'v3'});
        expect(child1_1.set).to.have.been.calledWith({prop2: 'v3'});
      });

      it('throws if no widget matches given class', function() {
        expect(() => widget.apply('strict', {'.baz': {prop2: 'v3'}})).to.throw(Error,
          'No widget matches the given selector ".baz"'
        );
      });

      it('throws if no widget matches given child class', function() {
        expect(() => widget.apply('strict', {':host > .baz': {prop2: 'v3'}})).to.throw(Error,
          'No widget matches the given selector ":host > .baz"'
        );
      });

      it('applies properties to :host', function() {
        widget.apply('strict', {':host': {prop1: 'v1'}});

        expect(widget.set).to.have.been.calledWith({prop1: 'v1'});
        expect(child1.set).not.to.have.been.called;
        expect(child2.set).not.to.have.been.called;
        expect(child1_1.set).not.to.have.been.called;
      });

      it('applies properties to *', function() {
        widget.apply('strict', {'*': {prop1: 'v1'}});

        expect(widget.set).to.have.been.calledWith({prop1: 'v1'});
        expect(child1.set).to.have.been.calledWith({prop1: 'v1'});
        expect(child2.set).to.have.been.calledWith({prop1: 'v1'});
        expect(child1_1.set).to.have.been.calledWith({prop1: 'v1'});
      });

      it('throws for * if no children exist', function() {
        widget.children().dispose();
        expect(() => widget.apply('strict', {'*': {prop1: 'v1'}})).to.throw(Error,
          'The only widget that matches the given selector "*" is the host widget'
        );
      });

      it('applies properties to children with specific type', function() {
        widget.apply('strict', {TestWidget: {prop1: 'v1'}});

        expect(widget.set).to.have.been.called;
        expect(child1.set).to.have.been.called;
        expect(child2.set).to.have.been.called;
        expect(child1_1.set).to.have.been.called;
      });

      it('throws if no widget matches given type selector', function() {
        expect(() => widget.apply('strict', {Composite: {prop1: 'v1'}})).to.throw(Error,
          'No widget matches the given selector "Composite"'
        );
      });

      it('throws if no widgets except host match given type selector', function() {
        widget.children().dispose();

        expect(() => widget.apply('strict', {TestWidget: {prop1: 'v1'}})).to.throw(Error,
          'The only widget that matches the given selector "TestWidget" is the host widget'
        );
      });

    });

  });

});
