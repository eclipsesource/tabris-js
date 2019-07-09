import chai, {expect} from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {mockTabris} from './tabris-mock';

chai.use(sinonChai);

const sandbox = sinon.sandbox.create();
const restore = sandbox.restore.bind(sandbox);
const match = sinon.match;

/** @type {import('sinon').SinonSpyStatic} */
const spy = sandbox.spy.bind(sandbox);

/** @type {import('sinon').SinonStubStatic} */
const stub = sandbox.stub.bind(sandbox);

export {expect, spy, stub, restore, match, mockTabris};
