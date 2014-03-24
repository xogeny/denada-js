var grammar = require('./grammar');
var fs = require('fs');

exports.parse = function(s) {
    try {
	return grammar.parse(s);
    } catch(e) {
	throw {
	    message: "Syntax error on line "+e.line+" (column "+e.column+"): "+e.message
	};
    }
}

exports.parseFileSync = function(s) {
    var contents;
    contents = fs.readFileSync(s, 'utf8');
    try {
	return grammar.parse(contents);
    } catch(e) {
	throw {
	    message: "Syntax error on line "+e.line+" (column "+e.column+") of "+s+": "+e.message
	};
    }
}

exports.parseFile = function(s, callback) {
    fs.readFile(s, 'utf8', function(err, res) {
	var ast;
	if (err) callback(err);
	try {
	    ast = grammar.parse(res);
	    callback(undefined, ast);
	} catch(e) {
	    callback({
		message: "Syntax error on line "+e.line+" (column "+e.column+") of "+s+": "+e.message
	    });
	}
    });
}

function matchIdentifier(id, pattern) {
    return pattern==="_" || id.match(pattern)!=null;
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
	    if (vtype.match(pat)) return true;
	    return false;
	} else if (typeof(val)=="string") {
	    // If the value is a string, then we treat the pattern
	    // as a regexp or wildcard
	    if (pattern==="_") return true;
	    if (val.match(pattern)) return true;
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

function matchQualifiers(quals, patterns) {
    var matched;
    for(var i=0;i<quals.length;i++) {
	matched = false;
	for(var j=0;j<patterns.length;j++) {
	    if (matchIdentifier(quals[i], patterns[j])) {
		matched = true;
		break;
	    }
	}
	if (!matched) return false;
    }
    return true;
}

function matchDeclaration(elem, rule) {
    if (!matchIdentifier(elem.typename, rule.typename)) return false;
    if (!matchIdentifier(elem.varname, rule.varname)) return false;
    if (!matchValue(elem.value, rule.value)) return false;
    if (!matchModifiers(elem.modifiers, rule.modifiers)) return false;
    if (!matchQualifiers(elem.qualifiers, rule.qualifiers)) return false;
    return [];
}

function matchDefinition(elem, rule, context) {
    if (!matchIdentifier(elem.name, rule.name)) return false;
    if (!matchQualifiers(elem.qualifiers, rule.qualifiers)) return false;
    return checkContents(elem.contents, context || rule.contents);
}

function matchElement(elem, rule, context) {
    // If these aren't even the same type of element, they don't match
    if (elem.element!==rule.element) return false;
    if (elem.element=="declaration") return matchDeclaration(elem, rule);
    if (elem.element=="definition") return matchDefinition(elem, rule, context);
    throw "Unexpected element type: "+elem.element;
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

    var issues = []; // List of issues found (initially empty)
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
	    // Extract the last character in the description
	    endswith = desc.slice(-1);
	    startswith = desc[0];

	    // Determine if this is a recursive rule
	    if (startswith=="^") {
		recursive = true;
		rulename = desc.slice(1,desc.length);
	    } else {
		recursive = false;
		rulename = desc;
	    }

	    if (endswith=="*") {
		// Cardinality - Zero or more
		min = 0;
		rulename = rulename.slice(0,rulename.length-1);;
	    } else if (endswith=="+") {
		// Cardinality - One or more
		min = 1;
		rulename = rulename.slice(0,rulename.length-1);;
	    } else if (endswith=="?") {
		// Cardinality - Optional
		min = 0;
		max = 1;
		rulename = rulename.slice(0,rulename.length-1);;
	    } else {
		// If none of the above, assume exactly one is required
		min = 1;
		max = 1;
	    }

	    // Check to see if we already have a rule with this name...
	    if (ruledata.hasOwnProperty(rulename)) {
		// ...if so, make sure cardinality matches...
		if (ruledata[rulename].desc!==desc) {
		    throw "Rule "+rulename+" has mismatched cardinality: "+
			ruledata[rulename].desc+" vs. "+desc;
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
	for(var j in ruledata) {
	    data = ruledata[j];
	    for(var k=0;k<data.matches.length;k++) {
		rule = data.matches[k];
		result = matchElement(elem, rule, data.recursive ? rules : null);
		// No match found, continue searching
		if (result===false) continue;

		// If we get here, we have a match.  But, `result` is a list
		// of any issues encountered deeper down in the hierarchy.  So
		// we need to indicate we found a match and include any issues
		// that were identified...

		// Indicate we found a match
		matched = true;
		// Annotate the tree with information about which rule it matched
		elem["match"] = {"rulename": data.rulename, "count": data.count};
		// Record the fact that we found another match for this rule
		data.count = data.count+1;
		// Append any issues we found deeper in the tree hierarchy
		issues = issues.concat(result);
		// Indicate we're done searching
		break;
	    }
	    // If we've found a match, we can stop searching for one
	    if (matched) break;
	}
	// If we get here and no match was found, report it.
	if (!matched) issues.push("Unable to find a matching rule for element: "+
				  JSON.stringify(elem));
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
    /* Compare tree to rules and collect any issues found */
    var issues = checkContents(tree, rules);
    /* Return the tree and the issues */
    return issues;
}
