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

  var mainComposite = page.append("Composite", {
    background: "black",
    layoutData: {left: 0, top: 0, right: 0, bottom: 0}
  });

  var scrolledCompositeLayoutData = {left: 0, right: 0, bottom: 0, height: 164};

  var scrolledComposite = mainComposite.append("ScrolledComposite", {
    style: ["H_SCROLL"],
    data: {"paging":true},
    layoutData: scrolledCompositeLayoutData,
    background: "rgba(32, 32, 32, 0.6)"
  });

  scrolledComposite.append("rwt.widgets.ScrollBar", {
    style: ["HORIZONTAL"]
  });

  var composite = scrolledComposite.append("Composite", {
    layoutData: {}
  });

  function createImageThumbPath(imageName) {
    return "images/".concat(imageName).concat("_thumb.jpg");
  }

  function createImageBigPath(imageName) {
    return "images/".concat(imageName).concat(".jpg");
  }

  function bindShowToSelection(image, path) {
    image.on("MouseUp", function() {
      updateCentralImage(path);
    });
  }

  for (var i = 0; i < imageNames.length; i++) {
    var imageThumbPath = createImageThumbPath(imageNames[i]);
    var imageBigPath = createImageBigPath(imageNames[i]);
    var image = composite.append("Label", {
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
    imageHolder = mainComposite.append("Label", {
      layoutData: {top: 0, bottom: 0, left: 0, right: 0},
      data: {"zoom":true},
      image: [path, null, null]
    });
  }

  var toggleAction = function() {
    if (!scrolledComposite.isHidden) {
      recreateThumbnailAction("Thumbnails");
      scrolledComposite.set("layoutData", {height: 0});
      scrolledComposite.isHidden = true;
    } else {
      recreateThumbnailAction("Fullscreen");
      scrolledComposite.set("layoutData", scrolledCompositeLayoutData);
      scrolledComposite.isHidden = false;
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
