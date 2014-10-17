## <%=desc.type ? desc.type : desc.title%>

<%=desc.description%>
<%=(function(){
  var result = "";
  if (desc.include) {
    result += "Includes ";
    result += desc.include.map(function(include) {
      if(!includes[include]) {
        throw new Error("Could not find include " + include);
      }
      var incTitle = includes[include].title;
      return "<a href='#" + incTitle.replace( " ", "_" ) + "'>" + incTitle + "</a>";
    }).join(", ");
  }
  return result;
}())%>

<%=desc.properties ? grunt.template.process(templates.props, {data: {desc: desc}}) : ""%>

<%=desc.events ? grunt.template.process(templates.events, {data: {desc: desc}}) : ""%>
