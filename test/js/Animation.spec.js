/*******************************************************************************
 * Copyright (c) 2014 EclipseSource and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    EclipseSource - initial API and implementation
 ******************************************************************************/

describe("Animation.animate", function() {

  var proxy, nativeBridge;
  var consoleBackup = window.console;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    proxy = new tabris.Proxy("proxy-id");
  });

  afterEach(function() {
    window.console = consoleBackup;
  });

  it("creates native animation with target", function() {
    tabris.Animation.animate(proxy, {}, {});
    expect(createProps().target).toBe("proxy-id");
  });

  it("sets animated properties", function() {
    tabris.Animation.animate(proxy, {foo: "bar", opacity: 0.4, transform: {rotation: 0.5}}, {});
    expect(createProps().properties).toEqual({foo: "bar", opacity: 0.4, transform: {rotation: 0.5}});
  });

  it("sets valid options only", function() {
    tabris.Animation.animate(proxy, {}, {
      delay: 10, duration: 100, repeat: 1, reverse: true, easing: "ease-out", foo: "bar"
    });
    expect(createProps()).toEqual({
      delay: 10,
      duration: 100,
      repeat: 1,
      reverse: true,
      easing: "ease-out",
      target: "proxy-id",
      properties: {}
    });
  });

  it("warns against invalid options", function() {
    window.console = jasmine.createSpyObj("console", ["log", "info", "warn", "error"]);

    tabris.Animation.animate(proxy, {}, {foo: "bar"});

    expect(console.warn).toHaveBeenCalledWith("Invalid animation option \"foo\"");
  });

  it("starts animation", function() {
    tabris.Animation.animate(proxy, {}, {});
    expect(nativeBridge.calls({op: "call", id: animationId(), method: "start"}).length).toBe(1);
  });

  it("disposes animation on completion", function() {
    tabris.Animation.animate(proxy, {}, {});
    expect(nativeBridge.calls({op: "destroy", id: animationId()}).length).toBe(0);

    tabris._notify(animationId(), "Completion", {});
    expect(nativeBridge.calls({op: "destroy", id: animationId()}).length).toBe(1);
  });

  function animationId() {
    return nativeBridge.calls({op: "create", type: "tabris.Animation"}).pop().id;
  }

  function createProps() {
    return nativeBridge.calls({op: "create", type: "tabris.Animation"}).pop().properties;
  }

});
