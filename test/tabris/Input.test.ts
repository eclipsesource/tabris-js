import {expect, mockTabris, restore, stub} from '../test';
import ClientMock from './ClientMock';
import Input, {create as createInput} from '../../src/tabris/Input';

describe('Input', () => {

  /** @type {Input} */
  let input;

  /** @type {ClientMock & {call: () => any}} */
  let client;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
    input = createInput();
  });

  afterEach(restore);

  it('cannot be instantiated', () => {
    expect(() => new Input()).to.throw(Error, 'Input can not be created');
  });

  describe('create', () => {

    it('creates a native object', () => {
      createInput();
      expect(client.calls({op: 'create', type: 'tabris.Input'})).to.not.be.empty;
    });

    it('creates an instance', () => {
      expect(createInput()).to.be.instanceOf(Input);
    });

  });

  it('can not be disposed', () => {
    expect(() => input.dispose()).to.throw(Error, 'Cannot dispose input object');
  });

  ['pointerDown', 'pointerMove', 'pointerUp', 'pointerCancel', 'resize'].forEach(name =>
    it(`${name} event`, () => {
      const listener = stub();
      input.on(name, listener);

      input._trigger(name, {});

      expect(listener).to.have.been.calledOnce;
      expect(listener.getCall(0).args[0].target).to.equal(input);
      checkListen(name);
    }));

  function checkListen(event) {
    const listen = client.calls({op: 'listen', id: input.cid});
    expect(listen.length).to.equal(1);
    expect(listen[0].event).to.equal(event);
    expect(listen[0].listen).to.be.true;
  }

});
