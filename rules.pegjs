start
  = rule

rule
  = rec:recursive? name:rulename card:cardinality? {
    return {
      recursive: rec!=undefined,
      name: name,
      cardinality: card || { min: 1, max: 1 }
    }
  }

rulename
  = [a-zA-Z_]+

recursive
  = "^" { return true; }

cardinality
  = "+" { return {min: 1} } / "*" { return {min: 0} } / "?" { return {min: 0, max: 1} }
