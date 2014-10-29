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

tabris.registerType("_Animation", {
  _type: "tabris.Animation",
  _listen: {Completion: true, Progress: true, Start: true}
});

tabris.Animation = {

  validOptions: {delay: true, duration: true, repeat: true, reverse: true, easing: true},

  animate: function(target, properties, options) {
    var validatedOptions = {};
    for (var option in options) {
      if (this.validOptions[option]) {
        validatedOptions[option] = options[option];
      } else {
        console.warn("Invalid animation option \"" + option + "\"");
      }
    }
    tabris.create("_Animation", util.extend(validatedOptions, {
      target: target,
      properties: properties
    })).on("Completion", function() {
      this.dispose();
    }).call("start");
  }

};
