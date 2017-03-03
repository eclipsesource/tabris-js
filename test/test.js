import chai, {expect} from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {mockTabris} from './tabris-mock';

chai.use(sinonChai);

let sandbox = sinon.sandbox.create();
let spy = sandbox.spy.bind(sandbox);
let stub = sandbox.stub.bind(sandbox);
let restore = sandbox.restore.bind(sandbox);
let match = sinon.match;

export {expect, spy, stub, restore, match, mockTabris};
