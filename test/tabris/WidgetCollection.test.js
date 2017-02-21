import {expect, spy, stub, restore} from '../test';
import ClientStub from './ClientStub';
import NativeBridge from '../../src/tabris/NativeBridge';
import ProxyStore from '../../src/tabris/ProxyStore';
import Widget from '../../src/tabris/Widget';
import WidgetCollection from '../../src/tabris/WidgetCollection';

class Foo extends Widget {
  _acceptChild() {
    return true;
  }
}

class Bar extends Foo {}

describe('WidgetCollection', function() {

  let widgets, collection;

  beforeEach(function() {
    let client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    widgets = [new Foo(), new Bar(), new Foo()];
    collection = new WidgetCollection(widgets);
  });

  afterEach(restore);

  it('maps widgets to numeric fields', function() {
    expect(collection[0]).to.equal(widgets[0]);
    expect(collection[1]).to.equal(widgets[1]);
    expect(collection[2]).to.equal(widgets[2]);
  });

  it('first()', function() {
    expect(collection.first()).to.equal(widgets[0]);
  });

  it('last()', function() {
    expect(collection.last()).to.equal(widgets[2]);
  });

  it('toArray()', function() {
    let arr1 = collection.toArray();
    let arr2 = collection.toArray();

    expect(arr1).to.deep.equal(widgets);
    expect(arr2).to.deep.equal(widgets);
    expect(arr1).not.to.equal(arr2);
  });

  it('forEach()', function() {
    let callback = spy();

    collection.forEach(callback);

    expect(callback).to.have.been.calledWith(widgets[0], 0, collection);
    expect(callback).to.have.been.calledWith(widgets[1], 1, collection);
    expect(callback).to.have.been.calledWith(widgets[2], 2, collection);
  });

  it('indexOf()', function() {
    expect(collection.indexOf(widgets[0])).to.equal(0);
    expect(collection.indexOf(widgets[1])).to.equal(1);
    expect(collection.indexOf(widgets[2])).to.equal(2);
    expect(collection.indexOf(null)).to.equal(-1);
  });

  it('includes()', function() {
    expect(collection.includes(widgets[0])).to.be.true;
    expect(collection.includes(widgets[1])).to.be.true;
    expect(collection.includes(widgets[2])).to.be.true;
    expect(collection.includes(new Foo())).to.be.false;
    expect(collection.includes(null)).to.be.false;
  });

  describe('length', function() {

    it('reflects actual length', function() {
      expect(collection.length).to.equal(3);
    });

    it('cannot be changed', function() {
      collection.length = 1;

      expect(collection.length).to.equal(3);
    });

  });

  describe('filter()', function() {

    it('with callback', function() {
      expect(collection.filter(widget => widget !== widgets[1]).toArray()).to.deep.equal([widgets[0], widgets[2]]);
    });

    it('with type selector', function() {
      expect(collection.filter('Foo').toArray()).to.deep.equal([widgets[0], widgets[2]]);
    });

    it('with * selector', function() {
      expect(collection.filter('*').toArray()).to.deep.equal(widgets);
    });

    it('with .class selectors', function() {
      widgets[0].class = 'foo';
      widgets[1].class = 'bar';
      widgets[2].class = 'foo bar';

      expect(collection.filter('.foo').toArray()).to.deep.equal([widgets[0], widgets[2]]);
    });

    it('with # selectors', function() {
      widgets[0].id = 'foo';
      widgets[1].id = 'bar';
      widgets[2].id = 'foo';

      expect(collection.filter('#foo').toArray()).to.deep.equal([widgets[0], widgets[2]]);
    });

  });

  describe('delegation:', function() {

    it('set() is delegated', function() {
      spy(widgets[0], 'set');
      spy(widgets[1], 'set');
      spy(widgets[2], 'set');
      collection.set('foo', 'bar');

      expect(widgets[0].set).to.have.been.calledWith('foo', 'bar');
      expect(widgets[1].set).to.have.been.calledWith('foo', 'bar');
      expect(widgets[2].set).to.have.been.calledWith('foo', 'bar');
    });

    it('set() returns collection', function() {
      expect(collection.set('foo', 'bar')).to.equal(collection);
    });

    it('animate() is delegated', function() {
      let props = {foo: 'bar'};
      let options = {delay: 3000};
      stub(console, 'warn');
      spy(widgets[0], 'animate');
      spy(widgets[1], 'animate');
      spy(widgets[2], 'animate');
      collection.animate(props, options);

      expect(widgets[0].animate).to.have.been.calledWith(props, options);
      expect(widgets[1].animate).to.have.been.calledWith(props, options);
      expect(widgets[2].animate).to.have.been.calledWith(props, options);
    });

    it('animate() returns nothing', function() {
      expect(collection.animate({}, {})).to.be.undefined;
    });

    it('on() is delegated', function() {
      let listener = function() {};
      spy(widgets[0], 'on');
      spy(widgets[1], 'on');
      spy(widgets[2], 'on');
      collection.on('foo', listener);

      expect(widgets[0].on).to.have.been.calledWith('foo', listener);
      expect(widgets[1].on).to.have.been.calledWith('foo', listener);
      expect(widgets[2].on).to.have.been.calledWith('foo', listener);
    });

    it('on() returns collection', function() {
      expect(collection.on('foo', function() {})).to.equal(collection);
    });

    it('once() is delegated', function() {
      let listener = function() {};
      spy(widgets[0], 'once');
      spy(widgets[1], 'once');
      spy(widgets[2], 'once');
      collection.once('foo', listener);

      expect(widgets[0].once).to.have.been.calledWith('foo', listener);
      expect(widgets[1].once).to.have.been.calledWith('foo', listener);
      expect(widgets[2].once).to.have.been.calledWith('foo', listener);
    });

    it('once() returns collection', function() {
      expect(collection.once('foo', function() {})).to.equal(collection);
    });

    it('off() is delegated', function() {
      let listener = function() {};
      spy(widgets[0], 'off');
      spy(widgets[1], 'off');
      spy(widgets[2], 'off');
      collection.off('foo', listener);

      expect(widgets[0].off).to.have.been.calledWith('foo', listener);
      expect(widgets[1].off).to.have.been.calledWith('foo', listener);
      expect(widgets[2].off).to.have.been.calledWith('foo', listener);
    });

    it('off() returns collection', function() {
      expect(collection.off('foo', function() {})).to.equal(collection);
    });

    it('trigger() is delegated', function() {
      let event = {};
      spy(widgets[0], 'trigger');
      spy(widgets[1], 'trigger');
      spy(widgets[2], 'trigger');
      collection.trigger('foo', event);

      expect(widgets[0].trigger).to.have.been.calledWith('foo', event);
      expect(widgets[1].trigger).to.have.been.calledWith('foo', event);
      expect(widgets[2].trigger).to.have.been.calledWith('foo', event);
    });

    it('trigger() returns collection', function() {
      expect(collection.trigger('foo', {})).to.equal(collection);
    });

    it('dispose() is delegated', function() {
      spy(widgets[0], 'dispose');
      spy(widgets[1], 'dispose');
      spy(widgets[2], 'dispose');
      collection.dispose();

      expect(widgets[0].dispose).to.have.been.called;
      expect(widgets[1].dispose).to.have.been.called;
      expect(widgets[2].dispose).to.have.been.called;
    });

    it('dispose() returns undefined', function() {
      expect(collection.dispose()).to.be.undefined;
    });

    it('get() is delegated to first', function() {
      stub(widgets[0], 'get', () => 'foo');
      expect(collection.get('bar')).to.equal('foo');
      expect(widgets[0].get).to.have.been.calledWith('bar');
    });

    it('get() returns undefined for empty collection', function() {
      expect((new WidgetCollection([])).get('foo')).to.be.undefined;
    });

    it('parent() returns all parents', function() {
      let parents = [new Foo(), new Bar()];

      widgets[0].appendTo(parents[0]);
      widgets[2].appendTo(parents[1]);

      expect(collection.parent().toArray()).to.deep.equal(parents);
    });

    it('parent() returns only unique parents', function() {
      let parents = [new Foo(), new Bar()];
      widgets[0].appendTo(parents[0]);
      widgets[1].appendTo(parents[0]);
      widgets[2].appendTo(parents[1]);

      expect(collection.parent().toArray()).to.deep.equal(parents);
    });

    it('parent() returns undefined for empty collection', function() {
      expect((new WidgetCollection([])).parent()).to.be.undefined;
    });

    it('appendTo(parent) calls parent.append', function() {
      let parent = new Foo();
      spy(parent, 'append');
      collection.appendTo(parent);

      expect(parent.append).to.have.been.calledWith(collection);
    });

    it('children() returns children from all in collection', function() {
      let children = [new Foo(), new Bar(), new Foo(), new Bar()];
      widgets[0].append(children.slice(0, 2));
      widgets[2].append(children.slice(2, 4));

      expect(collection.children().toArray()).to.deep.equal(children);
    });

    it('children() with matcher returns children from all in collection', function() {
      let children = [new Foo(), new Bar(), new Foo(), new Bar()];
      widgets[0].append(children.slice(0, 2));
      widgets[2].append(children.slice(2, 4));

      expect(collection.children('Foo').toArray()).to.deep.equal([children[0], children[2]]);
    });

    it('find("*") returns descendants from all widgets in collection', function() {
      let children = [new Foo(), new Bar(), new Foo(), new Bar()];
      widgets[0].append(children[0]);
      widgets[2].append(children[1]);
      children[1].append(children.slice(2, 4));

      expect(collection.find('*').toArray().length).to.deep.equal(children.length);
      expect(collection.find('*').toArray()).to.deep.equal(children);
    });

    it('find() returns descendants from all widgets in collection', function() {
      let children = [new Foo(), new Foo(), new Foo(), new Foo()];
      widgets[0].append(children[0]);
      widgets[2].append(children[1]);
      children[1].append(children.slice(2, 4));

      expect(collection.find().toArray().length).to.deep.equal(children.length);
      expect(collection.find().toArray()).to.deep.equal(children);
    });

    it('find() returns no duplicates', function() {
      let children = [new Foo(), new Foo(), new Foo(), new Foo()];
      widgets[0].append(children[0]);
      children[0].append(children[1]);
      children[1].append(children[2]);
      children[2].append(children[3]);

      let result = collection.find('*').find('*');
      expect(result.length).to.equal(3);
      expect(result.indexOf(children[1])).not.to.equal(-1);
      expect(result.indexOf(children[2])).not.to.equal(-1);
      expect(result.indexOf(children[3])).not.to.equal(-1);
    });

  });

});
