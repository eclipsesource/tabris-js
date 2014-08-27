/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*jshint undef:false */
describe( "TabrisBackbone View", function() {

  var model;
  var widget;
  var parent;
  var MyView = Backbone.View.extend({});

  beforeEach( function() {
    tabris._reset();
    tabris._start( new NativeBridgeSpy() );
    model = new Backbone.Model();
    widget = tabris.create( "MyWidget" );
    parent = tabris.create( "MyParentWidget" );
    spyOn(parent, "append").and.callThrough();
  });

  afterEach(function() {
    widget.dispose();
    parent.dispose();
  });

  describe( "create view", function() {

    it( "stores given model, widget, type, attributes, events, collection, parent", function() {
      var events = {}, attributes = {}, collection = [], layoutData = {}, parentView = {};
      var view = new MyView({
        "model": model,
        "widget": widget, // in place of "el"
        "widgetType": "Button", // in place of "tagName"
        "parentWidget": parent, // needed in addition to type
        "parentView": parentView, // used for creation if parentView is missing
        "attributes": attributes,
        "events": events,
        "layoutData": layoutData, // in place of "className"/"id"
        "collection": collection,
        "foo": "bar"
      });

      expect(view.model).toBe(model);
      expect(view.widget).toBe(widget);
      expect(view.parentWidget).toBe(parent);
      expect(view.parentView).toBe(parentView);
      expect(view.widgetType).toBe("Button");
      expect(view.attributes).toBe(attributes);
      expect(view.layoutData).toBeUndefined();
      expect(view.events).toBe(events);
      expect(view.collection).toBe(collection);
      expect(view.foo).toBeUndefined();
    } );

    it("has default type Composite", function() {
      var view = new MyView({"parentWidget": parent});

      expect(view.widgetType).toBe("Composite");
    });

    it("creates Widget of default type on parentWidget", function() {
      var view = new MyView({
        "parentWidget": parent,
        "parentView" : {}
      });

      expect(view.widget).toEqual(jasmine.any(tabris.Proxy));
      expect(parent.append).toHaveBeenCalledWith("Composite", {});
    });

    it("creates Widget of custom type on parentWidget", function() {
      var MyView = Backbone.View.extend({widgetType: "Button"});
      var view = new MyView({"parentWidget": parent});

      expect(view.widget).toEqual(jasmine.any(tabris.Proxy));
      expect(parent.append).toHaveBeenCalledWith("Button", {});
    });

    it("creates Widget of custom type on parentView widget", function() {
      var parentView = new MyView({ "widget": parent });
      var view = new MyView({
        "parentView": parentView,
        "widgetType" : "Button"
      });

      expect(view.widget).toEqual(jasmine.any(tabris.Proxy));
      expect(parent.append).toHaveBeenCalledWith("Button", {});
    });

    it("creates Widget of custom type on parentView container", function() {
      var parentView = new MyView({ "widget": widget });
      parentView.container = parent;
      var view = new MyView({
        "parentView": parentView,
        "widgetType" : "Button"
      });

      expect(view.widget).toEqual(jasmine.any(tabris.Proxy));
      expect(parent.append).toHaveBeenCalledWith("Button", {});
    });

    it("stores parentView widget as parentWidget", function() {
      var parentView = new MyView({ "widget": parent });
      var view = new MyView({
        "parentView": parentView,
        "widgetType" : "Button"
      });

      expect(view.parentWidget).toBe(parent);
    });

    it("creates Widget with given attributes and layoutData", function() {
      spyOn(tabris.Proxy.prototype, "set").and.callThrough();
      var view = new MyView({
        "parentWidget": parent,
        "attributes": {"text": "foo"},
        "layoutData" : {"left": 1, "top": 2}
      });

      expect(parent.append).toHaveBeenCalledWith("Composite", { "text": "foo" });
      expect(view.widget.set).toHaveBeenCalledWith("layoutData", {"left": 1, "top": 2} );
    });

    it("applies layoutData to given widget", function() {
      spyOn(widget, "set").and.callThrough();
      /*jshint nonew: false */
      new MyView({
        "widget": widget,
        "layoutData" : {"left": 1, "top": 2}
      });

      expect(widget.set).toHaveBeenCalledWith("layoutData", {"left": 1, "top": 2} );
    });

    it("delegates events", function() {
      var MyView = Backbone.View.extend({
        events: { "Modify" : "onModify", "Selection" : "onSelection" },
        onModify : jasmine.createSpy(),
        onSelection : jasmine.createSpy()
      });
      var view = new MyView({"widget": widget});
      widget._notifyListeners( "Modify", [{"type": "modify"}] );
      widget._notifyListeners( "Selection", [{"type": "select"}] );

      expect(view.onModify).toHaveBeenCalledWith({"type": "modify"});
      expect(view.onModify.calls.all()[0].object).toBe(view);
      expect(view.onSelection).toHaveBeenCalledWith({"type": "select"});
      expect(view.onSelection.calls.all()[0].object).toBe(view);
    });

    it("delegates events to sub-widgets", function() {
      var MyView = Backbone.View.extend({
        events: { "Modify text" : "onModify", "Selection checkbox" : "onSelection" },
        onModify : jasmine.createSpy(),
        onSelection : jasmine.createSpy(),
        initialize : function() {
          this.text = this.widget.append( "Text" );
          this.checkbox = this.widget.append( "CheckBox" );
        }
      });
      var view = new MyView({"widget": widget});
      view.text._notifyListeners( "Modify", [{"type": "modify"}] );
      view.checkbox._notifyListeners( "Selection", [{"type": "select"}] );

      expect(view.onModify).toHaveBeenCalledWith({"type": "modify"});
      expect(view.onModify.calls.all()[0].object).toBe(view);
      expect(view.onSelection).toHaveBeenCalledWith({"type": "select"});
      expect(view.onSelection.calls.all()[0].object).toBe(view);
    });

    it("ignores missing sub-widgets", function() {
      var MyView = Backbone.View.extend({
        events: { "Modify text" : "onModify", "Selection checkbox" : "onSelection" },
        onModify : jasmine.createSpy(),
        onSelection : jasmine.createSpy(),
        initialize : function() {
          this.text = this.widget.append( "Text" );
        }
      });
      var view = new MyView({"widget": widget});
      view.text._notifyListeners( "Modify", [{"type": "modify"}] );

      expect(view.onModify).toHaveBeenCalledWith({"type": "modify"});
      expect(view.onModify.calls.all()[0].object).toBe(view);
    });

    it("throws error if not a widget", function() {
      var MyView = Backbone.View.extend({
        events: { "Modify text" : "onModify", "Selection checkbox" : "onSelection" },
        onModify : jasmine.createSpy(),
        onSelection : jasmine.createSpy(),
        initialize : function() {
          this.text = {};
        }
      });

      expect(function(){
        /*jshint nonew:false */
        new MyView({"widget": widget});
      }).toThrow();
    });

    it("throws error if disposed widget", function() {
      var MyView = Backbone.View.extend({
        events: { "Modify text" : "onModify", "Selection checkbox" : "onSelection" },
        onModify : jasmine.createSpy(),
        onSelection : jasmine.createSpy(),
        initialize : function() {
          this.text = this.widget.append( "Text" );
          text.dispose();
        }
      });

      expect(function(){
        /*jshint nonew:false */
        new MyView({"widget": widget});
      }).toThrow();
    });

  } );

  describe("undelegateEvents", function() {

    it("Removes all event listener from widget", function() {
      var MyView = Backbone.View.extend({
        events: { "Modify" : "onModify", "Selection" : "onSelection" },
        onModify : jasmine.createSpy(),
        onSelection : jasmine.createSpy()
      });
      var view = new MyView({"widget": widget});

      view.undelegateEvents();
      widget._notifyListeners( "Modify", [{"type": "modify"}] );
      widget._notifyListeners( "Selection", [{"type": "select"}] );

      expect(view.onModify).not.toHaveBeenCalled();
      expect(view.onSelection).not.toHaveBeenCalled();
    });

    it("Removes all event listener from sub-widgets", function() {
      var MyView = Backbone.View.extend({
        events: { "Modify text" : "onModify", "Selection checkbox" : "onSelection" },
        onModify : jasmine.createSpy(),
        onSelection : jasmine.createSpy(),
        initialize : function() {
          this.text = this.widget.append( "Text" );
          this.checkbox = this.widget.append( "CheckBox" );
        }
      });
      var view = new MyView({"widget": widget});

      view.undelegateEvents();
      view.text._notifyListeners( "Modify", [{"type": "modify"}] );
      view.checkbox._notifyListeners( "Selection", [{"type": "select"}] );

      expect(view.onModify).not.toHaveBeenCalled();
      expect(view.onSelection).not.toHaveBeenCalled();
    });

    it("Removes event listener from widgets that have been detached from the view", function() {
      var MyView = Backbone.View.extend({
        events: { "Modify text" : "onModify", "Selection checkbox" : "onSelection" },
        onModify : jasmine.createSpy(),
        onSelection : jasmine.createSpy(),
        initialize : function() {
          this.text = this.widget.append( "Text" );
          this.checkbox = this.widget.append( "CheckBox" );
        }
      });
      var view = new MyView({"widget": widget});
      var text = view.text, checkbox = view.checkbox;
      view.text = view.checkbox = null;

      view.undelegateEvents();
      text._notifyListeners( "Modify", [{"type": "modify"}] );
      checkbox._notifyListeners( "Selection", [{"type": "select"}] );

      expect(view.onModify).not.toHaveBeenCalled();
      expect(view.onSelection).not.toHaveBeenCalled();
    });

    it("Ignores disposed widgets", function() {
      var MyView = Backbone.View.extend({
        events: { "Modify text" : "onModify", "Selection checkbox" : "onSelection" },
        onModify : jasmine.createSpy(),
        onSelection : jasmine.createSpy(),
        initialize : function() {
          this.text = this.widget.append( "Text" );
          this.checkbox = this.widget.append( "CheckBox" );
        }
      });
      var view = new MyView({"widget": widget});
      view.text.dispose();

      view.undelegateEvents();
      view.checkbox._notifyListeners( "Selection", [{"type": "select"}] );

      expect(view.onModify).not.toHaveBeenCalled();
      expect(view.onSelection).not.toHaveBeenCalled();
    });

  });

  describe("listenTo", function() {

    it("listens to model change", function() {
      var view = new MyView({"widget": widget});
      view.render = jasmine.createSpy();

      view.listenTo(model, "change", view.render);
      model.set("foo", "bar");

      expect(view.render).toHaveBeenCalled();
    });

  });

  describe("remove", function() {

    it("disposes widget", function() {
      var view = new MyView({"widget": widget});
      spyOn(widget, "dispose");

      view.remove();

      expect(widget.dispose).toHaveBeenCalled();
    });

    it("stops listening to model", function() {
      var view = new MyView({"widget": widget});
      view.render = jasmine.createSpy();
      view.listenTo(model, "change", view.render);

      view.remove();
      model.set("foo", "bar");

      expect(view.render).not.toHaveBeenCalled();
    });

  });


} );
