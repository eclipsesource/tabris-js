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

(function() {

  tabris.PropertyDecoding = {

    color: function(value) {
      return util.colorArrayToString(value);
    },

    font: function(value) {
      return util.fontArrayToString(value);
    },

    image: function(value) {
      return util.imageFromArray(value);
    },

    bounds: function(value) {
      return {left: value[0], top: value[1], width: value[2], height: value[3]};
    }

  };

}());
