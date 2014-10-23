tabris.load(function() {

  var MARGIN = 12;
  var error = "";

  var page = tabris.create("Page", {
    title: "XMLHttpRequest",
    topLevel: true
  });

  var urlText = tabris.create("Text", {
    layoutData: {left: MARGIN, right: MARGIN, top: MARGIN},
    message: "Request url",
    text: "index.json"
  });

  var button = tabris.create("Button", {
    layoutData: {left: MARGIN, right: MARGIN, top: [urlText, MARGIN]},
    text: "Send request"
  });

  var progressBar = tabris.create("ProgressBar", {
    layoutData: {left: MARGIN, right: MARGIN, top: [button, MARGIN]},
    minimum: 0,
    maximum: 100,
    selection: 0
  });

  var stateLabel = tabris.create("Label", {
    style: ["WRAP"],
    markupEnabled: true,
    layoutData: {left: MARGIN, right: MARGIN, top: [progressBar, MARGIN]}
  });

  var httpStatusLabel = tabris.create("Label", {
    style: ["WRAP"],
    markupEnabled: true,
    layoutData: {left: MARGIN, right: MARGIN, top: [stateLabel, MARGIN]}
  });

  var headerLabel = tabris.create("Label", {
    style: ["WRAP"],
    markupEnabled: true,
    layoutData: {left: MARGIN, right: MARGIN, top: [httpStatusLabel, MARGIN]}
  });

  var bodyLabel = tabris.create("Label", {
    style: ["WRAP"],
    markupEnabled: true,
    layoutData: {left: MARGIN, right: MARGIN, top: [headerLabel, MARGIN]}
  });

  page.append(urlText, button, progressBar, stateLabel, httpStatusLabel, headerLabel, bodyLabel);

  button.on("selection", function() {
    progressBar.set("selection", 0);
    if ([xhr.UNSENT, xhr.DONE].indexOf(xhr.readyState) > -1) {
      button.set("text", "Cancel");
      httpStatusLabel.set("text", "");
      headerLabel.set("text", "");
      bodyLabel.set("text", "");
      sendRequest(urlText.get("text").toString());
    } else {
      xhr.abort();
    }
  });

  var xhr = new tabris.XMLHttpRequest();

  xhr.ontimeout = function() {
    error = "timeout";
    updateResponseLabel(this);
  };

  xhr.onerror = function() {
    error = "network error";
    updateResponseLabel(this);
  };

  xhr.onabort = function() {
    error = "aborted";
    updateResponseLabel(this);
  };

  xhr.onreadystatechange = function() {
    updateResponseLabel(xhr);
    if (xhr.readyState === xhr.DONE) {
      button.set("text", "Send request");
    }
  };

  xhr.onprogress = function(e) {
    progressBar.set("selection", e.loaded / e.total * 100);
  };

  xhr.timeout = 2000;



  function updateResponseLabel(xhr) {
    stateLabel.set("text", "<b>" + getStateName() + (error ? " (" + error + ")" : "") + "</b>");
    if (xhr.readyState === xhr.HEADERS_RECEIVED) {
      httpStatusLabel.set("text", "Response: " + xhr.status + " " + xhr.statusText);
      headerLabel.set("text", "Headers: " + xhr.getAllResponseHeaders().split(/\r\n|\r|\n/).length);
    }
    if (xhr.readyState === xhr.DONE) {
      bodyLabel.set("text", xhr.responseText.substr(0, Math.min(200, xhr.responseText.length)));
    }
  }

  function getStateName() {
    for (var key in xhr) {
      if(xhr[key] === xhr.readyState) {
        return key;
      }
    }
  }

  function sendRequest(url) {
    error = "";
    xhr.open("GET", url);
    xhr.send();
  }
  page.open();

});
