import {expect, stub, restore} from '../test';
import {checkVersion} from '../../src/tabris/version';

describe('version check', function() {

  beforeEach(function() {
    stub(console, 'error');
    stub(console, 'warn');
  });

  afterEach(restore);

  it('accepts same versions', function() {
    checkVersion('1.2.3', '1.2.3');

    expect(console.warn).not.to.have.been.called;
    expect(console.error).not.to.have.been.called;
  });

  it('ignores smaller tabris patch version', function() {
    checkVersion('1.2.2', '1.2.3');

    expect(console.warn).not.to.have.been.called;
    expect(console.error).not.to.have.been.called;
  });

  it('ignores greater tabris patch version', function() {
    checkVersion('1.2.4', '1.2.3');

    expect(console.warn).not.to.have.been.called;
    expect(console.error).not.to.have.been.called;
  });

  it('ignores smaller tabris minor version', function() {
    checkVersion('1.1.0', '1.2.3');

    expect(console.warn).not.to.have.been.called;
    expect(console.error).not.to.have.been.called;
  });

  it('compares numerically, not lexicographically', function() {
    checkVersion('1.9.0', '1.10.0');

    expect(console.warn).not.to.have.been.called;
    expect(console.error).not.to.have.been.called;
  });

  it('raises warning for greater tabris minor version', function() {
    checkVersion('1.3.0', '1.2.3');

    expect(console.warn).to.have.been.calledWith('Version mismatch: JavaScript module "tabris" ' +
      '(version 1.3.0) is newer than the native tabris platform. ' +
      'Supported module versions: 1.0 to 1.2.');
    expect(console.error).not.to.have.been.called;
  });

  it('raises error for smaller tabris major version', function() {
    checkVersion('1.2.3', '2.2.3');

    expect(console.warn).not.to.have.been.called;
    expect(console.error).to.have.been.calledWith('Version mismatch: JavaScript module "tabris" ' +
      '(version 1.2.3) is incompatible with the native tabris platform. ' +
      'Supported module versions: 2.0 to 2.2.');
  });

  it('raises error for greater tabris major version', function() {
    checkVersion('2.1.0', '1.2.3');

    expect(console.warn).not.to.have.been.called;
    expect(console.error).to.have.been.calledWith('Version mismatch: JavaScript module "tabris" ' +
      '(version 2.1.0) is incompatible with the native tabris platform. ' +
      'Supported module versions: 1.0 to 1.2.');
  });

});
