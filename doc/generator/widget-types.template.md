# Widget Types

This section describes the API specific to different types of widgets.

<%=
  types.map(function(desc) {
    grunt.log.verbose.writeln("Generating DOC for " + desc.type);
    return grunt.template.process(templates.widget, {data: {
      desc: desc, templates: templates, includes: includes
    }});
  }).join("")
%>
