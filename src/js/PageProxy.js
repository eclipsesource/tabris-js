/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global Tabris: true, util: false */

Tabris.PageProxy = function( uiProxy ) {
  this._uiProxy = uiProxy;
};

Tabris.PageProxy.prototype = {

  _PAGE_PROPS: ["title", "image", "style", "topLevel"],

  _create: function( properties ) {
    var compositeProperties = util.extend( util.omit( properties, this._PAGE_PROPS ), {
      parent: Tabris._shell,
      layoutData: { left: 0, right: 0, top: 0, bottom: 0 }
    });
    this._composite = Tabris.create( "rwt.widgets.Composite", compositeProperties );
    var pageProperties = util.extend( util.pick( properties, this._PAGE_PROPS ), {
      parent: this._uiProxy._ui,
      control: this._composite.id
    });
    this._page = Tabris.create( "tabris.Page", pageProperties );
    return this;
  },

  append: function( type, properties ) {
    return this._composite.append( type, properties );
  },

  get: function( property ) {
    if( this._PAGE_PROPS.indexOf( property ) !== -1 ) {
      return this._page.get( property );
    }
    return this._composite.get( property );
  },

  set: function( arg1, arg2 ) {
    var properties;
    if( typeof arg1 === "string" ) {
      properties = {};
      properties[arg1] = arg2;
    } else {
      properties = arg1;
    }
    this._page.set( util.pick( properties, this._PAGE_PROPS ) );
    this._composite.set( util.omit( properties, this._PAGE_PROPS ) );
    return this;
  },

  call: function( method, parameters ) {
    this._composite.call( method, parameters );
    return this;
  },

  on: function( event, listener ) {
    this._composite.on( event, listener );
    return this;
  },

  off: function( event, listener ) {
    this._composite.off( event, listener );
    return this;
  },

  dispose: function() {
    this._composite.dispose();
    this._page.dispose();
  },

  open: function() {
    this._uiProxy.setActivePage( this._page );
  },

  close: function() {
    this._composite.dispose();
    this._uiProxy.setLastActivePage();
    this._page.dispose();
  }

};
