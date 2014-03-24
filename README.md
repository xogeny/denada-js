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
give me give more minutes and I'll explain why I did it.

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

The generic syntax of Denada is simple.  There are two things you can
express in Denada.  One looks like a variable declaration and the
other expresses nested structure (which can contain instances of these
same two things).  For example, this is valid Denada code:

```
Real x;
group {
  Real y;
  Integer z;
}
```

This doesn't really *mean* anything, but it conforms to the required
syntax.  Although this might be useful as is, the real use case for
Denada is defining a grammar the restricts what is permitted.  Let's
imagine we wanted to define some kind of nested property file format.
A sample of our property file might look like this:

```
property x;
property y = 5;
