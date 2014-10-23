tabris.load(function() {

  var MARGIN = 12;

  var verticalTrayOffset;
  var prevEvent;
  var prevPrevEvent;
  var animation;

  var loremIpsum = "Etiam nisl nisi, egestas quis lacus ut, tristique suscipit metus. In " +
                   "vehicula lectus metus, at accumsan elit fringilla blandit. Integer et quam " +
                   "sed dolor pharetra molestie id eget dui. Donec ac libero eu lectus dapibus " +
                   "placerat eu a tellus. Fusce vulputate ac sem sit amet bibendum.\n\n" +
                   "Pellentesque euismod varius purus nec pharetra. Sed vitae ipsum sit amet " +
                   "risus vehicula euismod in at nunc. Sed in viverra arcu, id blandit risus. " +
                   "Praesent sagittis quis nisl id molestie. Donec dignissim, nisl id volutpat " +
                   "consectetur, massa diam aliquam lectus, sed euismod leo elit eu justo. " +
                   "Integer vel ante sapien.\n\nNunc sit amet blandit tellus, sed consequat " +
                   "neque. Proin vel elementum augue. Quisque gravida nulla nisl, at fermentum " +
                   "turpis euismod in. ";

  var page = tabris.create("Page", {
    title: "Tray",
    topLevel: true
  });

  var tray = tabris.create("Composite", {
    layoutData: {left: 0, right: 0, top: [30, 0], bottom: 0}
  });

  var strap = tabris.create("Composite", {
    layoutData: {left: [40, 0], right: [40, 0], top: 0, height: 48},
    background: "#259b24"
  });

  var strapContainer = tabris.create("Composite", {
    layoutData: {left: 0, right: 0, top: 0, bottom: 0}
  });

  var strapLabel = tabris.create("Label", {
    layoutData: {left: MARGIN, right: MARGIN, top: 10},
    alignment: "center",
    text: "⇧",
    font: "bold 24px",
    foreground: "white"
  });

  var content = tabris.create("Composite", {
    layoutData: {left: MARGIN, right: MARGIN, top: [strap, 0], bottom: 0},
    background: "#8bc34a"
  });

  var contentLabel = tabris.create("Label", {
    layoutData: {left: MARGIN, right: MARGIN, top: MARGIN},
    alignment: "center",
    text: "Tray content",
    font: "bold 24px",
    foreground: "white"
  });

  var shade = tabris.create("Composite", {
    layoutData: {left: 0, right: 0, top: 0, bottom: 0},
    background: "black",
    opacity: 0
  });

  var pageLabel = tabris.create("Label", {
    style: ["WRAP"],
    layoutData: {left: MARGIN, right: MARGIN, top: MARGIN, bottom: MARGIN},
    text: loremIpsum,
    foreground: "#777"
  });

  strap.append(strapLabel, strapContainer);
  content.append(contentLabel);
  tray.append(content, strap);
  page.append(tray, shade, pageLabel);

  function updateShadeOpacity() {
    var traveled = tray.get("transform").translationY / verticalTrayOffset;
    shade.set("opacity", 0.75 - traveled);
  }

  function updateStrapLabelRotation() {
    var traveled = tray.get("transform").translationY / verticalTrayOffset;
    strapLabel.set("transform", {rotation: traveled * Math.PI - Math.PI});
  }

  content.on("resize", function() {
    var bounds = content.get("bounds");
    verticalTrayOffset = bounds[3];
    tray.set("transform", {translationY: verticalTrayOffset});
    updateShadeOpacity();
    updateStrapLabelRotation();
  });

  strapLabel.on("touchstart", function(e) {
    prevEvent = e;
    if (animation !== undefined) {
      animation.call("cancel");
    }
  });

  strapLabel.on("touchmove", function(e) {
    var y = e.touches[0].y - prevEvent.touches[0].y;
    prevPrevEvent = prevEvent;
    prevEvent = e;
    var offsetY = tray.get("transform").translationY + y;
    tray.set("transform", {translationY: Math.min(Math.max(offsetY, 0), verticalTrayOffset)});
    updateShadeOpacity();
    updateStrapLabelRotation();
  });

  strapLabel.on("touchcancel", function() {
    positionTrayInRestingState();
  });

  strapLabel.on("touchend", function() {
    positionTrayInRestingState();
  });

  function positionTrayInRestingState() {
    var y = prevEvent.touches[0].y - prevPrevEvent.touches[0].y;
    var translationTarget = 0;
    if (y >= 0) {
      translationTarget = verticalTrayOffset;
    }
    var duration = verticalTrayOffset;
    if (duration < 0) {
      duration *= -1;
    }
    animation = tabris.create("tabris.Animation", {
      target: tray,
      duration: duration,
      easing: "ease-out", // "linear", "ease-in", "ease-out", "ease-in-out"
      properties: {
        transform: {
          translationY: translationTarget
        }
      }
    }).on("Progress", function() {
      updateShadeOpacity();
      updateStrapLabelRotation();
    }).on("Completion", function() {
      this.dispose();
      animation = undefined;
    }).call("start");
  }

});
