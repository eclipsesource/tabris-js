tabris.load(function() {

  var MARGIN = 12;
  var httpRequest = null;

  var page = tabris.createPage({
    title: "XMLHttpRequest",
    topLevel: true
  });

  var urlText = page.append("Text", {
    layoutData: {left: MARGIN, right: MARGIN, top: MARGIN},
    message: "Request url",
    text: "http://85.214.110.251/protected/Tabris-trial-SDK-1.4.0-preview.zip"
  });

  var button = page.append("Button", {
    layoutData: {left: MARGIN, right: MARGIN, top: [urlText, MARGIN]},
    text: "Send request"
  });

  var progressBar = page.append("ProgressBar", {
    style: ["WRAP"],
    layoutData: {left: MARGIN, right: MARGIN, top: [button, MARGIN]},
    markupEnabled: true,
    minimum: 0,
    maximum: 100,
    selection: 0
  });

  var stateLabel = page.append("Label", {
    style: ["WRAP"],
    markupEnabled: true,
    layoutData: {left: MARGIN, right: MARGIN, top: [progressBar, MARGIN]}
  });

  var httpStatusLabel = page.append("Label", {
    style: ["WRAP"],
    markupEnabled: true,
    layoutData: {left: MARGIN, right: MARGIN, top: [stateLabel, MARGIN]}
  });

  var headerLabel = page.append("Label", {
    style: ["WRAP"],
    markupEnabled: true,
    layoutData: {left: MARGIN, right: MARGIN, top: [httpStatusLabel, MARGIN]}
  });

  var bodyLabel = page.append("Label", {
    style: ["WRAP"],
    markupEnabled: true,
    layoutData: {left: MARGIN, right: MARGIN, top: [headerLabel, MARGIN]}
  });

  button.on("Selection", function() {
    progressBar.set("selection", 0);
    if (httpRequest === null) {
      button.set("text", "Cancel");
      httpStatusLabel.set("text", "");
      headerLabel.set("text", "");
      bodyLabel.set("text", "");
      sendRequest(urlText.get("text").toString());
    } else {
      httpRequest.call("abort");
    }
  });

  function updateResponseLabel(e) {
    stateLabel.set("text", "<b>" + e.state + "</b>");
    if (e.state == "headers") {
      httpStatusLabel.set("text", "Response: " + e.code + " " + e.message);
      headerLabel.set("text", "Headers: " + Object.keys(e.headers).length);
    }
    if (e.state == "finished") {
      bodyLabel.set("text", e.response.substr(0, Math.min(200, e.response.length)));
    }
  }

  function sendRequest(url) {
    httpRequest = tabris.create("tabris.HttpRequest");
    httpRequest.on("StateChange", function(e) {
      console.log(e.state);
      updateResponseLabel(e);
      if (requestEnded(e)) {
        button.set("text", "Send request");
        httpRequest.dispose();
        httpRequest = null;
      }
    });
    httpRequest.call("send", {
      url: url,
      method: "GET",
      headers: {
        "Accept-Encoding": "gzip,deflate"
      },
      timeout: 2000
    });
    httpRequest.on("DownloadProgress", function(e) {
      progressBar.set("selection", e.loaded / e.total * 100);
    });
  }

  function requestEnded(e) {
    return e.state == "finished" || e.state == "aborted" || e.state == "error" || e.state == "timeout";
  }

  page.open();

});
