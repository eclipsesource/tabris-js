tabris.load(function() {

  var imageHolder;

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

  var page = tabris.createPage({
    title: "The Big Bang Theory",
    topLevel: true
  });

  var mainComposite = tabris.create("Composite", {
    parent: page,
    background: "black",
    layoutData: {left: 0, top: 0, right: 0, bottom: 0}
  });

  var scrollCompositeLayoutData = {left: 0, right: 0, bottom: 0, height: 164};

  var scrollComposite = tabris.create("ScrollComposite", {
    parent: mainComposite,
    scroll: "horizontal",
    data: {"paging":true},
    layoutData: scrollCompositeLayoutData,
    background: "rgba(32, 32, 32, 0.6)"
  });

  function createImageThumbPath(imageName) {
    return "images/".concat(imageName).concat("_thumb.jpg");
  }

  function createImageBigPath(imageName) {
    return "images/".concat(imageName).concat(".jpg");
  }

  function bindShowToSelection(image, path) {
    image.on("touchend", function() {
      updateCentralImage(path);
    });
  }

  for (var i = 0; i < imageNames.length; i++) {
    var imageThumbPath = createImageThumbPath(imageNames[i]);
    var imageBigPath = createImageBigPath(imageNames[i]);
    var image = tabris.create("Label", {
      parent: scrollComposite,
      layoutData: {top: 7, left: i * 150 + i * 7, width: 150, height: 150},
      image: [imageThumbPath, 150, 150],
      data: {
        showTouch: true
      }
    });
    bindShowToSelection(image, imageBigPath);
  }

  function updateCentralImage(path) {
    if (imageHolder) {
      imageHolder.dispose();
    }
    imageHolder = tabris.create("Label", {
      parent: mainComposite,
      layoutData: {top: 0, bottom: 0, left: 0, right: 0},
      data: {"zoom":true},
      image: [path, null, null]
    });
  }

  var toggleAction = function() {
    if (!scrollComposite.isHidden) {
      recreateThumbnailAction("Thumbnails");
      scrollComposite.set("layoutData", {left:0, top:0, height: 0});
      scrollComposite.isHidden = true;
    } else {
      recreateThumbnailAction("Fullscreen");
      scrollComposite.set("layoutData", scrollCompositeLayoutData);
      scrollComposite.isHidden = false;
    }
  };

  var recreateThumbnailAction = function(actionTitle) {
    action.dispose();
    action = tabris.createAction({
      title: actionTitle,
      placementPriority: "HIGH"
    }, toggleAction);
  };

  var action = tabris.createAction({
    title: "Fullscreen",
    placementPriority: "HIGH"
  }, toggleAction);

  page.open();
});
