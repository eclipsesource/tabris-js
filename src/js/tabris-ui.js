/*global Tabris: true, util: false */

Tabris._ui = {

  _pages: [],

  setActivePage: function( page ) {
    this._pages.push( page );
    Tabris._UI.set( "activePage", page.id );
  },

  getActivePage: function() {
    return this._pages[ this._pages.length - 1 ];
  },

  setLastActivePage: function() {
    this._pages.pop();
    var page = this.getActivePage();
    Tabris._UI.set( "activePage", page.id );
  },

  load: function() {
    Tabris.create( "rwt.widgets.Display" );
    Tabris._shell = Tabris.create( "rwt.widgets.Shell", {
      style: ["NO_TRIM"],
      mode: "maximized",
      active: true,
      visibility: true
    });
    Tabris._UI = Tabris.create( "tabris.UI", {
      shell: Tabris._shell.id
    });
    Tabris._UI.on( "ShowPage", function( properties ) {
      var page = Tabris._proxies[ properties.pageId ];
      Tabris._ui.setActivePage( page );
    });
    Tabris._UI.on( "ShowPreviousPage", function() {
      Tabris._ui.getActivePage().close();
    });
  },

  createAction: function( properties, handler ) {
    var action = Tabris.create( "tabris.Action", util.merge( properties, {
      parent: Tabris._UI
    }));
    action.on( "Selection", handler );
    return action;
  },

  createPage: function( properties ) {
    var pageKeys = ['title', 'image', 'topLevel'];
    var compositeProperties = util.merge( util.omit( properties, pageKeys ), {
      parent: Tabris._shell,
      layoutData: { left: 0, right: 0, top: 0, bottom: 0 }
    });
    var composite = Tabris.create( "rwt.widgets.Composite", compositeProperties );
    var pageProperties = util.merge( util.pick( properties, pageKeys ), {
      parent: Tabris._UI,
      control: composite.id
    });
    var page = Tabris.create( "tabris.Page", pageProperties );
    composite.open = function() {
      Tabris._ui.setActivePage( page );
    };
    composite.close = function() {
      composite.dispose();
      Tabris._ui.setLastActivePage();
      page.dispose();
    };
    page.close = composite.close;
    return composite;
  }
};

Tabris.createAction = Tabris._ui.createAction;
Tabris.createPage = Tabris._ui.createPage;
Tabris.load( Tabris._ui.load );
