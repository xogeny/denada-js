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

function checkElement(elem, rule) {
    if (elem.element!==rule.element) return false;
    if (elem.element=="declaration") {
    } else if (elem.element=="definition") {
    } else {
	return false;
    }
    return true;
}

function checkContents(tree, rules) {
    var issues = [];
    var rule;
    var desc;
    var ruledata = {};
    var rulename;
    var endswith;
    var min;
    var max;
    for(var i=0;i<rules.length;i++) {
	min = undefined;
	max = undefined;
	rule = rules[i];
	desc = rule.description;
	if (desc) {
	    endswith = desc.slice(-1);
	    rulename = desc.slice(0,desc.length-1);
	    if (endswith=="*") {
		min = 0;
	    } else if (endswith=="+") {
		min = 1;
	    } else if (endswith=="?") {
		min = 0;
		max = 1;
		ruledata[rulename] = {"rule": rule, "rulename": rulename, "min": 0, "max": 1};
	    } else {
		rulename = desc;
		min = 1;
		max = 1;
	    }
	    if (ruledata.hasOwnProperty(rulename)) {
		if (ruledata[rulename].desc!==desc) {
		    throw "Rule "+rulename+" has mismatched cardinality: "+
			ruledata[rulename].desc+" vs. "+desc;
		}
		ruledata[rulename].matches.push(rule);
	    } else {
		ruledata[rulename] = {
		    "matches": [rule],
		    "rulename": rulename,
		    "count": 0,
		    "desc": desc,
		    "min": 1,
		    "max": 1};
	    }
	} else {
	    issues.push("Rule without rulename: "+rule);
	}
    }
    //console.log("Rule data: ");
    //console.log(ruledata);

    var elem;
    var data;
    var matched;
    for(var i=0;i<tree.length;i++) {
	elem = tree[i];
	matched = false;
	for(var j in ruledata) {
	    data = ruledata[j];
	    for(var k=0;k<data.matches.length;k++) {
		rule = data.matches[k];
		if (checkElement(elem, rule)) {
		    matched = true;
		    data.count = data.count+1;
		    break;
		}
	    }
	    if (matched) break;
	}
	if (!matched) issues.push("Unable to find a matching rule for "+elem);
    }

    for(var j in ruledata) {
	data = ruledata[j];
	if (data.min && data.count<data.min) {
	    issues.push("Expected at least "+data.min+" matches for rule "+data.rulename+
			" but found "+data.count);
	}
	if (data.max && data.count>data.max) {
	    issues.push("Expected at most "+data.max+" matches for rule "+data.rulename+
			" but found "+data.count);
	}
    }
    return issues;
}

exports.process = function(tree, rules) {
    var issues = checkContents(tree, rules);
    return (tree, issues);
}
