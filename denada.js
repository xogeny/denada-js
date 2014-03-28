var grammar = require('./grammar');
var ruleGrammar = require('./ruleGrammar');
var fs = require('fs');

function addNamed(d) {
    if (d.element=="declaration") return;
    if (!d.hasOwnProperty("decl")) d["decl"] = {}
    if (!d.hasOwnProperty("def")) d["def"] = {}
    for(var i=0;i<d.contents.length;i++) {
	var elem = d.contents[i];
	if (elem.element==="definition") d["def"][elem.name] = elem;
	if (elem.element==="declaration") d["decl"][elem.varname] = elem;
    }
}

exports.parse = function(s, options) {
    var ast;
    var msg;
    try {
	ast = grammar.parse(s);
	if (ast==null || ast==undefined) {
	    throw new Error("Parse failed to return a valid tree: "+args.tree);
	}
	exports.visit(ast, addNamed);
	return ast;
    } catch(e) {
	if (e.file==null) {
	    msg = e.name+" on line "+e.line+" (column "+e.column+"): "+e.message;
	} else {
	    msg = e.name+" on line "+e.line+" (column "+e.column+") of "+e.file+": "+e.message;
	}
	throw new Error(msg);
    }
}

exports.parseFileSync = function(s, options) {
    var contents;
    contents = fs.readFileSync(s, 'utf8');
    return exports.parse(contents, options);
}

exports.parseFile = function(s, callback) {
    fs.readFile(s, 'utf8', function(err, res) {
	var ast;
	if (err) callback(err);
	try {
	    ast = exports.parse(res);
	    callback(undefined, ast);
	} catch(e) {
	    callback(e);
	}
    });
}

function matchIdentifier(id, pattern) {
    // If the pattern is just the wildcard character, it is
    // always a match
    if (pattern==="_") return true;

    // If the pattern is (or could be) an unquoted identifier,
    // assume that it must be an exact match...
    if (pattern.match("^[a-zA-Z_]+$")) {
	return id===pattern;
    }

    // Otherwise, assume the pattern is a regexp
    return id.match(pattern)!=null;
}

function matchValue(val, pattern) {
    // If the pattern is a string then we must handle some special cases
    if (typeof(pattern)=="string") {
	// If the pattern starts with $, the rest is a pattern to match against
	// the type of the value
	if (pattern[0]=="$") {
	    var vtype = typeof(val);
	    var pat = pattern.slice(1);
	    if (pat==="_") return true;
	    if (vtype.match(pat)!=null) return true;
	    return false;
	} else if (typeof(val)=="string") {
	    // If the value is a string, then we treat the pattern
	    // as a regexp or wildcard
	    if (pattern==="_") return true;
	    if (val.match(pattern)!=null) return true;
	    return false;
	} else {
	    // We get here if the pattern is a string but the value
	    // is not.  In that case, no match is possible
	    return false;
	}
    }
    // If pattern isn't a string, then just check for literal equality
    return val===pattern;
}

function matchModifiers(obj, patterns) {
    var matched;
    for(var op in obj) {
	matched = false;
	for(var pp in patterns) {
	    var imatch = matchIdentifier(op, pp);
	    var vmatch = matchValue(obj[op], patterns[pp]);
	    if (imatch && vmatch) {
		matched = true;
		break;
	    }
	}
	if (!matched) return false;
    }
    return true;
}

function matchQualifiers(quals, patterns, reasons) {
    var required = [];
    var count = [];
    var pats = [];
    var matched;
    var pat;
    for(var j=0;j<patterns.length;j++) {
	if (patterns[j].slice(-1)=="?") {
	    pat = patterns[j].substr(0,patterns[j].length-1)
	    required.push(false);
	} else {
	    pat = patterns[j]
	    required.push(true);
	}
	pats.push(pat);
	count.push(0);
    }
    for(var i=0;i<quals.length;i++) {
	matched = false;
	for(var j=0;j<patterns.length;j++) {
	    if (matchIdentifier(quals[i], pats[j])) {
		matched = true;
		count[j]++;
		break;
	    }
	}
	if (!matched) return false;
    }
    for(var j=0;j<patterns.length;j++) {
	if (required[j] && count[j]==0) {
	    reasons.push("missing required qualifier "+pats[j]);
	    return false;
	}
    }
    return true;
}

function matchDeclaration(elem, rule, data, reasons) {
    if (!matchIdentifier(elem.typename, rule.typename)) {
	reasons.push("Type name "+elem.typename+" didn't match name pattern "+
		     rule.typename+" for rule "+data.rulename);
	return false;
    }
    if (!matchIdentifier(elem.varname, rule.varname)) {
	reasons.push("Variable name "+elem.varname+" didn't match name pattern "+
		     rule.varname+" for rule "+data.rulename);
	return false;
    }
    if (!matchValue(elem.value, rule.value)) {
	reasons.push("Assigned value "+elem.value+" didn't match value pattern "+
		     rule.value+" for rule "+data.rulename);
	return false;
    }
    if (!matchModifiers(elem.modifiers, rule.modifiers)) {
	reasons.push("Modifications didn't match set of potential modifications "+
		     " for rule "+data.rulename);
	return false;
    }
    if (!matchQualifiers(elem.qualifiers, rule.qualifiers, reasons)) {
	reasons.push(elem.qualifiers.toString()+" didn't match set of potential qualifiers "+
		     rule.qualifiers.toString()+" for rule "+data.rulename);
	return false;
    }
    return true;
}

function matchDefinition(elem, rule, data, context, issues, reasons) {
    var subissues;
    if (!matchIdentifier(elem.name, rule.name)) {
	reasons.push("Name "+elem.name+" didn't match name pattern "+
		     rule.name+" for rule "+data.rulename);
	return false;
    }
    if (!matchQualifiers(elem.qualifiers, rule.qualifiers)) {
	reasons.push(elem.qualifiers.toString()+" didn't match set of potential qualifiers "+
		     rule.qualifiers.toString()+" for rule "+data.rulename);
	return false;
    }
    if (!matchModifiers(elem.modifiers, rule.modifiers)) {
	reasons.push("Modifications didn't match set of potential modifications "+
		     " for rule "+data.rulename);
	return false;
    }
    subissues = checkContents(elem.contents, context || rule.contents)
    for(var i=0;i<subissues.length;i++) issues.push(subissues[i]);
    return true;
}

function matchElement(elem, rule, data, context, issues, reasons) {
    // If these aren't even the same type of element, they don't match
    if (elem.element!==rule.element) return false;
    if (elem.element=="declaration")
	return matchDeclaration(elem, rule, data, reasons);
    if (elem.element=="definition")
	return matchDefinition(elem, rule, data, context, issues, reasons);
    throw new Error("Unexpected element type: "+elem.element);
}

/*
 * This function checks a given ast, tree, against another ast, rules, that
 * that represents the patterns in the AST that are allowed.
 */
function checkContents(tree, rules) {
    var rule;
    var desc;
    var rulename;
    var endswith;
    var startswith;
    var recursive;
    var min;
    var max;
    var elem;
    var data;
    var matched;
    var result;
    var reasons;
    var pdata;

    var issues = []; // List of issues found (initially empty)
    var subissues; // Used to record nested issues
    var ruledata = {}; // Collection of rules found in the rules ast

    /* We start by looping over the rules and processing each rule we
       find to collect information for the `ruledata` collection. */
    for(var i=0;i<rules.length;i++) {
	/* Assume there are no min or max matches required, in general */
	min = undefined;
	max = undefined;
	/* Extract the specific element for this rule */
	rule = rules[i];
	/* Extract the description for the rule.  The description contains
	   the name of the rule and indicates its cardinality. */
	desc = rule.description;
	if (desc) {
	    pdata = ruleGrammar.parse(desc);
	    recursive = pdata.recursive;
	    rulename = pdata.name;
	    min = pdata.min;
	    max = pdata.max;

	    // Check to see if we already have a rule with this name...
	    if (ruledata.hasOwnProperty(rulename)) {
		// ...if so, make sure cardinality matches...
		if (ruledata[rulename].desc!==desc) {
		    throw new Error("Rule "+rulename+" has mismatched cardinality: "+
				    ruledata[rulename].desc+" vs. "+desc);
		}
		// ...and then add the current rule as a potential match
		ruledata[rulename].matches.push(rule);
	    } else {
		// ...if not, initialize the rule data for this rule
		ruledata[rulename] = {
		    "matches": [rule],
		    "recursive": recursive,
		    "rulename": rulename,
		    "count": 0,
		    "desc": desc,
		    "min": min,
		    "max": max};
	    }
	    // Add the rule data to the rule
	    rule["ruledata"] = {
		"recursive": recursive,
		"rulename": rulename,
		"desc": desc,
		"min": min,
		"max": max
	    };
	} else {
	    // Found an element in the rule tree with no rule name or cardinality information
	    issues.push("Rule without rulename: "+rule);
	}
    }

    // Now that we have all the rule data collected...

    // ...we loop through the elements in `tree`...
    for(var i=0;i<tree.length;i++) {
	elem = tree[i];
	matched = false;
	// ..and then we loop through the rules to see if this element
	// matches any of the rules.
	reasons = [];
	for(var j in ruledata) {
	    data = ruledata[j];
	    for(var k=0;k<data.matches.length;k++) {
		rule = data.matches[k];
		subissues = [];
		result = matchElement(elem, rule, data, data.recursive ? rules : null,
				      subissues, reasons);

		// No match found, continue searching
		if (result===false) continue;

		// If we get here, we have a match.  But, `result` is a list
		// of any issues encountered deeper down in the hierarchy.  So
		// we need to indicate we found a match and include any issues
		// that were identified...

		// Indicate we found a match
		matched = true;
		// Annotate the tree with information about which rule it matched
		elem["rulename"] = data.rulename
		elem["count"] = data.count
		// Record the fact that we found another match for this rule
		data.count = data.count+1;
		// Append any issues we found deeper in the tree hierarchy
		issues = issues.concat(subissues);
		// Indicate we're done searching
		break;
	    }
	    // If we've found a match, we can stop searching for one
	    if (matched) break;
	}
	// If we get here and no match was found, report it.
	if (!matched) {
	    issues.push("Line "+elem.line+", column "+elem.column+
			(elem.file==null ? "" : "of "+elem.file)+
			": Unable to find a matching rule for element: "+
			exports.unparse(elem, true)+" because\n  "+reasons.join("\n  "));
	}
    }

    // Now that we've checked each element in `tree` to see if it has a match,
    // let's check to make sure that each rule had the appropriate number of
    // matches.
    for(var j in ruledata) {
	data = ruledata[j];
	// If a minimum was specified, make sure we met it.
	if (data.min && data.count<data.min) {
	    issues.push("Expected at least "+data.min+" matches for rule "+data.rulename+
			" but found "+data.count);
	}
	// If a maximum was specified, make sure we didn't exceed it.
	if (data.max && data.count>data.max) {
	    issues.push("Expected at most "+data.max+" matches for rule "+data.rulename+
			" but found "+data.count);
	}
    }

    // Return any issues we found.
    return issues;
}

exports.process = function(tree, rules) {
    if (tree==null || tree==undefined) {
	return ["Invalid input tree: "+tree];
    }
    /* Compare tree to rules and collect any issues found */
    var issues = checkContents(tree, rules);
    /* Return the tree and the issues */
    return issues;
}

function unparseIdentifier(id) {
    if (id.match("^[_a-zA-z]+$")!=null) return id
    else return "'"+id+"'";
}

function unparseQualifiers(quals) {
    return quals.join(" ")+(quals.length>0 ? " " : "");
}

function unparseValue(val) {
    if (typeof(val)=="string") { return '"'+val+'"'; }
    return val.toString();
}

function unparseModifiers(mods) {
    if (Object.keys(mods).length>0) {
	mods = []
	for(var k in mods) {
	    mods.push(unparseIdentifier(k)+"="+unparseValue(mods[k]));
	}
	return "("+mods.join(",")+")";
    }
    return "";
}

function stringFill3(x, n) { 
    var s = ''; 
    for (;;) { 
        if (n & 1) s += x; 
        n >>= 1; 
        if (n) x += x; 
        else break; 
    } 
    return s; 
}

function unparse(elem, indent, recursive) {
    var ret = "";
    var mods = [];
    ret = ret+stringFill3(" ", indent);
    if (elem.element=="definition") {
	ret = ret+unparseQualifiers(elem.qualifiers);
	ret = ret+unparseIdentifier(elem.name);
	if (elem.modifiers!=null) ret = ret+unparseModifiers(elem.modifiers);
	if (elem.description!=null) {
	    ret = ret + ' "'+elem.description+'"';
	}
	if (recursive) {
	    ret = ret+" {\n";
	    for(var i=0;i<elem.contents.length;i++) {
		ret = ret+unparse(elem.contents[i], indent+2, recursive);
	    }
	    ret = ret+stringFill3(" ", indent)+"}\n";
	} else {
	    ret = ret + " { ... }";
	}
    } else if (elem.element=="declaration") {
	// Qualifiers
	ret = ret+unparseQualifiers(elem.qualifiers);
	ret = ret+unparseIdentifier(elem.typename)+" "+unparseIdentifier(elem.varname);
	if (elem.modifiers!=null) ret = ret+unparseModifiers(elem.modifiers);
	if (elem.value!=null) {
	    ret = ret+"="+unparseValue(elem.value);
	}
	if (elem.description!=null) {
	    ret = ret + ' "'+elem.description+'"';
	}
	ret = ret+";\n";
    } else {
	throw new Error("Invalid element: "+elem);
    }
    return ret;
}

exports.unparse = function(tree, recursive) {
    var ret = "";
    var recurse = recursive || true;
    if (tree instanceof Array) {
	for(var i=0;i<tree.length;i++) {
	    ret = ret + unparse(tree[i], 0, recursive);
	}
    } else {
	ret = ret + unparse(tree, 0, recursive);
    }
    return ret;
}

exports.visit = function(tree, f) {
    for(var i=0;i<tree.length;i++) {
	f(tree[i]);
	if (tree[i].element=="definition") {
	    exports.visit(tree[i].contents, f);
	}
    }
}

exports.flatten = function(tree, filter) {
    var elems = [];
    exports.visit(tree, function(e) {
	if (filter) { if (filter(e)) elems.push(e); }
	else elems.push(e);
    });
    return elems;
}

/* Some useful predicates that can be used for filtering */
exports.pred = {};
exports.pred.isDefinition = function (d) { return d.element==="definition"; }
exports.pred.matchesRule = function(pat) {
    return function(d) {
	return d.hasOwnProperty("rulename") && d.rulename.match(pat)!=null;
    }
}
exports.pred.hasQualifier = function(qual) {
    return function(d) {
	for(var i=0;i<d.qualifiers.length;i++) {
	    if (d.qualifiers[i].match(qual)!=null) return true;
	}
	return false;
    }
}
