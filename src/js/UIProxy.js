/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global Tabris: true, util: false */

Tabris.UIProxy = function() {
  this._pages = [];
};

Tabris.UIProxy.prototype = {

  _create: function() {
    var self = this;
    Tabris.create( "rwt.widgets.Display" );
    Tabris._shell = Tabris.create( "rwt.widgets.Shell", {
      style: ["NO_TRIM"],
      mode: "maximized",
      active: true,
      visibility: true
    });
    this._ui = Tabris.create( "tabris.UI", {
      shell: Tabris._shell.id
    });
    this._ui.on( "ShowPage", function( properties ) {
      var page = Tabris._proxies[ properties.pageId ];
      self.setActivePage( page );
    });
    this._ui.on( "ShowPreviousPage", function() {
      self.getActivePage().close();
    });
    return this;
  },

  _install: function( target ) {
    target.createAction = util.bind( this.createAction, this );
    target.createPage = util.bind( this.createPage, this );
  },

  setActivePage: function( page ) {
    this._pages.push( page );
    this._ui.set( "activePage", page.id );
  },

  getActivePage: function() {
    return this._pages[ this._pages.length - 1 ];
  },

  setLastActivePage: function() {
    this._pages.pop();
    var page = this.getActivePage();
    if( page ) {
      this._ui.set( "activePage", page.id );
    }
  },

  createAction: function( properties, handler ) {
    var action = Tabris.create( "tabris.Action", util.merge( properties, {
      parent: this._ui
    }));
    if( typeof handler === "function" ) {
      action.on( "Selection", handler );
    }
    return action;
  },

  createPage: function( properties ) {
    return new Tabris.PageProxy( this )._create( properties );
  }
};

Tabris.load( function() {
  new Tabris.UIProxy()._create()._install( Tabris );
});
