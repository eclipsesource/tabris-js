import {expect, mockTabris, restore} from '../../test';
import ClientStub from '../ClientStub';
import Widget from '../../../src/tabris/Widget';
import Button from '../../../src/tabris/widgets/Button';

describe('Button', function() {

  /** @type {ClientStub} */
  let client;

  /** @type {Button} */
  let button;

  beforeEach(function() {
    client = new ClientStub();
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
      button = new Button({style: 'outline'});
      client.resetCalls();
    });

    it('is a outline style Button instance', function() {
      expect(button).to.be.instanceof(Widget);
      expect(button.style).to.equal('outline');
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
