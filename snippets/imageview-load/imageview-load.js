var page = new tabris.Page({
  title: "ImageView load event",
  topLevel: true
});

new tabris.ImageView({
  right: "50% +8", bottom: "50% +8", width: 64, height: 64,
  background: "#dedede",
  image: {src: "images/cloud-check.png", scale: 3}
}).on("load", function(imageView, event) {
  handleLoad("#textView1", event);
}).appendTo(page);

new tabris.TextView({
  id: "textView1",
  right:"50% +8", top: "50% +8", width: 64,
  alignment: "center"
}).appendTo(page);

new tabris.ImageView({
  left: "50% +8", bottom: "50% +8", width: 64, height: 64,
  background: "#dedede",
  image: {src: "unavailable.png", scale: 3}
}).on("load", function(imageView, event) {
  handleLoad("#textView2", event);
}).appendTo(page);

new tabris.TextView({
  id: "textView2",
  left: "50% +8", top: "50% +8", width: 64,
  alignment: "center"
}).appendTo(page);

function handleLoad(textViewId, event) {
  page.find(textViewId).set("text", event.error ? "Error" : "Success");
}

page.open();
