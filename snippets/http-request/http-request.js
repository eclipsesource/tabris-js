tabris.load(function() {

  var MARGIN = 12;

  var page = tabris.create("Page", {
    title: "Retrieving a JSON response using XMLHttpRequest",
    topLevel: true
  });

  var button = tabris.create("Button", {
    layoutData: {left: MARGIN, top: MARGIN},
    text: "Start xmlHttpRequest"
  }).on("selection", function() {
    xhr.onreadystatechange = function() {
      if (xhr.readyState === xhr.DONE) {
        tabris.create("Label", {
          style: ["WRAP"],
          markupEnabled: true,
          text: "<b>Words starting with 'mobile': </b>" + JSON.parse(xhr.responseText)[1].join(", "),
          layoutData: {left: MARGIN, right: MARGIN, top: [button, MARGIN]}
        }).appendTo(page);
      }
    };
    xhr.open("GET", "http://en.wiktionary.org/w/api.php?action=opensearch&search=mobile&limit=100");
    xhr.send();
  }).appendTo(page);

  var xhr = new tabris.XMLHttpRequest();

  page.open();

});
