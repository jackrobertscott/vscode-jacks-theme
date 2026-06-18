import type { FontPalette, Hex, Theme, TokenRule } from "./theme.js";

const token = (
  name: string,
  scope: TokenRule["scope"],
  foreground: Hex,
): TokenRule => ({
  name,
  scope,
  settings: { foreground },
});

export const createTokenColors = (F: FontPalette): TokenRule[] => [
  token(
    "Source text",
    ["source", "meta.embedded", "text.html.markdown", "meta.jsx.children"],
    F.text,
  ),
  token("Comments", ["comment", "punctuation.definition.comment"], F.faint),
  token(
    "Documentation comments",
    [
      "comment.block.documentation",
      "storage.type.class.jsdoc",
      "entity.name.type.instance.jsdoc",
    ],
    F.faint,
  ),
  token(
    "Keywords and control flow",
    [
      "keyword",
      "keyword.control",
      "keyword.operator.expression",
      "storage.modifier",
    ],
    F.ember,
  ),
  token(
    "Imports and exports",
    [
      "keyword.control.import",
      "keyword.control.export",
      "storage.modifier.async",
      "keyword.control.from",
    ],
    F.ember,
  ),
  token(
    "Declaration keywords",
    [
      "storage.type",
      "storage.type.function",
      "storage.type.class",
      "storage.type.interface",
      "storage.type.type",
    ],
    F.sand,
  ),
  token(
    "Operators",
    [
      "keyword.operator",
      "punctuation.accessor",
      "punctuation.separator.key-value",
      "keyword.operator.type",
    ],
    F.muted,
  ),
  token("Strings", ["string", "constant.other.symbol"], F.moss),
  token(
    "Template strings",
    ["string.template", "punctuation.definition.template-expression"],
    F.moss,
  ),
  token(
    "Regular expressions",
    ["string.regexp", "constant.character.escape"],
    F.moss,
  ),
  token(
    "Numbers and constants",
    [
      "constant.numeric",
      "constant.language",
      "constant.character",
      "constant.other.enum",
    ],
    F.sand,
  ),
  token(
    "Booleans and nullish values",
    [
      "constant.language.boolean",
      "constant.language.null",
      "constant.language.undefined",
    ],
    F.sand,
  ),
  token(
    "Functions",
    [
      "entity.name.function",
      "support.function",
      "variable.function",
      "support.function.console",
    ],
    F.sky,
  ),
  token(
    "Methods",
    ["entity.name.function.member", "support.function.dom"],
    F.sky,
  ),
  token(
    "Classes and constructors",
    [
      "entity.name.type.class",
      "entity.name.class",
      "support.class",
      "support.type",
    ],
    F.plum,
  ),
  token(
    "Interfaces, aliases, and type parameters",
    [
      "entity.name.type.interface",
      "entity.name.type.alias",
      "entity.name.type",
      "entity.name.type.module",
      "entity.name.type.namespace",
      "support.type.primitive",
    ],
    F.plum,
  ),
  token(
    "Object keys and properties",
    [
      "meta.object-literal.key",
      "support.type.property-name",
      "variable.other.property",
      "variable.other.member",
      "meta.property.object",
      "support.variable.property",
    ],
    F.text,
  ),
  token(
    "Parameters",
    ["variable.parameter", "entity.name.variable.parameter"],
    F.text,
  ),
  token(
    "Variables",
    [
      "variable",
      "variable.other.readwrite",
      "variable.other.constant",
      "entity.name.variable",
      "variable.language.this",
    ],
    F.text,
  ),
  token(
    "Decorators and annotations",
    [
      "meta.decorator",
      "entity.name.function.decorator",
      "punctuation.decorator",
    ],
    F.plum,
  ),
  token(
    "JSX components",
    ["entity.name.tag.tsx", "support.class.component.tsx"],
    F.plum,
  ),
  token("JSX attributes", ["entity.other.attribute-name"], F.sand),
  token(
    "Tag punctuation",
    [
      "punctuation.definition.tag",
      "punctuation.definition.tag.begin",
      "punctuation.definition.tag.end",
    ],
    F.muted,
  ),
  token("HTML and XML tags", ["entity.name.tag"], F.sky),
  token(
    "CSS selectors",
    [
      "entity.other.attribute-name.class.css",
      "entity.other.attribute-name.id.css",
      "entity.name.tag.css",
    ],
    F.moss,
  ),
  token(
    "CSS properties",
    [
      "support.type.property-name.css",
      "support.type.vendored.property-name.css",
    ],
    F.text,
  ),
  token(
    "Markdown headings",
    ["markup.heading", "entity.name.section.markdown"],
    F.ember,
  ),
  token("Markdown links", ["markup.underline.link", "string.other.link"], F.sky),
  token("Markup emphasis", ["markup.italic"], F.text),
  token("Markup bold", ["markup.bold"], F.text),
  token(
    "Inserted content",
    ["markup.inserted", "meta.diff.header.to-file"],
    F.moss,
  ),
  token(
    "Deleted content",
    ["markup.deleted", "meta.diff.header.from-file"],
    F.clay,
  ),
  token("Changed content", ["markup.changed"], F.sand),
  token("Invalid", ["invalid", "invalid.illegal"], F.clay),
  token(
    "Punctuation",
    ["punctuation", "meta.brace", "punctuation.definition.block"],
    F.muted,
  ),
];

export const createSemanticTokenColors = (
  F: FontPalette,
): Theme["semanticTokenColors"] => ({
  namespace: F.sky,
  type: F.plum,
  class: F.plum,
  enum: F.plum,
  interface: F.plum,
  struct: F.plum,
  typeParameter: F.sand,
  parameter: F.text,
  variable: F.text,
  property: F.text,
  enumMember: F.sand,
  event: F.moss,
  function: F.sky,
  method: F.sky,
  macro: F.sand,
  keyword: F.ember,
  modifier: F.ember,
  comment: F.faint,
  string: F.moss,
  number: F.sand,
  regexp: F.moss,
  operator: F.muted,
  decorator: F.plum,
  "variable.readonly": F.text,
  "variable.declaration": F.text,
  "variable.readonly.declaration": F.text,
  "property.readonly": F.text,
  "property.declaration": F.text,
  "parameter.declaration": F.text,
  "typeParameter.declaration": F.sand,
  "function.declaration": F.sky,
  "method.declaration": F.sky,
  "class.declaration": F.plum,
  "interface.declaration": F.plum,
  "type.declaration": F.plum,
  "enum.declaration": F.plum,
  "*.deprecated": F.faint,
});
