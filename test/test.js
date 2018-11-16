import chai, {expect} from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {mockTabris} from './tabris-mock';

chai.use(sinonChai);

const sandbox = sinon.sandbox.create();
const spy = sandbox.spy.bind(sandbox);
const stub = sandbox.stub.bind(sandbox);
const restore = sandbox.restore.bind(sandbox);
const match = sinon.match;

export {expect, spy, stub, restore, match, mockTabris};
