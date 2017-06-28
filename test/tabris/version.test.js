import {expect, stub, restore} from '../test';
import {checkVersion} from '../../src/tabris/version';

describe('version check', function() {

  beforeEach(function() {
    stub(console, 'error');
  });

  afterEach(restore);

  it('accepts same versions', function() {
    checkVersion('1.2.3', '1.2.3');

    expect(console.error).not.to.have.been.called;
  });

  it('ignores mismatching patch version', function() {
    checkVersion('1.2.2', '1.2.3');
    checkVersion('1.2.4', '1.2.3');

    expect(console.error).not.to.have.been.called;
  });

  it('ignores build identifier', function() {
    checkVersion('1.2.3-dev.20170627+1116', '1.2.3');

    expect(console.error).not.to.have.been.called;
  });

  it('raises error for mismatching minor version', function() {
    checkVersion('1.1.3', '1.2.3');

    expect(console.error).to.have.been.calledWith('Version mismatch: JavaScript module "tabris" ' +
      '(version 1.1.3) is incompatible with the native tabris platform (version 1.2.3).');
  });

  it('raises error for mismatching major version', function() {
    checkVersion('2.2.3', '1.2.3');

    expect(console.error).to.have.been.calledWith('Version mismatch: JavaScript module "tabris" ' +
      '(version 2.2.3) is incompatible with the native tabris platform (version 1.2.3).');
  });

});
