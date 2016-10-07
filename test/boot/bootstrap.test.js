import {expect, stub, restore} from '../test';
import '../../src/boot/Module';
import '../../src/boot/bootstrap';

describe('bootstrap', function() {

  function fakeClient() {
    let client = {
      // used by module system, return empty modules
      load: () => {},
      loadAndExecute: () => ({executeResult: {exports: {}}}),
      // allow to specify client version using the client.version field in tests
      get: (target, prop) => {
        if (target === 'tabris.App' && prop === 'tabrisJsVersion') {
          return client.version;
        }
      }
    };
    return client;
  }

  let client;

  beforeEach(function() {
    client = fakeClient();
    global.tabris.trigger = function() {};
    global.document = {
      createElement: () => ({}),
      head: {
        appendChild() {}
      }
    };
    stub(console, 'error');
    stub(console, 'warn');
  });

  afterEach(restore);

  describe('version check', function() {

    it('accepts same versions', function() {
      client.version = '1.2.3';
      tabris.version = '1.2.3';

      tabris._start(client);

      expect(console.warn).not.to.have.been.called;
      expect(console.error).not.to.have.been.called;
    });

    it('ignores smaller tabris patch version', function() {
      client.version = '1.2.3';
      tabris.version = '1.2.2';

      tabris._start(client);

      expect(console.warn).not.to.have.been.called;
      expect(console.error).not.to.have.been.called;
    });

    it('ignores greater tabris patch version', function() {
      client.version = '1.2.3';
      tabris.version = '1.2.4';

      tabris._start(client);

      expect(console.warn).not.to.have.been.called;
      expect(console.error).not.to.have.been.called;
    });

    it('ignores smaller tabris minor version', function() {
      client.version = '1.2.3';
      tabris.version = '1.1.0';

      tabris._start(client);

      expect(console.warn).not.to.have.been.called;
      expect(console.error).not.to.have.been.called;
    });

    it('compares numerically, not lexicographically', function() {
      client.version = '1.10.0';
      tabris.version = '1.9.0';

      tabris._start(client);

      expect(console.warn).not.to.have.been.called;
      expect(console.error).not.to.have.been.called;
    });

    it('raises warning for greater tabris minor version', function() {
      client.version = '1.2.3';
      tabris.version = '1.3.0';

      tabris._start(client);

      expect(console.warn).to.have.been.calledWith('Version mismatch: JavaScript module "tabris" ' +
        '(version 1.3.0) is newer than the native tabris platform. ' +
        'Supported module versions: 1.0 to 1.2.');
      expect(console.error).not.to.have.been.called;
    });

    it('raises error for smaller tabris major version', function() {
      client.version = '2.2.3';
      tabris.version = '1.2.3';

      tabris._start(client);

      expect(console.warn).not.to.have.been.called;
      expect(console.error).to.have.been.calledWith('Version mismatch: JavaScript module "tabris" ' +
        '(version 1.2.3) is incompatible with the native tabris platform. ' +
        'Supported module versions: 2.0 to 2.2.');
    });

    it('raises error for greater tabris major version', function() {
      client.version = '1.2.3';
      tabris.version = '2.1.0';

      tabris._start(client);

      expect(console.warn).not.to.have.been.called;
      expect(console.error).to.have.been.calledWith('Version mismatch: JavaScript module "tabris" ' +
        '(version 2.1.0) is incompatible with the native tabris platform. ' +
        'Supported module versions: 1.0 to 1.2.');
    });

  });

});
