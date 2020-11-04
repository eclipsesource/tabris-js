import {expect, mockTabris, spy, stub, restore} from '../test';
import ClientMock from './ClientMock';
import Composite from '../../src/tabris/widgets/Composite';
import WidgetCollection from '../../src/tabris/WidgetCollection';
import TextView from '../../src/tabris/widgets/TextView';

class Foo extends Composite {
  get foo() {
    return this._foo;
  }
  set foo(value) {
    this._foo = value;
  }
}

class Bar extends Foo {}

describe('WidgetCollection', function() {

  /** @type {Array<Foo|Bar>} */
  let widgets;
  /** @type {WidgetCollection} */
  let collection;
  /** @type {Bar} */
  let host;

  beforeEach(function() {
    mockTabris(new ClientMock());
    host = new Bar();
    widgets = [new Foo(), new Bar(), new Foo()];
    host.append(widgets);
    collection = new WidgetCollection(widgets, {origin: host});
  });

  afterEach(restore);

  it('maps widgets to numeric fields', function() {
    expect(collection[0]).to.equal(widgets[0]);
    expect(collection[1]).to.equal(widgets[1]);
    expect(collection[2]).to.equal(widgets[2]);
  });

  it('sets host', function() {
    expect(collection.host).to.equal(host);
  });

  it('makes host readonly', function() {
    // @ts-ignore
    collection.host = new Foo();
    expect(collection.host).to.equal(host);
  });

  it('first()', function() {
    expect(collection.first()).to.equal(widgets[0]);
  });

  it('first(selector)', function() {
    expect(collection.first(Bar)).to.equal(widgets[1]);
  });

  it('only()', function() {
    expect(new WidgetCollection([host]).only()).to.equal(host);
    expect(() => collection.only()).to.throw('Expected exactly one match, but found 3');
  });

  it('only(selector)', function() {
    expect(collection.only(Bar)).to.equal(widgets[1]);
    expect(() => collection.only('#notFound')).to.throw('Expected exactly one match, but found 0');
  });

  it('last()', function() {
    expect(collection.last()).to.equal(widgets[2]);
  });

  it('last(selector)', function() {
    expect(collection.last(Bar)).to.equal(widgets[1]);
  });

  it('toArray()', function() {
    const arr1 = collection.toArray();
    const arr2 = collection.toArray();

    expect(arr1).to.deep.equal(widgets);
    expect(arr2).to.deep.equal(widgets);
    expect(arr1).not.to.equal(arr2);
  });

  it('forEach()', function() {
    const callback = spy();

    collection.forEach(callback);

    expect(callback).to.have.been.calledWith(widgets[0], 0, collection);
    expect(callback).to.have.been.calledWith(widgets[1], 1, collection);
    expect(callback).to.have.been.calledWith(widgets[2], 2, collection);
  });

  it('map()', function() {
    const result = collection.map((value, index, ctx) => ({
      value, index, ctx
    }));

    expect(result[0].index).to.equal(0);
    expect(result[1].index).to.equal(1);
    expect(result[2].index).to.equal(2);
    expect(result[0].value).to.equal(collection[0]);
    expect(result[1].value).to.equal(collection[1]);
    expect(result[2].value).to.equal(collection[2]);
    expect(result[0].ctx).to.equal(collection);
    expect(result[1].ctx).to.equal(collection);
    expect(result[2].ctx).to.equal(collection);
  });

  it('slice()', function() {
    expect(collection.slice()).to.be.instanceof(WidgetCollection);
    expect(collection.slice(1).toArray()).to.deep.equal(
      collection.toArray().slice(1)
    );
    expect(collection.slice(1, 2).toArray()).to.deep.equal(
      collection.toArray().slice(1, 2)
    );
    expect(collection.slice(-2).toArray()).to.deep.equal(
      collection.toArray().slice(-2)
    );
  });

  it('concat()', function() {
    const added = [new Bar(), new Bar()];
    expect(collection.concat()).to.be.instanceof(WidgetCollection);
    expect(collection.concat(added).toArray()).to.deep.equal(
      collection.toArray().concat(added)
    );
    expect(collection.concat(added[0], added[1]).toArray()).to.deep.equal(
      collection.toArray().concat(added)
    );
    expect(collection.concat(new WidgetCollection(added)).toArray()).to.deep.equal(
      collection.toArray().concat(added)
    );
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
      // @ts-ignore
      collection.length = 1;

      expect(collection.length).to.equal(3);
    });

  });

  describe('filter()', function() {

    it('with callback', function() {
      expect(collection.filter(widget => widget !== widgets[1]).toArray()).to.deep.equal([widgets[0], widgets[2]]);
    });

    it('calls callback with index and WidgetCollection', function() {
      const callback = stub();

      collection.filter(callback);

      expect(callback).to.have.been.calledWith(widgets[0], 0, collection);
      expect(callback).to.have.been.calledWith(widgets[1], 1, collection);
      expect(callback).to.have.been.calledWith(widgets[2], 2, collection);
    });

    it('with type', function() {
      expect(collection.filter(Foo).toArray()).to.deep.equal(widgets);
      expect(collection.filter(Bar).toArray()).to.deep.equal([widgets[1]]);
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

    it('with child selectors', function() {
      const tree = new WidgetCollection(
        [new Foo(), new Foo(), new Foo(), new Foo(), new Foo(), new Foo()],
        {origin: host}
      );
      host.append(tree);
      tree[0].set({class: 'foo'}).append(
        tree[1].set({class: 'bar'}).append(
          tree[2].set({class: 'foo'}).append(
            tree[4].set({class: 'foo'}),
            tree[5].set({class: 'baz'})
          ),
          tree[3].set({class: 'bar'})
        )
      );

      expect(tree.filter(':host > *').toArray()).to.deep.equal([tree[0]]);
      expect(tree.filter('.foo > *').toArray()).to.deep.equal([tree[1], tree[4], tree[5]]);
      expect(tree.filter('.bar > *').toArray()).to.deep.equal([tree[2], tree[3]]);
      expect(tree.filter('.baz> *').toArray()).to.deep.equal([]);
      expect(tree.filter('* >.foo').toArray()).to.deep.equal([tree[0], tree[2], tree[4]]);
      expect(tree.filter('.bar>.foo').toArray()).to.deep.equal([tree[2]]);
      expect(tree.filter('.foo > * > *').toArray()).to.deep.equal([tree[2], tree[3]]);
      expect(tree.filter('.foo > * > .foo').toArray()).to.deep.equal([tree[2]]);
    });

  });

  describe('delegation:', function() {

    it('set() is delegated', function() {
      collection.set({foo: 'bar'});

      expect(widgets[0].foo).to.equal('bar');
      expect(widgets[1].foo).to.equal('bar');
      expect(widgets[2].foo).to.equal('bar');
    });

    it('set() returns collection', function() {
      expect(collection.set({foo: 'bar'})).to.equal(collection);
    });

    it('animate() is delegated', function() {
      const props = {foo: 'bar'};
      const options = {delay: 3000};
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
      const listener = function() {};
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
      const listener = function() {};
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
      const listener = function() {};
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
      const event = {};
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

    it('detach() is delegated', function() {
      spy(widgets[0], 'detach');
      spy(widgets[1], 'detach');
      spy(widgets[2], 'detach');
      collection.detach();

      expect(widgets[0].detach).to.have.been.called;
      expect(widgets[1].detach).to.have.been.called;
      expect(widgets[2].detach).to.have.been.called;
    });

    it('dispose() returns undefined', function() {
      expect(collection.dispose()).to.be.undefined;
    });

    it('parent() returns WidgetCollection with host', function() {
      const parents = [host, new Bar()];

      widgets[2].appendTo(parents[1]);

      expect(collection.parent()).to.be.instanceof(WidgetCollection);
      expect(collection.parent().host).to.equal(host);
    });

    it('parent() returns all parents', function() {
      const parents = [host, new Bar()];

      widgets[2].appendTo(parents[1]);

      expect(collection.parent().toArray()).to.deep.equal(parents);
    });

    it('parent() returns only unique parents', function() {
      const parents = [new Foo(), new Bar()];
      widgets[0].appendTo(parents[0]);
      widgets[1].appendTo(parents[0]);
      widgets[2].appendTo(parents[1]);

      expect(collection.parent().toArray()).to.deep.equal(parents);
    });

    it('parent() returns undefined for empty collection', function() {
      expect((new WidgetCollection()).parent()).to.be.undefined;
    });

    it('appendTo(parent) calls parent.append', function() {
      const parent = new Foo();
      spy(parent, 'append');
      collection.appendTo(parent);

      expect(parent.append).to.have.been.calledWith(collection);
    });

    it('children() returns WidgetCollection', function() {
      expect(collection.children()).to.be.instanceof(WidgetCollection);
      expect(collection.children().host).to.equal(host);
    });

    it('children() returns children from all in collection', function() {
      const children = [new Foo(), new Bar(), new Foo(), new Bar()];
      widgets[0].append(children.slice(0, 2));
      widgets[2].append(children.slice(2, 5));

      expect(collection.children().toArray()).to.deep.equal(children);
    });

    it('children() returns empty array for non-composite entries', function() {
      collection = new WidgetCollection([new TextView()]);

      expect(collection.children().toArray()).to.deep.equal([]);
    });

    it('children() with matcher returns children from all in collection', function() {
      const children = [new Foo(), new Bar(), new Foo(), new Bar()];
      widgets[0].append(children.slice(0, 2));
      widgets[2].append(children.slice(2, 4));

      expect(collection.children('Foo').toArray()).to.deep.equal([children[0], children[2]]);
    });

  });

  describe('toString', function() {

    it('strigifies in one line for 3 entries', function() {
      const lines = collection.toString().split('\n');
      expect(lines.length).to.equal(1);
      expect(lines[0]).to.match(/^WidgetCollection { Foo\[cid=".*"\], Bar.*\s}$/);
    });

    it('strigifies in multiple line for 4 entries', function() {
      collection = collection.concat([new Bar()]);
      const lines = collection.toString().split('\n');
      expect(lines.length).to.equal(6);
      expect(lines[0]).to.equal('WidgetCollection {');
      expect(lines[1]).to.match(/\s\sFoo\[cid=".*"\]/);
      expect(lines[4]).to.match(/\s\sBar\[cid=".*"\]/);
      expect(lines[5]).to.equal('}');
    });

  });

});
