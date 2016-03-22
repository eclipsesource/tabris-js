var page = new tabris.Page({
  title: "XMLHttpRequest",
  topLevel: true
});

new tabris.Button({
  layoutData: {left: 10, top: 10},
  text: "Find words starting with 'mobile'"
}).on("select", function() {
  var xhr = new tabris.XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === xhr.DONE) {
      new tabris.TextView({
        layoutData: {left: 10, right: 10, top: "prev() 10"},
        text: JSON.parse(xhr.responseText)[1].join(", ")
      }).appendTo(page);
    }
  };
  xhr.open("GET", "http://en.wiktionary.org/w/api.php?action=opensearch&search=mobile&limit=100");
  xhr.send();
}).appendTo(page);

page.open();
