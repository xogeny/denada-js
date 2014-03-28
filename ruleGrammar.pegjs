start
  = rule

rule
  = rec:recursive? name:rulename card:cardinality? {
    var ret = {};
    var cardinality = card || { min: 1, max: 1 };
    ret["recursive"] = rec!=undefined;
    ret["name"] = name;
    ret["min"] = cardinality.min;
    ret["max"] = cardinality.max;
    return ret;
  }

rulename
  = chars:[a-zA-Z_]+ { return chars.join(""); }

recursive
  = "^" { return true; }

cardinality
  = "+" { return {min: 1} } / "*" { return {min: 0} } / "?" { return {min: 0, max: 1} }
