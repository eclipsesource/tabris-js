import {expect, mockTabris, restore} from '../../test';
import ClientStub from '../ClientStub';
import ContentView from '../../../src/tabris/widgets/ContentView';
import Composite from '../../../src/tabris/widgets/Composite';

describe('ContentView', () => {

  let contentView, client;

  beforeEach(() => {
    client = new ClientStub();
    mockTabris(client);
    contentView = new ContentView(true);
  });

  afterEach(restore);

  it('can not be created standalone', () => {
    expect(() => {
      new ContentView({});
    }).to.throw(Error);
  });

  it('is a ContentView', () => {
    expect(contentView).to.be.an.instanceOf(ContentView);
  });

  it('CREATEs Composite', () => {
    const createCall = client.calls({op: 'create', id: contentView.cid})[0];
    expect(createCall.type).to.equal('tabris.Composite');
  });

  it('can not be disposed', () => {
    expect(() => {
      contentView.dispose();
    }).to.throw(Error);
  });

  it('can not be reparented', () => {
    new Composite().append(contentView);
    expect(() => {
      new Composite().append(contentView);
    }).to.throw(Error);
  });

});
