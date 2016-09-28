import {expect, spy, stub, restore} from '../test';
import WidgetCollection from '../../src/tabris/WidgetCollection';

describe('WidgetCollection', function() {

  let counter = 0;
  let mockProxy = function() {
    let mock = {};
    ['set', 'get', 'append', 'appendTo', 'on', 'off', 'once', 'parent', 'children', 'animate', 'dispose'].forEach(
      method => mock[method] = stub()
    );
    mock.cid = 'o' + counter++;
    mock._getSelectableChildren = function() {
      return this._children;
    };
    return mock;
  };

  let mocks, collection;

  beforeEach(function() {
    mocks = [mockProxy(), mockProxy(), mockProxy()];
    collection = new WidgetCollection(mocks);
  });

  afterEach(restore);

  it('maps proxies to numeric fields', function() {
    expect(collection[0]).to.equal(mocks[0]);
    expect(collection[1]).to.equal(mocks[1]);
    expect(collection[2]).to.equal(mocks[2]);
  });

  it('sets length value', function() {
    expect(collection.length).to.equal(3);
  });

  it('first()', function() {
    expect(collection.first()).to.equal(mocks[0]);
  });

  it('last()', function() {
    expect(collection.last()).to.equal(mocks[2]);
  });

  it('toArray()', function() {
    let arr1 = collection.toArray();
    let arr2 = collection.toArray();

    expect(arr1).to.eql(mocks);
    expect(arr2).to.eql(mocks);
    expect(arr1).not.to.equal(arr2);
  });

  it('forEach()', function() {
    let callback = spy();

    collection.forEach(callback);

    expect(callback).to.have.been.calledWith(mocks[0], 0, collection);
    expect(callback).to.have.been.calledWith(mocks[1], 1, collection);
    expect(callback).to.have.been.calledWith(mocks[2], 2, collection);
  });

  it('indexOf()', function() {
    expect(collection.indexOf(mocks[0])).to.equal(0);
    expect(collection.indexOf(mocks[1])).to.equal(1);
    expect(collection.indexOf(mocks[2])).to.equal(2);
    expect(collection.indexOf(null)).to.equal(-1);
  });

  describe('filter()', function() {

    it('with callback', function() {
      expect(collection.filter((proxy) => {
        return proxy !== mocks[1];
      }).toArray()).to.eql([mocks[0], mocks[2]]);
    });

    it('with type selector', function() {
      mocks[0].type = 'Foo';
      mocks[1].type = 'Bar';
      mocks[2].type = 'Foo';

      expect(collection.filter('Foo').toArray()).to.eql([mocks[0], mocks[2]]);
    });

    it('with * selector', function() {
      mocks[0].type = 'Foo';
      mocks[1].type = 'Bar';
      mocks[2].type = 'Foo';

      expect(collection.filter('*').toArray()).to.eql(mocks);
    });

    it('with # selectors', function() {
      mocks[0].id = 'foo';
      mocks[1].id = 'bar';
      mocks[2].id = 'bar';

      expect(collection.filter('#bar').toArray()).to.eql([mocks[1], mocks[2]]);
    });

  });

  describe('delegation:', function() {

    it('set() is delegated', function() {
      collection.set('foo', 'bar');

      expect(mocks[0].set).to.have.been.calledWith('foo', 'bar');
      expect(mocks[1].set).to.have.been.calledWith('foo', 'bar');
      expect(mocks[2].set).to.have.been.calledWith('foo', 'bar');
    });

    it('set() returns collection', function() {
      expect(collection.set('foo', 'bar')).to.equal(collection);
    });

    it('animate() is delegated', function() {
      let props = {foo: 'bar'};
      let options = {delay: 3000};
      collection.animate(props, options);

      expect(mocks[0].animate).to.have.been.calledWith(props, options);
      expect(mocks[1].animate).to.have.been.calledWith(props, options);
      expect(mocks[2].animate).to.have.been.calledWith(props, options);
    });

    it('animate() returns nothing', function() {
      expect(collection.animate({}, {})).to.be.undefined;
    });

    it('on() is delegated', function() {
      let listener = function() {};
      collection.on('foo', listener);

      expect(mocks[0].on).to.have.been.calledWith('foo', listener);
      expect(mocks[1].on).to.have.been.calledWith('foo', listener);
      expect(mocks[2].on).to.have.been.calledWith('foo', listener);
    });

    it('on() returns collection', function() {
      expect(collection.on('foo', function() {})).to.equal(collection);
    });

    it('once() is delegated', function() {
      let listener = function() {};
      collection.once('foo', listener);

      expect(mocks[0].once).to.have.been.calledWith('foo', listener);
      expect(mocks[1].once).to.have.been.calledWith('foo', listener);
      expect(mocks[2].once).to.have.been.calledWith('foo', listener);
    });

    it('once() returns collection', function() {
      expect(collection.once('foo', function() {})).to.equal(collection);
    });

    it('off() is delegated', function() {
      let listener = function() {};
      collection.off('foo', listener);

      expect(mocks[0].off).to.have.been.calledWith('foo', listener);
      expect(mocks[1].off).to.have.been.calledWith('foo', listener);
      expect(mocks[2].off).to.have.been.calledWith('foo', listener);
    });

    it('off() returns collection', function() {
      expect(collection.off('foo', function() {})).to.equal(collection);
    });

    it('dispose() is delegated', function() {
      collection.dispose();

      expect(mocks[0].dispose).to.have.been.called;
      expect(mocks[1].dispose).to.have.been.called;
      expect(mocks[2].dispose).to.have.been.called;
    });

    it('dispose() returns undefined', function() {
      expect(collection.dispose()).to.be.undefined;
    });

    it('get() is delegated to first', function() {
      mocks[0].get.returns('foo');
      expect(collection.get('bar')).to.equal('foo');
      expect(mocks[0].get).to.have.been.calledWith('bar');
    });

    it('get() returns undefined for empty collection', function() {
      expect((new WidgetCollection([])).get('foo')).to.be.undefined;
    });

    it('parent() returns all parents', function() {
      let parents = [mockProxy(), mockProxy()];
      mocks[0].parent.returns(parents[0]);
      mocks[2].parent.returns(parents[1]);

      expect(collection.parent().toArray()).to.eql(parents);
    });

    it('parent() returns only unique parents', function() {
      let parents = [mockProxy(), mockProxy()];
      mocks[0].parent.returns(parents[0]);
      mocks[1].parent.returns(parents[0]);
      mocks[2].parent.returns(parents[1]);

      expect(collection.parent().toArray()).to.eql(parents);
    });

    it('parent() returns undefined for empty collection', function() {
      expect((new WidgetCollection([])).parent()).to.be.undefined;
    });

    it('appendTo(parent) calls parent.append', function() {
      let parent = mockProxy();
      collection.appendTo(parent);
      expect(parent.append).to.have.been.calledWith(collection);
    });

    it('children() returns children from all in collection', function() {
      let children = [mockProxy(), mockProxy(), mockProxy(), mockProxy()];
      mocks[0]._children = children.slice(0, 2);
      mocks[2]._children = children.slice(2, 4);

      expect(collection.children().toArray()).to.eql(children);
    });

    it('children() with matcher returns children from all in collection', function() {
      let children = [mockProxy(), mockProxy(), mockProxy(), mockProxy()];
      children[0].type = children[2].type = 'Foo';
      mocks[0]._children = children.slice(0, 2);
      mocks[2]._children = children.slice(2, 4);

      expect(collection.children('Foo').toArray()).to.eql([children[0], children[2]]);
    });

    it('find("*") returns descendants from all proxies in collection', function() {
      let children = [mockProxy(), mockProxy(), mockProxy(), mockProxy()];
      mocks[0]._children = [children[0]];
      mocks[2]._children = [children[1]];
      children[1]._children = children.slice(2, 4);

      expect(collection.find('*').toArray().length).to.eql(children.length);
      expect(collection.find('*').toArray()).to.eql(children);
    });

    it('find() returns descendants from all proxies in collection', function() {
      let children = [mockProxy(), mockProxy(), mockProxy(), mockProxy()];
      mocks[0]._children = [children[0]];
      mocks[2]._children = [children[1]];
      children[1]._children = children.slice(2, 4);

      expect(collection.find().toArray().length).to.eql(children.length);
      expect(collection.find().toArray()).to.eql(children);
    });

    it('find() returns no duplicates', function() {
      let children = [mockProxy(), mockProxy(), mockProxy(), mockProxy()];
      mocks[0]._children = [children[0]];
      children[0]._children = [children[1]];
      children[1]._children = [children[2]];
      children[2]._children = [children[3]];

      let result = collection.find('*').find('*');
      expect(result.length).to.equal(3);
      expect(result.indexOf(children[1])).not.to.equal(-1);
      expect(result.indexOf(children[2])).not.to.equal(-1);
      expect(result.indexOf(children[3])).not.to.equal(-1);
    });

  });

});
