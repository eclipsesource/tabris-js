import chai, {expect} from "chai";
import * as sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

let sandbox = sinon.sandbox.create();
let spy = sandbox.spy.bind(sandbox);
let stub = sandbox.stub.bind(sandbox);
let restore = sandbox.restore.bind(sandbox);

export {expect, spy, stub, restore};
