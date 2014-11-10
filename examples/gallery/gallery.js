tabris.load(function() {

  var imageNames = [
    "catseye",
    "heic0305a",
    "heic0401a",
    "heic0407a",
    "heic0407b",
    "heic0409a",
    "heic0414a",
    "heic0502a",
    "heic0514a",
    "heic0515a",
    "heic0604a",
    "heic0910e",
    "IRS46_nasa",
    "ngc4414",
    "opo0110a",
    "opo0505a",
    "opo9901a",
    "orion-nebula"
  ];

  var page = tabris.create("Page", {
    title: "The Big Bang Theory",
    background: "black",
    topLevel: true
  });

  var scrollComposite = tabris.create("ScrollComposite", {
    scroll: "horizontal",
    data: {paging: true},
    layoutData: {left: 0, right: 0, bottom: 0, height: 164},
    background: "rgba(32, 32, 32, 0.6)"
  }).appendTo(page);

  imageNames.forEach(function(image, index) {
    tabris.create("ImageView", {
      layoutData: {top: 7, left: index * 157, width: 150, height: 150},
      image: {src: "images/" + image + "_thumb.jpg", width: 150, height: 150},
      data: {
        showTouch: true
      }
    }).on("touchend", function() {
      fullImage.set("image", {src: "images/" + image + ".jpg"});
    }).appendTo(scrollComposite);
  });

  var fullImage = tabris.create("ImageView", {
    layoutData: {top: 0, bottom: 0, left: 0, right: 0},
    image: {src: "images/" + imageNames[0] + ".jpg" },
    scaleMode: "auto"
  }).appendTo(page);

  var fullscreenAction = tabris.create("Action", {
    title: "Fullscreen",
    placementPriority: "HIGH"
  }).on("selection", toggleAction);

  var thumbnailsAction = tabris.create("Action", {
    title: "Thumbnails",
    placementPriority: "HIGH",
    visibility: false
  }).on("selection", toggleAction);

  page.open();

  function toggleAction() {
    if (scrollComposite.get("visibility")) {
      scrollComposite.set("visibility", false);
      thumbnailsAction.set("visibility", true);
      fullscreenAction.set("visibility", false);
    } else {
      scrollComposite.set("visibility", true);
      thumbnailsAction.set("visibility", false);
      fullscreenAction.set("visibility", true);
    }
  }

});
