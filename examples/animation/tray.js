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

  var page = tabris.createPage({
    title: "Tray",
    topLevel: true
  });

  var tray = page.append("Composite", {
    layoutData: {left: 0, right: 0, top: [30, 0], bottom: 0}
  });

  var strap = tray.append("Composite", {
    layoutData: {left: [40, 0], right: [40, 0], top: 0, height: 48},
    background: "#259b24"
  });

  var strapTarget = strap.append("Composite", {
    layoutData: {left: 0, right: 0, top: 0, bottom: 0}
  });

  var strapLabel = strap.append("Label", {
    layoutData: {left: MARGIN, right: MARGIN, top: 10},
    alignment: "center",
    text: "⇧",
    font: "bold 24px",
    foreground: "white"
  });

  var content = tray.append("Composite", {
    layoutData: {left: MARGIN, right: MARGIN, top: [strap, 0], bottom: 0},
    background: "#8bc34a"
  });

  content.append("Label", {
    layoutData: {left: MARGIN, right: MARGIN, top: MARGIN},
    alignment: "center",
    text: "Tray content",
    font: "bold 24px",
    foreground: "white"
  });

  var shade = page.append("Composite", {
    layoutData: {left: 0, right: 0, top: 0, bottom: 0},
    background: "black",
    opacity: 0
  });

  page.append("Label", {
    style: ["WRAP"],
    layoutData: {left: MARGIN, right: MARGIN, top: MARGIN, bottom: MARGIN},
    text: loremIpsum,
    foreground: "#777"
  });

  function updateShadeOpacity() {
    var traveled = tray.get("translationY") / verticalTrayOffset;
    shade.set("opacity", 0.75 - traveled);
  }

  function updateStrapLabelRotation() {
    var traveled = tray.get("translationY") / verticalTrayOffset;
    strapLabel.set("rotation", traveled * Math.PI - Math.PI);
  }

  content.on("resize", function() {
    var bounds = content.get("bounds");
    verticalTrayOffset = bounds[3];
    tray.set("translationY", verticalTrayOffset);
    updateShadeOpacity();
    updateStrapLabelRotation();
  });

  strapTarget.on("MouseDown", function(e) {
    prevEvent = e;
    if (animation !== undefined) {
      animation.call("cancel");
    }
  });

  strapTarget.on("MouseMove", function(e) {
    var y = e.y - prevEvent.y;
    prevPrevEvent = prevEvent;
    prevEvent = e;
    var translationY = tray.get("translationY") + y;
    tray.set("translationY", Math.min(Math.max(translationY, 0), verticalTrayOffset));
    updateShadeOpacity();
    updateStrapLabelRotation();
  });

  strapTarget.on("MouseUp", function() {
    var time = prevEvent.time - prevPrevEvent.time;
    var y = prevEvent.y - prevPrevEvent.y;
    var translationTarget = 0;
    if (y >= 0) {
      translationTarget = verticalTrayOffset;
    }
    var duration = time / y * 400;
    if (duration < 0) {
      duration *= -1;
    }
    animation = tabris.create("tabris.Animation", {
      target: tray,
      duration: duration,
      easing: "ease-out", // "linear", "ease-in", "ease-out", "ease-in-out"
      properties: {
        translationY: translationTarget
      }
    }).on("Progress", function() {
      updateShadeOpacity();
      updateStrapLabelRotation();
    }).on("Completion", function() {
      this.dispose();
      animation = undefined;
    }).call("start");
  });

});
