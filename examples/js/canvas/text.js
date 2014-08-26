tabris.load(function() {

  var page = tabris.createPage({
    title: "Text",
    topLevel: true
  });

  var canvas = page.append("Canvas", {
    layoutData: {left: 10, top: 10, right: 10, bottom: 10}
  });

  var ctx = tabris.getContext(canvas, 500, 700);

  ctx.strokeStyle="red";
  ctx.moveTo(5,100);
  ctx.lineTo(500,100);
  ctx.stroke();

  ctx.textBaseline="top";
  ctx.fillText("Top",5,100);
  ctx.textBaseline="bottom";
  ctx.fillText("Bottom",50,100);
  ctx.textBaseline="middle";
  ctx.fillText("Middle",120,100);
  ctx.textBaseline="alphabetic";
  ctx.fillText("Alphabetic",190,100);
  ctx.textBaseline="ideographic";
  ctx.fillText("Ideographic",390,100);
  ctx.textBaseline="hanging";
  ctx.fillText("Hanging",290,100);

  ctx.strokeStyle="red";
  ctx.moveTo(150,120);
  ctx.lineTo(150,270);
  ctx.stroke();

  ctx.textAlign="start";
  ctx.fillText("start",150,160);
  ctx.textAlign="end";
  ctx.fillText("end",150,180);
  ctx.textAlign="left";
  ctx.fillText("left",150,200);
  ctx.textAlign="center";
  ctx.fillText("center",150,220);
  ctx.textAlign="right";
  ctx.fillText("right",150,240);

});