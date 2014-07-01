/*global Tabris: true, util: false */

Tabris.UIController = function() {
  this._pages = [];
};

Tabris.UIController.prototype = {

  init: function() {
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
  },

  install: function( target ) {
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
    action.on( "Selection", handler );
    return action;
  },

  createPage: function( properties ) {
    var self = this;
    var pageKeys = ['title', 'image', 'topLevel'];
    var compositeProperties = util.merge( util.omit( properties, pageKeys ), {
      parent: Tabris._shell,
      layoutData: { left: 0, right: 0, top: 0, bottom: 0 }
    });
    var composite = Tabris.create( "rwt.widgets.Composite", compositeProperties );
    var pageProperties = util.merge( util.pick( properties, pageKeys ), {
      parent: this._ui,
      control: composite.id
    });
    var page = Tabris.create( "tabris.Page", pageProperties );
    composite.open = function() {
      self.setActivePage( page );
    };
    composite.close = function() {
      composite.dispose();
      self.setLastActivePage();
      page.dispose();
    };
    page.close = composite.close;
    return composite;
  }
};

Tabris.load( function() {
  var uiController = new Tabris.UIController();
  uiController.init();
  uiController.install( Tabris );
});
