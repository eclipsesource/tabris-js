/*******************************************************************************
 * Copyright (c) 2010-2014 EclipseSource and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 *     - Original Backbone.View implementation. Backbone may be freely distributed
 *       under the MIT license.
 *   EclipseSource - modified for Tabris-js
 ******************************************************************************/

// NOTE: There seems to be a bug in the jshint version we are using that does not allow adding
// "_" to the list of globals. (It then claims that "_" is unused.)
/*jshint undef:false */
(function() {

  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId("view");
    options = options || {};
    _.extend(this, _.pick(options, viewOptions));
    this._ensureWidget(options);
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = [
    "model",
    "collection",
    "widget",
    "parentWidget",
    "parentView",
    "attributes",
    "widgetType",
    "events"
  ];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Backbone.Events, {

    // The default `type` of a View's widget is `Composite`.
    widgetType: "Composite",

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function() {},

    // **render** is the core function that your view should override, in order
    // to populate its widget (`this.widget`), with the appropriate content. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      if (this.widget.close) {
        this.widget.close();
      }
      this.widget.dispose();
      this.stopListening();
      return this;
    },

    // Change the view's widget (`this.widget` property), including event
    // re-delegation.
    setWidget: function(widget, delegate) {
      if (this.widget) {
        this.undelegateEvents();
      }
      this.widget = widget;
      if (delegate !== false) {
        this.delegateEvents();
      }
      return this;
    },

    // NOTE [TABRIS]: could the selector be supported somehow? Comment unchanged:
    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       "mousedown .title":  "edit",
    //       "click .button":     "save",
    //       "click .open":       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, "events")))) {
        return this;
      }
      this.undelegateEvents();
      var listener = [];
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) {
          method = this[events[key]];
        }
        if (!method) {
          continue;
        }
        var match = key.match(delegateEventSplitter);
        var eventName = match[1];
        var selector = match[2] || "widget";
        if (this[selector]) {
          method = _.bind(method, this);
          this[selector].on(eventName, method);
          listener.push([this[selector], eventName, method]);
        }
      }
      this.undelegateEvents = _.bind(View.prototype.undelegateEvents, this, listener);
      return this;
    },

    // removes all given listener. Overwritten on instance by delegateEvents
    undelegateEvents: function(arr) {
      if (arr instanceof Array) {
        for (var i = 0; i < arr.length; i++) {
          try {
            arr[i][0].off(arr[i][1], arr[i][2]);
          } catch (ex) {
            // widget is probably disposed
          }
        }
      }
      delete this.undelegateEvents;
      return this;
    },

    // Ensure that the View has a widget to render into.
    // Create a widget from the `widgetType`, `attributes` and `layoutData` properties.
    // If no parent is present, create and open a page;
    _ensureWidget: function(options) {
      if (!this.widget) {
        var attrs = _.extend({}, _.result(this, "attributes"));
        if (!this.parentWidget && this.parentView) {
          this.parentWidget = this.parentView.container || this.parentView.widget;
        }
        if (this.parentWidget) {
          var widget = tabris.create(_.result(this, "widgetType"), attrs);
          this.parentWidget.append(widget);
          this.setWidget(widget, false);
        } else {
          this.setWidget(tabris.create("Page", attrs), false);
          this.widget.open();
        }
      } else {
        this.setWidget(_.result(this, "widget"), false);
      }
      if (options.layoutData) {
        this.widget.set("layoutData", options.layoutData);
      }
    }

  });

  View.extend = Backbone.Model.extend;

}());
