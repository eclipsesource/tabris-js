var MARGIN = 12;

var trayHeight;
var prevEvents;
var state = "resting";
var dragOffset;

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

tabris.create("TextView", {
  layoutData: {left: MARGIN, right: MARGIN, top: MARGIN},
  text: loremIpsum,
  foreground: "#777"
}).appendTo(page);

var shade = tabris.create("Composite", {
  layoutData: {left: 0, right: 0, top: 0, bottom: 0},
  background: "black",
  opacity: 0
}).appendTo(page);

var tray = tabris.create("Composite", {
  layoutData: {left: 0, right: 0, top: ["30%", 0], bottom: 0}
}).appendTo(page);

var strap = tabris.create("Composite", {
  layoutData: {left: ["40%", 0], right: ["40%", 0], top: 0, height: 48},
  background: "#259b24"
}).appendTo(tray);

var strapIcon = tabris.create("TextView", {
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

tabris.create("TextView", {
  layoutData: {left: MARGIN, right: MARGIN, top: MARGIN},
  alignment: "center",
  text: "Tray content",
  font: "bold 24px",
  foreground: "white"
}).appendTo(trayContent);

function getShadeOpacity(translationY) {
  var traveled = translationY / trayHeight;
  return 0.75 - traveled;
}

function getStrapIconTransform(translationY) {
  var traveled = translationY / trayHeight;
  return {rotation: traveled * Math.PI - Math.PI};
}

trayContent.on("change:bounds", function() {
  var bounds = trayContent.get("bounds");
  trayHeight = bounds.height;
  tray.set("transform", {translationY: trayHeight});
});

strap.on("touchstart", function(event) {
  if (state === "resting") {
    state = "dragging";
    dragOffset = tray.get("transform").translationY - event.touches[0].pageY;
    prevEvents = [event, event];
  }
});

function getMovementY() {
  return prevEvents[0].touches[0].pageY - prevEvents[1].touches[0].pageY;
}

strap.on("touchmove", function(event) {
  if (state === "dragging") {
    prevEvents.unshift(event);
    prevEvents.pop();
    var offsetY = Math.min(Math.max(event.touches[0].pageY + dragOffset, 0), trayHeight);
    tray.set("transform", {translationY: offsetY});
    shade.set("opacity", getShadeOpacity(offsetY));
    strapIcon.set("transform", getStrapIconTransform(offsetY));
  }
});

strap.on("touchcancel", function() {
  positionTrayInRestingState();
});

strap.on("touchend", function() {
  positionTrayInRestingState();
});

function positionTrayInRestingState() {
  if (state === "dragging") {
    var translationY = getMovementY() >= 0 ? trayHeight : 0;
    var options = {duration: Math.abs(trayHeight), easing: "ease-out"};
    state = "animating";
    shade.animate({opacity: getShadeOpacity(translationY)}, options);
    strapIcon.animate({transform: getStrapIconTransform(translationY)}, options);
    tray.animate({transform: {translationY: translationY}}, options).on("completion", function() {
      state = "resting";
    });
  }
}
