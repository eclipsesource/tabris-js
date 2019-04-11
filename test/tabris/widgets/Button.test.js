import {expect, mockTabris, restore} from '../../test';
import ClientMock from '../ClientMock';
import Widget from '../../../src/tabris/Widget';
import Button from '../../../src/tabris/widgets/Button';

describe('Button', function() {

  /** @type {ClientMock} */
  let client;

  /** @type {Button} */
  let button;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
  });

  afterEach(restore);

  describe('constructor', function() {

    it('CREATEs Button', function() {
      const button = new Button();

      expect(client.calls({type: 'tabris.Button'})[0].id).to.equal(button.cid);
    });

  });

  describe('instance (style=default)', function() {

    beforeEach(function() {
      button = new Button();
      client.resetCalls();
    });

    it('is a default style Button instance', function() {
      expect(button).to.be.instanceof(Widget);
      expect(button.style).to.equal('default');
    });

    it('style can not be changed', function() {
      button.style = 'outline';
      expect(button.style).to.equal('default');
    });

    it('strokeColor can not be changed', function() {
      button.strokeColor = 'red';
      expect(button.strokeColor).to.equal('initial');
    });

    it('translate textColor color', function() {
      button.textColor = 'rgb(255, 254, 253)';
      expect(
        client.calls({op: 'set', id: button.cid})[0].properties.textColor
      ).to.deep.equal([255, 254, 253, 255]);
    });

    it('translate textColor "initial" to undefined', function() {
      button.textColor = 'initial';
      expect(
        client.calls({op: 'set', id: button.cid})[0].properties.textColor
      ).to.be.null;
    });

  });

  describe('instance (style=outline)', function() {

    beforeEach(function() {
      button = new Button({text: 'hello', background: 'rgba(255, 0, 255, 0)', style: 'outline'});
      client.resetCalls();
    });

    it('has all initial properties set', function() {
      // this is just a check that reorderProperties does not miss any values
      // The correctness of the actual re-ordering can not be disproven so a test is meaningless
      expect(button.style).to.equal('outline');
      expect(button.text).to.equal('hello');
      expect(button.background.toString()).to.equal('rgba(255, 0, 255, 0)');
    });

    it('translate strokeColor color', function() {
      button.strokeColor = 'rgb(255, 254, 253)';
      expect(
        client.calls({op: 'set', id: button.cid})[0].properties.strokeColor
      ).to.deep.equal([255, 254, 253, 255]);
    });

    it('translate strokeColor "initial" to undefined', function() {
      button.strokeColor = 'initial';
      expect(
        client.calls({op: 'set', id: button.cid})[0].properties.strokeColor
      ).to.be.null;
    });

  });

});
