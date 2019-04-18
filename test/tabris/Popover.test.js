import {expect, mockTabris, restore, spy} from './../test';
import ClientMock from './ClientMock';
import Popover from './../../src/tabris/Popover';
import ContentView from './../../src/tabris/widgets/ContentView';
import Button from './../../src/tabris/widgets/Button';
import {createJsxProcessor} from '../../src/tabris/JsxProcessor';
import WidgetCollection from '../../src/tabris/WidgetCollection';

describe('Popover', () => {

  /** @type {ClientMock} */
  let client;

  /** @type {Popover} */
  let popover;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
    popover = new Popover();
  });

  afterEach(restore);

  describe('open', () => {

    it('returns this', () => {
      expect(popover.open()).to.equal(popover);
    });

    it('calls open', () => {
      popover.open();
      expect(client.calls({op: 'call'})[0].method).to.equal('open');
    });

    it('throws if popover was closed', () => {
      popover.open();
      popover.close();
      expect(() => popover.open()).to.throw('Can not open a popup that was disposed');
    });

    describe('as static method', () => {

      it('returns popover', () => {
        expect(Popover.open(popover)).to.equal(popover);
      });

      it('calls open', () => {
        Popover.open(popover);
        expect(client.calls({op: 'call'})[0].method).to.equal('open');
      });

      it('throws for other values', () => {
        expect(() => Popover.open('Hello World!')).to.throw();
      });

      it('throws if popover was closed', () => {
        popover.open();
        popover.close();
        expect(() => Popover.open(popover)).to.throw('Can not open a popup that was disposed');
      });

    });

  });

  describe('contentView', () => {

    it('is instance of ContentView', () => {
      expect(popover.contentView).to.be.an.instanceOf(ContentView);
    });

    it('is read-only', () => {
      const contentView = popover.contentView;

      delete popover.contentView;
      popover.contentView = undefined;

      expect(popover.contentView).to.equal(contentView);
    });

    it('is set on native side on popover creation', () => {
      expect(client.calls({op: 'set'})[0]).to.deep.equal({
        op: 'set',
        id: popover.cid,
        properties: {contentView: popover.contentView.cid}
      });
    });

  });

  describe('close', () => {

    it('returns this', () => {
      expect(popover.close()).to.equal(popover);
    });

    it('disposes the popover and contentView', () => {
      const contentView = popover.contentView;

      popover.close();

      expect(popover.isDisposed()).to.equal(true);
      expect(contentView.isDisposed()).to.equal(true);
    });

  });

  describe('close event', () => {

    it('popover always LISTENs to close', () => {
      expect(client.calls({op: 'listen'})[0]).to.deep.equal({
        op: 'listen',
        id: popover.cid,
        event: 'close',
        listen: true
      });
    });

    it('fires close event', () => {
      const closeOk = spy();
      const close = spy();
      popover.on('closeOk', closeOk);
      popover.onClose(close);

      tabris._notify(popover.cid, 'close', {});

      expect(closeOk).not.to.have.been.called;
      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: popover});
    });

  });

  describe('JSX', () => {

    let jsx, widgets;

    beforeEach(function() {
      jsx = createJsxProcessor();
      widgets = [
        new Button(),
        new Button(),
        new Button(),
        new Button(),
        new Button()
      ];
    });

    it('with all properties', function() {
      const popover = jsx.createElement(
        Popover,
        {width: 100, height: 200, anchor: widgets[0]}
      );

      expect(popover).to.be.instanceOf(Popover);
      expect(client.calls({
        op: 'create',
        type: 'tabris.Popover',
        id: popover.cid
      })[0].properties).to.deep.equal({
        width: 100, height: 200, anchor: widgets[0].cid,
        contentView: popover.contentView.cid
      });
    });

    it('with no properties', function() {
      const popover = jsx.createElement(Popover);

      expect(popover).to.be.instanceOf(Popover);
      expect(client.calls({
        op: 'create',
        type: 'tabris.Popover',
        id: popover.cid
      })[0].properties).to.deep.equal({
        contentView: popover.contentView.cid
      });
    });

    it('with widget content', function() {
      const popup = jsx.createElement(
        Popover,
        null,
        widgets[0],
        [widgets[1], widgets[2]],
        new WidgetCollection([widgets[3], widgets[4]])
      );

      expect(popup.contentView.children().toArray()).to.deep.equal(widgets);
    });

    it('with widget content via property', function() {
      const popup = jsx.createElement(
        Popover,
        {children: [
          widgets[0], widgets[1], widgets[2],
          new WidgetCollection([widgets[3], widgets[4]])
        ]}
      );

      expect(popup.contentView.children().toArray()).to.deep.equal(widgets);
    });

  });

});
