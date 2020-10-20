const toId = (id) => id.replace(/[^\w]*/, "");

/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

var objectToString = Object.prototype.toString;
var isArray =
  Array.isArray ||
  function isArrayPolyfill(object) {
    return objectToString.call(object) === "[object Array]";
  };

function isFunction(object) {
  return typeof object === "function";
}

/**
 * More correct typeof string handling array
 * which normally returns typeof 'object'
 */
function typeStr(obj) {
  return isArray(obj) ? "array" : typeof obj;
}

function escapeRegExp(string) {
  return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

/**
 * Null safe way of checking whether or not an object,
 * including its prototype, has a given property
 */
function hasProperty(obj, propName) {
  return obj != null && typeof obj === "object" && propName in obj;
}

/**
 * Safe way of detecting whether or not the given thing is a primitive and
 * whether it has the given property
 */
function primitiveHasOwnProperty(primitive, propName) {
  return (
    primitive != null &&
    typeof primitive !== "object" &&
    primitive.hasOwnProperty &&
    primitive.hasOwnProperty(propName)
  );
}

// Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
// See https://github.com/janl/mustache.js/issues/189
var regExpTest = RegExp.prototype.test;
function testRegExp(re, string) {
  return regExpTest.call(re, string);
}

var nonSpaceRe = /\S/;
function isWhitespace(string) {
  return !testRegExp(nonSpaceRe, string);
}

var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
    return entityMap[s];
  });
}

var whiteRe = /\s*/;
var spaceRe = /\s+/;
var equalsRe = /\s*=/;
var curlyRe = /\s*\}/;
var tagRe = /#|\^|\/|>|\{|&|=|!/;

/**
 * Breaks up the given `template` string into a tree of tokens. If the `tags`
 * argument is given here it must be an array with two string values: the
 * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
 * course, the default is to use mustaches (i.e. mustache.tags).
 *
 * A token is an array with at least 4 elements. The first element is the
 * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
 * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
 * all text that appears outside a symbol this element is "text".
 *
 * The second element of a token is its "value". For mustache tags this is
 * whatever else was inside the tag besides the opening symbol. For text tokens
 * this is the text itself.
 *
 * The third and fourth elements of the token are the start and end indices,
 * respectively, of the token in the original template.
 *
 * Tokens that are the root node of a subtree contain two more elements: 1) an
 * array of tokens in the subtree and 2) the index in the original template at
 * which the closing tag for that section begins.
 *
 * Tokens for partials also contain two more elements: 1) a string value of
 * indendation prior to that tag and 2) the index of that tag on that line -
 * eg a value of 2 indicates the partial is the third tag on this line.
 */
export function parseTemplate(template, tags) {
  if (!template) return [];
  var lineHasNonSpace = false;
  var sections = []; // Stack to hold section tokens
  var tokens = []; // Buffer to hold the tokens
  var spaces = []; // Indices of whitespace tokens on the current line
  var hasTag = false; // Is there a {{tag}} on the current line?
  var nonSpace = false; // Is there a non-space char on the current line?
  var indentation = ""; // Tracks indentation for tags that use it
  var tagIndex = 0; // Stores a count of number of tags encountered on a line

  // Strips all whitespace tokens array for the current line
  // if there was a {{#tag}} on it and otherwise only space.
  function stripSpace() {
    if (hasTag && !nonSpace) {
      while (spaces.length) delete tokens[spaces.pop()];
    } else {
      spaces = [];
    }

    hasTag = false;
    nonSpace = false;
  }

  var openingTagRe, closingTagRe, closingCurlyRe;
  function compileTags(tagsToCompile) {
    if (typeof tagsToCompile === "string")
      tagsToCompile = tagsToCompile.split(spaceRe, 2);

    if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
      throw new Error("Invalid tags: " + tagsToCompile);

    openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + "\\s*");
    closingTagRe = new RegExp("\\s*" + escapeRegExp(tagsToCompile[1]));
    closingCurlyRe = new RegExp("\\s*" + escapeRegExp("}" + tagsToCompile[1]));
  }

  compileTags(tags || mustache.tags);

  var scanner = new Scanner(template);

  var start, type, value, chr, token, openSection;
  while (!scanner.eos()) {
    start = scanner.pos;

    // Match any text between tags.
    value = scanner.scanUntil(openingTagRe);

    if (value) {
      for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
        chr = value.charAt(i);

        if (isWhitespace(chr)) {
          spaces.push(tokens.length);
          indentation += chr;
        } else {
          nonSpace = true;
          lineHasNonSpace = true;
          indentation += " ";
        }

        tokens.push(["text", chr, start, start + 1]);
        start += 1;

        // Check for whitespace on the current line.
        if (chr === "\n") {
          stripSpace();
          indentation = "";
          tagIndex = 0;
          lineHasNonSpace = false;
        }
      }
    }

    // Match the opening tag.
    if (!scanner.scan(openingTagRe)) break;

    hasTag = true;

    // Get the tag type.
    type = scanner.scan(tagRe) || "name";
    scanner.scan(whiteRe);

    // Get the tag value.
    if (type === "=") {
      value = scanner.scanUntil(equalsRe);
      scanner.scan(equalsRe);
      scanner.scanUntil(closingTagRe);
    } else if (type === "{") {
      value = scanner.scanUntil(closingCurlyRe);
      scanner.scan(curlyRe);
      scanner.scanUntil(closingTagRe);
      type = "&";
    } else {
      value = scanner.scanUntil(closingTagRe);
    }

    // Match the closing tag.
    if (!scanner.scan(closingTagRe))
      throw new Error("Unclosed tag at " + scanner.pos);

    if (type == ">") {
      token = [
        type,
        value,
        start,
        scanner.pos,
        indentation,
        tagIndex,
        lineHasNonSpace,
      ];
    } else {
      token = [type, value, start, scanner.pos];
    }
    tagIndex++;
    tokens.push(token);

    if (type === "#" || type === "^") {
      sections.push(token);
    } else if (type === "/") {
      // Check section nesting.
      openSection = sections.pop();

      if (!openSection)
        throw new Error('Unopened section "' + value + '" at ' + start);

      if (openSection[1] !== value)
        throw new Error(
          'Unclosed section "' + openSection[1] + '" at ' + start
        );
    } else if (type === "name" || type === "{" || type === "&") {
      nonSpace = true;
    } else if (type === "=") {
      // Set the tags for the next time around.
      compileTags(value);
    }
  }

  stripSpace();

  // Make sure there are no open sections when we're done.
  openSection = sections.pop();

  if (openSection)
    throw new Error(
      'Unclosed section "' + openSection[1] + '" at ' + scanner.pos
    );

  return nestTokens(squashTokens(tokens));
}

/**
 * Combines the values of consecutive text tokens in the given `tokens` array
 * to a single token.
 */
function squashTokens(tokens) {
  var squashedTokens = [];

  var token, lastToken;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];

    if (token) {
      if (token[0] === "text" && lastToken && lastToken[0] === "text") {
        lastToken[1] += token[1];
        lastToken[3] = token[3];
      } else {
        squashedTokens.push(token);
        lastToken = token;
      }
    }
  }

  return squashedTokens;
}

/**
 * Forms the given array of `tokens` into a nested tree structure where
 * tokens that represent a section have two additional items: 1) an array of
 * all tokens that appear in that section and 2) the index in the original
 * template that represents the end of that section.
 */
function nestTokens(tokens) {
  var nestedTokens = [];
  var collector = nestedTokens;
  var sections = [];

  var token, section;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];

    switch (token[0]) {
      case "#":
      case "^":
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case "/":
        section = sections.pop();
        section[5] = token[2];
        collector =
          sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
    }
  }

  return nestedTokens;
}

/**
 * A simple string scanner that is used by the template parser to find
 * tokens in template strings.
 */
function Scanner(string) {
  this.string = string;
  this.tail = string;
  this.pos = 0;
}

/**
 * Returns `true` if the tail is empty (end of string).
 */
Scanner.prototype.eos = function eos() {
  return this.tail === "";
};

/**
 * Tries to match the given regular expression at the current position.
 * Returns the matched text if it can match, the empty string otherwise.
 */
Scanner.prototype.scan = function scan(re) {
  var match = this.tail.match(re);

  if (!match || match.index !== 0) return "";

  var string = match[0];

  this.tail = this.tail.substring(string.length);
  this.pos += string.length;

  return string;
};

/**
 * Skips all text until the given regular expression can be matched. Returns
 * the skipped string, which is the entire tail if no match can be made.
 */
Scanner.prototype.scanUntil = function scanUntil(re) {
  var index = this.tail.search(re),
    match;

  switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
  }

  this.pos += match.length;

  return match;
};

class Context {
  constructor(locals) {
    this.locals = locals || [];
  }

  lookup(name) {
    let top, sub;
    if (name !== ".") {
      [top, ...sub] = name.split(".");
    }

    if (sub && sub.length) {
      sub.unshift("");
    }

    const args = [
      top ? `"${top.replace('"', '\\"')}"` : "null",
      ...this.locals,
    ];
    return `view(${args.join(",")})${sub ? sub.join(".") : ""}`;
  }

  sub(local) {
    return new Context([local, ...this.locals]);
  }
}

/**
 * A Writer knows how to take a stream of tokens and render them to a
 * string, given a context. It also maintains a cache of templates to
 * avoid the need to parse the same template twice.
 */
function Writer() {
  this.templateCache = {
    _cache: {},
    set: function set(key, value) {
      this._cache[key] = value;
    },
    get: function get(key) {
      return this._cache[key];
    },
    clear: function clear() {
      this._cache = {};
    },
  };
}

/**
 * Clears all cached templates in this writer.
 */
Writer.prototype.clearCache = function clearCache() {
  if (typeof this.templateCache !== "undefined") {
    this.templateCache.clear();
  }
};

/**
 * Parses and caches the given `template` according to the given `tags` or
 * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
 * that is generated from the parse.
 */
Writer.prototype.parse = function parse(template, tags) {
  var cache = this.templateCache;
  var cacheKey = template + ":" + (tags || mustache.tags).join(":");
  var isCacheEnabled = typeof cache !== "undefined";
  var tokens = isCacheEnabled ? cache.get(cacheKey) : undefined;

  if (tokens == undefined) {
    tokens = parseTemplate(template, tags);
    isCacheEnabled && cache.set(cacheKey, tokens);
  }
  return tokens;
};

/**
 * High-level method that is used to render the given `template` with
 * the given `view`.
 *
 * The optional `partials` argument may be an object that contains the
 * names and templates of partials that are used in the template. It may
 * also be a function that is used to load partial templates on the fly
 * that takes a single argument: the name of the partial.
 *
 * If the optional `tags` argument is given here it must be an array with two
 * string values: the opening and closing tags used in the template (e.g.
 * [ "<%", "%>" ]). The default is to mustache.tags.
 */
Writer.prototype.render = function render(
  template,
  view,
  partials,
  tags,
  xmldomOrWindow
) {
  nested = 0;
  var tokens = this.parse(serializeXml(template, xmldomOrWindow), tags);
  return this.renderTokens(tokens, new Context(), partials, template, tags);
};

/**
 * Low-level method that renders the given array of `tokens` using
 * the given `context` and `partials`.
 *
 * Note: The `originalTemplate` is only ever used to extract the portion
 * of the original template that was contained in a higher-order section.
 * If the template doesn't use higher-order sections, this argument may
 * be omitted.
 */
Writer.prototype.renderTokens = function renderTokens(
  tokens,
  context,
  partials,
  originalTemplate,
  tags
) {
  var buffer = "";

  var token, symbol, value;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    value = undefined;
    token = tokens[i];
    symbol = token[0];

    if (symbol === "#")
      value = this.renderSection(token, context, partials, originalTemplate);
    else if (symbol === "^")
      value = this.renderInverted(token, context, partials, originalTemplate);
    else if (symbol === ">")
      value = this.renderPartial(token, context, partials, tags);
    else if (symbol === "&") value = this.unescapedValue(token, context);
    else if (symbol === "name") value = this.escapedValue(token, context);
    else if (symbol === "text") value = this.rawValue(token);

    if (value !== undefined) buffer += value;
  }

  return `<>${buffer.replace(/^[\s]+/, "")}</>`;
};

let nested = 0;

Writer.prototype.renderSection = function renderSection(
  token,
  context,
  partials,
  originalTemplate
) {
  const name = token[1];
  const at = nested++;
  const id = toId(name);
  const local = `_${at}_${id}`;
  const localKey = `_i_${at}`;
  const inside = this.renderTokens(
    token[4],
    context.sub(local),
    originalTemplate
  );
  return `{section(${context.lookup(
    name
  )}, (${local}, ${localKey}) => ${inside})}`;
};

Writer.prototype.renderInverted = function renderInverted(
  token,
  context,
  partials,
  originalTemplate
) {
  // // Use JavaScript's definition of falsy. Include empty arrays.
  // // See https://github.com/janl/mustache.js/issues/186
  return `{inverted(${context.lookup(token[1])}) && ${this.renderTokens(
    token[4],
    context,
    partials,
    originalTemplate
  )}}`;
};

Writer.prototype.indentPartial = function indentPartial(
  partial,
  indentation,
  lineHasNonSpace
) {
  var filteredIndentation = indentation.replace(/[^ \t]/g, "");
  var partialByNl = partial.split("\n");
  for (var i = 0; i < partialByNl.length; i++) {
    if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
      partialByNl[i] = filteredIndentation + partialByNl[i];
    }
  }
  return partialByNl.join("\n");
};

Writer.prototype.renderPartial = function renderPartial(
  token,
  context,
  partials,
  tags
) {
  if (!partials) return;

  var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
  if (value != null) {
    var lineHasNonSpace = token[6];
    var tagIndex = token[5];
    var indentation = token[4];
    var indentedValue = value;
    if (tagIndex == 0 && indentation) {
      indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
    }
    return this.renderTokens(
      this.parse(indentedValue, tags),
      context,
      partials,
      indentedValue,
      tags
    );
  }
};

Writer.prototype.unescapedValue = function unescapedValue(token, context) {
  return `{html(${context.lookup(token[1])})}`;
};

Writer.prototype.escapedValue = function escapedValue(token, context) {
  return `{${context.lookup(token[1])}}`;
};

Writer.prototype.rawValue = function rawValue(token) {
  return token[1];
};

var mustache = {
  name: "mustache.js",
  version: "4.0.1",
  tags: ["{{", "}}"],
  clearCache: undefined,
  escape: undefined,
  parse: undefined,
  render: undefined,
  Scanner: undefined,
  Context: undefined,
  Writer: undefined,
  /**
   * Allows a user to override the default caching strategy, by providing an
   * object with set, get and clear methods. This can also be used to disable
   * the cache by setting it to the literal `undefined`.
   */
  set templateCache(cache) {
    defaultWriter.templateCache = cache;
  },
  /**
   * Gets the default or overridden caching object from the default writer.
   */
  get templateCache() {
    return defaultWriter.templateCache;
  },
};

// All high-level mustache.* functions use this writer.
var defaultWriter = new Writer();

/**
 * Clears all cached templates in the default writer.
 */
mustache.clearCache = function clearCache() {
  return defaultWriter.clearCache();
};

/**
 * Parses and caches the given template in the default writer and returns the
 * array of tokens it contains. Doing this ahead of time avoids the need to
 * parse templates on the fly as they are rendered.
 */
mustache.parse = function parse(template, tags) {
  return defaultWriter.parse(template, tags);
};

/**
 * Renders the `template` with the given `view` and `partials` using the
 * default writer. If the optional `tags` argument is given here it must be an
 * array with two string values: the opening and closing tags used in the
 * template (e.g. [ "<%", "%>" ]). The default is to mustache.tags.
 */
mustache.render = function render(template, view, partials, tags) {
  if (typeof template !== "string") {
    throw new TypeError(
      'Invalid template! Template should be a "string" ' +
        'but "' +
        typeStr(template) +
        '" was given as the first ' +
        "argument for mustache#render(template, view, partials)"
    );
  }

  return defaultWriter.render(template, view, partials, tags);
};

function serializeXml(template, { DOMParser, XMLSerializer } = window) {
  const parsed = new DOMParser().parseFromString(
    `<html><body>${template}</body></html>`,
    "text/html"
  );
  const serialized = new XMLSerializer().serializeToString(parsed);
  return (
    /<body>([\s\S]*)<\/body>/im
      .exec(serialized)[1]
      // ugly and probably unsafe
      .replace(/="{{([^"]*)}}"/gim, (_, content) => `={{${content}}}`)
  );
}

// Export the escaping function so that the user may override it.
// See https://github.com/janl/mustache.js/issues/244
mustache.escape = escapeHtml;

// Export these mainly for testing, but also for advanced usage.
mustache.Scanner = Scanner;
mustache.Context = Context;
mustache.Writer = Writer;

export default Writer;
