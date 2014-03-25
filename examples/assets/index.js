var denada = require('../../denada');

var grammar = denada.parseFileSync('assetGrammar.dnd');
var tree = denada.parseFileSync('assets.dnd');

var issues = denada.process(tree, grammar);
console.log(issues.join("\n"));

function isComputer(d) { return d.rulename==="computer"; }
function prettyPrint(d) { return d.name+": "+d.decl.model.value+" @ "+d.decl.location.value; }

var computers = denada
    .flatten(tree, isComputer)
    .map(prettyPrint);

console.log("Computers:\n"+computers.join(", "));

var assets = denada
    .flatten(tree, denada.pred.isDefinition)
    .map(prettyPrint);

console.log("Assets:\n"+assets.join("\n"));
