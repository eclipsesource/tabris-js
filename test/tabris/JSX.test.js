import {expect, mockTabris} from '../test';
import ClientStub from './ClientStub';
import {createElement} from '../../src/tabris/JSX';
import Composite from '../../src/tabris/widgets/Composite';
import Button from '../../src/tabris/widgets/Button';
import CheckBox from '../../src/tabris/widgets/CheckBox';
import Switch from '../../src/tabris/widgets/Switch';
import AlertDialog from '../../src/tabris/AlertDialog';

describe('JSX', function() {

  beforeEach(function() {
    mockTabris(new ClientStub());
  });

  describe('createElement', function() {

    it('creates widget by string', function() {
      global.tabris.CheckBox = CheckBox;
      expect(createElement('checkBox', null)).to.be.an.instanceof(CheckBox);
    });

    it('creates widget by Constructor', function() {
      expect(createElement(CheckBox, null)).to.be.an.instanceof(CheckBox);
    });

    it('sets properties', function() {
      expect(createElement(CheckBox, {text: 'foo'}).text).to.equal('foo');
    });

    it('appends children', function() {
      let children = createElement(
        Composite,
        {},
        createElement(Button),
        createElement(CheckBox),
        createElement(Switch)
      ).children();

      expect(children[0]).to.be.instanceof(Button);
      expect(children[1]).to.be.instanceof(CheckBox);
      expect(children[2]).to.be.instanceof(Switch);
    });

    it('fails for non-widget native type', function() {
      expect(() => createElement(AlertDialog, null)).to.throw();
    });

    it('fails for non-widget named custom type', function() {
      expect(() => createElement(class Foo {
        set() {}
        append() {}
      }), null).to.throw(Error, 'JSX: Unsupported type Foo');
    });

    it('fails for non-widget named custom type', function() {
      expect(() => createElement(class {
        set() {}
        append() {}
      }, null)).to.throw(Error, 'JSX: Unsupported type');
    });

    it('fails for string pointing to non-function', function() {
      global.tabris.Foo = 'bar';
      expect(() => createElement('foo', null)).to.throw(Error, 'JSX: Unsupported type');
    });

    it('fails for unrecognized string', function() {
      global.tabris.CheckBox = CheckBox;
      expect(() => createElement('composite', null)).to.throw();
    });

  });

});
