import {expect, mockTabris, restore, spy, stub} from '../test';
import GC, {OPCODES} from '../../src/tabris/GC';
import ClientStub from './ClientStub';
import CanvasContext from '../../src/tabris/CanvasContext';
import ImageData from '../../src/tabris/ImageData';
import Canvas from '../../src/tabris/widgets/Canvas';
import ImageBitmap from '../../src/tabris/ImageBitmap';
import Blob from '../../src/tabris/Blob';

describe('CanvasContext', function() {

  /** @type {ClientMock} */
  let client;
  let ctx;
  let gc;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    gc = new GC();
    ctx = new CanvasContext(gc);
  });

  afterEach(function() {
    restore();
    gc.dispose();
  });

  function flush() {
    tabris.trigger('flush');
  }

  function getLastPacket() {
    let calls = client.calls({id: gc.cid, op: 'call', method: 'draw'});
    return calls.length ? calls[calls.length - 1].parameters.packedOperations : undefined;
  }

  function decodeLastPacket() {
    let calls = client.calls({id: gc.cid, op: 'call', method: 'draw'});
    return calls.length ? decode(calls[calls.length - 1].parameters.packedOperations) : {};
  }

  function decode(packet) {
    let values = {};
    values.ops = packet[0].map(opCode => findOpCode(opCode));
    ['doubles', 'booleans', 'strings', 'ints'].forEach((name, index) => {
      let slot = packet[index + 1];
      if (slot.length) {
        values[name] = slot;
      }
    });
    return values;
  }

  function findOpCode(opCode) {
    for (let name in OPCODES) {
      if (OPCODES[name] === opCode) {
        return name;
      }
    }
  }

  describe('OPCODES', function() {

    it('are unique', function() {
      let codes = Object.keys(OPCODES).map(key => OPCODES[key]).sort();
      for (let i = 1; i < codes.length; i++) {
        expect(codes[i] !== codes[i - 1]);
      }
    });

  });

  describe('getContext', function() {

    let canvas;

    beforeEach(function() {
      canvas = new Canvas();
      client.resetCalls();
    });

    it('returns null without "2d" parameter', function() {
      expect(canvas.getContext('foo', 100, 200)).to.equal(null);
    });

    it('creates a native GC with parent', function() {
      canvas.getContext('2d', 100, 200);

      let createCalls = client.calls({op: 'create', type: 'tabris.GC'});
      expect(createCalls.length).to.equal(1);
      expect(createCalls[0].properties.parent).to.equal(canvas.cid);
    });

    it('creates and returns graphics context', function() {
      let ctx = canvas.getContext('2d', 100, 200);

      expect(ctx).to.be.an.instanceof(CanvasContext);
    });

    it('returns same instance everytime', function() {
      let ctx1 = canvas.getContext('2d', 100, 200);

      let ctx2 = canvas.getContext('2d', 100, 200);

      expect(ctx2).to.equal(ctx1);
    });

    it('calls init', function() {
      canvas.getContext('2d', 100, 200);

      let call = client.calls({op: 'call', method: 'init'})[0];
      expect(call.parameters.width).to.equal(100);
      expect(call.parameters.height).to.equal(200);
    });

    it('calls init everytime', function() {
      canvas.getContext('2d', 100, 200);

      canvas.getContext('2d', 200, 100);

      let call = client.calls({op: 'call', method: 'init'})[1];
      expect(call.parameters.width).to.equal(200);
      expect(call.parameters.height).to.equal(100);
    });

    it('updates width and height in canvas dummy', function() {
      ctx = canvas.getContext('2d', 100, 200);

      expect(ctx.canvas.width).to.equal(100);
      expect(ctx.canvas.height).to.equal(200);
    });

    it('allows to set canvas.style attributes', function() {
      // Used by third party libraries, ensure this doesn't crash
      ctx.canvas.style.width = 23;
      expect(ctx.canvas.style.width).to.equal(23);
    });

  });

  describe('property', function() {

    describe('lineWidth', function() {

      it('defaults to 1', function() {
        expect(ctx.lineWidth).to.equal(1);
      });

      it('accepts changes', function() {
        ctx.lineWidth = 2;

        expect(ctx.lineWidth).to.equal(2);
      });

      it('renders changes', function() {
        ctx.lineWidth = 2;
        flush();

        expect(decodeLastPacket()).to.deep.equal({ops: ['lineWidth'], doubles: [2]});
      });

      it('ignores zero and negative values, but prints a warning', function() {
        stub(console, 'warn');
        ctx.lineWidth = 3;

        ctx.lineWidth = 0;
        ctx.lineWidth = -1;

        expect(ctx.lineWidth).to.equal(3);
        expect(console.warn).to.have.been.calledWith('Unsupported value for lineWidth: 0');
        expect(console.warn).to.have.been.calledWith('Unsupported value for lineWidth: -1');
      });

    });

    describe('lineCap', function() {

      it("defaults to 'butt'", function() {
        expect(ctx.lineCap).to.equal('butt');
      });

      it('accepts changes', function() {
        ctx.lineCap = 'round';

        expect(ctx.lineCap).to.equal('round');
      });

      it('renders changes', function() {
        ctx.lineCap = 'round';
        flush();

        let pkg = decodeLastPacket();
        expect(pkg).to.deep.equal({ops: ['lineCap'], strings: ['round']});
      });

      it('ignores unknown values, but prints a warning', function() {
        stub(console, 'warn');
        ctx.lineCap = 'round';

        ctx.lineCap = 'foo';

        expect(ctx.lineCap).to.equal('round');
        expect(console.warn).to.have.been.calledWith('Unsupported value for lineCap: foo');
      });

    });

    describe('lineJoin', function() {

      it("defaults to 'miter'", function() {
        expect(ctx.lineJoin).to.equal('miter');
      });

      it('accepts changes', function() {
        ctx.lineJoin = 'round';

        expect(ctx.lineJoin).to.equal('round');
      });

      it('renders changes', function() {
        ctx.lineJoin = 'round';
        flush();

        expect(decodeLastPacket()).to.deep.equal({ops: ['lineJoin'], strings: ['round']});
      });

      it('ignores unknown values, but prints a warning', function() {
        stub(console, 'warn');
        ctx.lineJoin = 'round';

        ctx.lineJoin = 'foo';

        expect(ctx.lineJoin).to.equal('round');
        expect(console.warn).to.have.been.calledWith('Unsupported value for lineJoin: foo');
      });

    });

    describe('fillStyle', function() {

      it('defaults to black', function() {
        expect(ctx.fillStyle).to.equal('rgba(0, 0, 0, 1)');
      });

      it('accepts changes', function() {
        ctx.fillStyle = 'red';

        expect(ctx.fillStyle).to.equal('rgba(255, 0, 0, 1)');
      });

      it('renders changes', function() {
        ctx.fillStyle = 'red';
        flush();

        expect(decodeLastPacket()).to.deep.equal({ops: ['fillStyle'], ints: [255, 0, 0, 255]});
      });

      it('ignores invalid color strings, but prints a warning', function() {
        stub(console, 'warn');
        ctx.fillStyle = 'red';

        ctx.fillStyle = 'no-such-color';

        expect(ctx.fillStyle).to.equal('rgba(255, 0, 0, 1)');
        expect(console.warn).to.have.been.calledWith('Unsupported value for fillStyle: no-such-color');
      });

    });

    describe('strokeStyle', function() {

      it('defaults to black', function() {
        expect(ctx.strokeStyle).to.equal('rgba(0, 0, 0, 1)');
      });

      it('accepts changes', function() {
        ctx.strokeStyle = 'red';

        expect(ctx.strokeStyle).to.equal('rgba(255, 0, 0, 1)');
      });

      it('renders changes', function() {
        ctx.strokeStyle = 'red';
        flush();

        expect(decodeLastPacket()).to.deep.equal({ops: ['strokeStyle'], ints: [255, 0, 0, 255]});
      });

      it('ignores invalid color strings, but prints a warning', function() {
        stub(console, 'warn');
        ctx.strokeStyle = 'red';

        ctx.strokeStyle = 'no-such-color';

        expect(ctx.strokeStyle).to.equal('rgba(255, 0, 0, 1)');
        expect(console.warn).to.have.been.calledWith('Unsupported value for strokeStyle: no-such-color');
      });

    });

    describe('textAlign', function() {

      it("defaults to 'start'", function() {
        expect(ctx.textAlign).to.equal('start');
      });

      it('accepts changes', function() {
        ctx.textAlign = 'center';

        expect(ctx.textAlign).to.equal('center');
      });

      it('renders changes', function() {
        ctx.textAlign = 'center';
        flush();

        expect(decodeLastPacket()).to.deep.equal({ops: ['textAlign'], strings: ['center']});
      });

      it('ignores unknown values, but prints a warning', function() {
        stub(console, 'warn');
        ctx.textAlign = 'center';

        ctx.textAlign = 'foo';

        expect(ctx.textAlign).to.equal('center');
        expect(console.warn).to.have.been.calledWith('Unsupported value for textAlign: foo');
      });

    });

    describe('textBaseline', function() {

      it("defaults to 'alphabetic'", function() {
        expect(ctx.textBaseline).to.equal('alphabetic');
      });

      it('accepts changes', function() {
        ctx.textBaseline = 'middle';

        expect(ctx.textBaseline).to.equal('middle');
      });

      it('renders changes', function() {
        ctx.textBaseline = 'middle';
        flush();

        expect(decodeLastPacket()).to.deep.equal({ops: ['textBaseline'], strings: ['middle']});
      });

      it('ignores unknown values, but prints a warning', function() {
        stub(console, 'warn');
        ctx.textBaseline = 'middle';

        ctx.textBaseline = 'foo';

        expect(ctx.textBaseline).to.equal('middle');
        expect(console.warn).to.have.been.calledWith('Unsupported value for textBaseline: foo');
      });

    });

    describe('font', function() {

      it('defaults to sans-serif, 12px', function() {
        expect(ctx.font).to.equal('12px sans-serif');
      });

      it('accepts changes', function() {
        ctx.font = '14px Helvetica';

        expect(ctx.font).to.equal('14px Helvetica');
      });

      it('renders changes', function() {
        ctx.font = 'bold italic 14px Helvetica';
        flush();

        expect(decodeLastPacket()).to.deep.equal({
          ops: ['font'],
          strings: ['Helvetica', 'italic', 'bold'],
          doubles: [14]
        });
      });

      it('ignores illegal values, but prints a warning', function() {
        stub(console, 'warn');
        ctx.font = '14px Helvetica';

        ctx.font = 23;

        expect(ctx.font).to.equal('14px Helvetica');
        expect(console.warn).to.have.been.calledWith('Unsupported value for font: 23');
      });

    });

  });

  describe('save', function() {

    it('does not change current state', function() {
      ctx.strokeStyle = 'red';
      ctx.save();

      expect(ctx.strokeStyle).to.equal('rgba(255, 0, 0, 1)');
    });

    it('renders save operation', function() {
      ctx.save();
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['save']});
    });

  });

  describe('restore', function() {

    it('restores previous state', function() {
      ctx.strokeStyle = 'red';
      ctx.save();
      ctx.strokeStyle = 'blue';

      ctx.restore();

      expect(ctx.strokeStyle).to.equal('rgba(255, 0, 0, 1)');
    });

    it('restores multiple steps', function() {
      ctx.strokeStyle = 'red';
      ctx.save();
      ctx.strokeStyle = 'blue';
      ctx.save();

      ctx.restore();
      ctx.restore();

      expect(ctx.strokeStyle).to.equal('rgba(255, 0, 0, 1)');
    });

    it('does not change current state when stack is empty', function() {
      ctx.strokeStyle = 'red';

      ctx.restore();

      expect(ctx.strokeStyle).to.equal('rgba(255, 0, 0, 1)');
    });

    it('renders restore operation', function() {
      ctx.restore();
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['restore']});
    });

  });

  describe('path operations', function() {

    it("aren't rendered before flush", function() {
      ctx.beginPath();
      ctx.moveTo(10, 20);
      ctx.lineTo(30, 40);
      ctx.rect(30, 40, 10, 20);
      ctx.arc(30, 40, 10, 1, 2);
      ctx.quadraticCurveTo(40, 50, 50, 60);
      ctx.bezierCurveTo(50, 70, 60, 80, 70, 80);
      ctx.closePath();

      expect(getLastPacket()).to.be.undefined;
    });

    it('are rendered on flush', function() {
      ctx.beginPath();
      ctx.moveTo(10, 20);
      ctx.lineTo(30, 40);
      ctx.rect(30, 40, 10, 20);
      ctx.arc(30, 40, 10, 1, 2);
      ctx.quadraticCurveTo(40, 50, 50, 60);
      ctx.bezierCurveTo(50, 70, 60, 80, 70, 80);
      ctx.closePath();

      flush();

      expect(decodeLastPacket().ops).to.deep.equal([
        'beginPath', 'moveTo', 'lineTo', 'rect', 'arc', 'quadraticCurveTo', 'bezierCurveTo', 'closePath'
      ]);
    });

    it('are not rendered after gc disposal anymore', function() {
      ctx.rect(10, 20, 30, 40);

      gc.dispose();
      flush();

      expect(getLastPacket()).to.be.undefined;
    });

  });

  describe('transformations', function() {

    it("aren't rendered before flush", function() {
      ctx.setTransform(1, 2, 3, 4, 5, 6);
      ctx.transform(1, 2, 3, 4, 5, 6);
      ctx.translate(23, 42);
      ctx.rotate(3.14);
      ctx.scale(2, 3);

      expect(getLastPacket()).to.be.undefined;
    });

    it('are rendered on flush', function() {
      ctx.setTransform(1, 2, 3, 4, 5, 6);
      ctx.transform(1, 2, 3, 4, 5, 6);
      ctx.translate(23, 42);
      ctx.rotate(3.14);
      ctx.scale(2, 3);

      flush();

      expect(decodeLastPacket().ops).to.deep.equal(['setTransform', 'transform', 'translate', 'rotate', 'scale']);
    });

  });

  describe('scale', function() {

    it('is rendered', function() {
      ctx.scale(2, 3);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['scale'], doubles: [2, 3]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.scale(2);
      }).to.throw('Not enough arguments to CanvasContext.scale');
    });

  });

  describe('rotate', function() {

    it('is rendered', function() {
      ctx.rotate(3.14);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['rotate'], doubles: [3.14]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.rotate();
      }).to.throw('Not enough arguments to CanvasContext.rotate');
    });

  });

  describe('translate', function() {

    it('is rendered', function() {
      ctx.translate(23, 42);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['translate'], doubles: [23, 42]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.translate(23);
      }).to.throw('Not enough arguments to CanvasContext.translate');
    });

  });

  describe('transform', function() {

    it('is rendered', function() {
      ctx.transform(1, 2, 3, 4, 5, 6);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['transform'], doubles: [1, 2, 3, 4, 5, 6]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.transform();
      }).to.throw('Not enough arguments to CanvasContext.transform');
    });

  });

  describe('setTransform', function() {

    it('is rendered', function() {
      ctx.setTransform(1, 2, 3, 4, 5, 6);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['setTransform'], doubles: [1, 2, 3, 4, 5, 6]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.setTransform();
      }).to.throw('Not enough arguments to CanvasContext.setTransform');
    });

  });

  describe('measureText', function() {

    it('is rendered', function() {
      expect(ctx.measureText('foo').width).to.be.above('foo'.length);
    });

  });

  describe('beginPath', function() {

    it('is rendered', function() {
      ctx.beginPath();
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['beginPath']});
    });

  });

  describe('closePath', function() {

    it('is rendered', function() {
      ctx.closePath();
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['closePath']});
    });

  });

  describe('lineTo', function() {

    it('is rendered', function() {
      ctx.lineTo(10, 20);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['lineTo'], doubles: [10, 20]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.lineTo(1);
      }).to.throw('Not enough arguments to CanvasContext.lineTo');
    });

  });

  describe('moveTo', function() {

    it('is rendered', function() {
      ctx.moveTo(10, 20);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['moveTo'], doubles: [10, 20]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.moveTo(1);
      }).to.throw('Not enough arguments to CanvasContext.moveTo');
    });

  });

  describe('bezierCurveTo', function() {

    it('is rendered', function() {
      ctx.bezierCurveTo(1, 2, 3, 4, 5, 6);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['bezierCurveTo'], doubles: [1, 2, 3, 4, 5, 6]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.bezierCurveTo(1, 2, 3, 4, 5);
      }).to.throw('Not enough arguments to CanvasContext.bezierCurveTo');
    });

  });

  describe('quadraticCurveTo', function() {

    it('is rendered', function() {
      ctx.quadraticCurveTo(1, 2, 3, 4);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['quadraticCurveTo'], doubles: [1, 2, 3, 4]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.quadraticCurveTo(1, 2, 3);
      }).to.throw('Not enough arguments to CanvasContext.quadraticCurveTo');
    });

  });

  describe('arc', function() {

    it('is rendered with counterclockwise default', function() {
      ctx.arc(1, 2, 3, 4, 5);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['arc'], doubles: [1, 2, 3, 4, 5], booleans: [false]});
    });

    it('is rendered with counterclockwise parameter', function() {
      ctx.arc(1, 2, 3, 4, 5, true);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['arc'], doubles: [1, 2, 3, 4, 5], booleans: [true]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.arc(1, 2, 3, 4);
      }).to.throw('Not enough arguments to CanvasContext.arc');
    });

  });

  describe('arcTo', function() {

    it('is rendered', function() {
      ctx.arcTo(1, 2, 3, 4, 5);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['arcTo'], doubles: [1, 2, 3, 4, 5]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.arcTo(1, 2, 3, 4);
      }).to.throw('Not enough arguments to CanvasContext.arcTo');
    });

  });

  describe('rect', function() {

    it('is rendered', function() {
      ctx.rect(1, 2, 3, 4);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['rect'], doubles: [1, 2, 3, 4]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.rect(1, 2, 3);
      }).to.throw('Not enough arguments to CanvasContext.rect');
    });

  });

  describe('fill', function() {

    it('is rendered', function() {
      ctx.fill();
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['fill']});
    });

  });

  describe('stroke', function() {

    it('is rendered', function() {
      ctx.stroke();
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['stroke']});
    });

  });

  describe('clearRect', function() {

    it('is rendered', function() {
      ctx.clearRect(10, 20, 30, 40);
      flush();

      expect(decodeLastPacket()).to.deep.equal({ops: ['clearRect'], doubles: [10, 20, 30, 40]});
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.clearRect(1, 2, 3);
      }).to.throw('Not enough arguments to CanvasContext.clearRect');
    });

  });

  describe('drawImage', function() {

    /** @type {ImageBitmap} */
    let imageBitmap;

    /** @type {string} */
    let imageId;

    beforeEach(function() {
      const result = ImageBitmap.createImageBitmap(new Blob([new Uint8Array([0, 1, 2])]));
      const id = client.calls({type: 'tabris.ImageBitmap', op: 'create'})[0].id;
      const param = client.calls({op: 'call', method: 'loadEncodedImage', id})[0].parameters;
      param.onSuccess({width: 100, height: 200});
      return result.then(value => {
        imageBitmap = value;
        imageId = client.calls({op: 'create', type: 'tabris.ImageBitmap'})[0].id;
      });
    });

    it('throws if parameters are missing', function() {
      expect(() => ctx.drawImage()).to.throw('Not enough arguments to CanvasContext.drawImage');
    });

    it('throws if parameter count does not match any overload', function() {
      expect(() => ctx.drawImage(imageBitmap, 1, 2, 3)).to.throw(
        '4 is not a valid argument count for any overload of Canvas.drawImage.'
      );
    });

    it('throws if image is not ImageBitmap', function() {
      expect(() => ctx.drawImage('foo.jpg', 1, 2, 3, 4, 5, 6, 7, 8)).to.throw(
        'First argument of CanvasContext.drawImage must be of type ImageBitmap'
      );
    });

    it('is rendered with all parameters', function() {
      ctx.drawImage(imageBitmap, 1, 2, 3, 4, 5, 6, 7, 8);
      flush();
      expect(decodeLastPacket()).to.deep.equal({
        ops: ['drawImage'],
        doubles: [1, 2, 3, 4, 5, 6, 7, 8],
        strings: [imageId]
      });
    });

    it('is rendered with implicit source rect', function() {
      ctx.drawImage(imageBitmap, 1, 2, 3, 4);
      flush();
      expect(decodeLastPacket()).to.deep.equal({
        ops: ['drawImage'],
        doubles: [0, 0, 100, 200, 1, 2, 3, 4],
        strings: [imageId]
      });
    });

    it('is rendered with implicit source rect and destination rect', function() {
      ctx.drawImage(imageBitmap, 1, 2);
      flush();
      expect(decodeLastPacket()).to.deep.equal({
        ops: ['drawImage'],
        doubles: [0, 0, 100, 200, 1, 2, 100, 200],
        strings: [imageId]
      });
    });

  });

  describe('fillRect', function() {

    it('is rendered', function() {
      ctx.fillRect(10, 20, 30, 40);
      flush();

      expect(decodeLastPacket()).to.deep.equal({
        ops: ['fillRect'],
        doubles: [10, 20, 30, 40]
      });
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.fillRect(1, 2, 3);
      }).to.throw('Not enough arguments to CanvasContext.fillRect');
    });

  });

  describe('strokeRect', function() {

    it('is rendered', function() {
      ctx.strokeRect(10, 20, 30, 40);
      flush();

      expect(decodeLastPacket()).to.deep.equal({
        ops: ['strokeRect'],
        doubles: [10, 20, 30, 40]
      });
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.strokeRect(1, 2, 3);
      }).to.throw('Not enough arguments to CanvasContext.strokeRect');
    });

  });

  describe('fillText', function() {

    it('is rendered', function() {
      ctx.fillText('foo', 10, 20);
      flush();

      expect(decodeLastPacket()).to.deep.equal({
        ops: ['fillText'],
        doubles: [10, 20],
        booleans: [false, false, false],
        strings: ['foo']
      });
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.fillText('foo', 2);
      }).to.throw('Not enough arguments to CanvasContext.fillText');
    });

  });

  describe('strokeText', function() {

    it('is rendered', function() {
      ctx.strokeText('foo', 10, 20);
      flush();

      expect(decodeLastPacket()).to.deep.equal({
        ops: ['strokeText'],
        doubles: [10, 20],
        booleans: [false, false, false],
        strings: ['foo']
      });
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.strokeText('foo', 2);
      }).to.throw('Not enough arguments to CanvasContext.strokeText');
    });

  });

  describe('createImageData', function() {

    it('creates ImageData from width and height', function() {
      let result = ctx.createImageData(10, 20);

      expect(result).to.be.an.instanceof(ImageData);
      expect(result.width).to.equal(10);
      expect(result.height).to.equal(20);
    });

    it('creates ImageData from ImageData', function() {
      let array = new Uint8ClampedArray(60).fill(128);
      let input = new ImageData(array, 3, 5);

      let result = ctx.createImageData(input);

      expect(result).to.be.an.instanceof(ImageData);
      expect(result.width).to.equal(3);
      expect(result.height).to.equal(5);
      expect(result.data[0]).to.equal(0);
    });

    it('raises error if parameters missing', function() {
      expect(function() {
        ctx.createImageData(10);
      }).to.throw('Not enough arguments to CanvasContext.createImageData');
    });

  });

  describe('getImageData', function() {

    let array;

    beforeEach(function() {
      array = new Uint8ClampedArray(60);
      stub(client, 'call').returns(array);
    });

    it('is rendered', function() {
      ctx.getImageData(10, 20, 5, 3);

      expect(client.call).to.have.been.calledWith(gc.cid, 'getImageData', {
        x: 10,
        y: 20,
        width: 5,
        height: 3
      });
    });

    it('returns value from native', function() {
      let result = ctx.getImageData(10, 20, 5, 3);

      expect(result.data).to.deep.equal(array);
    });

    it('raises error if parameters missing', function() {
      expect(function() {
        ctx.getImageData(10, 20, 100);
      }).to.throw('Not enough arguments to CanvasContext.getImageData');
    });

  });

  describe('putImageData', function() {

    let imageData;

    beforeEach(function() {
      imageData = new ImageData(3, 5);
      spy(client, 'call');
    });

    it('is rendered', function() {
      ctx.putImageData(imageData, 10, 20);

      expect(client.call).to.have.been.calledWith(gc.cid, 'putImageData', {
        data: imageData.data,
        x: 10,
        y: 20,
        width: 3,
        height: 5
      });
    });

    it('raises error if parameters missing', function() {
      expect(() => {
        ctx.putImageData(imageData, 10);
      }).to.throw('Not enough arguments to CanvasContext.putImageData');
    });

  });

});
