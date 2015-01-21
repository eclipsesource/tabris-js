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

tabris.create("Label", {
  layoutData: {left: MARGIN, right: MARGIN, top: MARGIN, bottom: MARGIN},
  text: loremIpsum,
  foreground: "#777"
}).appendTo(page);

var shade = tabris.create("Composite", {
  layoutData: {left: 0, right: 0, top: 0, bottom: 0},
  background: "black",
  opacity: 0
}).appendTo(page);

var tray = tabris.create("Composite", {
  layoutData: {left: 0, right: 0, top: [30, 0], bottom: 0}
}).appendTo(page);

var strap = tabris.create("Composite", {
  layoutData: {left: [40, 0], right: [40, 0], top: 0, height: 48},
  background: "#259b24"
}).appendTo(tray);

var strapLabel = tabris.create("Label", {
  layoutData: {left: MARGIN, right: MARGIN, top: 10},
  alignment: "center",
  text: "⇧",
  font: "bold 24px",
  foreground: "white"
}).appendTo(strap);

var trayContent = tabris.create("Composite", {
  layoutData: {left: MARGIN, right: MARGIN, top: [strap, 0], bottom: 0},
  background: "#8bc34a"
}).appendTo(tray);

tabris.create("Label", {
  layoutData: {left: MARGIN, right: MARGIN, top: MARGIN},
  alignment: "center",
  text: "Tray content",
  font: "bold 24px",
  foreground: "white"
}).appendTo(trayContent);

function updateShadeOpacity(translationY) {
  var traveled = translationY / verticalTrayOffset;
  shade.set("opacity", 0.75 - traveled);
}

function updateStrapLabelRotation(translationY) {
  var traveled = translationY / verticalTrayOffset;
  strapLabel.set("transform", {rotation: traveled * Math.PI - Math.PI});
}

trayContent.on("change:bounds", function() {
  var bounds = trayContent.get("bounds");
  verticalTrayOffset = bounds.height;
  tray.set("transform", {translationY: verticalTrayOffset});
  updateShadeOpacity(verticalTrayOffset);
  updateStrapLabelRotation(verticalTrayOffset);
});

strap.on("touchstart", function(e) {
  prevEvent = e;
  if (animation !== undefined) {
    animation.call("cancel");
  }
});

strap.on("touchmove", function(e) {
  var y = e.touches[0].pageY - prevEvent.touches[0].pageY;
  prevPrevEvent = prevEvent;
  prevEvent = e;
  var offsetY = tray.get("transform").translationY + y;
  tray.set("transform", {translationY: Math.min(Math.max(offsetY, 0), verticalTrayOffset)});
  updateShadeOpacity(offsetY);
  updateStrapLabelRotation(offsetY);
});

strap.on("touchcancel", function() {
  positionTrayInRestingState();
});

strap.on("touchend", function() {
  positionTrayInRestingState();
});

function positionTrayInRestingState() {
  var y = prevEvent.touches[0].pageY - prevPrevEvent.touches[0].pageY;
  var translationTarget = 0;
  if (y >= 0) {
    translationTarget = verticalTrayOffset;
  }
  var duration = verticalTrayOffset;
  if (duration < 0) {
    duration *= -1;
  }
  animation = tabris.create("_Animation", {
    target: tray,
    duration: duration,
    easing: "ease-out", // "linear", "ease-in", "ease-out", "ease-in-out"
    properties: {
      transform: {
        translationY: translationTarget
      }
    }
  }).on("Progress", function() {
    var translationY = tray.get("transform").translationY;
    updateShadeOpacity(translationY);
    updateStrapLabelRotation(translationY);
  }).on("Completion", function() {
    this.dispose();
    animation = undefined;
    // TODO remove the following workaround when tabris-ios #538 is implemented
    var offsetY = tray.get("transform").translationY;
    updateShadeOpacity(offsetY);
    updateStrapLabelRotation(offsetY);
  }).call("start");
}
