<%=desc.type ? "### Properties" : ""%>

<%for(var prop in desc.properties){
%>- *<%=prop%>*: <%=(function(value) {
    var type = value.split(":")[0];
    var def = value.split("?")[1] || "";
    var allowed = value.indexOf(":") !== -1 ? value.split(":")[1].split("?")[0] : "";
    var result = "`" + type + "`";
    if (allowed) {
      result += ", possible values: \"" + allowed.split("|").join("\", \"") + "\"";
    }
    if (def) {
      result += ", default value: \"" + def + "\"";
    }
    return result;
   }(desc.properties[prop]))%>
<%}%>
