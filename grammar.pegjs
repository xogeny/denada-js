{
}

/* ===== Syntactical Elements ===== */

start
  = element*

element
  = declaration
  / definition

declaration
  = _ ids:(id:identifier _ { return id; })+ mods:modifiers?
    val:assignment dstr:dstring ";" _ {
    return {
      "element": "declaration",
      "qualifiers": ids.slice(0, ids.length-2),
      "typename": ids.slice(-2, -1)[0],
      "varname": ids.slice(-1)[0],
      "modifiers": mods,
      "value": val,
      "description": dstr,
      "file": null,
      "line": line(),
      "column": column()
    };
  }

modification
  = _ id:identifier _ "=" _ e:expr _ { return [id, e]; }

modifiers
  = "(" con:(head:modification rest:("," m:modification { return m; })* {
      var ret = {};
      rest.push(head);      
      for(var i=0;i<rest.length;i++) { ret[rest[i][0]] = rest[i][1]; }
      return ret;
  })? ")" { return con ? con : {}; }

definition
  = ids:(id:identifier _ { return id; })+ mods:modifiers? dstr:dstring _ "{"
    _ contents: (elem:element _ { return elem; })* "}" _ {
    return {
      "element": "definition",
      "qualifiers": ids.slice(0, ids.length-1),
      "name": ids.slice(-1)[0],
      "modifiers": mods,
      "description": dstr,
      "contents": contents,
      "file": null,
      "line": line(),
      "column": column()
    };
  }

dstring
  = (_ s:string { return s; })?

assignment
  = (_ "=" _ e:expr { return e; })?

identifier
  = chars:[a-zA-Z_0-9]+ { return chars.join(""); }
  / "'" chars:[^'\\\0-\x1F\x7f]+ "'" { return chars.join(""); }

expr
  = value

json
  = _ object:object { return object; }

object
  = "{" _ "}" _                 { return {};      }
  / "{" _ members:members "}" _ { return members; }

members
  = head:pair tail:("," _ pair)* {
      var result = {};
      result[head[0]] = head[1];
      for (var i = 0; i < tail.length; i++) {
        result[tail[i][2][0]] = tail[i][2][1];
      }
      return result;
    }

pair
  = name:string ":" _ value:value { return [name, value]; }

array
  = "[" _ "]" _                   { return [];       }
  / "[" _ elements:elements "]" _ { return elements; }

elements
  = head:value tail:("," _ value)* {
      var result = [head];
      for (var i = 0; i < tail.length; i++) {
        result.push(tail[i][2]);
      }
      return result;
    }

value
  = string
  / number
  / object
  / array
  / "true" _  { return true;  }
  / "false" _ { return false; }
  / "null" _  { return null;  }

/* ===== Lexical Elements ===== */

string "string"
  = '"' '"' _             { return "";    }
  / '"' chars:chars '"' _ { return chars; }

chars
  = chars:char+ { return chars.join(""); }

char
  // In the original JSON grammar: "any-Unicode-character-except-"-or-\-or-control-character"
  = [^"\\\0-\x1F\x7f]
  / '\\"'  { return '"';  }
  / "\\\\" { return "\\"; }
  / "\\/"  { return "/";  }
  / "\\b"  { return "\b"; }
  / "\\f"  { return "\f"; }
  / "\\n"  { return "\n"; }
  / "\\r"  { return "\r"; }
  / "\\t"  { return "\t"; }
  / "\\u" digits:$(hexDigit hexDigit hexDigit hexDigit) {
      return String.fromCharCode(parseInt(digits, 16));
    }

number "number"
  = parts:$(int frac exp) _ { return parseFloat(parts); }
  / parts:$(int frac) _     { return parseFloat(parts); }
  / parts:$(int exp) _      { return parseFloat(parts); }
  / parts:$(int) _          { return parseFloat(parts); }

int
  = digit19 digits
  / digit
  / "-" digit19 digits
  / "-" digit

frac
  = "." digits

exp
  = e digits

digits
  = digit+

e
  = [eE] [+-]?

/*
 * The following rules are not present in the original JSON gramar, but they are
 * assumed to exist implicitly.
 *
 * FIXME: Define them according to ECMA-262, 5th ed.
 */

digit
  = [0-9]

digit19
  = [1-9]

hexDigit
  = [0-9a-fA-F]

/* ===== Whitespace ===== */

_ "whitespace"
  = whitespace*

// Whitespace is undefined in the original JSON grammar, so I assume a simple
// conventional definition consistent with ECMA-262, 5th ed.
whitespace
  = [ \t\n\r]
