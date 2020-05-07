import {expect, mockTabris} from '../test';
import $ from '../../src/tabris/$';
import ClientMock from './ClientMock';
import {create as createContentView} from '../../src/tabris/widgets/ContentView';
import Composite from '../../src/tabris/widgets/Composite';
import TextView from '../../src/tabris/widgets/TextView';
import NativeObject from '../../src/tabris/NativeObject';

describe('$', function() {

  /** @type {ClientMock} */
  let client;

  /** @type {import('../../src/tabris/widgets/ContentView').default} */
  let contentView;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
    // @ts-ignore
    contentView = tabris.contentView = createContentView();
  });

  // See JsxProcessor.test.js for other JSX uses of $
  it('throws if attributes and array are given', function() {
    expect(() => $({foo: 'bar'}, ['foo'])).to.throw(Error, '$ does not support attributes');
  });

  describe('with selector parameter', function() {

    beforeEach(function() {
      const parent = new Composite();
      parent.append(new TextView({id: 'foo'}));
      parent.append(new TextView({id: 'bar'}));
      contentView.append(parent);
    });

    it('forwards filter function to tabris.contentView.find', function() {
      expect(
        $(widget => widget instanceof TextView).first()
      ).to.equal(contentView.find('#foo').first());
    });

    it('forwards constructor to tabris.contentView.find', function() {
      expect($(TextView).first()).to.equal(contentView.find('#foo').first());
    });

    it('forwards string to tabris.contentView.find', function() {
      expect($('TextView').first()).to.equal(contentView.find('#foo').first());
      expect($('#foo').first()).to.equal(contentView.find('#foo').first());
    });

    it('falls back to "*"', function() {
      expect($().toArray()).to.deep.equal(contentView.find('*').toArray());
    });

  });

  describe('with number parameter', function() {

    it('returns matching NativeObject', function() {
      class TestType extends NativeObject { get _nativeType() { return 'type'; }}
      const nativeObject = new TestType();
      expect($(parseInt(contentView.cid.slice(1)))).to.equal(contentView);
      expect($(parseInt(nativeObject.cid.slice(1)))).to.equal(nativeObject);
    });

  });

});
