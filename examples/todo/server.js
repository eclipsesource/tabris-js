/*jshint node:true*/
(function() {

  var idCounter = 0;
  var restify = require("restify"), save = require("save")("todo", {idProperty: "id"});

  // initialize server
  var server = restify.createServer({name: "storage"})
                    .use(restify.queryParser())
                    .use(restify.fullResponse())
                    .use(restify.bodyParser())
                    .use(restify.queryParser());
  server.listen(3000, function () {
    console.log("%s listening at %s", server.name, server.url);
  });

  // handle HTTP methods
  server.get("/", function (req, res) {
    save.find({}, function (error, todos) {
      res.send(todos);
    });
  });
  server.put("/:id", function(req, res) {
    save.update(req.params);
    res.send();
  });
  server.post("/", function(req, res) {
    var todo = req.params;
    todo.id = idCounter++;
    save.create(todo);
    res.send({id: todo.id});
  });
  server.del("/:id", function(req, res) {
    save.delete(req.params.id);
    res.send();
  });

  // add sample todo entries
  save.create({id: idCounter++, title:"Buy milk"});
  save.create({id: idCounter++, title:"Buy carrots"});
  save.create({id: idCounter++, title:"Buy tomatoes"});
  save.create({id: idCounter++, title:"Drink beer", priority:2});
  save.create({id: idCounter++, title:"Go to sleep", priority:0});

}());