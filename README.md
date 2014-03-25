# Denada - A declarative language for creating simple DSLs

## Background

Denada is based on a project I once worked on where we needed to build
and quickly evolve a simple domain-specific language (DSL).  But an
important aspect of the project was that there were several
non-developers involved.  We developed a language very similar to this
one that had several interesting properties (which I'll come to
shortly).  Recently, I was faced with a situation where I needed to
develop a DSL for a project and decided to follow the same approach.

I can already imagine people rolling their eyes at the premise.  But
give me five more minutes and I'll explain why I did it.

There are lots of different ways to build DSLs.  Let's take a quick
walk across the spectrum of possibilities.  One approach to DSL design
is to create an "internal DSL" where you simply use clever syntactic
tricks in some host language to create what looks like a domain
specific language but is really just a set of domain specific
primitives layered on top of an existing language.  Scala is
particularly good for things like this (using `implicit` constructs)
but you can do it in a number of languages (yes, Lisp works well for
this too...but I don't care for the aesthetics of homoiconic
representations).  The problem here is that you expose the user of the
language to the (potentiall complicated) semantics of the host
language.  Depending on the use case, leveraging the host language's
semantics could be a win (you need to implement similar semantics in
your language) or a loss (you add a bunch of complexity and sharp
edges to a language for non-experts).

Another approach is to create a so-called "extenral DSL".  For this,
you might using a parser generator (e.g. ANTLR) to create a parser for
your language.  This allows you to completely define your semantics
(without exposing people to the host language semantics).  This allows
you to control the complexity of the language.  But you've still got
to create the parser, debug parsing issues, generate a tree, and then
write code to walk the tree.  So this can be a significant investment
of time.  Sure, parser generators can really speed things up.  But
there are cases where some of this work can be skipped.

Another route you can go is to just use various markup languages to
try and represent your data.  Representations like XML, YAML, JSON or
even INI files can be used in this way.  But for some cases this is
either overly verbose, too "technical" or unreadable.

## So Why Denada?

The general philosophy of Denada is to define a syntax *a priori*.  As
a result, you don't need to write a parser for it.  You don't get a
choice about how the language looks.  Sure, it's fun to "design"
languages.  But there is a wide range of simple DSLs that can be
implemented naturally within the limited syntax of Denada.

So, I can already hear people saying "But if you've decided on the
syntax, you've already design **a** language, what's all this talk
about designing DSLs".  Although the syntax of Denada is defined, the
grammar isn't.  Denada allows us to impose a grammar on top of the
syntax in the same way that "XML Schemas" allow us to impose a
structure on top of XML.  And, like "XML Schemas" we use the same
syntax for the grammar as for the language.  But unlike anything XML
related, Denada looks (kind of) like a computer language designed for
humans to read.  It also includes a richer data model.

## An Example

To demonstrate how Denada works, let's work through a simple example.
Imagine I'm a system administator and I need a file format to list all
the assets in the company.

The generic syntax of Denada is simple.  There are two things you can
express in Denada.  One looks like a variable declaration and the
other expresses nested structure (which can contain instances of these
same two things).  For example, this is valid Denada code:

```
printer ABC {
   set location = "By my desk";
   set model = "HP 8860";
}
```

This doesn't really *mean* anything, but it conforms to the required
syntax.  Although this might be useful as is, the real use case for
Denada is defining a grammar the restricts what is permitted.  That's
because this is also completely legal:

```
aardvark ABC {
   set location = "By my desk";
   set order = "Tubulidentata";
}
```

So in this case, we want to restrict ourselves (initially) to
cataloging printers.  To do this, we specify a grammar for our assets
file.  Initially, our grammar could look like this:

```
printer _ "printer*" {
  set location = "$string" "location";
  set model = "$string" "model";
  set networkName = "$string" "name?";
}
```

Note how this looks almost exactly like our original input text?  That
is because grammars in Denada are Denada files.  They just have some
special annotations (not syntax!).  In this case, the "name" of the
printer is given as just `_`.  This is a wildcard in Denada means "any
identifier".  Also note the "descriptive string" following the printer
definition, `"printer*"`.  That means that this defines the `printer`
rule and the start indicates we can have zero or more of them in our
file.

Furthermore, this grammar defines the contents of a `printer`
specification.  It shows that there can be three lines inside a
printer definition.  The first is the `location` of the printer.  This
is mandatory because the rule name, `"location"` has no cardinality
specified.  Similarly, we also have a mandatory `model` property.
Finally, we have an optional `networkName` property.  We know it is
optional because the rule name `"name?"` ends with a `?`.

By defining the grammar in this way, we specify precisely what can be
included in the Denada file.  But let's not limit ourselves to
printers.  Assume we want to list the computers in the company too.
We would could simply create a new rule for computers, *e.g.,*

```
printer _ "printer*" {
  set location = "$string" "location";
  set model = "$string" "model";
  set networkName = "$string" "name?";
}

computer _ "computer*" {
  set location = "$string" "location";
  set model = "$string" "model";
  set networkName = "$string" "name?";
}
```

In this case, the contents of these definitions are the same, so we
could even do this:

```
'printer|computer' _ "asset*" {
  set location = "$string" "location";
  set model = "$string" "model";
  set networkName = "$string" "name?";
}
```

With just this simple grammar, we've created a parser for a DSL that
can parse our sample asset list above and flag errors.  The resulting
abstract syntax tree is just a JSON tree:

```
[
  {
    "element": "definition",
    "qualifiers": [
      "printer"
    ],
    "name": "ABC",
    "contents": [
      {
        "element": "declaration",
        "qualifiers": [],
        "typename": "set",
        "modifiers": null,
        "varname": "location",
        "value": "By my desk",
        "description": null,
	"rulename": "location",
        "count": 0
      },
      {
        "element": "declaration",
        "qualifiers": [],
        "typename": "set",
        "modifiers": null,
        "varname": "model",
        "value": "HP 8860",
        "description": null,
        "rulename": "model",
        "count": 0
      }
    ],
    "description": null,
    "rulename": "printer",
    "count": 0
  },
  {
    "element": "definition",
    "qualifiers": [
      "printer"
    ],
    "name": "DEF",
    "contents": [
      {
        "element": "declaration",
        "qualifiers": [],
        "typename": "set",
        "modifiers": null,
        "varname": "location",
        "value": "By my desk",
        "description": null,
        "rulename": "location",
        "count": 0
      },
      {
        "element": "declaration",
        "qualifiers": [],
        "typename": "set",
        "modifiers": null,
        "varname": "model",
        "value": "HP 8860",
        "description": null,
        "rulename": "model",
        "count": 0
      },
      {
        "element": "declaration",
        "qualifiers": [],
        "typename": "set",
        "modifiers": null,
        "varname": "networkName",
        "value": "PrinterDEF",
        "description": null,
        "rulename": "name",
        "count": 0
      }
    ],
    "description": null,
    "rulename": "printer",
    "count": 1
  },
  {
    "element": "definition",
    "qualifiers": [
      "computer"
    ],
    "name": "XYZ",
    "contents": [
      {
        "element": "declaration",
        "qualifiers": [],
        "typename": "set",
        "modifiers": null,
        "varname": "location",
        "value": "On my desk",
        "description": null,
        "rulename": "location",
        "count": 0
      },
      {
        "element": "declaration",
        "qualifiers": [],
        "typename": "set",
        "modifiers": null,
        "varname": "model",
        "value": "Mac Book Air",
        "description": null,
        "rulename": "model",
        "count": 0
      }
    ],
    "description": null,
    "rulename": "computer",
    "count": 0
  }
]
```

We can then walk this tree and extract the information we need.  By
using the grammar, we know exactly what content to expect in the
abstract syntax tree so we can minimize the amount of checking we need
to do when walking it.

Note how the tree has been marked up with information about the rule
that each node matched?  As we'll see in a minute, this will allow us
to quickly query for matches.

## AST Processing

In our asset tracking example, the AST is pretty large and includes a
lot of information.  If we need that information, then this is really
useful.  But there are many cases where we may not.

Let's imagine, for the sake of our example, that we simply wanted to
generate a decently formatted list of computers.  The following
example code shows a script that would read in our asset list from a
file named `assets.dnd`, check it against a grammar for that file (to
make sure the format conforms precisely to what we expect) and then
process the AST into a nice list:

```
var grammar = denada.parseFileSync('assetGrammar.dnd');
var tree = denada.parseFileSync('assets.dnd');

denada.process(tree, grammar);

function isComputer(d) { return d.rulename==="computer"; }
function prettyPrint(d) { return d.name+": "+d.decl.model.value+" @ "+d.decl.location.value; }

var computers = denada
    .flatten(tree, isComputer)
    .map(prettyPrint);

console.log("Computers:\n"+computers.join(", "));
```

The resulting output from this script would be:

```
Computers:
XYZ: Mac Book Air @ Coffee machine
```

If we wanted to output all the assets according to this format, we
might change the script to be:

```
var grammar = denada.parseFileSync('assetGrammar.dnd');
var tree = denada.parseFileSync('assets.dnd');

denada.process(tree, grammar);

function prettyPrint(d) { return d.name+": "+d.decl.model.value+" @ "+d.decl.location.value; }

var assets = denada
    .flatten(tree, denada.pred.isDefinition)
    .map(prettyPrint);

console.log("Assets:\n"+assets.join("\n"));
```

In this case, the output from the script would be:

```
Assets:
ABC: HP 8860 @ Mike's desk
XYZ: Mac Book Air @ Coffee machine
DEF: HP 8860 @ Mike's desk
```

The Denada library includes basic functions to `visit` nodes in the
AST of the simply `flatten` it (with optional filtering).  Once the
tree has been flattened, the normal `Array` related functions from
Javascript (*e.g.,* `map`) can be applied to the resulting collection
of nodes.
