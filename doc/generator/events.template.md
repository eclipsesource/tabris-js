<%=desc.type ? "### Events" : ""%>

<%= desc.events.map(function(name) {
  return "- " + name;
}).join("\n") %>
