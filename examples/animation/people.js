tabris.load(function() {

  var IMAGE_PATH = "images/";
  var IMAGE_SIZE = 128;
  var THUMB_SIZE = 64;
  var MARGIN_SMALL = 4;
  var MARGIN = 12;
  var MARGIN_LARGE = 24;
  var ANIMATION_START_DELAY = 500;

  var people = [
    ["Holger", "Staudacher", "holger.jpg"],
    ["Ian", "Bull", "ian.jpg"],
    ["Jochen", "Krause", "jochen.jpg"],
    ["Jordi ", "Böhme López", "jordi.jpg"],
    ["Markus ", "Knauer", "markus.jpg"],
    ["Moritz", "Post", "moritz.jpg"],
    ["Tim", "Buschtöns", "tim.jpg"]
  ].map(function(element) {
    return {firstName: element[0], lastName: element[1], image: IMAGE_PATH + element[2]};
  });

  var page = tabris.create("Page", {
    title: "People",
    topLevel: true
  });

  var personDetailsParent = tabris.create("Composite", {
    layoutData: {left: MARGIN, top: MARGIN_LARGE, right: MARGIN}
  }).appendTo(page);

  var personDetailView = createPersonDetail(personDetailsParent, people[2], ANIMATION_START_DELAY);

  var peopleComposite = tabris.create("ScrollComposite", {
    scroll: "horizontal",
    layoutData: {left: 0, top: [personDetailsParent, MARGIN], right: 0, height: 96}
  }).appendTo(page);

  people.forEach(function(person, index) {
    var composite = createPersonThumbView(peopleComposite, person);
    animateInFromBottom(composite, index);
  });

  page.open();

  function animateInFromBottom(widget, index) {
    widget.set({
      opacity: 0.0,
      transform: {translationY: THUMB_SIZE / 2}
    });
    widget.animate({
      opacity: 1.0,
      transform: {translationY: 0}
    }, {
      delay: index * 100 + 800 + ANIMATION_START_DELAY,
      duration: 200,
      easing: "ease-in-out"
    });
  }

  function animateInFromRight(widget, delay) {
    widget.set({
      opacity: 0.0,
      transform: {translationX: 32}
    });
    widget.animate({
        opacity: 1.0,
        transform: {translationX: 0}
      }, {
        duration: 500,
        delay: delay,
        easing: "ease-out"
      }
    );
  }

  function animateInScaleUp(widget, delay) {
    widget.set("opacity", 0.0);
    widget.animate({
      opacity: 1.0,
      transform: {scaleX: 1.0, scaleY: 1.0}
    }, {
      delay: delay,
      duration: 400,
      easing: "ease-out"
    });
  }

  function animateOutLeftCreateCurrentPerson(person) {
    // this animation uses internal api to get notified when the animation ended
    // the callback will be exposed via official api soon
    tabris.create("_Animation", {
      target: personDetailView,
      duration: 500,
      easing: "ease-out",
      properties: {
        opacity: 0.0,
        transform: {
          translationX: -64
        }
      }
    }).on("Completion", function() {
      this.dispose();
      personDetailView.dispose();
      personDetailView = createPersonDetail(personDetailsParent, person, 0);
    }).call("start");
  }

  function createPersonDetail(parent, person, delay) {
    var composite = tabris.create("Composite", {
      layoutData: {left: 0, right: 0, top: 0, height: IMAGE_SIZE + MARGIN_LARGE}
    });
    var personImage = tabris.create("ImageView", {
      layoutData: {left: 0, top: 0, width: IMAGE_SIZE, height: IMAGE_SIZE},
      image: {src: person.image, width: IMAGE_SIZE, height: IMAGE_SIZE},
      opacity: 0.0
    }).on("change:bounds", function listener() {
      this.set("transform", {
        scaleX: 0.75,
        scaleY: 0.75
      });
      animateInScaleUp(this, delay);
    });
    var nameLabel = tabris.create("Label", {
      layoutData: {left: [personImage, MARGIN], top: 0},
      text: person.firstName + " " + person.lastName,
      font: "bold 18px"
    });
    var professionLabel = tabris.create("Label", {
      layoutData: {left: [personImage, MARGIN], top: [nameLabel, MARGIN]},
      text: "Software developer"
    });
    var companyLabel = tabris.create("Label", {
      layoutData: {left: [personImage, MARGIN], top: [professionLabel, MARGIN_SMALL]},
      text: "EclipseSource"
    });
    var mailLabel = tabris.create("Label", {
      layoutData: {left: [personImage, MARGIN], top: [companyLabel, MARGIN]},
      text: "mail@eclipsesource.com",
      font: "italic 14px"
    });
    parent.append(composite);
    composite.append(personImage, nameLabel, professionLabel, companyLabel, mailLabel);
    animateInFromRight(nameLabel, delay);
    animateInFromRight(professionLabel, 100 + delay);
    animateInFromRight(companyLabel, 200 + delay);
    animateInFromRight(mailLabel, 300 + delay);
    return composite;
  }

  function createPersonThumbView(parent, person) {
    var neighbor = parent.children().pop();
    var composite = tabris.create("Composite", {
      layoutData: {left: neighbor ? [neighbor, MARGIN] : MARGIN, top: 0}
    }).appendTo(parent);
    var personView = tabris.create("ImageView", {
      layoutData: {left: 0, top: 0, width: THUMB_SIZE, height: THUMB_SIZE},
      image: {src: person.image, width: THUMB_SIZE, height: THUMB_SIZE},
      data: {showTouch: true} // internal API
    }).on("touchend", function() {
      animateOutLeftCreateCurrentPerson(person);
    }).appendTo(composite);
    tabris.create("Label", {
      alignment: "center",
      layoutData: {left: 0, top: [personView, 0], width: THUMB_SIZE},
      text: person.firstName
    }).appendTo(composite);
    return composite;
  }

});
