webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Utilities
//



function _class(obj) { return Object.prototype.toString.call(obj); }

function isString(obj) { return _class(obj) === '[object String]'; }

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function has(object, key) {
  return _hasOwnProperty.call(object, key);
}

// Merge objects
//
function assign(obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function (source) {
    if (!source) { return; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be object');
    }

    Object.keys(source).forEach(function (key) {
      obj[key] = source[key];
    });
  });

  return obj;
}

// Remove element from array and put another array at those position.
// Useful for some operations with tokens
function arrayReplaceAt(src, pos, newElements) {
  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
}

////////////////////////////////////////////////////////////////////////////////

function isValidEntityCode(c) {
  /*eslint no-bitwise:0*/
  // broken sequence
  if (c >= 0xD800 && c <= 0xDFFF) { return false; }
  // never used
  if (c >= 0xFDD0 && c <= 0xFDEF) { return false; }
  if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) { return false; }
  // control codes
  if (c >= 0x00 && c <= 0x08) { return false; }
  if (c === 0x0B) { return false; }
  if (c >= 0x0E && c <= 0x1F) { return false; }
  if (c >= 0x7F && c <= 0x9F) { return false; }
  // out of range
  if (c > 0x10FFFF) { return false; }
  return true;
}

function fromCodePoint(c) {
  /*eslint no-bitwise:0*/
  if (c > 0xffff) {
    c -= 0x10000;
    var surrogate1 = 0xd800 + (c >> 10),
        surrogate2 = 0xdc00 + (c & 0x3ff);

    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c);
}


var UNESCAPE_MD_RE  = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g;
var ENTITY_RE       = /&([a-z#][a-z0-9]{1,31});/gi;
var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi');

var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;

var entities = __webpack_require__(54);

function replaceEntityPattern(match, name) {
  var code = 0;

  if (has(entities, name)) {
    return entities[name];
  }

  if (name.charCodeAt(0) === 0x23/* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
    code = name[1].toLowerCase() === 'x' ?
      parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);

    if (isValidEntityCode(code)) {
      return fromCodePoint(code);
    }
  }

  return match;
}

/*function replaceEntities(str) {
  if (str.indexOf('&') < 0) { return str; }

  return str.replace(ENTITY_RE, replaceEntityPattern);
}*/

function unescapeMd(str) {
  if (str.indexOf('\\') < 0) { return str; }
  return str.replace(UNESCAPE_MD_RE, '$1');
}

function unescapeAll(str) {
  if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) { return str; }

  return str.replace(UNESCAPE_ALL_RE, function (match, escaped, entity) {
    if (escaped) { return escaped; }
    return replaceEntityPattern(match, entity);
  });
}

////////////////////////////////////////////////////////////////////////////////

var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};

function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}

function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
}

////////////////////////////////////////////////////////////////////////////////

var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;

function escapeRE(str) {
  return str.replace(REGEXP_ESCAPE_RE, '\\$&');
}

////////////////////////////////////////////////////////////////////////////////

function isSpace(code) {
  switch (code) {
    case 0x09:
    case 0x20:
      return true;
  }
  return false;
}

// Zs (unicode class) || [\t\f\v\r\n]
function isWhiteSpace(code) {
  if (code >= 0x2000 && code <= 0x200A) { return true; }
  switch (code) {
    case 0x09: // \t
    case 0x0A: // \n
    case 0x0B: // \v
    case 0x0C: // \f
    case 0x0D: // \r
    case 0x20:
    case 0xA0:
    case 0x1680:
    case 0x202F:
    case 0x205F:
    case 0x3000:
      return true;
  }
  return false;
}

////////////////////////////////////////////////////////////////////////////////

/*eslint-disable max-len*/
var UNICODE_PUNCT_RE = __webpack_require__(37);

// Currently without astral characters support.
function isPunctChar(ch) {
  return UNICODE_PUNCT_RE.test(ch);
}


// Markdown ASCII punctuation characters.
//
// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
// http://spec.commonmark.org/0.15/#ascii-punctuation-character
//
// Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
//
function isMdAsciiPunct(ch) {
  switch (ch) {
    case 0x21/* ! */:
    case 0x22/* " */:
    case 0x23/* # */:
    case 0x24/* $ */:
    case 0x25/* % */:
    case 0x26/* & */:
    case 0x27/* ' */:
    case 0x28/* ( */:
    case 0x29/* ) */:
    case 0x2A/* * */:
    case 0x2B/* + */:
    case 0x2C/* , */:
    case 0x2D/* - */:
    case 0x2E/* . */:
    case 0x2F/* / */:
    case 0x3A/* : */:
    case 0x3B/* ; */:
    case 0x3C/* < */:
    case 0x3D/* = */:
    case 0x3E/* > */:
    case 0x3F/* ? */:
    case 0x40/* @ */:
    case 0x5B/* [ */:
    case 0x5C/* \ */:
    case 0x5D/* ] */:
    case 0x5E/* ^ */:
    case 0x5F/* _ */:
    case 0x60/* ` */:
    case 0x7B/* { */:
    case 0x7C/* | */:
    case 0x7D/* } */:
    case 0x7E/* ~ */:
      return true;
    default:
      return false;
  }
}

// Hepler to unify [reference labels].
//
function normalizeReference(str) {
  // Trim and collapse whitespace
  //
  str = str.trim().replace(/\s+/g, ' ');

  // In node v10 'ẞ'.toLowerCase() === 'Ṿ', which is presumed to be a bug
  // fixed in v12 (couldn't find any details).
  //
  // So treat this one as a special case
  // (remove this when node v10 is no longer supported).
  //
  if ('ẞ'.toLowerCase() === 'Ṿ') {
    str = str.replace(/ẞ/g, 'ß');
  }

  // .toLowerCase().toUpperCase() should get rid of all differences
  // between letter variants.
  //
  // Simple .toLowerCase() doesn't normalize 125 code points correctly,
  // and .toUpperCase doesn't normalize 6 of them (list of exceptions:
  // İ, ϴ, ẞ, Ω, K, Å - those are already uppercased, but have differently
  // uppercased versions).
  //
  // Here's an example showing how it happens. Lets take greek letter omega:
  // uppercase U+0398 (Θ), U+03f4 (ϴ) and lowercase U+03b8 (θ), U+03d1 (ϑ)
  //
  // Unicode entries:
  // 0398;GREEK CAPITAL LETTER THETA;Lu;0;L;;;;;N;;;;03B8;
  // 03B8;GREEK SMALL LETTER THETA;Ll;0;L;;;;;N;;;0398;;0398
  // 03D1;GREEK THETA SYMBOL;Ll;0;L;<compat> 03B8;;;;N;GREEK SMALL LETTER SCRIPT THETA;;0398;;0398
  // 03F4;GREEK CAPITAL THETA SYMBOL;Lu;0;L;<compat> 0398;;;;N;;;;03B8;
  //
  // Case-insensitive comparison should treat all of them as equivalent.
  //
  // But .toLowerCase() doesn't change ϑ (it's already lowercase),
  // and .toUpperCase() doesn't change ϴ (already uppercase).
  //
  // Applying first lower then upper case normalizes any character:
  // '\u0398\u03f4\u03b8\u03d1'.toLowerCase().toUpperCase() === '\u0398\u0398\u0398\u0398'
  //
  // Note: this is equivalent to unicode case folding; unicode normalization
  // is a different step that is not required here.
  //
  // Final result should be uppercased, because it's later stored in an object
  // (this avoid a conflict with Object.prototype members,
  // most notably, `__proto__`)
  //
  return str.toLowerCase().toUpperCase();
}

////////////////////////////////////////////////////////////////////////////////

// Re-export libraries commonly used in both markdown-it and its plugins,
// so plugins won't have to depend on them explicitly, which reduces their
// bundled size (e.g. a browser build).
//
exports.lib                 = {};
exports.lib.mdurl           = __webpack_require__(58);
exports.lib.ucmicro         = __webpack_require__(208);

exports.assign              = assign;
exports.isString            = isString;
exports.has                 = has;
exports.unescapeMd          = unescapeMd;
exports.unescapeAll         = unescapeAll;
exports.isValidEntityCode   = isValidEntityCode;
exports.fromCodePoint       = fromCodePoint;
// exports.replaceEntities     = replaceEntities;
exports.escapeHtml          = escapeHtml;
exports.arrayReplaceAt      = arrayReplaceAt;
exports.isSpace             = isSpace;
exports.isWhiteSpace        = isWhiteSpace;
exports.isMdAsciiPunct      = isMdAsciiPunct;
exports.isPunctChar         = isPunctChar;
exports.escapeRE            = escapeRE;
exports.normalizeReference  = normalizeReference;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 2 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 3 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 4 */
/***/ (function(module, exports) {

/* globals __VUE_SSR_CONTEXT__ */

// this module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = injectStyles
  }

  if (hook) {
    var functional = options.functional
    var existing = functional
      ? options.render
      : options.beforeCreate
    if (!functional) {
      // inject component registration as beforeCreate hook
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    } else {
      // register for functioal component in vue file
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return existing(h, context)
      }
    }
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/

var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

var listToStyles = __webpack_require__(227)

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

module.exports = function (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(14)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(8);
var createDesc = __webpack_require__(16);
module.exports = __webpack_require__(6) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(12);
var IE8_DOM_DEFINE = __webpack_require__(44);
var toPrimitive = __webpack_require__(31);
var dP = Object.defineProperty;

exports.f = __webpack_require__(6) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(95);
var defined = __webpack_require__(22);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(29)('wks');
var uid = __webpack_require__(17);
var Symbol = __webpack_require__(1).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(11);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 13 */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.6.11' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = true;


/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 17 */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 18 */,
/* 19 */,
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  agate: 1,
  androidstudio: 1,
  'arduino-light': 1,
  arta: 1,
  ascetic: 1,
  'atom-one-dark': 1,
  'atom-one-light': 1,
  'brown-paper': 1,
  'codepen-embed': 1,
  'color-brewer': 1,
  dark: 1,
  default: 1,
  docco: 1,
  far: 1,
  foundation: 1,
  github: 1,
  googlecode: 1,
  grayscale: 1,
  hybrid: 1,
  idea: 1,
  'ir-black': 1,
  magula: 1,
  'mono-blue': 1,
  'monokai-sublime': 1,
  monokai: 1,
  obsidian: 1,
  'paraiso-dark': 1,
  'paraiso-light': 1,
  pojoaque: 1,
  purebasic: 1,
  rainbow: 1,
  routeros: 1,
  'school-book': 1,
  sunburst: 1,
  'tomorrow-night-blue': 1,
  'tomorrow-night-bright': 1,
  vs: 1,
  vs2015: 1,
  xcode: 1,
  xt256: 1,
  'a11y-dark': 1,
  'a11y-light': 1,
  'an-old-hope': 1,
  'atom-one-dark-reasonable': 1,
  'brown-pap': 1,
  devibeans: 1,
  'github-dark': 1,
  'github-dark-dimmed': 1,
  gml: 1,
  'gradient-dark': 1,
  'gradient-light': 1,
  'isbl-editor-dark': 1,
  'isbl-editor-light': 1,
  'kimbie-dark': 1,
  'kimbie-light': 1,
  lightfair: 1,
  lioshi: 1,
  'night-owl': 1,
  'nnfx-dark': 1,
  'nnfx-light': 1,
  nord: 1,
  pojo: 1,
  'qtcreator-dark': 1,
  'qtcreator-light': 1,
  'shades-of-purple': 1,
  srcery: 1,
  'stackoverflow-dark': 1,
  'stackoverflow-light': 1
};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _iterator = __webpack_require__(86);

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = __webpack_require__(85);

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};

/***/ }),
/* 22 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),
/* 23 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(49);
var enumBugKeys = __webpack_require__(23);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 26 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(8).f;
var has = __webpack_require__(2);
var TAG = __webpack_require__(10)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(29)('keys');
var uid = __webpack_require__(17);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(13);
var global = __webpack_require__(1);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(15) ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 30 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(11);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(1);
var core = __webpack_require__(13);
var LIBRARY = __webpack_require__(15);
var wksExt = __webpack_require__(33);
var defineProperty = __webpack_require__(8).f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

exports.f = __webpack_require__(10);


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * cssfilter
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var DEFAULT = __webpack_require__(52);
var FilterCSS = __webpack_require__(121);


/**
 * XSS过滤
 *
 * @param {String} css 要过滤的CSS代码
 * @param {Object} options 选项：whiteList, onAttr, onIgnoreAttr
 * @return {String}
 */
function filterCSS (html, options) {
  var xss = new FilterCSS(options);
  return xss.process(html);
}


// 输出
exports = module.exports = filterCSS;
exports.FilterCSS = FilterCSS;
for (var i in DEFAULT) exports[i] = DEFAULT[i];

// 在浏览器端使用
if (typeof window !== 'undefined') {
  window.filterCSS = module.exports;
}


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * class Ruler
 *
 * Helper class, used by [[MarkdownIt#core]], [[MarkdownIt#block]] and
 * [[MarkdownIt#inline]] to manage sequences of functions (rules):
 *
 * - keep rules in defined order
 * - assign the name to each rule
 * - enable/disable rules
 * - add/replace rules
 * - allow assign rules to additional named chains (in the same)
 * - cacheing lists of active rules
 *
 * You will not need use this class directly until write plugins. For simple
 * rules control use [[MarkdownIt.disable]], [[MarkdownIt.enable]] and
 * [[MarkdownIt.use]].
 **/



/**
 * new Ruler()
 **/
function Ruler() {
  // List of added rules. Each element is:
  //
  // {
  //   name: XXX,
  //   enabled: Boolean,
  //   fn: Function(),
  //   alt: [ name2, name3 ]
  // }
  //
  this.__rules__ = [];

  // Cached rule chains.
  //
  // First level - chain name, '' for default.
  // Second level - diginal anchor for fast filtering by charcodes.
  //
  this.__cache__ = null;
}

////////////////////////////////////////////////////////////////////////////////
// Helper methods, should not be used directly


// Find rule index by name
//
Ruler.prototype.__find__ = function (name) {
  for (var i = 0; i < this.__rules__.length; i++) {
    if (this.__rules__[i].name === name) {
      return i;
    }
  }
  return -1;
};


// Build rules lookup cache
//
Ruler.prototype.__compile__ = function () {
  var self = this;
  var chains = [ '' ];

  // collect unique names
  self.__rules__.forEach(function (rule) {
    if (!rule.enabled) { return; }

    rule.alt.forEach(function (altName) {
      if (chains.indexOf(altName) < 0) {
        chains.push(altName);
      }
    });
  });

  self.__cache__ = {};

  chains.forEach(function (chain) {
    self.__cache__[chain] = [];
    self.__rules__.forEach(function (rule) {
      if (!rule.enabled) { return; }

      if (chain && rule.alt.indexOf(chain) < 0) { return; }

      self.__cache__[chain].push(rule.fn);
    });
  });
};


/**
 * Ruler.at(name, fn [, options])
 * - name (String): rule name to replace.
 * - fn (Function): new rule function.
 * - options (Object): new rule options (not mandatory).
 *
 * Replace rule by name with new function & options. Throws error if name not
 * found.
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * Replace existing typographer replacement rule with new one:
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.core.ruler.at('replacements', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.at = function (name, fn, options) {
  var index = this.__find__(name);
  var opt = options || {};

  if (index === -1) { throw new Error('Parser rule not found: ' + name); }

  this.__rules__[index].fn = fn;
  this.__rules__[index].alt = opt.alt || [];
  this.__cache__ = null;
};


/**
 * Ruler.before(beforeName, ruleName, fn [, options])
 * - beforeName (String): new rule will be added before this one.
 * - ruleName (String): name of added rule.
 * - fn (Function): rule function.
 * - options (Object): rule options (not mandatory).
 *
 * Add new rule to chain before one with given name. See also
 * [[Ruler.after]], [[Ruler.push]].
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.before = function (beforeName, ruleName, fn, options) {
  var index = this.__find__(beforeName);
  var opt = options || {};

  if (index === -1) { throw new Error('Parser rule not found: ' + beforeName); }

  this.__rules__.splice(index, 0, {
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};


/**
 * Ruler.after(afterName, ruleName, fn [, options])
 * - afterName (String): new rule will be added after this one.
 * - ruleName (String): name of added rule.
 * - fn (Function): rule function.
 * - options (Object): rule options (not mandatory).
 *
 * Add new rule to chain after one with given name. See also
 * [[Ruler.before]], [[Ruler.push]].
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.inline.ruler.after('text', 'my_rule', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.after = function (afterName, ruleName, fn, options) {
  var index = this.__find__(afterName);
  var opt = options || {};

  if (index === -1) { throw new Error('Parser rule not found: ' + afterName); }

  this.__rules__.splice(index + 1, 0, {
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};

/**
 * Ruler.push(ruleName, fn [, options])
 * - ruleName (String): name of added rule.
 * - fn (Function): rule function.
 * - options (Object): rule options (not mandatory).
 *
 * Push new rule to the end of chain. See also
 * [[Ruler.before]], [[Ruler.after]].
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.core.ruler.push('my_rule', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.push = function (ruleName, fn, options) {
  var opt = options || {};

  this.__rules__.push({
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};


/**
 * Ruler.enable(list [, ignoreInvalid]) -> Array
 * - list (String|Array): list of rule names to enable.
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Enable rules with given names. If any rule name not found - throw Error.
 * Errors can be disabled by second param.
 *
 * Returns list of found rule names (if no exception happened).
 *
 * See also [[Ruler.disable]], [[Ruler.enableOnly]].
 **/
Ruler.prototype.enable = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [ list ]; }

  var result = [];

  // Search by name and enable
  list.forEach(function (name) {
    var idx = this.__find__(name);

    if (idx < 0) {
      if (ignoreInvalid) { return; }
      throw new Error('Rules manager: invalid rule name ' + name);
    }
    this.__rules__[idx].enabled = true;
    result.push(name);
  }, this);

  this.__cache__ = null;
  return result;
};


/**
 * Ruler.enableOnly(list [, ignoreInvalid])
 * - list (String|Array): list of rule names to enable (whitelist).
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Enable rules with given names, and disable everything else. If any rule name
 * not found - throw Error. Errors can be disabled by second param.
 *
 * See also [[Ruler.disable]], [[Ruler.enable]].
 **/
Ruler.prototype.enableOnly = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [ list ]; }

  this.__rules__.forEach(function (rule) { rule.enabled = false; });

  this.enable(list, ignoreInvalid);
};


/**
 * Ruler.disable(list [, ignoreInvalid]) -> Array
 * - list (String|Array): list of rule names to disable.
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Disable rules with given names. If any rule name not found - throw Error.
 * Errors can be disabled by second param.
 *
 * Returns list of found rule names (if no exception happened).
 *
 * See also [[Ruler.enable]], [[Ruler.enableOnly]].
 **/
Ruler.prototype.disable = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [ list ]; }

  var result = [];

  // Search by name and disable
  list.forEach(function (name) {
    var idx = this.__find__(name);

    if (idx < 0) {
      if (ignoreInvalid) { return; }
      throw new Error('Rules manager: invalid rule name ' + name);
    }
    this.__rules__[idx].enabled = false;
    result.push(name);
  }, this);

  this.__cache__ = null;
  return result;
};


/**
 * Ruler.getRules(chainName) -> Array
 *
 * Return array of active functions (rules) for given chain name. It analyzes
 * rules configuration, compiles caches if not exists and returns result.
 *
 * Default chain name is `''` (empty string). It can't be skipped. That's
 * done intentionally, to keep signature monomorphic for high speed.
 **/
Ruler.prototype.getRules = function (chainName) {
  if (this.__cache__ === null) {
    this.__compile__();
  }

  // Chain can be empty, if rules disabled. But we still have to return Array.
  return this.__cache__[chainName] || [];
};

module.exports = Ruler;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Token class




/**
 * class Token
 **/

/**
 * new Token(type, tag, nesting)
 *
 * Create new token and fill passed properties.
 **/
function Token(type, tag, nesting) {
  /**
   * Token#type -> String
   *
   * Type of the token (string, e.g. "paragraph_open")
   **/
  this.type     = type;

  /**
   * Token#tag -> String
   *
   * html tag name, e.g. "p"
   **/
  this.tag      = tag;

  /**
   * Token#attrs -> Array
   *
   * Html attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
   **/
  this.attrs    = null;

  /**
   * Token#map -> Array
   *
   * Source map info. Format: `[ line_begin, line_end ]`
   **/
  this.map      = null;

  /**
   * Token#nesting -> Number
   *
   * Level change (number in {-1, 0, 1} set), where:
   *
   * -  `1` means the tag is opening
   * -  `0` means the tag is self-closing
   * - `-1` means the tag is closing
   **/
  this.nesting  = nesting;

  /**
   * Token#level -> Number
   *
   * nesting level, the same as `state.level`
   **/
  this.level    = 0;

  /**
   * Token#children -> Array
   *
   * An array of child nodes (inline and img tokens)
   **/
  this.children = null;

  /**
   * Token#content -> String
   *
   * In a case of self-closing tag (code, html, fence, etc.),
   * it has contents of this tag.
   **/
  this.content  = '';

  /**
   * Token#markup -> String
   *
   * '*' or '_' for emphasis, fence string for fence, etc.
   **/
  this.markup   = '';

  /**
   * Token#info -> String
   *
   * fence infostring
   **/
  this.info     = '';

  /**
   * Token#meta -> Object
   *
   * A place for plugins to store an arbitrary data
   **/
  this.meta     = null;

  /**
   * Token#block -> Boolean
   *
   * True for block-level tokens, false for inline tokens.
   * Used in renderer to calculate line breaks
   **/
  this.block    = false;

  /**
   * Token#hidden -> Boolean
   *
   * If it's true, ignore this element when rendering. Used for tight lists
   * to hide paragraphs.
   **/
  this.hidden   = false;
}


/**
 * Token.attrIndex(name) -> Number
 *
 * Search attribute index by name.
 **/
Token.prototype.attrIndex = function attrIndex(name) {
  var attrs, i, len;

  if (!this.attrs) { return -1; }

  attrs = this.attrs;

  for (i = 0, len = attrs.length; i < len; i++) {
    if (attrs[i][0] === name) { return i; }
  }
  return -1;
};


/**
 * Token.attrPush(attrData)
 *
 * Add `[ name, value ]` attribute to list. Init attrs if necessary
 **/
Token.prototype.attrPush = function attrPush(attrData) {
  if (this.attrs) {
    this.attrs.push(attrData);
  } else {
    this.attrs = [ attrData ];
  }
};


/**
 * Token.attrSet(name, value)
 *
 * Set `name` attribute to `value`. Override old value if exists.
 **/
Token.prototype.attrSet = function attrSet(name, value) {
  var idx = this.attrIndex(name),
      attrData = [ name, value ];

  if (idx < 0) {
    this.attrPush(attrData);
  } else {
    this.attrs[idx] = attrData;
  }
};


/**
 * Token.attrGet(name)
 *
 * Get the value of attribute `name`, or null if it does not exist.
 **/
Token.prototype.attrGet = function attrGet(name) {
  var idx = this.attrIndex(name), value = null;
  if (idx >= 0) {
    value = this.attrs[idx][1];
  }
  return value;
};


/**
 * Token.attrJoin(name, value)
 *
 * Join value to existing attribute via space. Or create new attribute if not
 * exists. Useful to operate with token classes.
 **/
Token.prototype.attrJoin = function attrJoin(name, value) {
  var idx = this.attrIndex(name);

  if (idx < 0) {
    this.attrPush([ name, value ]);
  } else {
    this.attrs[idx][1] = this.attrs[idx][1] + ' ' + value;
  }
};


module.exports = Token;


/***/ }),
/* 37 */
/***/ (function(module, exports) {

module.exports=/[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4E\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDF55-\uDF59]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDC3B\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/

/***/ }),
/* 38 */
/***/ (function(module, exports) {

module.exports = {
  indexOf: function(arr, item) {
    var i, j;
    if (Array.prototype.indexOf) {
      return arr.indexOf(item);
    }
    for (i = 0, j = arr.length; i < j; i++) {
      if (arr[i] === item) {
        return i;
      }
    }
    return -1;
  },
  forEach: function(arr, fn, scope) {
    var i, j;
    if (Array.prototype.forEach) {
      return arr.forEach(fn, scope);
    }
    for (i = 0, j = arr.length; i < j; i++) {
      fn.call(scope, arr[i], i, arr);
    }
  },
  trim: function(str) {
    if (String.prototype.trim) {
      return str.trim();
    }
    return str.replace(/(^\s*)|(\s*$)/g, "");
  },
  spaceIndex: function(str) {
    var reg = /\s|\n|\t/;
    var match = reg.exec(str);
    return match ? match.index : -1;
  }
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CONFIG = undefined;

var _help_zhCN = __webpack_require__(203);

var _help_zhCN2 = _interopRequireDefault(_help_zhCN);

var _help_zhTW = __webpack_require__(204);

var _help_zhTW2 = _interopRequireDefault(_help_zhTW);

var _help_en = __webpack_require__(198);

var _help_en2 = _interopRequireDefault(_help_en);

var _help_fr = __webpack_require__(199);

var _help_fr2 = _interopRequireDefault(_help_fr);

var _help_ptBR = __webpack_require__(201);

var _help_ptBR2 = _interopRequireDefault(_help_ptBR);

var _help_ru = __webpack_require__(202);

var _help_ru2 = _interopRequireDefault(_help_ru);

var _help_de = __webpack_require__(197);

var _help_de2 = _interopRequireDefault(_help_de);

var _help_ja = __webpack_require__(200);

var _help_ja2 = _interopRequireDefault(_help_ja);

var _words_zhCN = __webpack_require__(237);

var _words_zhCN2 = _interopRequireDefault(_words_zhCN);

var _words_zhTW = __webpack_require__(238);

var _words_zhTW2 = _interopRequireDefault(_words_zhTW);

var _words_en = __webpack_require__(232);

var _words_en2 = _interopRequireDefault(_words_en);

var _words_fr = __webpack_require__(233);

var _words_fr2 = _interopRequireDefault(_words_fr);

var _words_ptBR = __webpack_require__(235);

var _words_ptBR2 = _interopRequireDefault(_words_ptBR);

var _words_ru = __webpack_require__(236);

var _words_ru2 = _interopRequireDefault(_words_ru);

var _words_de = __webpack_require__(231);

var _words_de2 = _interopRequireDefault(_words_de);

var _words_ja = __webpack_require__(234);

var _words_ja2 = _interopRequireDefault(_words_ja);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONFIG = exports.CONFIG = {
    'help_zh-CN': _help_zhCN2.default,
    'help_zh-TW': _help_zhTW2.default,
    'help_pt-BR': _help_ptBR2.default,
    'help_en': _help_en2.default,
    'help_fr': _help_fr2.default,
    'help_ru': _help_ru2.default,
    'help_de': _help_de2.default,
    'help_ja': _help_ja2.default,
    'words_zh-CN': _words_zhCN2.default,
    'words_zh-TW': _words_zhTW2.default,
    'words_pt-BR': _words_ptBR2.default,
    'words_en': _words_en2.default,
    'words_fr': _words_fr2.default,
    'words_ru': _words_ru2.default,
    'words_de': _words_de2.default,
    'words_ja': _words_ja2.default,
    'langList': ['en', 'zh-CN', 'zh-TW', 'fr', 'pt-BR', 'ru', 'de', 'ja'],
    'toolbars': {
        'bold': true,
        'italic': true,
        'header': true,
        'underline': true,
        'strikethrough': true,
        'mark': true,
        'superscript': true,
        'subscript': true,
        'quote': true,
        'ol': true,
        'ul': true,
        'link': true,
        'imagelink': true,
        'code': true,
        'table': true,
        'undo': true,
        'redo': true,
        'trash': true,
        'save': true,
        'alignleft': true,
        'aligncenter': true,
        'alignright': true,
        'navigation': true,
        'subfield': true,
        'fullscreen': true,
        'readmodel': true,
        'htmlcode': true,
        'help': true,
        'preview': true
    }
};

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadScript = loadScript;
exports.loadLink = loadLink;
var insertTextAtCaret = exports.insertTextAtCaret = function insertTextAtCaret(obj, _ref, $vm) {
    var prefix = _ref.prefix,
        subfix = _ref.subfix,
        str = _ref.str,
        type = _ref.type;

    obj.focus();
    if (isExistSelectionObj(obj)) {
        var startPos = obj.selectionStart;
        var endPos = obj.selectionEnd;
        var tmpStr = obj.value;
        if (startPos === endPos) {
            obj.value = tmpStr.substring(0, startPos) + prefix + str + subfix + tmpStr.substring(endPos, tmpStr.length);
            obj.selectionStart = startPos + prefix.length;
            obj.selectionEnd = startPos + (str.length + prefix.length);
        } else {
            if (tmpStr.substring(startPos - prefix.length, startPos) === prefix && tmpStr.substring(endPos, endPos + subfix.length) === subfix && judgeItalicAndBold(prefix, subfix, tmpStr, startPos, endPos)) {
                obj.value = tmpStr.substring(0, startPos - prefix.length) + tmpStr.substring(startPos, endPos) + tmpStr.substring(endPos + subfix.length, tmpStr.length);
                obj.selectionStart = startPos - prefix.length;
                obj.selectionEnd = endPos - prefix.length;
            } else {
                obj.value = tmpStr.substring(0, startPos) + prefix + tmpStr.substring(startPos, endPos) + subfix + tmpStr.substring(endPos, tmpStr.length);
                obj.selectionStart = startPos + prefix.length;
                obj.selectionEnd = startPos + (endPos - startPos + prefix.length);
            }
        }
    } else {
        alert('Error: Browser version is too low');
    }

    $vm.d_value = obj.value;
    obj.focus();
};

var code_structure = {
    prefix: "```",
    subfix: "\n```\n",
    defaultLanguageText: "language"
};

var insertCodeBlock = exports.insertCodeBlock = function insertCodeBlock($vm) {
    var obj = $vm.getTextareaDom();

    if (isExistSelectionObj(obj)) {
        var language = code_structure.defaultLanguageText;
        var startPos = obj.selectionStart,
            endPos = obj.selectionEnd,
            tmpStr = obj.value;


        if (startPos === endPos) {
            insertCodeBlockToVM(language, "", obj);
        } else {
            if (isCancelCodeBlock(obj)) {
                removeCodeBlockFromVM(obj);
            } else {
                var value = tmpStr.substring(startPos, endPos);
                insertCodeBlockToVM("", value, obj);
            }
        }
    } else {
        alert('Error: Browser version is too low');
        return;
    }

    $vm.d_value = obj.value;
    obj.focus();
};

function insertCodeBlockToVM(language, content, selectionObj) {
    var prefix = code_structure.prefix,
        subfix = code_structure.subfix;
    var startPos = selectionObj.selectionStart,
        endPos = selectionObj.selectionEnd,
        tmpStr = selectionObj.value;


    var value = tmpStr.substring(0, startPos);
    value += prefix + language + "\n";
    value += content;
    value += subfix;
    value += tmpStr.substring(endPos, tmpStr.length);

    selectionObj.value = value;
    selectionObj.selectionStart = startPos + prefix.length + (language ? 0 : 1);
    selectionObj.selectionEnd = selectionObj.selectionStart + language.length + content.length;
}

function removeCodeBlockFromVM(selectionObj) {
    var prefix = code_structure.prefix,
        subfix = code_structure.subfix,
        language = code_structure.defaultLanguageText;
    var startPos = selectionObj.selectionStart,
        endPos = selectionObj.selectionEnd,
        content = selectionObj.value;

    var selectedValue = content.substring(startPos, endPos);

    if (content.substring(startPos - 1, startPos) === "\n") {
        prefix = prefix + "\n";
    } else {
        subfix = "\n" + subfix;
        if (prefix + language + subfix === content.substring(startPos - prefix.length, endPos + subfix.length)) {
            var _value = content.substring(0, startPos - prefix.length);
            _value += content.substring(endPos + subfix.length, content.length);

            selectionObj.value = _value;
            selectionObj.selectionStart = startPos - prefix.length;
            selectionObj.selectionEnd = selectionObj.selectionStart;
            return;
        }
    }

    var value = content.substring(0, startPos - prefix.length);
    value += selectedValue;
    value += content.substring(endPos + subfix.length, content.length);

    selectionObj.value = value;
    selectionObj.selectionStart = startPos - prefix.length;
    selectionObj.selectionEnd = selectionObj.selectionStart + selectedValue.length;
}

function isExistSelectionObj(textareaDom) {
    return typeof textareaDom.selectionStart === 'number' && typeof textareaDom.selectionEnd === 'number';
}

function isCancelCodeBlock(selectionObj) {
    var startPos = selectionObj.selectionStart,
        endPos = selectionObj.selectionEnd,
        content = selectionObj.value;
    var prefix = code_structure.prefix,
        subfix = code_structure.subfix;


    if (content.substring(startPos - 1, startPos) === "\n") {
        prefix = prefix + "\n";
    } else {
        subfix = "\n" + subfix;
    }

    return content.substring(startPos - prefix.length, startPos) === prefix && content.substring(endPos, endPos + subfix.length) === subfix;
}

function judgeItalicAndBold(prefix, subfix, tmpStr, startPos, endPos) {
    if (prefix === '*' && subfix === '*') {
        if (tmpStr.substring(startPos - 2, startPos - 1) === '*' && tmpStr.substring(endPos + 1, endPos + 2) === '*') {
            return false;
        }
    }
    return true;
}
var insertOl = exports.insertOl = function insertOl($vm) {
    var obj = $vm.getTextareaDom();
    if (isExistSelectionObj(obj)) {
        var startPos = obj.selectionStart;
        var endPos = obj.selectionEnd;
        var tmpStr = obj.value;
        if (startPos === endPos) {
            obj.value = tmpStr.substring(0, startPos) + '1. ' + tmpStr.substring(endPos, tmpStr.length);
            obj.selectionEnd = obj.selectionStart = startPos + 3;
        } else {
            var start = startPos;
            while (start > 0 && tmpStr.substring(start - 1, start) !== '\n') {
                start--;
            }
            var selectStr = tmpStr.substring(start, endPos);
            var selectStrs = selectStr.split('\n');
            for (var i = 0; i < selectStrs.length; i++) {
                selectStrs[i] = i + 1 + '. ' + selectStrs[i];
            }
            var newSelectStr = selectStrs.join('\n');
            obj.value = tmpStr.substring(0, start) + newSelectStr + tmpStr.substring(endPos, tmpStr.length);
            obj.selectionStart = start;
            obj.selectionEnd = endPos + newSelectStr.length - selectStr.length;
        }
    } else {
        alert('Error: Browser version is too low');
    }

    $vm.d_value = obj.value;
    obj.focus();
};
var removeLine = exports.removeLine = function removeLine($vm) {
    var obj = $vm.getTextareaDom();
    if (isExistSelectionObj(obj)) {
        var startPos = obj.selectionStart;
        var endPos = obj.selectionEnd;
        var tmpStr = obj.value;

        var start = startPos;
        while (start > 0 && tmpStr.substring(start - 1, start) !== '\n') {
            start--;
        }
        var end = endPos;
        while (end < tmpStr.length && tmpStr.substring(end, end + 1) !== '\n') {
            end++;
        }
        if (end < tmpStr.length) {
            end++;
        }
        obj.value = tmpStr.substring(0, start) + tmpStr.substring(end, tmpStr.length);
        obj.selectionEnd = obj.selectionStart = start === 0 ? 0 : start - 1;
    } else {
        alert('Error: Browser version is too low');
    }

    $vm.d_value = obj.value;
    obj.focus();
};
var insertUl = exports.insertUl = function insertUl($vm) {
    var obj = $vm.getTextareaDom();
    if (isExistSelectionObj(obj)) {
        var startPos = obj.selectionStart;
        var endPos = obj.selectionEnd;
        var tmpStr = obj.value;
        if (startPos === endPos) {
            obj.value = tmpStr.substring(0, startPos) + '- ' + tmpStr.substring(endPos, tmpStr.length);
            obj.selectionEnd = obj.selectionStart = startPos + 2;
        } else {
            var start = startPos;
            while (start > 0 && tmpStr.substring(start - 1, start) !== '\n') {
                start--;
            }
            var selectStr = tmpStr.substring(start, endPos);
            var newSelectStr = selectStr.replace(/\n/g, '\n- ');
            newSelectStr = '- ' + newSelectStr;
            obj.value = tmpStr.substring(0, start) + newSelectStr + tmpStr.substring(endPos, tmpStr.length);
            obj.selectionStart = start;
            obj.selectionEnd = endPos + newSelectStr.length - selectStr.length;
        }
    } else {
        alert('Error: Browser version is too low');
    }

    $vm.d_value = obj.value;
    obj.focus();
};
var insertTab = exports.insertTab = function insertTab($vm, tab) {
    tab = tab ? new Array(tab).fill(' ').join('') : '\t';
    var obj = $vm.getTextareaDom();
    if (isExistSelectionObj(obj)) {
        var startPos = obj.selectionStart;
        var endPos = obj.selectionEnd;
        var tmpStr = obj.value;
        var lastLine = tmpStr.substring(0, startPos).split('\n').pop();
        if (lastLine.match(/^\s*[0-9]+\.\s+\S*/)) {
            var temp = lastLine.replace(/(\d+)/, 1);
            obj.value = tmpStr.substring(0, startPos - temp.length) + tab + temp + tmpStr.substring(endPos, tmpStr.length);
        } else if (lastLine.match(/^\s*-\s+\S*/)) {
            obj.value = tmpStr.substring(0, startPos - lastLine.length) + tab + lastLine + tmpStr.substring(endPos, tmpStr.length);
        } else {
            obj.value = tmpStr.substring(0, startPos) + tab + tmpStr.substring(endPos, tmpStr.length);
        }
        obj.selectionStart = obj.selectionEnd = startPos + tab.length;
    } else {
        alert('Error: Browser version is too low');
    }

    $vm.d_value = obj.value;
    obj.focus();
};
var unInsertTab = exports.unInsertTab = function unInsertTab($vm, tab) {
    var regTab = new RegExp(tab ? "\\s{" + tab + "}" : '\t');
    console.log("regTab:", regTab);
    var obj = $vm.getTextareaDom();
    if (isExistSelectionObj(obj)) {
        var startPos = obj.selectionStart;
        var endPos = obj.selectionEnd;
        var tmpStr = obj.value;
        var lastLine = tmpStr.substring(0, startPos).split('\n').pop();
        if (lastLine.search(regTab) >= 0) {
            obj.value = tmpStr.substring(0, startPos - lastLine.length) + lastLine.replace(regTab, '') + tmpStr.substring(endPos, tmpStr.length);
            obj.selectionStart = obj.selectionEnd = startPos - (tab || 1);
        }
    } else {
        alert('Error: Browser version is too low');
    }

    $vm.d_value = obj.value;
    obj.focus();
};
var insertEnter = exports.insertEnter = function insertEnter($vm, event) {
    var obj = $vm.getTextareaDom();
    if (isExistSelectionObj(obj)) {
        var startPos = obj.selectionStart;
        var endPos = obj.selectionEnd;
        var tmpStr = obj.value;

        var lastLine = tmpStr.substring(0, startPos).split('\n').pop();
        var matchListNeedChangeLine = lastLine.match(/^\s*(?:[0-9]+\.|-)\s+\S+/);
        if (matchListNeedChangeLine) {
            event.preventDefault();

            var subfix = matchListNeedChangeLine.shift().match(/^\s*(?:[0-9]+\.|-)\s/).shift();
            if (subfix.search(/-/) >= 0) {
                obj.value = tmpStr.substring(0, startPos) + '\n' + subfix + tmpStr.substring(endPos, tmpStr.length);
                obj.selectionStart = obj.selectionEnd = startPos + subfix.length + 1;
            } else {
                var temp = subfix.replace(/(\d+)/, parseInt(subfix) + 1);
                obj.value = tmpStr.substring(0, startPos) + '\n' + temp + tmpStr.substring(endPos, tmpStr.length);
                obj.selectionStart = obj.selectionEnd = startPos + temp.length + 1;
            }
        } else {
            var matchListNeedRemoveLine = lastLine.match(/^\s*(?:[0-9]+\.|-)\s+$/);
            if (matchListNeedRemoveLine) {
                event.preventDefault();
                var preLength = matchListNeedRemoveLine.shift().length;
                obj.value = tmpStr.substring(0, startPos - preLength) + '\n' + tmpStr.substring(endPos, tmpStr.length);
                obj.selectionStart = obj.selectionEnd = startPos - preLength;
            }
        }
    } else {
        alert('Error: Browser version is too low');
    }
    $vm.d_value = obj.value;
    obj.focus();
};
var getNavigation = exports.getNavigation = function getNavigation($vm, full) {
    var navigationContent = void 0;

    navigationContent = $vm.$refs.navigationContent;

    navigationContent.innerHTML = $vm.d_render;
    var nodes = navigationContent.children;
    if (nodes.length) {
        for (var i = 0; i < nodes.length; i++) {
            judageH(nodes[i], i, nodes);
        }
    }
    function judageH(node, i, nodes) {
        var reg = /^H[1-6]{1}$/;
        if (!reg.exec(node.tagName)) {
            node.style.display = 'none';
        } else {
            node.onclick = function () {
                var vShowContent = $vm.$refs.vShowContent;
                var vNoteEdit = $vm.$refs.vNoteEdit;
                if ($vm.s_subfield) {
                    if ($vm.s_preview_switch) {
                        vNoteEdit.scrollTop = vShowContent.children[i].offsetTop * (vNoteEdit.scrollHeight - vNoteEdit.offsetHeight) / (vShowContent.scrollHeight - vShowContent.offsetHeight);
                    } else {}
                } else {
                    if ($vm.s_preview_switch) {
                        vShowContent.scrollTop = vShowContent.children[i].offsetTop;
                    } else {}
                }
            };
        }
    }
};

var scrollLink = exports.scrollLink = function scrollLink($event, $vm) {
    var element = $event.srcElement ? $event.srcElement : $event.target;
    var ratio = element.scrollTop / (element.scrollHeight - element.offsetHeight);
    if ($vm.edit_scroll_height >= 0 && element.scrollHeight !== $vm.edit_scroll_height && element.scrollHeight - element.offsetHeight - element.scrollTop <= 30) {
        $vm.$refs.vNoteEdit.scrollTop = element.scrollHeight - element.offsetHeight;
        ratio = 1;
    }
    $vm.edit_scroll_height = element.scrollHeight;

    if ($vm.$refs.vShowContent.scrollHeight > $vm.$refs.vShowContent.offsetHeight) {
        $vm.$refs.vShowContent.scrollTop = ($vm.$refs.vShowContent.scrollHeight - $vm.$refs.vShowContent.offsetHeight) * ratio;
    }
};
var fullscreenchange = exports.fullscreenchange = function fullscreenchange($vm) {
    $vm.$el.addEventListener('fullscreenchange', function (e) {
        $vm.$toolbar_right_read_change_status();
    }, false);
    $vm.$el.addEventListener('mozfullscreenchange', function (e) {
        $vm.$toolbar_right_read_change_status();
    }, false);
    $vm.$el.addEventListener('webkitfullscreenchange', function (e) {
        $vm.$toolbar_right_read_change_status();
    }, false);
    $vm.$el.addEventListener('msfullscreenchange', function (e) {
        $vm.$toolbar_right_read_change_status();
    }, false);
};

var windowResize = exports.windowResize = function windowResize($vm) {
    function sizeToStatus() {
        if ($vm.$el.clientWidth > 768) {
            $vm.s_subfield = $vm.subfield;
        } else {
            $vm.s_subfield = false;
        }
    }

    sizeToStatus();
    window.addEventListener('resize', sizeToStatus);
};

function loadScript(src, callback) {
    if (!(typeof callback === 'function')) {
        callback = function callback() {};
    }
    var check = document.querySelectorAll("script[src='" + src + "']");
    if (check.length > 0) {
        check[0].addEventListener('load', function () {
            callback();
        });
        callback();
        return;
    }
    var script = document.createElement('script');
    var head = document.getElementsByTagName('head')[0];
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    script.src = src;
    if (script.addEventListener) {
        script.addEventListener('load', function () {
            callback();
        }, false);
    } else if (script.attachEvent) {
        script.attachEvent('onreadystatechange', function () {
            var target = window.event.srcElement;
            if (target.readyState === 'loaded') {
                callback();
            }
        });
    }
    head.appendChild(script);
}

function loadLink(src, callback, id) {
    if (!(typeof callback === 'function')) {
        callback = function callback() {};
    }
    var check = document.querySelectorAll("link[href='" + src + "']");
    if (check.length > 0) {
        callback();
        return;
    }

    if (id) {
        var styles = document.querySelectorAll("link#" + id);
        if (styles.length) {
            styles[0].href = src;
            return;
        }
    }

    var link = document.createElement('link');
    var head = document.getElementsByTagName('head')[0];
    link.rel = 'stylesheet';
    link.href = src;
    id && (link['id'] = id);
    if (link.addEventListener) {
        link.addEventListener('load', function () {
            callback();
        }, false);
    } else if (link.attachEvent) {
        link.attachEvent('onreadystatechange', function () {
            var target = window.event.srcElement;
            if (target.readyState === 'loaded') {
                callback();
            }
        });
    }
    head.appendChild(link);
}

var ImagePreviewListener = exports.ImagePreviewListener = function ImagePreviewListener($vm) {
    $vm.$refs.vShowContent.addEventListener('click', function (event) {
        event = event ? event : window.event;
        var ele = event.srcElement ? event.srcElement : event.target;
        if (ele.tagName === 'IMG') {
            if ($vm.imageClick != null) {
                $vm.imageClick(ele);
            } else {
                $vm.d_preview_imgsrc = ele.src;
            }
        }
    });
};

/***/ }),
/* 41 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(11);
var document = __webpack_require__(1).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(1);
var core = __webpack_require__(13);
var ctx = __webpack_require__(92);
var hide = __webpack_require__(7);
var has = __webpack_require__(2);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(6) && !__webpack_require__(14)(function () {
  return Object.defineProperty(__webpack_require__(42)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(15);
var $export = __webpack_require__(43);
var redefine = __webpack_require__(50);
var hide = __webpack_require__(7);
var Iterators = __webpack_require__(24);
var $iterCreate = __webpack_require__(97);
var setToStringTag = __webpack_require__(27);
var getPrototypeOf = __webpack_require__(103);
var ITERATOR = __webpack_require__(10)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(12);
var dPs = __webpack_require__(100);
var enumBugKeys = __webpack_require__(23);
var IE_PROTO = __webpack_require__(28)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(42)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(94).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(49);
var hiddenKeys = __webpack_require__(23).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),
/* 48 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(2);
var toIObject = __webpack_require__(9);
var arrayIndexOf = __webpack_require__(91)(false);
var IE_PROTO = __webpack_require__(28)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(7);


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(22);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 52 */
/***/ (function(module, exports) {

/**
 * cssfilter
 *
 * @author 老雷<leizongmin@gmail.com>
 */

function getDefaultWhiteList () {
  // 白名单值说明：
  // true: 允许该属性
  // Function: function (val) { } 返回true表示允许该属性，其他值均表示不允许
  // RegExp: regexp.test(val) 返回true表示允许该属性，其他值均表示不允许
  // 除上面列出的值外均表示不允许
  var whiteList = {};

  whiteList['align-content'] = false; // default: auto
  whiteList['align-items'] = false; // default: auto
  whiteList['align-self'] = false; // default: auto
  whiteList['alignment-adjust'] = false; // default: auto
  whiteList['alignment-baseline'] = false; // default: baseline
  whiteList['all'] = false; // default: depending on individual properties
  whiteList['anchor-point'] = false; // default: none
  whiteList['animation'] = false; // default: depending on individual properties
  whiteList['animation-delay'] = false; // default: 0
  whiteList['animation-direction'] = false; // default: normal
  whiteList['animation-duration'] = false; // default: 0
  whiteList['animation-fill-mode'] = false; // default: none
  whiteList['animation-iteration-count'] = false; // default: 1
  whiteList['animation-name'] = false; // default: none
  whiteList['animation-play-state'] = false; // default: running
  whiteList['animation-timing-function'] = false; // default: ease
  whiteList['azimuth'] = false; // default: center
  whiteList['backface-visibility'] = false; // default: visible
  whiteList['background'] = true; // default: depending on individual properties
  whiteList['background-attachment'] = true; // default: scroll
  whiteList['background-clip'] = true; // default: border-box
  whiteList['background-color'] = true; // default: transparent
  whiteList['background-image'] = true; // default: none
  whiteList['background-origin'] = true; // default: padding-box
  whiteList['background-position'] = true; // default: 0% 0%
  whiteList['background-repeat'] = true; // default: repeat
  whiteList['background-size'] = true; // default: auto
  whiteList['baseline-shift'] = false; // default: baseline
  whiteList['binding'] = false; // default: none
  whiteList['bleed'] = false; // default: 6pt
  whiteList['bookmark-label'] = false; // default: content()
  whiteList['bookmark-level'] = false; // default: none
  whiteList['bookmark-state'] = false; // default: open
  whiteList['border'] = true; // default: depending on individual properties
  whiteList['border-bottom'] = true; // default: depending on individual properties
  whiteList['border-bottom-color'] = true; // default: current color
  whiteList['border-bottom-left-radius'] = true; // default: 0
  whiteList['border-bottom-right-radius'] = true; // default: 0
  whiteList['border-bottom-style'] = true; // default: none
  whiteList['border-bottom-width'] = true; // default: medium
  whiteList['border-collapse'] = true; // default: separate
  whiteList['border-color'] = true; // default: depending on individual properties
  whiteList['border-image'] = true; // default: none
  whiteList['border-image-outset'] = true; // default: 0
  whiteList['border-image-repeat'] = true; // default: stretch
  whiteList['border-image-slice'] = true; // default: 100%
  whiteList['border-image-source'] = true; // default: none
  whiteList['border-image-width'] = true; // default: 1
  whiteList['border-left'] = true; // default: depending on individual properties
  whiteList['border-left-color'] = true; // default: current color
  whiteList['border-left-style'] = true; // default: none
  whiteList['border-left-width'] = true; // default: medium
  whiteList['border-radius'] = true; // default: 0
  whiteList['border-right'] = true; // default: depending on individual properties
  whiteList['border-right-color'] = true; // default: current color
  whiteList['border-right-style'] = true; // default: none
  whiteList['border-right-width'] = true; // default: medium
  whiteList['border-spacing'] = true; // default: 0
  whiteList['border-style'] = true; // default: depending on individual properties
  whiteList['border-top'] = true; // default: depending on individual properties
  whiteList['border-top-color'] = true; // default: current color
  whiteList['border-top-left-radius'] = true; // default: 0
  whiteList['border-top-right-radius'] = true; // default: 0
  whiteList['border-top-style'] = true; // default: none
  whiteList['border-top-width'] = true; // default: medium
  whiteList['border-width'] = true; // default: depending on individual properties
  whiteList['bottom'] = false; // default: auto
  whiteList['box-decoration-break'] = true; // default: slice
  whiteList['box-shadow'] = true; // default: none
  whiteList['box-sizing'] = true; // default: content-box
  whiteList['box-snap'] = true; // default: none
  whiteList['box-suppress'] = true; // default: show
  whiteList['break-after'] = true; // default: auto
  whiteList['break-before'] = true; // default: auto
  whiteList['break-inside'] = true; // default: auto
  whiteList['caption-side'] = false; // default: top
  whiteList['chains'] = false; // default: none
  whiteList['clear'] = true; // default: none
  whiteList['clip'] = false; // default: auto
  whiteList['clip-path'] = false; // default: none
  whiteList['clip-rule'] = false; // default: nonzero
  whiteList['color'] = true; // default: implementation dependent
  whiteList['color-interpolation-filters'] = true; // default: auto
  whiteList['column-count'] = false; // default: auto
  whiteList['column-fill'] = false; // default: balance
  whiteList['column-gap'] = false; // default: normal
  whiteList['column-rule'] = false; // default: depending on individual properties
  whiteList['column-rule-color'] = false; // default: current color
  whiteList['column-rule-style'] = false; // default: medium
  whiteList['column-rule-width'] = false; // default: medium
  whiteList['column-span'] = false; // default: none
  whiteList['column-width'] = false; // default: auto
  whiteList['columns'] = false; // default: depending on individual properties
  whiteList['contain'] = false; // default: none
  whiteList['content'] = false; // default: normal
  whiteList['counter-increment'] = false; // default: none
  whiteList['counter-reset'] = false; // default: none
  whiteList['counter-set'] = false; // default: none
  whiteList['crop'] = false; // default: auto
  whiteList['cue'] = false; // default: depending on individual properties
  whiteList['cue-after'] = false; // default: none
  whiteList['cue-before'] = false; // default: none
  whiteList['cursor'] = false; // default: auto
  whiteList['direction'] = false; // default: ltr
  whiteList['display'] = true; // default: depending on individual properties
  whiteList['display-inside'] = true; // default: auto
  whiteList['display-list'] = true; // default: none
  whiteList['display-outside'] = true; // default: inline-level
  whiteList['dominant-baseline'] = false; // default: auto
  whiteList['elevation'] = false; // default: level
  whiteList['empty-cells'] = false; // default: show
  whiteList['filter'] = false; // default: none
  whiteList['flex'] = false; // default: depending on individual properties
  whiteList['flex-basis'] = false; // default: auto
  whiteList['flex-direction'] = false; // default: row
  whiteList['flex-flow'] = false; // default: depending on individual properties
  whiteList['flex-grow'] = false; // default: 0
  whiteList['flex-shrink'] = false; // default: 1
  whiteList['flex-wrap'] = false; // default: nowrap
  whiteList['float'] = false; // default: none
  whiteList['float-offset'] = false; // default: 0 0
  whiteList['flood-color'] = false; // default: black
  whiteList['flood-opacity'] = false; // default: 1
  whiteList['flow-from'] = false; // default: none
  whiteList['flow-into'] = false; // default: none
  whiteList['font'] = true; // default: depending on individual properties
  whiteList['font-family'] = true; // default: implementation dependent
  whiteList['font-feature-settings'] = true; // default: normal
  whiteList['font-kerning'] = true; // default: auto
  whiteList['font-language-override'] = true; // default: normal
  whiteList['font-size'] = true; // default: medium
  whiteList['font-size-adjust'] = true; // default: none
  whiteList['font-stretch'] = true; // default: normal
  whiteList['font-style'] = true; // default: normal
  whiteList['font-synthesis'] = true; // default: weight style
  whiteList['font-variant'] = true; // default: normal
  whiteList['font-variant-alternates'] = true; // default: normal
  whiteList['font-variant-caps'] = true; // default: normal
  whiteList['font-variant-east-asian'] = true; // default: normal
  whiteList['font-variant-ligatures'] = true; // default: normal
  whiteList['font-variant-numeric'] = true; // default: normal
  whiteList['font-variant-position'] = true; // default: normal
  whiteList['font-weight'] = true; // default: normal
  whiteList['grid'] = false; // default: depending on individual properties
  whiteList['grid-area'] = false; // default: depending on individual properties
  whiteList['grid-auto-columns'] = false; // default: auto
  whiteList['grid-auto-flow'] = false; // default: none
  whiteList['grid-auto-rows'] = false; // default: auto
  whiteList['grid-column'] = false; // default: depending on individual properties
  whiteList['grid-column-end'] = false; // default: auto
  whiteList['grid-column-start'] = false; // default: auto
  whiteList['grid-row'] = false; // default: depending on individual properties
  whiteList['grid-row-end'] = false; // default: auto
  whiteList['grid-row-start'] = false; // default: auto
  whiteList['grid-template'] = false; // default: depending on individual properties
  whiteList['grid-template-areas'] = false; // default: none
  whiteList['grid-template-columns'] = false; // default: none
  whiteList['grid-template-rows'] = false; // default: none
  whiteList['hanging-punctuation'] = false; // default: none
  whiteList['height'] = true; // default: auto
  whiteList['hyphens'] = false; // default: manual
  whiteList['icon'] = false; // default: auto
  whiteList['image-orientation'] = false; // default: auto
  whiteList['image-resolution'] = false; // default: normal
  whiteList['ime-mode'] = false; // default: auto
  whiteList['initial-letters'] = false; // default: normal
  whiteList['inline-box-align'] = false; // default: last
  whiteList['justify-content'] = false; // default: auto
  whiteList['justify-items'] = false; // default: auto
  whiteList['justify-self'] = false; // default: auto
  whiteList['left'] = false; // default: auto
  whiteList['letter-spacing'] = true; // default: normal
  whiteList['lighting-color'] = true; // default: white
  whiteList['line-box-contain'] = false; // default: block inline replaced
  whiteList['line-break'] = false; // default: auto
  whiteList['line-grid'] = false; // default: match-parent
  whiteList['line-height'] = false; // default: normal
  whiteList['line-snap'] = false; // default: none
  whiteList['line-stacking'] = false; // default: depending on individual properties
  whiteList['line-stacking-ruby'] = false; // default: exclude-ruby
  whiteList['line-stacking-shift'] = false; // default: consider-shifts
  whiteList['line-stacking-strategy'] = false; // default: inline-line-height
  whiteList['list-style'] = true; // default: depending on individual properties
  whiteList['list-style-image'] = true; // default: none
  whiteList['list-style-position'] = true; // default: outside
  whiteList['list-style-type'] = true; // default: disc
  whiteList['margin'] = true; // default: depending on individual properties
  whiteList['margin-bottom'] = true; // default: 0
  whiteList['margin-left'] = true; // default: 0
  whiteList['margin-right'] = true; // default: 0
  whiteList['margin-top'] = true; // default: 0
  whiteList['marker-offset'] = false; // default: auto
  whiteList['marker-side'] = false; // default: list-item
  whiteList['marks'] = false; // default: none
  whiteList['mask'] = false; // default: border-box
  whiteList['mask-box'] = false; // default: see individual properties
  whiteList['mask-box-outset'] = false; // default: 0
  whiteList['mask-box-repeat'] = false; // default: stretch
  whiteList['mask-box-slice'] = false; // default: 0 fill
  whiteList['mask-box-source'] = false; // default: none
  whiteList['mask-box-width'] = false; // default: auto
  whiteList['mask-clip'] = false; // default: border-box
  whiteList['mask-image'] = false; // default: none
  whiteList['mask-origin'] = false; // default: border-box
  whiteList['mask-position'] = false; // default: center
  whiteList['mask-repeat'] = false; // default: no-repeat
  whiteList['mask-size'] = false; // default: border-box
  whiteList['mask-source-type'] = false; // default: auto
  whiteList['mask-type'] = false; // default: luminance
  whiteList['max-height'] = true; // default: none
  whiteList['max-lines'] = false; // default: none
  whiteList['max-width'] = true; // default: none
  whiteList['min-height'] = true; // default: 0
  whiteList['min-width'] = true; // default: 0
  whiteList['move-to'] = false; // default: normal
  whiteList['nav-down'] = false; // default: auto
  whiteList['nav-index'] = false; // default: auto
  whiteList['nav-left'] = false; // default: auto
  whiteList['nav-right'] = false; // default: auto
  whiteList['nav-up'] = false; // default: auto
  whiteList['object-fit'] = false; // default: fill
  whiteList['object-position'] = false; // default: 50% 50%
  whiteList['opacity'] = false; // default: 1
  whiteList['order'] = false; // default: 0
  whiteList['orphans'] = false; // default: 2
  whiteList['outline'] = false; // default: depending on individual properties
  whiteList['outline-color'] = false; // default: invert
  whiteList['outline-offset'] = false; // default: 0
  whiteList['outline-style'] = false; // default: none
  whiteList['outline-width'] = false; // default: medium
  whiteList['overflow'] = false; // default: depending on individual properties
  whiteList['overflow-wrap'] = false; // default: normal
  whiteList['overflow-x'] = false; // default: visible
  whiteList['overflow-y'] = false; // default: visible
  whiteList['padding'] = true; // default: depending on individual properties
  whiteList['padding-bottom'] = true; // default: 0
  whiteList['padding-left'] = true; // default: 0
  whiteList['padding-right'] = true; // default: 0
  whiteList['padding-top'] = true; // default: 0
  whiteList['page'] = false; // default: auto
  whiteList['page-break-after'] = false; // default: auto
  whiteList['page-break-before'] = false; // default: auto
  whiteList['page-break-inside'] = false; // default: auto
  whiteList['page-policy'] = false; // default: start
  whiteList['pause'] = false; // default: implementation dependent
  whiteList['pause-after'] = false; // default: implementation dependent
  whiteList['pause-before'] = false; // default: implementation dependent
  whiteList['perspective'] = false; // default: none
  whiteList['perspective-origin'] = false; // default: 50% 50%
  whiteList['pitch'] = false; // default: medium
  whiteList['pitch-range'] = false; // default: 50
  whiteList['play-during'] = false; // default: auto
  whiteList['position'] = false; // default: static
  whiteList['presentation-level'] = false; // default: 0
  whiteList['quotes'] = false; // default: text
  whiteList['region-fragment'] = false; // default: auto
  whiteList['resize'] = false; // default: none
  whiteList['rest'] = false; // default: depending on individual properties
  whiteList['rest-after'] = false; // default: none
  whiteList['rest-before'] = false; // default: none
  whiteList['richness'] = false; // default: 50
  whiteList['right'] = false; // default: auto
  whiteList['rotation'] = false; // default: 0
  whiteList['rotation-point'] = false; // default: 50% 50%
  whiteList['ruby-align'] = false; // default: auto
  whiteList['ruby-merge'] = false; // default: separate
  whiteList['ruby-position'] = false; // default: before
  whiteList['shape-image-threshold'] = false; // default: 0.0
  whiteList['shape-outside'] = false; // default: none
  whiteList['shape-margin'] = false; // default: 0
  whiteList['size'] = false; // default: auto
  whiteList['speak'] = false; // default: auto
  whiteList['speak-as'] = false; // default: normal
  whiteList['speak-header'] = false; // default: once
  whiteList['speak-numeral'] = false; // default: continuous
  whiteList['speak-punctuation'] = false; // default: none
  whiteList['speech-rate'] = false; // default: medium
  whiteList['stress'] = false; // default: 50
  whiteList['string-set'] = false; // default: none
  whiteList['tab-size'] = false; // default: 8
  whiteList['table-layout'] = false; // default: auto
  whiteList['text-align'] = true; // default: start
  whiteList['text-align-last'] = true; // default: auto
  whiteList['text-combine-upright'] = true; // default: none
  whiteList['text-decoration'] = true; // default: none
  whiteList['text-decoration-color'] = true; // default: currentColor
  whiteList['text-decoration-line'] = true; // default: none
  whiteList['text-decoration-skip'] = true; // default: objects
  whiteList['text-decoration-style'] = true; // default: solid
  whiteList['text-emphasis'] = true; // default: depending on individual properties
  whiteList['text-emphasis-color'] = true; // default: currentColor
  whiteList['text-emphasis-position'] = true; // default: over right
  whiteList['text-emphasis-style'] = true; // default: none
  whiteList['text-height'] = true; // default: auto
  whiteList['text-indent'] = true; // default: 0
  whiteList['text-justify'] = true; // default: auto
  whiteList['text-orientation'] = true; // default: mixed
  whiteList['text-overflow'] = true; // default: clip
  whiteList['text-shadow'] = true; // default: none
  whiteList['text-space-collapse'] = true; // default: collapse
  whiteList['text-transform'] = true; // default: none
  whiteList['text-underline-position'] = true; // default: auto
  whiteList['text-wrap'] = true; // default: normal
  whiteList['top'] = false; // default: auto
  whiteList['transform'] = false; // default: none
  whiteList['transform-origin'] = false; // default: 50% 50% 0
  whiteList['transform-style'] = false; // default: flat
  whiteList['transition'] = false; // default: depending on individual properties
  whiteList['transition-delay'] = false; // default: 0s
  whiteList['transition-duration'] = false; // default: 0s
  whiteList['transition-property'] = false; // default: all
  whiteList['transition-timing-function'] = false; // default: ease
  whiteList['unicode-bidi'] = false; // default: normal
  whiteList['vertical-align'] = false; // default: baseline
  whiteList['visibility'] = false; // default: visible
  whiteList['voice-balance'] = false; // default: center
  whiteList['voice-duration'] = false; // default: auto
  whiteList['voice-family'] = false; // default: implementation dependent
  whiteList['voice-pitch'] = false; // default: medium
  whiteList['voice-range'] = false; // default: medium
  whiteList['voice-rate'] = false; // default: normal
  whiteList['voice-stress'] = false; // default: normal
  whiteList['voice-volume'] = false; // default: medium
  whiteList['volume'] = false; // default: medium
  whiteList['white-space'] = false; // default: normal
  whiteList['widows'] = false; // default: 2
  whiteList['width'] = true; // default: auto
  whiteList['will-change'] = false; // default: auto
  whiteList['word-break'] = true; // default: normal
  whiteList['word-spacing'] = true; // default: normal
  whiteList['word-wrap'] = true; // default: normal
  whiteList['wrap-flow'] = false; // default: auto
  whiteList['wrap-through'] = false; // default: wrap
  whiteList['writing-mode'] = false; // default: horizontal-tb
  whiteList['z-index'] = false; // default: auto

  return whiteList;
}


/**
 * 匹配到白名单上的一个属性时
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {String}
 */
function onAttr (name, value, options) {
  // do nothing
}

/**
 * 匹配到不在白名单上的一个属性时
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {String}
 */
function onIgnoreAttr (name, value, options) {
  // do nothing
}

var REGEXP_URL_JAVASCRIPT = /javascript\s*\:/img;

/**
 * 过滤属性值
 *
 * @param {String} name
 * @param {String} value
 * @return {String}
 */
function safeAttrValue(name, value) {
  if (REGEXP_URL_JAVASCRIPT.test(value)) return '';
  return value;
}


exports.whiteList = getDefaultWhiteList();
exports.getDefaultWhiteList = getDefaultWhiteList;
exports.onAttr = onAttr;
exports.onIgnoreAttr = onIgnoreAttr;
exports.safeAttrValue = safeAttrValue;


/***/ }),
/* 53 */
/***/ (function(module, exports) {

module.exports = {
  indexOf: function (arr, item) {
    var i, j;
    if (Array.prototype.indexOf) {
      return arr.indexOf(item);
    }
    for (i = 0, j = arr.length; i < j; i++) {
      if (arr[i] === item) {
        return i;
      }
    }
    return -1;
  },
  forEach: function (arr, fn, scope) {
    var i, j;
    if (Array.prototype.forEach) {
      return arr.forEach(fn, scope);
    }
    for (i = 0, j = arr.length; i < j; i++) {
      fn.call(scope, arr[i], i, arr);
    }
  },
  trim: function (str) {
    if (String.prototype.trim) {
      return str.trim();
    }
    return str.replace(/(^\s*)|(\s*$)/g, '');
  },
  trimRight: function (str) {
    if (String.prototype.trimRight) {
      return str.trimRight();
    }
    return str.replace(/(\s*$)/g, '');
  }
};


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// HTML5 entities map: { name -> utf16string }
//


/*eslint quotes:0*/
module.exports = __webpack_require__(123);


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Regexps to match html elements



var attr_name     = '[a-zA-Z_:][a-zA-Z0-9:._-]*';

var unquoted      = '[^"\'=<>`\\x00-\\x20]+';
var single_quoted = "'[^']*'";
var double_quoted = '"[^"]*"';

var attr_value  = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')';

var attribute   = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)';

var open_tag    = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';

var close_tag   = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
var comment     = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->';
var processing  = '<[?].*?[?]>';
var declaration = '<![A-Z]+\\s+[^>]*>';
var cdata       = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';

var HTML_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + '|' + comment +
                        '|' + processing + '|' + declaration + '|' + cdata + ')');
var HTML_OPEN_CLOSE_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + ')');

module.exports.HTML_TAG_RE = HTML_TAG_RE;
module.exports.HTML_OPEN_CLOSE_TAG_RE = HTML_OPEN_CLOSE_TAG_RE;


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process *this* and _that_
//



// Insert each marker as a separate text token, and add it to delimiter list
//
module.exports.tokenize = function emphasis(state, silent) {
  var i, scanned, token,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (silent) { return false; }

  if (marker !== 0x5F /* _ */ && marker !== 0x2A /* * */) { return false; }

  scanned = state.scanDelims(state.pos, marker === 0x2A);

  for (i = 0; i < scanned.length; i++) {
    token         = state.push('text', '', 0);
    token.content = String.fromCharCode(marker);

    state.delimiters.push({
      // Char code of the starting marker (number).
      //
      marker: marker,

      // Total length of these series of delimiters.
      //
      length: scanned.length,

      // An amount of characters before this one that's equivalent to
      // current one. In plain English: if this delimiter does not open
      // an emphasis, neither do previous `jump` characters.
      //
      // Used to skip sequences like "*****" in one step, for 1st asterisk
      // value will be 0, for 2nd it's 1 and so on.
      //
      jump:   i,

      // A position of the token this delimiter corresponds to.
      //
      token:  state.tokens.length - 1,

      // If this delimiter is matched as a valid opener, `end` will be
      // equal to its position, otherwise it's `-1`.
      //
      end:    -1,

      // Boolean flags that determine if this delimiter could open or close
      // an emphasis.
      //
      open:   scanned.can_open,
      close:  scanned.can_close
    });
  }

  state.pos += scanned.length;

  return true;
};


function postProcess(state, delimiters) {
  var i,
      startDelim,
      endDelim,
      token,
      ch,
      isStrong,
      max = delimiters.length;

  for (i = max - 1; i >= 0; i--) {
    startDelim = delimiters[i];

    if (startDelim.marker !== 0x5F/* _ */ && startDelim.marker !== 0x2A/* * */) {
      continue;
    }

    // Process only opening markers
    if (startDelim.end === -1) {
      continue;
    }

    endDelim = delimiters[startDelim.end];

    // If the previous delimiter has the same marker and is adjacent to this one,
    // merge those into one strong delimiter.
    //
    // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
    //
    isStrong = i > 0 &&
               delimiters[i - 1].end === startDelim.end + 1 &&
               delimiters[i - 1].token === startDelim.token - 1 &&
               delimiters[startDelim.end + 1].token === endDelim.token + 1 &&
               delimiters[i - 1].marker === startDelim.marker;

    ch = String.fromCharCode(startDelim.marker);

    token         = state.tokens[startDelim.token];
    token.type    = isStrong ? 'strong_open' : 'em_open';
    token.tag     = isStrong ? 'strong' : 'em';
    token.nesting = 1;
    token.markup  = isStrong ? ch + ch : ch;
    token.content = '';

    token         = state.tokens[endDelim.token];
    token.type    = isStrong ? 'strong_close' : 'em_close';
    token.tag     = isStrong ? 'strong' : 'em';
    token.nesting = -1;
    token.markup  = isStrong ? ch + ch : ch;
    token.content = '';

    if (isStrong) {
      state.tokens[delimiters[i - 1].token].content = '';
      state.tokens[delimiters[startDelim.end + 1].token].content = '';
      i--;
    }
  }
}


// Walk through delimiter list and replace text tokens with tags
//
module.exports.postProcess = function emphasis(state) {
  var curr,
      tokens_meta = state.tokens_meta,
      max = state.tokens_meta.length;

  postProcess(state, state.delimiters);

  for (curr = 0; curr < max; curr++) {
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      postProcess(state, tokens_meta[curr].delimiters);
    }
  }
};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// ~~strike through~~
//



// Insert each marker as a separate text token, and add it to delimiter list
//
module.exports.tokenize = function strikethrough(state, silent) {
  var i, scanned, token, len, ch,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (silent) { return false; }

  if (marker !== 0x7E/* ~ */) { return false; }

  scanned = state.scanDelims(state.pos, true);
  len = scanned.length;
  ch = String.fromCharCode(marker);

  if (len < 2) { return false; }

  if (len % 2) {
    token         = state.push('text', '', 0);
    token.content = ch;
    len--;
  }

  for (i = 0; i < len; i += 2) {
    token         = state.push('text', '', 0);
    token.content = ch + ch;

    state.delimiters.push({
      marker: marker,
      length: 0, // disable "rule of 3" length checks meant for emphasis
      jump:   i,
      token:  state.tokens.length - 1,
      end:    -1,
      open:   scanned.can_open,
      close:  scanned.can_close
    });
  }

  state.pos += scanned.length;

  return true;
};


function postProcess(state, delimiters) {
  var i, j,
      startDelim,
      endDelim,
      token,
      loneMarkers = [],
      max = delimiters.length;

  for (i = 0; i < max; i++) {
    startDelim = delimiters[i];

    if (startDelim.marker !== 0x7E/* ~ */) {
      continue;
    }

    if (startDelim.end === -1) {
      continue;
    }

    endDelim = delimiters[startDelim.end];

    token         = state.tokens[startDelim.token];
    token.type    = 's_open';
    token.tag     = 's';
    token.nesting = 1;
    token.markup  = '~~';
    token.content = '';

    token         = state.tokens[endDelim.token];
    token.type    = 's_close';
    token.tag     = 's';
    token.nesting = -1;
    token.markup  = '~~';
    token.content = '';

    if (state.tokens[endDelim.token - 1].type === 'text' &&
        state.tokens[endDelim.token - 1].content === '~') {

      loneMarkers.push(endDelim.token - 1);
    }
  }

  // If a marker sequence has an odd number of characters, it's splitted
  // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
  // start of the sequence.
  //
  // So, we have to move all those markers after subsequent s_close tags.
  //
  while (loneMarkers.length) {
    i = loneMarkers.pop();
    j = i + 1;

    while (j < state.tokens.length && state.tokens[j].type === 's_close') {
      j++;
    }

    j--;

    if (i !== j) {
      token = state.tokens[j];
      state.tokens[j] = state.tokens[i];
      state.tokens[i] = token;
    }
  }
}


// Walk through delimiter list and replace text tokens with tags
//
module.exports.postProcess = function strikethrough(state) {
  var curr,
      tokens_meta = state.tokens_meta,
      max = state.tokens_meta.length;

  postProcess(state, state.delimiters);

  for (curr = 0; curr < max; curr++) {
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      postProcess(state, tokens_meta[curr].delimiters);
    }
  }
};


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports.encode = __webpack_require__(193);
module.exports.decode = __webpack_require__(192);
module.exports.format = __webpack_require__(194);
module.exports.parse  = __webpack_require__(195);


/***/ }),
/* 59 */,
/* 60 */
/***/ (function(module, exports) {

module.exports=/[\0-\x1F\x7F-\x9F]/

/***/ }),
/* 61 */
/***/ (function(module, exports) {

module.exports=/[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/

/***/ }),
/* 62 */
/***/ (function(module, exports) {

module.exports=/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(222)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(71),
  /* template */
  __webpack_require__(216),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-548e2160",
  /* moduleIdentifier (server only) */
  null
)
Component.options.__file = "D:\\work\\songwang\\test\\mavonEditor\\src\\components\\md-toolbar-left.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key.substr(0, 2) !== "__"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] md-toolbar-left.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-548e2160", Component.options)
  } else {
    hotAPI.reload("data-v-548e2160", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(72),
  /* template */
  __webpack_require__(214),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)
Component.options.__file = "D:\\work\\songwang\\test\\mavonEditor\\src\\components\\md-toolbar-right.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key.substr(0, 2) !== "__"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] md-toolbar-right.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1eaa14a3", Component.options)
  } else {
    hotAPI.reload("data-v-1eaa14a3", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * default settings
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var FilterCSS = __webpack_require__(34).FilterCSS;
var getDefaultCSSWhiteList = __webpack_require__(34).getDefaultWhiteList;
var _ = __webpack_require__(38);

function getDefaultWhiteList() {
  return {
    a: ["target", "href", "title"],
    abbr: ["title"],
    address: [],
    area: ["shape", "coords", "href", "alt"],
    article: [],
    aside: [],
    audio: ["autoplay", "controls", "loop", "preload", "src"],
    b: [],
    bdi: ["dir"],
    bdo: ["dir"],
    big: [],
    blockquote: ["cite"],
    br: [],
    caption: [],
    center: [],
    cite: [],
    code: [],
    col: ["align", "valign", "span", "width"],
    colgroup: ["align", "valign", "span", "width"],
    dd: [],
    del: ["datetime"],
    details: ["open"],
    div: [],
    dl: [],
    dt: [],
    em: [],
    font: ["color", "size", "face"],
    footer: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    header: [],
    hr: [],
    i: [],
    img: ["src", "alt", "title", "width", "height"],
    ins: ["datetime"],
    li: [],
    mark: [],
    nav: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    section: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    table: ["width", "border", "align", "valign"],
    tbody: ["align", "valign"],
    td: ["width", "rowspan", "colspan", "align", "valign"],
    tfoot: ["align", "valign"],
    th: ["width", "rowspan", "colspan", "align", "valign"],
    thead: ["align", "valign"],
    tr: ["rowspan", "align", "valign"],
    tt: [],
    u: [],
    ul: [],
    video: ["autoplay", "controls", "loop", "preload", "src", "height", "width"]
  };
}

var defaultCSSFilter = new FilterCSS();

/**
 * default onTag function
 *
 * @param {String} tag
 * @param {String} html
 * @param {Object} options
 * @return {String}
 */
function onTag(tag, html, options) {
  // do nothing
}

/**
 * default onIgnoreTag function
 *
 * @param {String} tag
 * @param {String} html
 * @param {Object} options
 * @return {String}
 */
function onIgnoreTag(tag, html, options) {
  // do nothing
}

/**
 * default onTagAttr function
 *
 * @param {String} tag
 * @param {String} name
 * @param {String} value
 * @return {String}
 */
function onTagAttr(tag, name, value) {
  // do nothing
}

/**
 * default onIgnoreTagAttr function
 *
 * @param {String} tag
 * @param {String} name
 * @param {String} value
 * @return {String}
 */
function onIgnoreTagAttr(tag, name, value) {
  // do nothing
}

/**
 * default escapeHtml function
 *
 * @param {String} html
 */
function escapeHtml(html) {
  return html.replace(REGEXP_LT, "&lt;").replace(REGEXP_GT, "&gt;");
}

/**
 * default safeAttrValue function
 *
 * @param {String} tag
 * @param {String} name
 * @param {String} value
 * @param {Object} cssFilter
 * @return {String}
 */
function safeAttrValue(tag, name, value, cssFilter) {
  // unescape attribute value firstly
  value = friendlyAttrValue(value);

  if (name === "href" || name === "src") {
    // filter `href` and `src` attribute
    // only allow the value that starts with `http://` | `https://` | `mailto:` | `/` | `#`
    value = _.trim(value);
    if (value === "#") return "#";
    if (
      !(
        value.substr(0, 7) === "http://" ||
        value.substr(0, 8) === "https://" ||
        value.substr(0, 7) === "mailto:" ||
        value.substr(0, 4) === "tel:" ||
        value[0] === "#" ||
        value[0] === "/"
      )
    ) {
      return "";
    }
  } else if (name === "background") {
    // filter `background` attribute (maybe no use)
    // `javascript:`
    REGEXP_DEFAULT_ON_TAG_ATTR_4.lastIndex = 0;
    if (REGEXP_DEFAULT_ON_TAG_ATTR_4.test(value)) {
      return "";
    }
  } else if (name === "style") {
    // `expression()`
    REGEXP_DEFAULT_ON_TAG_ATTR_7.lastIndex = 0;
    if (REGEXP_DEFAULT_ON_TAG_ATTR_7.test(value)) {
      return "";
    }
    // `url()`
    REGEXP_DEFAULT_ON_TAG_ATTR_8.lastIndex = 0;
    if (REGEXP_DEFAULT_ON_TAG_ATTR_8.test(value)) {
      REGEXP_DEFAULT_ON_TAG_ATTR_4.lastIndex = 0;
      if (REGEXP_DEFAULT_ON_TAG_ATTR_4.test(value)) {
        return "";
      }
    }
    if (cssFilter !== false) {
      cssFilter = cssFilter || defaultCSSFilter;
      value = cssFilter.process(value);
    }
  }

  // escape `<>"` before returns
  value = escapeAttrValue(value);
  return value;
}

// RegExp list
var REGEXP_LT = /</g;
var REGEXP_GT = />/g;
var REGEXP_QUOTE = /"/g;
var REGEXP_QUOTE_2 = /&quot;/g;
var REGEXP_ATTR_VALUE_1 = /&#([a-zA-Z0-9]*);?/gim;
var REGEXP_ATTR_VALUE_COLON = /&colon;?/gim;
var REGEXP_ATTR_VALUE_NEWLINE = /&newline;?/gim;
var REGEXP_DEFAULT_ON_TAG_ATTR_3 = /\/\*|\*\//gm;
var REGEXP_DEFAULT_ON_TAG_ATTR_4 = /((j\s*a\s*v\s*a|v\s*b|l\s*i\s*v\s*e)\s*s\s*c\s*r\s*i\s*p\s*t\s*|m\s*o\s*c\s*h\s*a)\:/gi;
var REGEXP_DEFAULT_ON_TAG_ATTR_5 = /^[\s"'`]*(d\s*a\s*t\s*a\s*)\:/gi;
var REGEXP_DEFAULT_ON_TAG_ATTR_6 = /^[\s"'`]*(d\s*a\s*t\s*a\s*)\:\s*image\//gi;
var REGEXP_DEFAULT_ON_TAG_ATTR_7 = /e\s*x\s*p\s*r\s*e\s*s\s*s\s*i\s*o\s*n\s*\(.*/gi;
var REGEXP_DEFAULT_ON_TAG_ATTR_8 = /u\s*r\s*l\s*\(.*/gi;

/**
 * escape doube quote
 *
 * @param {String} str
 * @return {String} str
 */
function escapeQuote(str) {
  return str.replace(REGEXP_QUOTE, "&quot;");
}

/**
 * unescape double quote
 *
 * @param {String} str
 * @return {String} str
 */
function unescapeQuote(str) {
  return str.replace(REGEXP_QUOTE_2, '"');
}

/**
 * escape html entities
 *
 * @param {String} str
 * @return {String}
 */
function escapeHtmlEntities(str) {
  return str.replace(REGEXP_ATTR_VALUE_1, function replaceUnicode(str, code) {
    return code[0] === "x" || code[0] === "X"
      ? String.fromCharCode(parseInt(code.substr(1), 16))
      : String.fromCharCode(parseInt(code, 10));
  });
}

/**
 * escape html5 new danger entities
 *
 * @param {String} str
 * @return {String}
 */
function escapeDangerHtml5Entities(str) {
  return str
    .replace(REGEXP_ATTR_VALUE_COLON, ":")
    .replace(REGEXP_ATTR_VALUE_NEWLINE, " ");
}

/**
 * clear nonprintable characters
 *
 * @param {String} str
 * @return {String}
 */
function clearNonPrintableCharacter(str) {
  var str2 = "";
  for (var i = 0, len = str.length; i < len; i++) {
    str2 += str.charCodeAt(i) < 32 ? " " : str.charAt(i);
  }
  return _.trim(str2);
}

/**
 * get friendly attribute value
 *
 * @param {String} str
 * @return {String}
 */
function friendlyAttrValue(str) {
  str = unescapeQuote(str);
  str = escapeHtmlEntities(str);
  str = escapeDangerHtml5Entities(str);
  str = clearNonPrintableCharacter(str);
  return str;
}

/**
 * unescape attribute value
 *
 * @param {String} str
 * @return {String}
 */
function escapeAttrValue(str) {
  str = escapeQuote(str);
  str = escapeHtml(str);
  return str;
}

/**
 * `onIgnoreTag` function for removing all the tags that are not in whitelist
 */
function onIgnoreTagStripAll() {
  return "";
}

/**
 * remove tag body
 * specify a `tags` list, if the tag is not in the `tags` list then process by the specify function (optional)
 *
 * @param {array} tags
 * @param {function} next
 */
function StripTagBody(tags, next) {
  if (typeof next !== "function") {
    next = function() {};
  }

  var isRemoveAllTag = !Array.isArray(tags);
  function isRemoveTag(tag) {
    if (isRemoveAllTag) return true;
    return _.indexOf(tags, tag) !== -1;
  }

  var removeList = [];
  var posStart = false;

  return {
    onIgnoreTag: function(tag, html, options) {
      if (isRemoveTag(tag)) {
        if (options.isClosing) {
          var ret = "[/removed]";
          var end = options.position + ret.length;
          removeList.push([
            posStart !== false ? posStart : options.position,
            end
          ]);
          posStart = false;
          return ret;
        } else {
          if (!posStart) {
            posStart = options.position;
          }
          return "[removed]";
        }
      } else {
        return next(tag, html, options);
      }
    },
    remove: function(html) {
      var rethtml = "";
      var lastPos = 0;
      _.forEach(removeList, function(pos) {
        rethtml += html.slice(lastPos, pos[0]);
        lastPos = pos[1];
      });
      rethtml += html.slice(lastPos);
      return rethtml;
    }
  };
}

/**
 * remove html comments
 *
 * @param {String} html
 * @return {String}
 */
function stripCommentTag(html) {
  return html.replace(STRIP_COMMENT_TAG_REGEXP, "");
}
var STRIP_COMMENT_TAG_REGEXP = /<!--[\s\S]*?-->/g;

/**
 * remove invisible characters
 *
 * @param {String} html
 * @return {String}
 */
function stripBlankChar(html) {
  var chars = html.split("");
  chars = chars.filter(function(char) {
    var c = char.charCodeAt(0);
    if (c === 127) return false;
    if (c <= 31) {
      if (c === 10 || c === 13) return true;
      return false;
    }
    return true;
  });
  return chars.join("");
}

exports.whiteList = getDefaultWhiteList();
exports.getDefaultWhiteList = getDefaultWhiteList;
exports.onTag = onTag;
exports.onIgnoreTag = onIgnoreTag;
exports.onTagAttr = onTagAttr;
exports.onIgnoreTagAttr = onIgnoreTagAttr;
exports.safeAttrValue = safeAttrValue;
exports.escapeHtml = escapeHtml;
exports.escapeQuote = escapeQuote;
exports.unescapeQuote = unescapeQuote;
exports.escapeHtmlEntities = escapeHtmlEntities;
exports.escapeDangerHtml5Entities = escapeDangerHtml5Entities;
exports.clearNonPrintableCharacter = clearNonPrintableCharacter;
exports.friendlyAttrValue = friendlyAttrValue;
exports.escapeAttrValue = escapeAttrValue;
exports.onIgnoreTagStripAll = onIgnoreTagStripAll;
exports.StripTagBody = StripTagBody;
exports.stripCommentTag = stripCommentTag;
exports.stripBlankChar = stripBlankChar;
exports.cssFilter = defaultCSSFilter;
exports.getDefaultCSSWhiteList = getDefaultCSSWhiteList;


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Simple HTML Parser
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var _ = __webpack_require__(38);

/**
 * get tag name
 *
 * @param {String} html e.g. '<a hef="#">'
 * @return {String}
 */
function getTagName(html) {
  var i = _.spaceIndex(html);
  if (i === -1) {
    var tagName = html.slice(1, -1);
  } else {
    var tagName = html.slice(1, i + 1);
  }
  tagName = _.trim(tagName).toLowerCase();
  if (tagName.slice(0, 1) === "/") tagName = tagName.slice(1);
  if (tagName.slice(-1) === "/") tagName = tagName.slice(0, -1);
  return tagName;
}

/**
 * is close tag?
 *
 * @param {String} html 如：'<a hef="#">'
 * @return {Boolean}
 */
function isClosing(html) {
  return html.slice(0, 2) === "</";
}

/**
 * parse input html and returns processed html
 *
 * @param {String} html
 * @param {Function} onTag e.g. function (sourcePosition, position, tag, html, isClosing)
 * @param {Function} escapeHtml
 * @return {String}
 */
function parseTag(html, onTag, escapeHtml) {
  "user strict";

  var rethtml = "";
  var lastPos = 0;
  var tagStart = false;
  var quoteStart = false;
  var currentPos = 0;
  var len = html.length;
  var currentTagName = "";
  var currentHtml = "";

  for (currentPos = 0; currentPos < len; currentPos++) {
    var c = html.charAt(currentPos);
    if (tagStart === false) {
      if (c === "<") {
        tagStart = currentPos;
        continue;
      }
    } else {
      if (quoteStart === false) {
        if (c === "<") {
          rethtml += escapeHtml(html.slice(lastPos, currentPos));
          tagStart = currentPos;
          lastPos = currentPos;
          continue;
        }
        if (c === ">") {
          rethtml += escapeHtml(html.slice(lastPos, tagStart));
          currentHtml = html.slice(tagStart, currentPos + 1);
          currentTagName = getTagName(currentHtml);
          rethtml += onTag(
            tagStart,
            rethtml.length,
            currentTagName,
            currentHtml,
            isClosing(currentHtml)
          );
          lastPos = currentPos + 1;
          tagStart = false;
          continue;
        }
        if ((c === '"' || c === "'") && html.charAt(currentPos - 1) === "=") {
          quoteStart = c;
          continue;
        }
      } else {
        if (c === quoteStart) {
          quoteStart = false;
          continue;
        }
      }
    }
  }
  if (lastPos < html.length) {
    rethtml += escapeHtml(html.substr(lastPos));
  }

  return rethtml;
}

var REGEXP_ILLEGAL_ATTR_NAME = /[^a-zA-Z0-9_:\.\-]/gim;

/**
 * parse input attributes and returns processed attributes
 *
 * @param {String} html e.g. `href="#" target="_blank"`
 * @param {Function} onAttr e.g. `function (name, value)`
 * @return {String}
 */
function parseAttr(html, onAttr) {
  "user strict";

  var lastPos = 0;
  var retAttrs = [];
  var tmpName = false;
  var len = html.length;

  function addAttr(name, value) {
    name = _.trim(name);
    name = name.replace(REGEXP_ILLEGAL_ATTR_NAME, "").toLowerCase();
    if (name.length < 1) return;
    var ret = onAttr(name, value || "");
    if (ret) retAttrs.push(ret);
  }

  // 逐个分析字符
  for (var i = 0; i < len; i++) {
    var c = html.charAt(i);
    var v, j;
    if (tmpName === false && c === "=") {
      tmpName = html.slice(lastPos, i);
      lastPos = i + 1;
      continue;
    }
    if (tmpName !== false) {
      if (
        i === lastPos &&
        (c === '"' || c === "'") &&
        html.charAt(i - 1) === "="
      ) {
        j = html.indexOf(c, i + 1);
        if (j === -1) {
          break;
        } else {
          v = _.trim(html.slice(lastPos + 1, j));
          addAttr(tmpName, v);
          tmpName = false;
          i = j;
          lastPos = i + 1;
          continue;
        }
      }
    }
    if (/\s|\n|\t/.test(c)) {
      html = html.replace(/\s|\n|\t/g, " ");
      if (tmpName === false) {
        j = findNextEqual(html, i);
        if (j === -1) {
          v = _.trim(html.slice(lastPos, i));
          addAttr(v);
          tmpName = false;
          lastPos = i + 1;
          continue;
        } else {
          i = j - 1;
          continue;
        }
      } else {
        j = findBeforeEqual(html, i - 1);
        if (j === -1) {
          v = _.trim(html.slice(lastPos, i));
          v = stripQuoteWrap(v);
          addAttr(tmpName, v);
          tmpName = false;
          lastPos = i + 1;
          continue;
        } else {
          continue;
        }
      }
    }
  }

  if (lastPos < html.length) {
    if (tmpName === false) {
      addAttr(html.slice(lastPos));
    } else {
      addAttr(tmpName, stripQuoteWrap(_.trim(html.slice(lastPos))));
    }
  }

  return _.trim(retAttrs.join(" "));
}

function findNextEqual(str, i) {
  for (; i < str.length; i++) {
    var c = str[i];
    if (c === " ") continue;
    if (c === "=") return i;
    return -1;
  }
}

function findBeforeEqual(str, i) {
  for (; i > 0; i--) {
    var c = str[i];
    if (c === " ") continue;
    if (c === "=") return i;
    return -1;
  }
}

function isQuoteWrapString(text) {
  if (
    (text[0] === '"' && text[text.length - 1] === '"') ||
    (text[0] === "'" && text[text.length - 1] === "'")
  ) {
    return true;
  } else {
    return false;
  }
}

function stripQuoteWrap(text) {
  if (isQuoteWrapString(text)) {
    return text.substr(1, text.length - 2);
  } else {
    return text;
  }
}

exports.parseTag = parseTag;
exports.parseAttr = parseAttr;


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var mavonEditor = __webpack_require__(212);
var VueMavonEditor = {
  markdownIt: mavonEditor.mixins[0].data().markdownIt,
  mavonEditor: mavonEditor,
  LeftToolbar: __webpack_require__(63),
  RightToolbar: __webpack_require__(64),
  install: function install(Vue) {
    Vue.component('mavon-editor', mavonEditor);
  }
};

module.exports = VueMavonEditor;

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(225)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(74),
  /* template */
  __webpack_require__(218),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)
Component.options.__file = "D:\\work\\songwang\\test\\mavonEditor\\src\\dev\\demo.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key.substr(0, 2) !== "__"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] demo.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-c06e3552", Component.options)
  } else {
    hotAPI.reload("data-v-c06e3552", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var autoTextarea = __webpack_require__(209);

var VueAutoTextarea = {
  autoTextarea: autoTextarea,
  install: function install(Vue) {
    Vue.component('auto-textarea', autoTextarea);
  }
};

module.exports = VueAutoTextarea;

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    data: function data() {
        var _this = this;

        return {
            temp_value: function () {
                return _this.value;
            }(),
            s_autofocus: function () {
                if (_this.autofocus) {
                    return 'autofocus';
                } else {
                    null;
                }
            }()
        };
    },
    created: function created() {},

    props: {
        fullHeight: {
            type: Boolean,
            default: false
        },
        autofocus: {
            type: Boolean,
            default: false
        },
        value: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        },
        border: {
            type: Boolean,
            default: false
        },
        resize: {
            type: Boolean,
            default: false
        },
        onchange: {
            type: Function,
            default: null
        },
        fontSize: {
            type: String,
            default: '14px'
        },
        lineHeight: {
            type: String,
            default: '18px'
        }
    },
    methods: {
        change: function change($event) {
            if (this.onchange) {
                this.onchange(this.temp_value, $event);
            }
        }
    },
    watch: {
        value: function value(val, oldVal) {
            this.temp_value = val;
        },
        temp_value: function temp_value(val, oldVal) {
            this.$emit('input', val);
        }
    }
};

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    name: 's-md-toolbar-left',
    props: {
        editable: {
            type: Boolean,
            default: true
        },
        transition: {
            type: Boolean,
            default: true
        },
        toolbars: {
            type: Object,
            required: true
        },
        d_words: {
            type: Object,
            required: true
        },
        image_filter: {
            type: Function,
            default: null
        }
    },
    data: function data() {
        return {
            img_file: [[0, null]],
            img_timer: null,
            header_timer: null,
            s_img_dropdown_open: false,
            s_header_dropdown_open: false,
            s_img_link_open: false,
            trigger: null,
            num: 0,
            link_text: '',
            link_addr: '',
            link_type: 'link'
        };
    },

    methods: {
        $imgLinkAdd: function $imgLinkAdd() {
            this.$emit('toolbar_left_addlink', this.link_type, this.link_text, this.link_addr);
            this.s_img_link_open = false;
        },
        $toggle_imgLinkAdd: function $toggle_imgLinkAdd(type) {
            var _this = this;

            this.link_type = type;
            this.link_text = this.link_addr = '';
            this.s_img_link_open = true;
            this.$nextTick(function () {
                _this.$refs.linkTextInput.focus();
            });
            this.s_img_dropdown_open = false;
        },
        $imgFileListClick: function $imgFileListClick(pos) {
            this.$emit('imgTouch', this.img_file[pos]);
        },
        $changeUrl: function $changeUrl(index, url) {
            this.img_file[index][0] = url;
        },
        $imgFileAdd: function $imgFileAdd($file) {
            this.img_file.push([++this.num, $file]);
            this.$emit('imgAdd', this.num, $file);
            this.s_img_dropdown_open = false;
        },
        $imgFilesAdd: function $imgFilesAdd($files) {
            var valid = typeof this.image_filter === 'function';
            for (var i = 0; i < $files.length; i++) {
                if (valid && this.image_filter($files[i]) === true) {
                    this.$imgFileAdd($files[i]);
                } else if (!valid && $files[i].type.match(/^image\//i)) {
                    this.$imgFileAdd($files[i]);
                }
            }
        },
        $imgAdd: function $imgAdd($e) {
            this.$imgFilesAdd($e.target.files);
            $e.target.value = '';
        },
        $imgDel: function $imgDel(pos) {
            this.$emit('imgDel', this.img_file[pos]);
            this.img_file.splice(pos, 1);
            this.num--;

            this.s_img_dropdown_open = false;
        },
        isEqualName: function isEqualName(filename, pos) {
            if (this.img_file[pos][1]) {
                if (this.img_file[pos][1].name === filename || this.img_file[pos][1]._name === filename) {
                    return true;
                }
            }
            return false;
        },
        $imgDelByFilename: function $imgDelByFilename(filename) {
            var pos = 0;
            while (this.img_file.length > pos) {
                if (this.img_file[pos][1] === filename || this.isEqualName(filename, pos)) {
                    this.$imgDel(pos);
                    return true;
                }
                pos += 1;
            }
            return false;
        },
        $imgAddByFilename: function $imgAddByFilename(filename, $file) {
            for (var i = 0; i < this.img_file.length; i++) {
                if (this.img_file[i][0] === filename) return false;
            }
            this.img_file[0][0] = filename;
            this.img_file[0][1] = $file;
            this.img_file[0][2] = filename;
            this.img_file.unshift(['./' + this.num, null]);
            this.$emit('imgAdd', this.img_file[1][0], $file, false);
            return true;
        },
        $imgAddByUrl: function $imgAddByUrl(filename, $url) {
            for (var i = 0; i < this.img_file.length; i++) {
                if (this.img_file[i][0] === filename) return false;
            }
            this.img_file[0][0] = filename;
            this.img_file[0][1] = $url;
            this.img_file.unshift(['./' + this.num, null]);
            return true;
        },
        $imgUpdateByFilename: function $imgUpdateByFilename(filename, $file) {
            for (var i = 0; i < this.img_file.length; i++) {
                if (this.img_file[i][0] === filename || this.isEqualName(filename, i)) {
                    this.img_file[i][1] = $file;
                    this.$emit('imgAdd', filename, $file, false);
                    return true;
                }
            }
            return false;
        },
        $mouseenter_img_dropdown: function $mouseenter_img_dropdown() {
            if (this.editable) {
                clearTimeout(this.img_timer);
                this.s_img_dropdown_open = true;
            }
        },
        $mouseleave_img_dropdown: function $mouseleave_img_dropdown() {
            var vm = this;
            this.img_timer = setTimeout(function () {
                vm.s_img_dropdown_open = false;
            }, 200);
        },
        $mouseenter_header_dropdown: function $mouseenter_header_dropdown() {
            if (this.editable) {
                clearTimeout(this.header_timer);
                this.s_header_dropdown_open = true;
            }
        },
        $mouseleave_header_dropdown: function $mouseleave_header_dropdown() {
            var vm = this;
            this.header_timer = setTimeout(function () {
                vm.s_header_dropdown_open = false;
            }, 200);
        },
        $clicks: function $clicks(_type) {
            if (this.editable) {
                this.$emit('toolbar_left_click', _type);
            }
        },
        $click_header: function $click_header(_type) {
            this.$emit('toolbar_left_click', _type);
            this.s_header_dropdown_open = false;
        },
        handleClose: function handleClose(e) {
            this.s_img_dropdown_open = false;
        }
    },
    watch: {
        s_img_link_open: function s_img_link_open(newVlaue) {
            this.$parent.$el.style.zIndex = newVlaue ? 1501 : 1500;
        }
    }
};

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    name: 's-md-toolbar-right',
    props: {
        s_subfield: {
            type: Boolean,
            required: true
        },
        toolbars: { type: Object, required: true },
        s_preview_switch: { type: Boolean, required: true },
        s_fullScreen: { type: Boolean, required: true },
        s_html_code: { type: Boolean, required: true },
        s_navigation: { type: Boolean, required: true },
        d_words: {
            type: Object,
            required: true
        }
    },
    methods: {
        $clicks: function $clicks(_type) {
            this.$emit('toolbar_right_click', _type);
        }
    }
};

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _langHljsCss = __webpack_require__(20);

var _langHljsCss2 = _interopRequireDefault(_langHljsCss);

var _config = __webpack_require__(39);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    name: 'app',
    data: function data() {
        return {
            d_language: 'zh-CN',
            help1: '',
            help2: '',
            d_words: {},
            screen_phone: false,
            toolbars: {
                underline: true,
                strikethrough: true,
                alignCenter: true,
                undo: true,
                save: true,
                fullscreen: true,
                navigation: true,
                preview: true,
                subfield: false
            },
            autofocus: true,
            subfield: true,
            editable: true,
            toolbarsFlag: true,
            img_file: {},
            external_link: {
                markdown_css: function markdown_css() {
                    return './markdown/github-markdown.min.css';
                },
                hljs_js: function hljs_js() {
                    return './highlightjs/highlight.min.js';
                },
                hljs_css: function hljs_css(css) {
                    return './highlightjs/styles/' + css + '.min.css';
                },
                hljs_lang: function hljs_lang(lang) {
                    return './highlightjs/languages/' + lang + '.min.js';
                },
                katex_css: function katex_css() {
                    return './katex/katex.min.css';
                },
                katex_js: function katex_js() {
                    return './katex/katex.min.js';
                }
            },
            toolbar_settings: {
                undo: true,
                redo: true,
                bold: true,
                italic: true,
                header: true,
                underline: true,
                strikethrough: true,
                quote: true,
                ol: true,
                ul: true,
                link: true,
                code: true,
                readmodel: true,
                htmlcode: true,
                alignleft: true,
                aligncenter: true,
                alignright: true,
                subfield: true,
                preview: true,
                navigation: true },
            image_filter: function image_filter($files) {
                console.log('image_filter files:', $files);

                return true;
            },
            imageClick: function imageClick(file) {
                console.log(file);
            },
            imgName: '',
            codeStyle: "github",
            styles: _langHljsCss2.default
        };
    },
    created: function created() {
        var $vm = this;
        this.initLanguage();
        this.sizeToStatus();
        window.addEventListener('resize', function () {
            $vm.sizeToStatus();
        });
    },
    mounted: function mounted() {
        var md = this.$refs.md;
        var toolbar_left = md.$refs.toolbar_left;
        var diy = this.$refs.diy;
        toolbar_left.$el.append(diy);
    },

    methods: {
        clearCache: function clearCache() {
            this.$refs.md.$emptyHistory();
        },
        $click: function $click(val) {
            console.log(val);
        },
        imgreplace: function imgreplace($e) {
            console.log('here');
            this.$refs.md.$imglst2Url([[0, 'https://raw.githubusercontent.com/hinesboy/mavonEditor/master/img/cn/cn-common.png'], [1, 'https://raw.githubusercontent.com/hinesboy/mavonEditor/master/img/cn/cn-common.png']]);
        },
        uploadimg: function uploadimg($e) {
            console.log(this.img_file);
            for (var _img in this.img_file) {
                this.$refs.md.$img2Url(_img, 'https://raw.githubusercontent.com/hinesboy/mavonEditor/master/img/cn/cn-common.png');
            }
        },
        $imgAdd: function $imgAdd(pos, $file) {
            console.log('imgAdd', pos, $file);
            this.img_file[pos] = $file;
        },
        $imgDel: function $imgDel(pos) {
            console.log('imgDel', pos);
            delete this.img_file[pos];
        },
        sizeToStatus: function sizeToStatus() {
            if (window.matchMedia('(min-width:768px)').matches) {
                this.screen_phone = false;
            } else {
                this.screen_phone = true;
            }
        },
        saveone: function saveone(val, render) {
            alert('save one');
        },
        savetwo: function savetwo(val, render) {
            alert('save two');
        },
        change: function change(val, render) {
            console.log(val);
        },
        opchange: function opchange(event) {
            this.d_language = event.target.value;
        },
        initLanguage: function initLanguage() {
            this.d_words = _config.CONFIG['words_' + this.d_language];
            this.help1 = _config.CONFIG['help_' + this.d_language];
            this.help2 = _config.CONFIG['help_' + this.d_language];
        },
        $subfieldtoggle: function $subfieldtoggle(flag, value) {
            console.log('sufield toggle' + flag);
        },
        $previewtoggle: function $previewtoggle(flag, value) {
            console.log('preview toggle' + flag);
        },
        imgdelete: function imgdelete() {
            var md = this.$refs.md;
            var toolbar_left = md.$refs.toolbar_left;
            toolbar_left.$imgDelByFilename(this.imgName);
        }
    },
    watch: {
        d_language: function d_language() {
            this.initLanguage();
        }
    }
};

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _app = __webpack_require__(210);

var _app2 = _interopRequireDefault(_app);

var _editor = __webpack_require__(211);

var _editor2 = _interopRequireDefault(_editor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'demo',
  components: {
    App: _app2.default,
    Editor: _editor2.default
  },
  data: function data() {
    return {
      viewIndex: 1
    };
  }
};

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _langHljsCss = __webpack_require__(20);

var _langHljsCss2 = _interopRequireDefault(_langHljsCss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var code = 'java\n/**\n * @author John Smith <john.smith@example.com>\n*/\npackage l2f.gameserver.model;\n\npublic abstract strictfp class L2Char extends L2Object {\n  public static final Short ERROR = 0x0001;\n\n  public void moveTo(int x, int y, int z) {\n    _ai = null;\n    log("Should not be called");\n    if (1 > 5) { // wtf!?\n      return;\n    }\n  }\n}';

module.exports = {
    name: 'editor',
    data: function data() {
        return {
            codeStyle: "github",
            styles: _langHljsCss2.default,
            code: '<span style="color:red;font-size:36px;">A</span> \n```' + code + '\n```',
            xssOptions: {
                whiteList: {
                    span: ['style']
                }
            }
        };
    }
};

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = __webpack_require__(21);

var _typeof3 = _interopRequireDefault(_typeof2);

var _autoTextarea = __webpack_require__(69);

var _keydownListen = __webpack_require__(79);

var _langHljsCss = __webpack_require__(20);

var _langHljsCss2 = _interopRequireDefault(_langHljsCss);

var _extraFunction = __webpack_require__(40);

var _util = __webpack_require__(84);

var _toolbar_left_click2 = __webpack_require__(82);

var _toolbar_right_click2 = __webpack_require__(83);

var _config = __webpack_require__(39);

var _markdown = __webpack_require__(81);

var _markdown2 = _interopRequireDefault(_markdown);

var _mdToolbarLeft = __webpack_require__(63);

var _mdToolbarLeft2 = _interopRequireDefault(_mdToolbarLeft);

var _mdToolbarRight = __webpack_require__(64);

var _mdToolbarRight2 = _interopRequireDefault(_mdToolbarRight);

__webpack_require__(125);

__webpack_require__(124);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    mixins: [_markdown2.default],
    props: {
        scrollStyle: {
            type: Boolean,
            default: true
        },
        boxShadow: {
            type: Boolean,
            default: true
        },
        transition: {
            type: Boolean,
            default: true
        },
        autofocus: {
            type: Boolean,
            default: true
        },
        fontSize: {
            type: String,
            default: '14px'
        },
        toolbarsBackground: {
            type: String,
            default: '#ffffff'
        },
        editorBackground: {
            type: String,
            default: '#ffffff'
        },
        previewBackground: {
            type: String,
            default: '#fbfbfb'
        },
        boxShadowStyle: {
            type: String,
            default: '0 2px 12px 0 rgba(0, 0, 0, 0.1)'
        },
        help: {
            type: String,
            default: null
        },
        value: {
            type: String,
            default: ''
        },
        language: {
            type: String,
            default: 'zh-CN'
        },
        subfield: {
            type: Boolean,
            default: true
        },
        navigation: {
            type: Boolean,
            default: false
        },
        defaultOpen: {
            type: String,
            default: null
        },
        editable: {
            type: Boolean,
            default: true
        },
        toolbarsFlag: {
            type: Boolean,
            default: true
        },
        toolbars: {
            type: Object,
            default: function _default() {
                return _config.CONFIG.toolbars;
            }
        },
        html: {
            type: Boolean,
            default: true
        },
        xssOptions: {
            type: [Object, Boolean],
            default: function _default() {
                return {};
            }
        },
        codeStyle: {
            type: String,
            default: function _default() {
                return 'github';
            }
        },
        placeholder: {
            type: String,
            default: null
        },
        ishljs: {
            type: Boolean,
            default: true
        },
        externalLink: {
            type: [Object, Boolean],
            default: true
        },
        imageFilter: {
            type: Function,
            default: null
        },
        imageClick: {
            type: Function,
            default: null
        },
        tabSize: {
            type: Number,
            default: 0
        },
        shortCut: {
            type: Boolean,
            default: true
        }
    },
    data: function data() {
        var _this = this;

        return {
            s_right_click_menu_show: false,
            right_click_menu_top: 0,
            right_click_menu_left: 0,
            s_subfield: function () {
                return _this.subfield;
            }(),
            s_autofocus: true,

            s_navigation: function () {
                return _this.navigation;
            }(),
            s_scrollStyle: function () {
                return _this.scrollStyle;
            }(),
            d_value: '',
            d_render: '',
            s_preview_switch: function () {
                var default_open_ = _this.defaultOpen;
                if (!default_open_) {
                    default_open_ = _this.subfield ? 'preview' : 'edit';
                }
                return default_open_ === 'preview' ? true : false;
            }(),
            s_fullScreen: false,
            s_help: false,
            s_html_code: false,
            d_help: null,
            d_words: null,
            edit_scroll_height: -1,
            s_readmodel: false,
            s_table_enter: false,
            d_history: function () {
                var temp_array = [];
                temp_array.push(_this.value);
                return temp_array;
            }(),
            d_history_index: 0,
            currentTimeout: '',
            d_image_file: [],
            d_preview_imgsrc: null,
            s_external_link: {
                markdown_css: function markdown_css() {
                    return 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.9.0/github-markdown.min.css';
                },
                hljs_js: function hljs_js() {
                    return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/highlight.min.js';
                },
                hljs_lang: function hljs_lang(lang) {
                    return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/languages/' + lang + '.min.js';
                },
                hljs_css: function hljs_css(css) {
                    if (_langHljsCss2.default[css]) {
                        return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/' + css + '.min.css';
                    }
                    return '';
                },
                katex_js: function katex_js() {
                    return 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3/katex.min.js';
                },
                katex_css: function katex_css() {
                    return 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3/katex.min.css';
                }
            },
            p_external_link: {},
            textarea_selectionEnd: 0,
            textarea_selectionEnds: [0],
            _xssHandler: null
        };
    },
    created: function created() {
        var $vm = this;

        this.initLanguage();
        this.initExternalFuc();
        this.$nextTick(function () {
            $vm.editableTextarea();
        });
    },
    mounted: function mounted() {
        var $vm = this;
        this.$el.addEventListener('paste', function (e) {
            $vm.$paste(e);
        });
        this.$el.addEventListener('drop', function (e) {
            $vm.$drag(e);
        });

        (0, _keydownListen.keydownListen)(this);

        (0, _extraFunction.ImagePreviewListener)(this);

        if (this.autofocus) {
            this.getTextareaDom().focus();
        }

        (0, _extraFunction.fullscreenchange)(this);
        this.d_value = this.value || "";

        document.body.appendChild(this.$refs.help);
        this.loadExternalLink('markdown_css', 'css');
        this.loadExternalLink('katex_css', 'css');
        this.loadExternalLink('katex_js', 'js', function () {
            $vm.iRender(true);
        });
        this.loadExternalLink('hljs_js', 'js', function () {
            $vm.iRender(true);
        });

        $vm.codeStyleChange($vm.codeStyle, true);
    },
    beforeDestroy: function beforeDestroy() {
        document.body.removeChild(this.$refs.help);
    },
    getMarkdownIt: function getMarkdownIt() {
        var mdIt = this.mixins[0].data().markdownIt;
        if (!mdIt) {
            mdIt = (0, _markdown.initMarkdown)();
        }
        return mdIt;
    },

    methods: {
        loadExternalLink: function loadExternalLink(name, type, callback) {
            if (typeof this.p_external_link[name] !== 'function') {
                if (this.p_external_link[name] !== false) {
                    console.error('external_link.' + name, 'is not a function, if you want to disabled this error log, set external_link.' + name, 'to function or false');
                }
                return;
            }
            var _obj = {
                'css': _extraFunction.loadLink,
                'js': _extraFunction.loadScript
            };
            if (_obj.hasOwnProperty(type)) {
                _obj[type](this.p_external_link[name](), callback);
            }
        },
        initExternalFuc: function initExternalFuc() {
            var $vm = this;
            var _external_ = ['markdown_css', 'hljs_js', 'hljs_css', 'hljs_lang', 'katex_js', 'katex_css'];
            var _type_ = (0, _typeof3.default)($vm.externalLink);
            var _is_object = _type_ === 'object';
            var _is_boolean = _type_ === 'boolean';
            for (var i = 0; i < _external_.length; i++) {
                if (_is_boolean && !$vm.externalLink || _is_object && $vm.externalLink[_external_[i]] === false) {
                    $vm.p_external_link[_external_[i]] = false;
                } else if (_is_object && typeof $vm.externalLink[_external_[i]] === 'function') {
                    $vm.p_external_link[_external_[i]] = $vm.externalLink[_external_[i]];
                } else {
                    $vm.p_external_link[_external_[i]] = $vm.s_external_link[_external_[i]];
                }
            }
        },
        textAreaFocus: function textAreaFocus() {
            this.$refs.vNoteTextarea.$refs.vTextarea.focus();
        },
        $drag: function $drag($e) {
            var dataTransfer = $e.dataTransfer;
            if (dataTransfer) {
                var files = dataTransfer.files;
                if (files.length > 0) {
                    $e.preventDefault();
                    this.$refs.toolbar_left.$imgFilesAdd(files);
                }
            }
        },
        $paste: function $paste($e) {
            var clipboardData = $e.clipboardData;
            if (clipboardData) {
                var items = clipboardData.items;
                if (!items) return;
                var types = clipboardData.types || [];
                var item = null;
                for (var i = 0; i < types.length; i++) {
                    if (types[i] === 'Files') {
                        item = items[i];
                        break;
                    }
                }
                if (item && item.kind === 'file') {
                    (0, _util.stopEvent)($e);
                    var oFile = item.getAsFile();
                    this.$refs.toolbar_left.$imgFilesAdd([oFile]);
                }
            }
        },
        $imgTouch: function $imgTouch(file) {
            var $vm = this;
        },
        $imgDel: function $imgDel(file) {
            this.markdownIt.image_del(file[1]);

            var fileReg = file[0];
            var reg = new RegExp('\\!\\[' + file[1]._name + '\\]\\(' + fileReg + '\\)', "g");

            this.d_value = this.d_value.replace(reg, '');
            this.iRender();
            this.$emit('imgDel', file);
        },
        $imgAdd: function $imgAdd(pos, $file, isinsert) {
            if (isinsert === undefined) isinsert = true;
            var $vm = this;
            if (this.__rFilter == null) {
                this.__rFilter = /^image\//i;
            }
            this.__oFReader = new FileReader();
            this.__oFReader.onload = function (oFREvent) {
                $vm.markdownIt.image_add(pos, oFREvent.target.result);
                $file.miniurl = oFREvent.target.result;
                if (isinsert === true) {
                    $file._name = $file.name.replace(/[\[\]\(\)\+\{\}&\|\\\*^%$#@\-]/g, '');

                    $vm.insertText($vm.getTextareaDom(), {
                        prefix: '![' + $file._name + '](' + pos + ')',
                        subfix: '',
                        str: ''
                    });
                    $vm.$nextTick(function () {
                        $vm.$emit('imgAdd', pos, $file);
                    });
                }
            };
            if ($file) {
                var oFile = $file;
                if (this.__rFilter.test(oFile.type)) {
                    this.__oFReader.readAsDataURL(oFile);
                }
            }
        },
        $imgUpdateByUrl: function $imgUpdateByUrl(pos, url) {
            var $vm = this;
            this.markdownIt.image_add(pos, url);
            this.$nextTick(function () {
                $vm.d_render = this.markdownIt.render(this.d_value);
            });
        },
        $imgAddByUrl: function $imgAddByUrl(pos, url) {
            if (this.$refs.toolbar_left.$imgAddByUrl(pos, url)) {
                this.$imgUpdateByUrl(pos, url);
                return true;
            }
            return false;
        },
        $img2Url: function $img2Url(fileIndex, url) {
            var reg_str = "/(!\\[\[^\\[\]*?\\]\(?=\\(\)\)\\(\\s*\(" + fileIndex + "\)\\s*\\)/g";
            var reg = eval(reg_str);
            this.d_value = this.d_value.replace(reg, "$1(" + url + ")");
            this.$refs.toolbar_left.$changeUrl(fileIndex, url);
            this.iRender();
        },
        $imglst2Url: function $imglst2Url(imglst) {
            if (imglst instanceof Array) {
                for (var i = 0; i < imglst.length; i++) {
                    this.$img2Url(imglst[i][0], imglst[i][1]);
                }
            }
        },
        toolbar_left_click: function toolbar_left_click(_type) {
            (0, _toolbar_left_click2.toolbar_left_click)(_type, this);
        },
        toolbar_left_addlink: function toolbar_left_addlink(_type, text, link) {
            (0, _toolbar_left_click2.toolbar_left_addlink)(_type, text, link, this);
        },
        toolbar_right_click: function toolbar_right_click(_type) {
            (0, _toolbar_right_click2.toolbar_right_click)(_type, this);
        },
        getNavigation: function getNavigation($vm, full) {
            return (0, _extraFunction.getNavigation)($vm, full);
        },
        change: function change(val, render) {
            this.$emit('change', val, render);
        },
        fullscreen: function fullscreen(status, val) {
            this.$emit('fullScreen', status, val);
        },
        readmodel: function readmodel(status, val) {
            this.$emit('readModel', status, val);
        },
        previewtoggle: function previewtoggle(status, val) {
            this.$emit('previewToggle', status, val);
        },
        subfieldtoggle: function subfieldtoggle(status, val) {
            this.$emit('subfieldToggle', status, val);
        },
        htmlcode: function htmlcode(status, val) {
            this.$emit('htmlCode', status, val);
        },
        helptoggle: function helptoggle(status, val) {
            this.$emit('helpToggle', status, val);
        },
        save: function save(val, render) {
            this.$emit('save', val, render);
        },
        navigationtoggle: function navigationtoggle(status, val) {
            this.$emit('navigationToggle', status, val);
        },
        $toolbar_right_read_change_status: function $toolbar_right_read_change_status() {
            this.s_readmodel = !this.s_readmodel;
            if (this.readmodel) {
                this.readmodel(this.s_readmodel, this.d_value);
            }
            if (this.s_readmodel && this.toolbars.navigation) {
                this.getNavigation(this, true);
            }
        },
        $v_edit_scroll: function $v_edit_scroll($event) {
            (0, _extraFunction.scrollLink)($event, this);
        },
        getTextareaDom: function getTextareaDom() {
            return this.$refs.vNoteTextarea.$refs.vTextarea;
        },
        insertText: function insertText(obj, _ref) {
            var prefix = _ref.prefix,
                subfix = _ref.subfix,
                str = _ref.str,
                type = _ref.type;


            (0, _extraFunction.insertTextAtCaret)(obj, { prefix: prefix, subfix: subfix, str: str, type: type }, this);
        },
        insertTab: function insertTab() {
            (0, _extraFunction.insertTab)(this, this.tabSize);
        },
        insertOl: function insertOl() {
            (0, _extraFunction.insertOl)(this);
        },
        removeLine: function removeLine() {
            (0, _extraFunction.removeLine)(this);
        },
        insertUl: function insertUl() {
            (0, _extraFunction.insertUl)(this);
        },
        unInsertTab: function unInsertTab() {
            (0, _extraFunction.unInsertTab)(this, this.tabSize);
        },
        insertCodeBlock: function insertCodeBlock() {
            (0, _extraFunction.insertCodeBlock)(this);
        },
        insertEnter: function insertEnter(event) {
            (0, _extraFunction.insertEnter)(this, event);
        },
        saveHistory: function saveHistory() {
            this.d_history.splice(this.d_history_index + 1, this.d_history.length);
            this.d_history.push(this.d_value);
            this.textarea_selectionEnds.splice(this.d_history_index + 1, this.textarea_selectionEnds.length);
            this.textarea_selectionEnds.push(this.textarea_selectionEnd);
            this.d_history_index = this.d_history.length - 1;
        },
        saveSelectionEndsHistory: function saveSelectionEndsHistory() {
            var textarea = this.$refs.vNoteTextarea && this.$refs.vNoteTextarea.$el.querySelector('textarea');
            this.textarea_selectionEnd = textarea ? textarea.selectionEnd : this.textarea_selectionEnd;
        },
        initLanguage: function initLanguage() {
            var lang = _config.CONFIG.langList.indexOf(this.language) >= 0 ? this.language : 'zh-CN';
            var $vm = this;
            $vm.$render(_config.CONFIG['help_' + lang], function (res) {
                $vm.d_help = res;
            });
            this.d_words = _config.CONFIG['words_' + lang];
        },
        editableTextarea: function editableTextarea() {
            var text_dom = this.$refs.vNoteTextarea.$refs.vTextarea;
            if (this.editable) {
                text_dom.removeAttribute('disabled');
            } else {
                text_dom.setAttribute('disabled', 'disabled');
            }
        },
        codeStyleChange: function codeStyleChange(val, isInit) {
            isInit = isInit ? isInit : false;
            if (typeof this.p_external_link.hljs_css !== 'function') {
                if (this.p_external_link.hljs_css !== false) {
                    console.error('external_link.hljs_css is not a function, if you want to disabled this error log, set external_link.hljs_css to function or false');
                }
                return;
            }
            var url = this.p_external_link.hljs_css(val);
            if (url.length === 0 && isInit) {
                console.warn('hljs color scheme', val, 'do not exist, loading default github');
                url = this.p_external_link.hljs_css('github');
            }
            if (url.length > 0) {
                (0, _extraFunction.loadLink)(url, null, "md-code-style");
            } else {
                console.warn('hljs color scheme', val, 'do not exist, hljs color scheme will not change');
            }
        },
        iRender: function iRender(toggleChange) {
            var $vm = this;
            this.$render($vm.d_value, function (res) {
                $vm.d_render = res;

                if (!toggleChange) {
                    if ($vm.change) $vm.change($vm.d_value, $vm.d_render);
                }

                if ($vm.s_navigation) (0, _extraFunction.getNavigation)($vm, false);

                $vm.$emit('input', $vm.d_value);

                if ($vm.d_value === $vm.d_history[$vm.d_history_index]) return;
                window.clearTimeout($vm.currentTimeout);
                $vm.currentTimeout = setTimeout(function () {
                    $vm.saveHistory();
                }, 500);
            });
        },
        $emptyHistory: function $emptyHistory() {
            this.d_history = [this.d_value];
            this.d_history_index = 0;
        }
    },
    watch: {
        d_value: function d_value(val, oldVal) {
            this.saveSelectionEndsHistory();
            this.iRender();
        },
        value: function value(val, oldVal) {
            if (val !== this.d_value) {
                this.d_value = val;
            }
        },
        subfield: function subfield(val, oldVal) {
            this.s_subfield = val;
        },
        d_history_index: function d_history_index() {
            if (this.d_history_index > 20) {
                this.d_history.shift();
                this.d_history_index = this.d_history_index - 1;
            }
            this.d_value = this.d_history[this.d_history_index];
        },

        language: function language(val) {
            this.initLanguage();
        },
        editable: function editable() {
            this.editableTextarea();
        },
        defaultOpen: function defaultOpen(val) {
            var default_open_ = val;
            if (!default_open_) {
                default_open_ = this.subfield ? 'preview' : 'edit';
            }
            this.s_preview_switch = default_open_ === 'preview' ? true : false;
            return this.s_preview_switch;
        },
        codeStyle: function codeStyle(val) {
            this.codeStyleChange(val);
        }
    },
    components: {
        'v-autoTextarea': _autoTextarea.autoTextarea,
        'v-md-toolbar-left': _mdToolbarLeft2.default,
        'v-md-toolbar-right': _mdToolbarRight2.default
    }
};

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _vue = __webpack_require__(19);

var _vue2 = _interopRequireDefault(_vue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var demo = __webpack_require__(68);
var sMd = __webpack_require__(67);

_vue2.default.use(sMd);
var app = new _vue2.default({
  el: '#main',
  render: function render(h) {
    return h(demo);
  }
});

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    '1c': '1c',
    'abnf': 'abnf',
    'accesslog': 'accesslog',
    'actionscript': 'actionscript',
    'as': 'actionscript',
    'ada': 'ada',
    'apache': 'apache',
    'apacheconf': 'apache',
    'applescript': 'applescript',
    'osascript': 'applescript',
    'arduino': 'arduino',
    'armasm': 'armasm',
    'arm': 'armasm',
    'asciidoc': 'asciidoc',
    'adoc': 'asciidoc',
    'aspectj': 'aspectj',
    'autohotkey': 'autohotkey',
    'ahk': 'autohotkey',
    'autoit': 'autoit',
    'avrasm': 'avrasm',
    'awk': 'awk',
    'axapta': 'axapta',
    'bash': 'bash',
    'sh': 'bash',
    'zsh': 'bash',
    'basic': 'basic',
    'bnf': 'bnf',
    'brainfuck': 'brainfuck',
    'bf': 'brainfuck',
    'cal': 'cal',
    'capnproto': 'capnproto',
    'capnp': 'capnproto',
    'ceylon': 'ceylon',
    'clean': 'clean',
    'icl': 'clean',
    'dcl': 'clean',
    'clojure-repl': 'clojure-repl',
    'clojure': 'clojure',
    'clj': 'clojure',
    'cmake': 'cmake',
    'cmake.in': 'cmake',
    'coffeescript': 'coffeescript',
    'coffee': 'coffeescript',
    'cson': 'coffeescript',
    'iced': 'coffeescript',
    'coq': 'coq',
    'cos': 'cos',
    'cls': 'cos',
    'cpp': 'cpp',
    'c': 'cpp',
    'cc': 'cpp',
    'h': 'cpp',
    'c++': 'cpp',
    'h++': 'cpp',
    'hpp': 'cpp',
    'crmsh': 'crmsh',
    'crm': 'crmsh',
    'pcmk': 'crmsh',
    'crystal': 'crystal',
    'cr': 'crystal',
    'cs': 'cs',
    'csharp': 'cs',
    'csp': 'csp',
    'css': 'css',
    'd': 'd',
    'dart': 'dart',
    'delphi': 'delphi',
    'dpr': 'delphi',
    'dfm': 'delphi',
    'pas': 'delphi',
    'pascal': 'delphi',
    'freepascal': 'delphi',
    'lazarus': 'delphi',
    'lpr': 'delphi',
    'lfm': 'delphi',
    'diff': 'diff',
    'patch': 'diff',
    'django': 'django',
    'jinja': 'django',
    'dns': 'dns',
    'bind': 'dns',
    'zone': 'dns',
    'dockerfile': 'dockerfile',
    'docker': 'dockerfile',
    'dos': 'dos',
    'bat': 'dos',
    'cmd': 'dos',
    'dsconfig': 'dsconfig',
    'dts': 'dts',
    'dust': 'dust',
    'dst': 'dust',
    'ebnf': 'ebnf',
    'elixir': 'elixir',
    'elm': 'elm',
    'erb': 'erb',
    'erlang-repl': 'erlang-repl',
    'erlang': 'erlang',
    'erl': 'erlang',
    'excel': 'excel',
    'xlsx': 'excel',
    'xls': 'excel',
    'fix': 'fix',
    'flix': 'flix',
    'fortran': 'fortran',
    'f90': 'fortran',
    'f95': 'fortran',
    'fsharp': 'fsharp',
    'fs': 'fsharp',
    'gams': 'gams',
    'gms': 'gams',
    'gauss': 'gauss',
    'gss': 'gauss',
    'gcode': 'gcode',
    'nc': 'gcode',
    'gherkin': 'gherkin',
    'feature': 'gherkin',
    'glsl': 'glsl',
    'go': 'go',
    'golang': 'go',
    'golo': 'golo',
    'gradle': 'gradle',
    'groovy': 'groovy',
    'haml': 'haml',
    'handlebars': 'handlebars',
    'hbs': 'handlebars',
    'html.hbs': 'handlebars',
    'html.handlebars': 'handlebars',
    'haskell': 'haskell',
    'hs': 'haskell',
    'haxe': 'haxe',
    'hx': 'haxe',
    'hsp': 'hsp',
    'htmlbars': 'htmlbars',
    'http': 'http',
    'https': 'http',
    'hy': 'hy',
    'hylang': 'hy',
    'inform7': 'inform7',
    'i7': 'inform7',
    'ini': 'ini',
    'toml': 'ini',
    'irpf90': 'irpf90',
    'java': 'java',
    'jsp': 'java',
    'javascript': 'javascript',
    'js': 'javascript',
    'jsx': 'javascript',
    'jboss-cli': 'jboss-cli',
    'wildfly-cli': 'jboss-cli',
    'json': 'json',
    'julia-repl': 'julia-repl',
    'julia': 'julia',
    'kotlin': 'kotlin',
    'lasso': 'lasso',
    'ls': 'livescript',
    'lassoscript': 'lasso',
    'ldif': 'ldif',
    'leaf': 'leaf',
    'less': 'less',
    'lisp': 'lisp',
    'livecodeserver': 'livecodeserver',
    'livescript': 'livescript',
    'llvm': 'llvm',
    'lsl': 'lsl',
    'lua': 'lua',
    'makefile': 'makefile',
    'mk': 'makefile',
    'mak': 'makefile',
    'markdown': 'markdown',
    'md': 'markdown',
    'mkdown': 'markdown',
    'mkd': 'markdown',
    'mathematica': 'mathematica',
    'mma': 'mathematica',
    'matlab': 'matlab',
    'maxima': 'maxima',
    'mel': 'mel',
    'mercury': 'mercury',
    'm': 'mercury',
    'moo': 'mercury',
    'mipsasm': 'mipsasm',
    'mips': 'mipsasm',
    'mizar': 'mizar',
    'mojolicious': 'mojolicious',
    'monkey': 'monkey',
    'moonscript': 'moonscript',
    'moon': 'moonscript',
    'n1ql': 'n1ql',
    'nginx': 'nginx',
    'nginxconf': 'nginx',
    'nimrod': 'nimrod',
    'nim': 'nimrod',
    'nix': 'nix',
    'nixos': 'nix',
    'nsis': 'nsis',
    'objectivec': 'objectivec',
    'mm': 'objectivec',
    'objc': 'objectivec',
    'obj-c': 'objectivec',
    'ocaml': 'ocaml',
    'ml': 'sml',
    'openscad': 'openscad',
    'scad': 'openscad',
    'oxygene': 'oxygene',
    'parser3': 'parser3',
    'perl': 'perl',
    'pl': 'perl',
    'pm': 'perl',
    'pf': 'pf',
    'pf.conf': 'pf',
    'php': 'php',
    'php3': 'php',
    'php4': 'php',
    'php5': 'php',
    'php6': 'php',
    'pony': 'pony',
    'powershell': 'powershell',
    'ps': 'powershell',
    'processing': 'processing',
    'profile': 'profile',
    'prolog': 'prolog',
    'protobuf': 'protobuf',
    'puppet': 'puppet',
    'pp': 'puppet',
    'purebasic': 'purebasic',
    'pb': 'purebasic',
    'pbi': 'purebasic',
    'python': 'python',
    'py': 'python',
    'gyp': 'python',
    'q': 'q',
    'k': 'q',
    'kdb': 'q',
    'qml': 'qml',
    'qt': 'qml',
    'r': 'r',
    'rib': 'rib',
    'roboconf': 'roboconf',
    'graph': 'roboconf',
    'instances': 'roboconf',
    'routeros': 'routeros',
    'mikrotik': 'routeros',
    'rsl': 'rsl',
    'ruby': 'ruby',
    'rb': 'ruby',
    'gemspec': 'ruby',
    'podspec': 'ruby',
    'thor': 'ruby',
    'irb': 'ruby',
    'ruleslanguage': 'ruleslanguage',
    'rust': 'rust',
    'rs': 'rust',
    'scala': 'scala',
    'scheme': 'scheme',
    'scilab': 'scilab',
    'sci': 'scilab',
    'scss': 'scss',
    'shell': 'shell',
    'console': 'shell',
    'smali': 'smali',
    'smalltalk': 'smalltalk',
    'st': 'smalltalk',
    'sml': 'sml',
    'sqf': 'sqf',
    'sql': 'sql',
    'stan': 'stan',
    'stata': 'stata',
    'do': 'stata',
    'ado': 'stata',
    'step21': 'step21',
    'p21': 'step21',
    'step': 'step21',
    'stp': 'step21',
    'stylus': 'stylus',
    'styl': 'stylus',
    'subunit': 'subunit',
    'swift': 'swift',
    'taggerscript': 'taggerscript',
    'tap': 'tap',
    'tcl': 'tcl',
    'tk': 'tcl',
    'tex': 'tex',
    'thrift': 'thrift',
    'tp': 'tp',
    'twig': 'twig',
    'craftcms': 'twig',
    'typescript': 'typescript',
    'ts': 'typescript',
    'vala': 'vala',
    'vbnet': 'vbnet',
    'vb': 'vbnet',
    'vbscript-html': 'vbscript-html',
    'vbscript': 'vbscript',
    'vbs': 'vbscript',
    'verilog': 'verilog',
    'v': 'verilog',
    'sv': 'verilog',
    'svh': 'verilog',
    'vhdl': 'vhdl',
    'vim': 'vim',
    'x86asm': 'x86asm',
    'xl': 'xl',
    'tao': 'xl',
    'xml': 'xml',
    'html': 'xml',
    'xhtml': 'xml',
    'rss': 'xml',
    'atom': 'xml',
    'xjb': 'xml',
    'xsd': 'xml',
    'xsl': 'xml',
    'plist': 'xml',
    'xquery': 'xquery',
    'xpath': 'xquery',
    'xq': 'xquery',
    'yaml': 'yaml',
    'yml': 'yaml',
    'YAML': 'yaml',
    'zephir': 'zephir',
    'zep': 'zephir'
};

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var KEY_CODE = {
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    B: 66,
    I: 73,
    H: 72,
    U: 85,
    D: 68,
    M: 77,
    Q: 81,
    O: 79,
    L: 76,
    S: 83,
    Z: 90,
    Y: 89,
    C: 67,
    T: 84,
    R: 82,
    DELETE: 8,
    TAB: 9,
    ENTER: 13,
    ONE: 97,
    TWO: 98,
    THREE: 99,
    FOUR: 100,
    FIVE: 101,
    SIX: 102,
    _ONE: 49,
    _TWO: 50,
    _THREE: 51,
    _FOUR: 52,
    _FIVE: 53,
    _SIX: 54
};
var keydownListen = exports.keydownListen = function keydownListen($vm) {
    if (!$vm.shortCut) {
        return;
    }
    $vm.$el.addEventListener('keydown', function (e) {
        if (!(e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {
            switch (e.keyCode) {
                case KEY_CODE.F8:
                    {
                        if ($vm.toolbars.navigation) {
                            e.preventDefault();
                            $vm.toolbar_right_click('navigation');
                        }
                        break;
                    }
                case KEY_CODE.F9:
                    {
                        if ($vm.toolbars.preview) {
                            e.preventDefault();
                            $vm.toolbar_right_click('preview');
                        }
                        break;
                    }
                case KEY_CODE.F10:
                    {
                        if ($vm.toolbars.fullscreen) {
                            e.preventDefault();
                            $vm.toolbar_right_click('fullscreen');
                        }
                        break;
                    }
                case KEY_CODE.F11:
                    {
                        if ($vm.toolbars.readmodel) {
                            e.preventDefault();
                            $vm.toolbar_right_click('read');
                        }
                        break;
                    }
                case KEY_CODE.F12:
                    {
                        if ($vm.toolbars.subfield) {
                            e.preventDefault();
                            $vm.toolbar_right_click('subfield');
                        }
                        break;
                    }
                case KEY_CODE.TAB:
                    {
                        if (!$vm.$refs.toolbar_left.s_img_link_open) {
                            e.preventDefault();
                            $vm.insertTab();
                        }
                        break;
                    }
                case KEY_CODE.ENTER:
                    {
                        if ($vm.$refs.toolbar_left.s_img_link_open) {
                            e.preventDefault();
                            $vm.$refs.toolbar_left.$imgLinkAdd();
                        } else {
                            $vm.insertEnter(e);
                        }
                        break;
                    }
            }
        } else if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {
            switch (e.keyCode) {
                case KEY_CODE.B:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('bold');
                        break;
                    }
                case KEY_CODE.I:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('italic');
                        break;
                    }
                case KEY_CODE.H:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header');
                        break;
                    }
                case KEY_CODE.U:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('underline');
                        break;
                    }
                case KEY_CODE.D:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('removeLine');
                        break;
                    }
                case KEY_CODE.M:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('mark');
                        break;
                    }
                case KEY_CODE.Q:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('quote');
                        break;
                    }
                case KEY_CODE.O:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('ol');
                        break;
                    }
                case KEY_CODE.L:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('link');
                        break;
                    }
                case KEY_CODE.S:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('save');
                        break;
                    }
                case KEY_CODE.Z:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('undo');
                        break;
                    }
                case KEY_CODE.Y:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('redo');
                        break;
                    }
                case KEY_CODE.DELETE:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('trash');
                        break;
                    }
                case KEY_CODE.ONE:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header1');
                        break;
                    }
                case KEY_CODE.TWO:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header2');
                        break;
                    }
                case KEY_CODE.THREE:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header3');
                        break;
                    }
                case KEY_CODE.FOUR:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header4');
                        break;
                    }
                case KEY_CODE.FIVE:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header5');
                        break;
                    }
                case KEY_CODE.SIX:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header6');
                        break;
                    }
                case KEY_CODE._ONE:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header1');
                        break;
                    }
                case KEY_CODE._TWO:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header2');
                        break;
                    }
                case KEY_CODE._THREE:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header3');
                        break;
                    }
                case KEY_CODE._FOUR:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header4');
                        break;
                    }
                case KEY_CODE._FIVE:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header5');
                        break;
                    }
                case KEY_CODE._SIX:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('header6');
                        break;
                    }
            }
        } else if ((e.ctrlKey || e.metaKey) && e.altKey && !e.shiftKey) {
            switch (e.keyCode) {
                case KEY_CODE.S:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('superscript');
                        break;
                    }
                case KEY_CODE.U:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('ul');
                        break;
                    }
                case KEY_CODE.L:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('imagelink');
                        break;
                    }
                case KEY_CODE.C:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('code');
                        break;
                    }
                case KEY_CODE.T:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('table');
                        break;
                    }
            }
        } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey) {
            switch (e.keyCode) {
                case KEY_CODE.S:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('subscript');
                        break;
                    }
                case KEY_CODE.D:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('strikethrough');
                        break;
                    }
                case KEY_CODE.L:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('alignleft');
                        break;
                    }
                case KEY_CODE.R:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('alignright');
                        break;
                    }
                case KEY_CODE.C:
                    {
                        e.preventDefault();
                        $vm.toolbar_left_click('aligncenter');
                        break;
                    }
            }
        } else if (!(e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey) {
            switch (e.keyCode) {
                case KEY_CODE.TAB:
                    {
                        if (!$vm.$refs.toolbar_left.s_img_link_open) {
                            e.preventDefault();
                            $vm.unInsertTab();
                        }
                        break;
                    }
            }
        }
    });
};

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (md, xssOptions) {
  if (md.options.html) {
    xssHandler = new _xss.FilterXSS(xssOptions);
    md.core.ruler.push('mavoneditor_sanitizer', mavoneditor_sanitizer);
  }
};

var _xss = __webpack_require__(229);

var xssHandler = void 0;

function mavoneditor_sanitizer(state) {
  if (!xssHandler) {
    return;
  }
  sanitizer(state.tokens, ['inline', 'html_block']);
}

function sanitizer(tokens, types) {
  var originContent = void 0,
      children = void 0;
  for (var i = 0; i < tokens.length; i++) {
    if (types.indexOf(tokens[i].type) !== -1) {
      originContent = tokens[i].content;
      children = tokens[i].children;
      tokens[i].content = xssHandler.process(originContent);
      if (children && children.length && originContent !== tokens[i].content) {
        sanitizer(children, ['html_inline']);
      }
    }
  }
}

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = __webpack_require__(21);

var _typeof3 = _interopRequireDefault(_typeof2);

exports.initMarkdown = initMarkdown;

var _langHljs = __webpack_require__(78);

var _langHljs2 = _interopRequireDefault(_langHljs);

var _extraFunction = __webpack_require__(40);

var _sanitizer = __webpack_require__(80);

var _sanitizer2 = _interopRequireDefault(_sanitizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var markdown_config = {
    html: true,
    xhtmlOut: true,
    breaks: true,
    langPrefix: 'lang-',
    linkify: false,
    typographer: true,
    quotes: '“”‘’'
};

var MarkdownIt = __webpack_require__(147);

var emoji = __webpack_require__(131);

var sub = __webpack_require__(143);

var sup = __webpack_require__(144);

var deflist = __webpack_require__(130);

var abbr = __webpack_require__(128);

var footnote = __webpack_require__(137);

var insert = __webpack_require__(140);

var mark = __webpack_require__(142);

var taskLists = __webpack_require__(145);

var container = __webpack_require__(129);

var toc = __webpack_require__(146);

var mihe = __webpack_require__(138);

var katex = __webpack_require__(141);
var miip = __webpack_require__(139);
var missLangs = {};
var needLangs = [];
var hljs_opts = {
    hljs: 'auto',
    highlighted: true,
    langCheck: function langCheck(lang) {
        if (lang && _langHljs2.default[lang] && !missLangs[lang]) {
            missLangs[lang] = 1;
            needLangs.push(_langHljs2.default[lang]);
        }
    }
};

function initMarkdown() {
    var markdown = new MarkdownIt(markdown_config);

    var defaultRender = markdown.renderer.rules.link_open || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };
    markdown.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        var hIndex = tokens[idx].attrIndex('href');
        if (tokens[idx].attrs[hIndex][1].startsWith('#')) return defaultRender(tokens, idx, options, env, self);

        var aIndex = tokens[idx].attrIndex('target');

        if (aIndex < 0) {
            tokens[idx].attrPush(['target', '_blank']);
        } else {
            tokens[idx].attrs[aIndex][1] = '_blank';
        }

        return defaultRender(tokens, idx, options, env, self);
    };

    markdown.use(mihe, hljs_opts).use(emoji).use(sup).use(sub).use(container).use(container, 'hljs-left').use(container, 'hljs-center').use(container, 'hljs-right').use(deflist).use(abbr).use(footnote).use(insert).use(mark).use(container).use(miip).use(katex).use(taskLists).use(toc);

    return markdown;
}

exports.default = {
    data: function data() {
        return {
            markdownIt: null
        };
    },
    created: function created() {
        this.markdownIt = initMarkdown();
        if (!this.html) {
            this.markdownIt.set({ html: false });
            this.xssOptions = false;
        } else if ((0, _typeof3.default)(this.xssOptions) === 'object') {
            this.markdownIt.use(_sanitizer2.default, this.xssOptions);
        }
    },
    mounted: function mounted() {
        hljs_opts.highlighted = this.ishljs;
    },

    methods: {
        $render: function $render(src, func) {
            var $vm = this;
            missLangs = {};
            needLangs = [];
            var res = this.markdownIt.render(src);
            if (this.ishljs) {
                if (needLangs.length > 0) {
                    $vm.$_render(src, func, res);
                }
            }
            func(res);
        },
        $_render: function $_render(src, func, res) {
            var $vm = this;
            var deal = 0;
            for (var i = 0; i < needLangs.length; i++) {
                var url = $vm.p_external_link.hljs_lang(needLangs[i]);
                (0, _extraFunction.loadScript)(url, function () {
                    deal = deal + 1;
                    if (deal === needLangs.length) {
                        res = this.markdownIt.render(src);
                        func(res);
                    }
                });
            }
        }
    },
    watch: {
        ishljs: function ishljs(val) {
            hljs_opts.highlighted = val;
        }
    }
};

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});


function $toolbar_left_undo_click($vm) {
    if ($vm.d_history_index > 0) {
        $vm.d_history_index--;
    }

    $vm.$nextTick(function () {
        var start = $vm.textarea_selectionEnds[$vm.d_history_index];
        $vm.getTextareaDom().selectionStart = start;
        $vm.getTextareaDom().selectionEnd = start;
    });
    $vm.getTextareaDom().focus();
}

function $toolbar_left_redo_click($vm) {
    if ($vm.d_history_index < $vm.d_history.length - 1) {
        $vm.d_history_index++;
    }
    $vm.$nextTick(function () {
        var start = $vm.textarea_selectionEnds[$vm.d_history_index];
        $vm.getTextareaDom().selectionStart = start;
        $vm.getTextareaDom().selectionEnd = start;
    });
    $vm.getTextareaDom().focus();
}
function $toolbar_left_trash_click($vm) {
    $vm.d_value = '';
    $vm.getTextareaDom().focus();
}
function $toolbar_left_save_click($vm) {
    $vm.save($vm.d_value, $vm.d_render);
}

function $toolbar_left_ol_click($vm) {
    $vm.insertOl();
}

function $toolbar_left_ul_click($vm) {
    $vm.insertUl();
}
function $toolbar_left_remove_line_click($vm) {
    $vm.removeLine();
}

function $toolbar_left_codeBlock_click($vm) {
    $vm.insertCodeBlock();
}

var toolbar_left_addlink = exports.toolbar_left_addlink = function toolbar_left_addlink(type, text, link, $vm) {
    var insert_text = {
        prefix: type === 'link' ? '[' + text + '](' : '![' + text + '](',
        subfix: ')',
        str: link
    };
    $vm.insertText($vm.getTextareaDom(), insert_text);
};
var toolbar_left_click = exports.toolbar_left_click = function toolbar_left_click(_type, $vm) {
    var _param_of_insert_text = {
        'bold': {
            prefix: '**',
            subfix: '**',
            str: $vm.d_words.tl_bold
        },
        'italic': {
            prefix: '*',
            subfix: '*',
            str: $vm.d_words.tl_italic
        },
        'header': {
            prefix: '# ',
            subfix: '',
            str: $vm.d_words.tl_header
        },
        'header1': {
            prefix: '# ',
            subfix: '',
            str: $vm.d_words.tl_header_one
        },
        'header2': {
            prefix: '## ',
            subfix: '',
            str: $vm.d_words.tl_header_two
        },
        'header3': {
            prefix: '### ',
            subfix: '',
            str: $vm.d_words.tl_header_three
        },
        'header4': {
            prefix: '#### ',
            subfix: '',
            str: $vm.d_words.tl_header_four
        },
        'header5': {
            prefix: '##### ',
            subfix: '',
            str: $vm.d_words.tl_header_five
        },
        'header6': {
            prefix: '###### ',
            subfix: '',
            str: $vm.d_words.tl_header_six
        },
        'underline': {
            prefix: '++',
            subfix: '++',
            str: $vm.d_words.tl_underline
        },
        'strikethrough': {
            prefix: '~~',
            subfix: '~~',
            str: $vm.d_words.tl_strikethrough
        },
        'mark': {
            prefix: '==',
            subfix: '==',
            str: $vm.d_words.tl_mark
        },
        'superscript': {
            prefix: '^',
            subfix: '^',
            str: $vm.d_words.tl_superscript
        },
        'subscript': {
            prefix: '~',
            subfix: '~',
            str: $vm.d_words.tl_subscript
        },
        'quote': {
            prefix: '> ',
            subfix: '',
            str: $vm.d_words.tl_quote
        },
        'link': {
            prefix: '[](',
            subfix: ')',
            str: $vm.d_words.tl_link
        },
        'imagelink': {
            prefix: '![](',
            subfix: ')',
            str: $vm.d_words.tl_image
        },
        'table': {
            prefix: '',
            subfix: '',
            str: '|column1|column2|column3|\n|-|-|-|\n|content1|content2|content3|\n'
        },
        'aligncenter': {
            prefix: '::: hljs-center\n\n',
            subfix: '\n\n:::\n',
            str: $vm.d_words.tl_aligncenter
        },
        'alignright': {
            prefix: '::: hljs-right\n\n',
            subfix: '\n\n:::\n',
            str: $vm.d_words.tl_alignright
        },
        'alignleft': {
            prefix: '::: hljs-left\n\n',
            subfix: '\n\n:::\n',
            str: $vm.d_words.tl_alignleft
        }
    };
    if (_param_of_insert_text.hasOwnProperty(_type)) {
        $vm.insertText($vm.getTextareaDom(), _param_of_insert_text[_type]);
    }
    var _other_left_click = {
        'undo': $toolbar_left_undo_click,
        'redo': $toolbar_left_redo_click,
        'trash': $toolbar_left_trash_click,
        'save': $toolbar_left_save_click,
        'ol': $toolbar_left_ol_click,
        'ul': $toolbar_left_ul_click,
        'removeLine': $toolbar_left_remove_line_click,
        'code': $toolbar_left_codeBlock_click
    };
    if (_other_left_click.hasOwnProperty(_type)) {
        _other_left_click[_type]($vm);
    }
};

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});


function $toolbar_right_html_click($vm) {
    $vm.s_html_code = !$vm.s_html_code;
    if ($vm.htmlcode) {
        $vm.htmlcode($vm.s_html_code, $vm.d_value);
    }
}

function $toolbar_right_help_click($vm) {
    $vm.s_help = !$vm.s_help;
    if ($vm.helptoggle) {
        $vm.helptoggle($vm.s_help, $vm.d_value);
    }
}

function $toolbar_right_read_click($vm) {
    var element = $vm.$refs.vReadModel;

    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

function $toolbar_right_preview_click($vm) {
    $vm.s_preview_switch = !$vm.s_preview_switch;

    if ($vm.previewtoggle) {
        $vm.previewtoggle($vm.s_preview_switch, $vm.d_value);
    }
}

function $toolbar_right_fullscreen_click($vm) {
    $vm.s_fullScreen = !$vm.s_fullScreen;
    if ($vm.fullscreen) {
        $vm.fullscreen($vm.s_fullScreen, $vm.d_value);
    }
}
function $toolbar_right_subfield_click($vm) {
    $vm.s_subfield = !$vm.s_subfield;
    $vm.s_preview_switch = $vm.s_subfield;

    if ($vm.previewtoggle) {
        $vm.previewtoggle($vm.s_preview_switch, $vm.d_value);
    }

    if ($vm.subfieldtoggle) {
        $vm.subfieldtoggle($vm.s_subfield, $vm.d_value);
    }
}
function $toolbar_right_navigation_click($vm) {
    $vm.s_navigation = !$vm.s_navigation;
    if ($vm.s_navigation) {
        $vm.s_preview_switch = true;
    }
    if ($vm.navigationtoggle) {
        $vm.navigationtoggle($vm.s_navigation, $vm.d_value);
    }
    if ($vm.s_navigation) {
        $vm.getNavigation($vm, false);
    }
}
var toolbar_right_click = exports.toolbar_right_click = function toolbar_right_click(_type, $vm) {
    var _other_right_click = {
        'help': $toolbar_right_help_click,
        'html': $toolbar_right_html_click,
        'read': $toolbar_right_read_click,
        'preview': $toolbar_right_preview_click,
        'fullscreen': $toolbar_right_fullscreen_click,
        'navigation': $toolbar_right_navigation_click,
        'subfield': $toolbar_right_subfield_click
    };
    if (_other_right_click.hasOwnProperty(_type)) {
        _other_right_click[_type]($vm);
    }
};

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = __webpack_require__(21);

var _typeof3 = _interopRequireDefault(_typeof2);

exports.p_ObjectCopy_DEEP = p_ObjectCopy_DEEP;
exports.p_urlParse = p_urlParse;
exports.stopEvent = stopEvent;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function p_ObjectCopy_DEEP(target, arg) {
  for (var arg_item in arg) {
    var type = (0, _typeof3.default)(arg[arg_item]);
    if (!target[arg_item] || type !== 'Object' && type !== 'object') {
      target[arg_item] = arg[arg_item];
      continue;
    } else {
      target[arg_item] = p_ObjectCopy_DEEP(target[arg_item], arg[arg_item]);
    }
  }
  return target;
};
function p_urlParse() {
  var url = window.location.search;
  var obj = {};
  var reg = /[?&][^?&]+=[^?&]+/g;
  var arr = url.match(reg);
  if (arr) {
    arr.forEach(function (item) {
      var tempArr = item.substring(1).split('=');
      var key = decodeURIComponent(tempArr[0]);
      var val = decodeURIComponent(tempArr[1]);
      obj[key] = val;
    });
  }
  return obj;
};

function stopEvent(e) {
  if (!e) {
    return;
  }
  if (e.preventDefault) {
    e.preventDefault();
  }
  if (e.stopPropagation) {
    e.stopPropagation();
  }
};

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(87), __esModule: true };

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(88), __esModule: true };

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(110);
__webpack_require__(108);
__webpack_require__(111);
__webpack_require__(112);
module.exports = __webpack_require__(13).Symbol;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(109);
__webpack_require__(113);
module.exports = __webpack_require__(33).f('iterator');


/***/ }),
/* 89 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 90 */
/***/ (function(module, exports) {

module.exports = function () { /* empty */ };


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(9);
var toLength = __webpack_require__(106);
var toAbsoluteIndex = __webpack_require__(105);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(89);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
var getKeys = __webpack_require__(25);
var gOPS = __webpack_require__(48);
var pIE = __webpack_require__(26);
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(1).document;
module.exports = document && document.documentElement;


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(41);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(41);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create = __webpack_require__(46);
var descriptor = __webpack_require__(16);
var setToStringTag = __webpack_require__(27);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(7)(IteratorPrototype, __webpack_require__(10)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),
/* 98 */
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(17)('meta');
var isObject = __webpack_require__(11);
var has = __webpack_require__(2);
var setDesc = __webpack_require__(8).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(14)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(8);
var anObject = __webpack_require__(12);
var getKeys = __webpack_require__(25);

module.exports = __webpack_require__(6) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(26);
var createDesc = __webpack_require__(16);
var toIObject = __webpack_require__(9);
var toPrimitive = __webpack_require__(31);
var has = __webpack_require__(2);
var IE8_DOM_DEFINE = __webpack_require__(44);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(6) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = __webpack_require__(9);
var gOPN = __webpack_require__(47).f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(2);
var toObject = __webpack_require__(51);
var IE_PROTO = __webpack_require__(28)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(30);
var defined = __webpack_require__(22);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(30);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(30);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var addToUnscopables = __webpack_require__(90);
var step = __webpack_require__(98);
var Iterators = __webpack_require__(24);
var toIObject = __webpack_require__(9);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(45)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 108 */
/***/ (function(module, exports) {



/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $at = __webpack_require__(104)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(45)(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// ECMAScript 6 symbols shim
var global = __webpack_require__(1);
var has = __webpack_require__(2);
var DESCRIPTORS = __webpack_require__(6);
var $export = __webpack_require__(43);
var redefine = __webpack_require__(50);
var META = __webpack_require__(99).KEY;
var $fails = __webpack_require__(14);
var shared = __webpack_require__(29);
var setToStringTag = __webpack_require__(27);
var uid = __webpack_require__(17);
var wks = __webpack_require__(10);
var wksExt = __webpack_require__(33);
var wksDefine = __webpack_require__(32);
var enumKeys = __webpack_require__(93);
var isArray = __webpack_require__(96);
var anObject = __webpack_require__(12);
var isObject = __webpack_require__(11);
var toObject = __webpack_require__(51);
var toIObject = __webpack_require__(9);
var toPrimitive = __webpack_require__(31);
var createDesc = __webpack_require__(16);
var _create = __webpack_require__(46);
var gOPNExt = __webpack_require__(102);
var $GOPD = __webpack_require__(101);
var $GOPS = __webpack_require__(48);
var $DP = __webpack_require__(8);
var $keys = __webpack_require__(25);
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function' && !!$GOPS.f;
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  __webpack_require__(47).f = gOPNExt.f = $getOwnPropertyNames;
  __webpack_require__(26).f = $propertyIsEnumerable;
  $GOPS.f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !__webpack_require__(15)) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FAILS_ON_PRIMITIVES = $fails(function () { $GOPS.f(1); });

$export($export.S + $export.F * FAILS_ON_PRIMITIVES, 'Object', {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return $GOPS.f(toObject(it));
  }
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(7)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(32)('asyncIterator');


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(32)('observable');


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(107);
var global = __webpack_require__(1);
var hide = __webpack_require__(7);
var Iterators = __webpack_require__(24);
var TO_STRING_TAG = __webpack_require__(10)('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(true);
// imports


// module
exports.push([module.i, "\n.container {\n    margin: auto;\n    width: 80%;\n}\n#editor {\n    height: 580px;\n}\n.switch-code-style {\n    margin-top: 10px;\n    font-size: 16px;\n}\n", "", {"version":3,"sources":["D:/work/songwang/test/mavonEditor/src/dev/editor.vue?08980da2"],"names":[],"mappings":";AAmDA;IACA,aAAA;IACA,WAAA;CACA;AACA;IACA,cAAA;CACA;AACA;IACA,iBAAA;IACA,gBAAA;CACA","file":"editor.vue","sourcesContent":["<template>\n    <div class=\"container\">\n        <div id=\"editor\">\n            <mavon-editor style=\"height: 100%\" v-model=\"code\" :codeStyle=\"codeStyle\" :xssOptions=\"xssOptions\"></mavon-editor>\n        </div>\n        <div class=\"switch-code-style\">\n            <span>code style:</span>\n            <select v-model=\"codeStyle\">\n                <option v-for=\"(val, key) in styles\" :value=\"key\">{{ key }}</option>\n            </select>\n        </div>\n    </div>\n</template>\n<script>\nimport styles from '../lib/core/hljs/lang.hljs.css.js'\n\nconst code = `java\n/**\n * @author John Smith <john.smith@example.com>\n*/\npackage l2f.gameserver.model;\n\npublic abstract strictfp class L2Char extends L2Object {\n  public static final Short ERROR = 0x0001;\n\n  public void moveTo(int x, int y, int z) {\n    _ai = null;\n    log(\"Should not be called\");\n    if (1 > 5) { // wtf!?\n      return;\n    }\n  }\n}`;\n\nmodule.exports = {\n    name: 'editor',\n    data: function () {\n        return {\n            codeStyle: \"github\",\n            styles,\n            code: '<span style=\"color:red;font-size:36px;\">A</span> \\n```' + code + '\\n```',\n            xssOptions:{\n                whiteList: {\n                    span: ['style']\n                }\n            }\n        };\n    }\n}\n</script>\n<style>\n.container {\n    margin: auto;\n    width: 80%;\n}\n#editor {\n    height: 580px;\n}\n.switch-code-style {\n    margin-top: 10px;\n    font-size: 16px;\n}\n</style>\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(true);
// imports


// module
exports.push([module.i, "\n.auto-textarea-wrapper {\n  position: relative;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  line-height: normal;\n}\n.auto-textarea-wrapper .auto-textarea-block {\n  display: block;\n  white-space: pre-wrap;\n  word-wrap: break-word !important;\n  visibility: hidden;\n  overflow: hidden;\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n  font-size: 100%;\n}\n.auto-textarea-wrapper .auto-textarea-input {\n  font-family: Menlo, \"Ubuntu Mono\", Consolas, \"Courier New\", \"Microsoft Yahei\", \"Hiragino Sans GB\", \"WenQuanYi Micro Hei\", sans-serif;\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  top: 0;\n  left: 0;\n  margin: 0;\n  padding: 0;\n  overflow-y: hidden;\n  color: #2c3e50;\n}\n.auto-textarea-wrapper .auto-textarea-input.no-border {\n  outline: 0 none;\n  border: none !important;\n}\n.auto-textarea-wrapper .auto-textarea-input.no-resize {\n  resize: none;\n}\n", "", {"version":3,"sources":["D:/work/songwang/test/mavonEditor/node_modules/auto-textarea/node_modules/auto-textarea/auto-textarea.vue","D:/work/songwang/test/mavonEditor/node_modules/auto-textarea/auto-textarea.vue"],"names":[],"mappings":";AAkFA;EACE,mBAAA;EACA,YAAA;EACA,UAAA;EACA,WAAA;EACA,oBAAA;CCjFD;ADkFC;EACE,eAAA;EACA,sBAAA;EACA,iCAAA;EACA,mBAAA;EACA,iBAAA;EACA,UAAA;EACA,WAAA;EACA,uBAAA;EACA,gBAAA;CChFH;ADiFC;EACE,qIAAA;EACA,mBAAA;EACA,YAAA;EACA,aAAA;EACA,OAAA;EACA,QAAA;EACA,UAAA;EACA,WAAA;EACA,mBAAA;EACA,eAAA;CC/EH;ADgFG;EACE,gBAAA;EACA,wBAAA;CC9EL;AD+EG;EACE,aAAA;CC7EL","file":"auto-textarea.vue","sourcesContent":["\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.auto-textarea-wrapper\n  position relative\n  width 100%\n  margin 0\n  padding 0\n  line-height normal\n  .auto-textarea-block\n    display block\n    white-space pre-wrap\n    word-wrap break-word !important\n    visibility hidden\n    overflow hidden\n    margin 0\n    padding 0\n    box-sizing border-box\n    font-size 100%\n  .auto-textarea-input\n    font-family Menlo, \"Ubuntu Mono\", Consolas, \"Courier New\", \"Microsoft Yahei\", \"Hiragino Sans GB\", \"WenQuanYi Micro Hei\", sans-serif\n    position absolute\n    width 100%\n    height 100%\n    top 0\n    left 0\n    margin 0\n    padding 0\n    overflow-y hidden\n    color #2C3E50\n    &.no-border\n      outline 0 none\n      border none !important\n    &.no-resize\n      resize none\n",".auto-textarea-wrapper {\n  position: relative;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  line-height: normal;\n}\n.auto-textarea-wrapper .auto-textarea-block {\n  display: block;\n  white-space: pre-wrap;\n  word-wrap: break-word !important;\n  visibility: hidden;\n  overflow: hidden;\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n  font-size: 100%;\n}\n.auto-textarea-wrapper .auto-textarea-input {\n  font-family: Menlo, \"Ubuntu Mono\", Consolas, \"Courier New\", \"Microsoft Yahei\", \"Hiragino Sans GB\", \"WenQuanYi Micro Hei\", sans-serif;\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  top: 0;\n  left: 0;\n  margin: 0;\n  padding: 0;\n  overflow-y: hidden;\n  color: #2c3e50;\n}\n.auto-textarea-wrapper .auto-textarea-input.no-border {\n  outline: 0 none;\n  border: none !important;\n}\n.auto-textarea-wrapper .auto-textarea-input.no-resize {\n  resize: none;\n}\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(true);
// imports


// module
exports.push([module.i, "\n.op-icon.dropdown-wrapper.dropdown[data-v-548e2160] {\n  position: relative;\n}\n.op-icon.dropdown-wrapper.dropdown[type=button][data-v-548e2160] {\n  -webkit-appearance: unset;\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown[data-v-548e2160] {\n  position: absolute;\n  display: block;\n  background: #fff;\n  top: 32px;\n  left: -45px;\n  min-width: 130px;\n  z-index: 1600;\n  border: 1px solid #ebeef5;\n  border-radius: 4px;\n  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown .dropdown-item[data-v-548e2160]:first-child {\n  border-top-left-radius: 3px;\n  border-top-right-radius: 3px;\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown .dropdown-item[data-v-548e2160]:last-child {\n  border-bottom-left-radius: 3px;\n  border-bottom-right-radius: 3px;\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.op-header[data-v-548e2160] {\n  left: -30px;\n  min-width: 90px;\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.fade-enter-active[data-v-548e2160],\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.fade-leave-active[data-v-548e2160] {\n  opacity: 1;\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.fade-enter[data-v-548e2160],\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.fade-leave-active[data-v-548e2160] {\n  opacity: 0;\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.transition[data-v-548e2160],\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.transition .dropdown-item[data-v-548e2160] {\n  -webkit-transition: all 0.2s linear 0s;\n  transition: all 0.2s linear 0s;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-item[data-v-548e2160] {\n  height: 40px;\n  line-height: 40px;\n  font-size: 14px;\n  color: #606266;\n  position: relative;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-item[data-v-548e2160]:hover {\n  color: #303133;\n  background-color: #e9e9eb;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-item input[data-v-548e2160] {\n  position: absolute;\n  font-size: 100px;\n  right: 0;\n  top: 0;\n  opacity: 0;\n  cursor: pointer;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images[data-v-548e2160] {\n  box-sizing: border-box;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images button[data-v-548e2160] {\n  position: absolute;\n  top: -1px;\n  right: 5px;\n  font-size: 14px;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images button[data-v-548e2160]:hover {\n  color: #f56c6c;\n  background-color: transparent;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images span[data-v-548e2160] {\n  display: inline-block;\n  width: 80px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images:hover .image-show[data-v-548e2160] {\n  display: block !important;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images .image-show[data-v-548e2160] {\n  display: none;\n  position: absolute;\n  left: -128px;\n  top: 0;\n  width: 120px;\n  height: 90px;\n  object-fit: contain;\n  border: 1px solid #f2f6fc;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images .image-show.transition[data-v-548e2160] {\n  -webkit-transition: all 0.2s linear 0s;\n  transition: all 0.2s linear 0s;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images.transition[data-v-548e2160] {\n  -webkit-transition: all 0.2s linear 0s;\n  transition: all 0.2s linear 0s;\n}\n.add-image-link-wrapper[data-v-548e2160] {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  background: rgba(0,0,0,0.7);\n  z-index: 1600;\n  -webkit-transition: all 0.1s linear 0s;\n  transition: all 0.1s linear 0s;\n}\n.add-image-link-wrapper.fade-enter-active[data-v-548e2160],\n.add-image-link-wrapper.fade-leave-active[data-v-548e2160] {\n  opacity: 1;\n}\n.add-image-link-wrapper.fade-enter[data-v-548e2160],\n.add-image-link-wrapper.fade-leave-active[data-v-548e2160] {\n  opacity: 0;\n}\n.add-image-link-wrapper .add-image-link[data-v-548e2160] {\n  position: fixed;\n  box-sizing: border-box;\n  text-align: center;\n  width: 24%;\n  left: 38%;\n  height: auto;\n  padding: 40px;\n  top: 25%;\n  -webkit-transition: all 0.1s linear 0s;\n  transition: all 0.1s linear 0s;\n  z-index: 3;\n  background: #fff;\n  border-radius: 2px;\n}\n@media only screen and (max-width: 1500px) {\n.add-image-link-wrapper .add-image-link[data-v-548e2160] {\n    width: 34%;\n    left: 33%;\n}\n}\n@media only screen and (max-width: 1000px) {\n.add-image-link-wrapper .add-image-link[data-v-548e2160] {\n    width: 50%;\n    left: 25%;\n}\n}\n@media only screen and (max-width: 600px) {\n.add-image-link-wrapper .add-image-link[data-v-548e2160] {\n    width: 80%;\n    left: 10%;\n}\n}\n.add-image-link-wrapper .add-image-link i[data-v-548e2160] {\n  font-size: 24px;\n  position: absolute;\n  right: 8px;\n  top: 6px;\n  color: rgba(0,0,0,0.7);\n  cursor: pointer;\n}\n.add-image-link-wrapper .add-image-link .title[data-v-548e2160] {\n  font-size: 20px;\n  margin-bottom: 30px;\n  margin-top: 10px;\n  font-weight: 500 !important;\n}\n.add-image-link-wrapper .add-image-link .input-wrapper[data-v-548e2160] {\n  margin-top: 10px;\n  width: 80%;\n  border: 1px solid #eeece8;\n  text-align: left;\n  margin-left: 10%;\n  height: 35px;\n}\n.add-image-link-wrapper .add-image-link .input-wrapper input[data-v-548e2160] {\n  height: 32px;\n  line-height: 32px;\n  font-size: 15px;\n  width: 90%;\n  margin-left: 8px;\n  border: none;\n  outline: none;\n}\n.add-image-link-wrapper .add-image-link .op-btn[data-v-548e2160] {\n  width: 100px;\n  height: 35px;\n  display: inline-block;\n  margin-top: 30px;\n  cursor: pointer;\n  text-align: center;\n  line-height: 35px;\n  opacity: 0.9;\n  border-radius: 2px;\n  letter-spacing: 1px;\n  font-size: 15px;\n}\n.add-image-link-wrapper .add-image-link .op-btn.sure[data-v-548e2160] {\n  background: #2185d0;\n  color: #fff;\n  margin-left: 5%;\n}\n.add-image-link-wrapper .add-image-link .op-btn.sure[data-v-548e2160]:hover {\n  opacity: 1;\n}\n.add-image-link-wrapper .add-image-link .op-btn.cancel[data-v-548e2160] {\n  border: 1px solid #bcbcbc;\n  color: #bcbcbc;\n}\n.add-image-link-wrapper .add-image-link .op-btn.cancel[data-v-548e2160]:hover {\n  color: #000;\n}\n", "", {"version":3,"sources":["D:/work/songwang/test/mavonEditor/src/components/src/components/md-toolbar-left.vue","D:/work/songwang/test/mavonEditor/src/components/md-toolbar-left.vue"],"names":[],"mappings":";AAkUI;EACI,mBAAA;CCjUP;ADkUO;EACI,0BAAA;CChUX;ADiUO;EACI,mBAAA;EACA,eAAA;EACA,iBAAA;EACA,UAAA;EACA,YAAA;EACA,iBAAA;EACA,cAAA;EACA,0BAAA;EACA,mBAAA;EACA,yCAAA;CC/TX;ADgUW;EACI,4BAAA;EACA,6BAAA;CC9Tf;AD+TW;EACI,+BAAA;EACA,gCAAA;CC7Tf;AD8TW;EACI,YAAA;EACA,gBAAA;CC5Tf;AD6TW;;EACI,WAAA;CC1Tf;AD2TW;;EACI,WAAA;CCxTf;AD0Ta;;EACE,uCAAA;EAAA,+BAAA;CCvTf;ADwTO;EACI,aAAA;EACA,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,mBAAA;CCtTX;ADuTW;EACI,eAAA;EACA,0BAAA;CCrTf;ADsTW;EACI,mBAAA;EACA,iBAAA;EACA,SAAA;EACA,OAAA;EACA,WAAA;EACA,gBAAA;CCpTf;ADqTO;EACI,uBAAA;CCnTX;ADoTW;EACI,mBAAA;EACA,UAAA;EACA,WAAA;EACA,gBAAA;CClTf;ADmTe;EACI,eAAA;EACA,8BAAA;CCjTnB;ADkTW;EACI,sBAAA;EACA,YAAA;EACA,oBAAA;EACA,iBAAA;EACA,wBAAA;CChTf;ADkTe;EACI,0BAAA;CChTnB;ADiTW;EACI,cAAA;EACA,mBAAA;EACA,aAAA;EACA,OAAA;EACA,aAAA;EACA,aAAA;EACA,oBAAA;EACA,0BAAA;CC/Sf;ADgTe;EACI,uCAAA;EAAA,+BAAA;CC9SnB;AD+SW;EACI,uCAAA;EAAA,+BAAA;CC7Sf;AD8SD;EACI,gBAAA;EACA,QAAA;EACA,SAAA;EACA,OAAA;EACA,UAAA;EACA,4BAAA;EACA,cAAA;EACA,uCAAA;EAAA,+BAAA;CC5SH;AD6SG;;EACI,WAAA;CC1SP;AD2SG;;EACI,WAAA;CCxSP;ADySG;EACI,gBAAA;EACA,uBAAA;EACA,mBAAA;EACA,WAAA;EACA,UAAA;EAUA,aAAA;EACA,cAAA;EACA,SAAA;EACA,uCAAA;EAAA,+BAAA;EACA,WAAA;EACA,iBAAA;EACA,mBAAA;CChTP;ADiS+C;AAAA;IACpC,WAAA;IACA,UAAA;CC9RT;CACF;AD8R+C;AAAA;IACpC,WAAA;IACA,UAAA;CC3RT;CACF;AD2R8C;AAAA;IACnC,WAAA;IACA,UAAA;CCxRT;CACF;ADgSO;EACI,gBAAA;EACA,mBAAA;EACA,WAAA;EACA,SAAA;EACA,uBAAA;EACA,gBAAA;CC9RX;AD+RO;EACI,gBAAA;EACA,oBAAA;EACA,iBAAA;EACA,4BAAA;CC7RX;AD8RO;EACI,iBAAA;EACA,WAAA;EACA,0BAAA;EACA,iBAAA;EACA,iBAAA;EACA,aAAA;CC5RX;AD6RW;EACI,aAAA;EACA,kBAAA;EACA,gBAAA;EACA,WAAA;EACA,iBAAA;EACA,aAAA;EACA,cAAA;CC3Rf;AD4RO;EACI,aAAA;EACA,aAAA;EACA,sBAAA;EACA,iBAAA;EACA,gBAAA;EACA,mBAAA;EACA,kBAAA;EACA,aAAA;EACA,mBAAA;EACA,oBAAA;EACA,gBAAA;CC1RX;AD2RO;EACI,oBAAA;EACA,YAAA;EACA,gBAAA;CCzRX;AD0RW;EACI,WAAA;CCxRf;ADyRO;EACI,0BAAA;EACA,eAAA;CCvRX;ADwRW;EACI,YAAA;CCtRf","file":"md-toolbar-left.vue","sourcesContent":["\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n    .op-icon.dropdown-wrapper.dropdown\n        position relative\n        &[type=button]\n            -webkit-appearance unset\n        .popup-dropdown\n            position absolute\n            display block\n            background #fff\n            top 32px\n            left -45px\n            min-width 130px\n            z-index 1600\n            border 1px solid #ebeef5\n            border-radius 4px\n            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)\n            .dropdown-item:first-child\n                border-top-left-radius 3px\n                border-top-right-radius 3px\n            .dropdown-item:last-child\n                border-bottom-left-radius 3px\n                border-bottom-right-radius 3px\n            &.op-header\n                left -30px\n                min-width 90px\n            &.fade-enter-active, &.fade-leave-active\n                opacity 1\n            &.fade-enter, &.fade-leave-active\n                opacity 0\n            &.transition\n              &, .dropdown-item\n                transition all 0.2s linear 0s\n        .dropdown-item\n            height 40px\n            line-height @height\n            font-size 14px\n            color #606266\n            position relative\n            &:hover\n                color #303133\n                background-color #e9e9eb\n            input\n                position absolute\n                font-size 100px\n                right 0\n                top 0\n                opacity 0\n                cursor pointer\n        .dropdown-images\n            box-sizing border-box\n            button\n                position absolute\n                top -1px\n                right 5px\n                font-size: 14px\n                &:hover\n                    color #F56C6C\n                    background-color: transparent\n            span\n                display inline-block\n                width 80px\n                white-space nowrap\n                overflow hidden\n                text-overflow ellipsis\n            &:hover\n                .image-show\n                    display block !important\n            .image-show\n                display none\n                position absolute\n                left -128px\n                top 0\n                width 120px\n                height 90px\n                object-fit contain\n                border 1px solid #F2F6FC\n                &.transition\n                    transition all 0.2s linear 0s\n            &.transition\n                transition all 0.2s linear 0s\n.add-image-link-wrapper\n    position fixed\n    left 0\n    right 0\n    top 0\n    bottom 0\n    background rgba(0, 0, 0, 0.7)\n    z-index 1600\n    transition all 0.1s linear 0s\n    &.fade-enter-active, &.fade-leave-active\n        opacity 1\n    &.fade-enter, &.fade-leave-active\n        opacity 0\n    .add-image-link\n        position fixed\n        box-sizing border-box\n        text-align center\n        width 24%\n        left 38%\n        @media only screen and (max-width 1500px)\n            width 34%\n            left 33%\n        @media only screen and (max-width 1000px)\n            width 50%\n            left 25%\n        @media only screen and (max-width 600px)\n            width 80%\n            left 10%\n        height auto\n        padding 40px\n        top 25%\n        transition all 0.1s linear 0s\n        z-index 3\n        background #fff\n        border-radius 2px\n\n        i\n            font-size 24px\n            position absolute\n            right 8px\n            top 6px\n            color rgba(0, 0, 0, 0.7)\n            cursor pointer\n        .title\n            font-size 20px\n            margin-bottom 30px\n            margin-top 10px\n            font-weight 500 !important\n        .input-wrapper\n            margin-top 10px\n            width 80%\n            border  1px solid #eeece8\n            text-align left\n            margin-left 10%\n            height 35px\n            input\n                height 32px\n                line-height 32px\n                font-size 15px\n                width 90%\n                margin-left 8px\n                border none\n                outline none\n        .op-btn\n            width 100px\n            height 35px\n            display inline-block\n            margin-top 30px\n            cursor pointer\n            text-align center\n            line-height @height\n            opacity 0.9\n            border-radius 2px\n            letter-spacing 1px\n            font-size 15px\n        .op-btn.sure\n            background #2185d0\n            color #fff\n            margin-left 5%\n            &:hover\n                opacity 1\n        .op-btn.cancel\n            border 1px solid #bcbcbc\n            color #bcbcbc\n            &:hover\n                color #000\n\n",".op-icon.dropdown-wrapper.dropdown {\n  position: relative;\n}\n.op-icon.dropdown-wrapper.dropdown[type=button] {\n  -webkit-appearance: unset;\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown {\n  position: absolute;\n  display: block;\n  background: #fff;\n  top: 32px;\n  left: -45px;\n  min-width: 130px;\n  z-index: 1600;\n  border: 1px solid #ebeef5;\n  border-radius: 4px;\n  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown .dropdown-item:first-child {\n  border-top-left-radius: 3px;\n  border-top-right-radius: 3px;\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown .dropdown-item:last-child {\n  border-bottom-left-radius: 3px;\n  border-bottom-right-radius: 3px;\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.op-header {\n  left: -30px;\n  min-width: 90px;\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.fade-enter-active,\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.fade-leave-active {\n  opacity: 1;\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.fade-enter,\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.fade-leave-active {\n  opacity: 0;\n}\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.transition,\n.op-icon.dropdown-wrapper.dropdown .popup-dropdown.transition .dropdown-item {\n  transition: all 0.2s linear 0s;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-item {\n  height: 40px;\n  line-height: 40px;\n  font-size: 14px;\n  color: #606266;\n  position: relative;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-item:hover {\n  color: #303133;\n  background-color: #e9e9eb;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-item input {\n  position: absolute;\n  font-size: 100px;\n  right: 0;\n  top: 0;\n  opacity: 0;\n  cursor: pointer;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images {\n  box-sizing: border-box;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images button {\n  position: absolute;\n  top: -1px;\n  right: 5px;\n  font-size: 14px;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images button:hover {\n  color: #f56c6c;\n  background-color: transparent;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images span {\n  display: inline-block;\n  width: 80px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images:hover .image-show {\n  display: block !important;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images .image-show {\n  display: none;\n  position: absolute;\n  left: -128px;\n  top: 0;\n  width: 120px;\n  height: 90px;\n  object-fit: contain;\n  border: 1px solid #f2f6fc;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images .image-show.transition {\n  transition: all 0.2s linear 0s;\n}\n.op-icon.dropdown-wrapper.dropdown .dropdown-images.transition {\n  transition: all 0.2s linear 0s;\n}\n.add-image-link-wrapper {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  background: rgba(0,0,0,0.7);\n  z-index: 1600;\n  transition: all 0.1s linear 0s;\n}\n.add-image-link-wrapper.fade-enter-active,\n.add-image-link-wrapper.fade-leave-active {\n  opacity: 1;\n}\n.add-image-link-wrapper.fade-enter,\n.add-image-link-wrapper.fade-leave-active {\n  opacity: 0;\n}\n.add-image-link-wrapper .add-image-link {\n  position: fixed;\n  box-sizing: border-box;\n  text-align: center;\n  width: 24%;\n  left: 38%;\n  height: auto;\n  padding: 40px;\n  top: 25%;\n  transition: all 0.1s linear 0s;\n  z-index: 3;\n  background: #fff;\n  border-radius: 2px;\n}\n@media only screen and (max-width: 1500px) {\n  .add-image-link-wrapper .add-image-link {\n    width: 34%;\n    left: 33%;\n  }\n}\n@media only screen and (max-width: 1000px) {\n  .add-image-link-wrapper .add-image-link {\n    width: 50%;\n    left: 25%;\n  }\n}\n@media only screen and (max-width: 600px) {\n  .add-image-link-wrapper .add-image-link {\n    width: 80%;\n    left: 10%;\n  }\n}\n.add-image-link-wrapper .add-image-link i {\n  font-size: 24px;\n  position: absolute;\n  right: 8px;\n  top: 6px;\n  color: rgba(0,0,0,0.7);\n  cursor: pointer;\n}\n.add-image-link-wrapper .add-image-link .title {\n  font-size: 20px;\n  margin-bottom: 30px;\n  margin-top: 10px;\n  font-weight: 500 !important;\n}\n.add-image-link-wrapper .add-image-link .input-wrapper {\n  margin-top: 10px;\n  width: 80%;\n  border: 1px solid #eeece8;\n  text-align: left;\n  margin-left: 10%;\n  height: 35px;\n}\n.add-image-link-wrapper .add-image-link .input-wrapper input {\n  height: 32px;\n  line-height: 32px;\n  font-size: 15px;\n  width: 90%;\n  margin-left: 8px;\n  border: none;\n  outline: none;\n}\n.add-image-link-wrapper .add-image-link .op-btn {\n  width: 100px;\n  height: 35px;\n  display: inline-block;\n  margin-top: 30px;\n  cursor: pointer;\n  text-align: center;\n  line-height: 35px;\n  opacity: 0.9;\n  border-radius: 2px;\n  letter-spacing: 1px;\n  font-size: 15px;\n}\n.add-image-link-wrapper .add-image-link .op-btn.sure {\n  background: #2185d0;\n  color: #fff;\n  margin-left: 5%;\n}\n.add-image-link-wrapper .add-image-link .op-btn.sure:hover {\n  opacity: 1;\n}\n.add-image-link-wrapper .add-image-link .op-btn.cancel {\n  border: 1px solid #bcbcbc;\n  color: #bcbcbc;\n}\n.add-image-link-wrapper .add-image-link .op-btn.cancel:hover {\n  color: #000;\n}\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(true);
// imports


// module
exports.push([module.i, "\ntextarea:disabled {\n  background-color: #fff;\n}\n.v-note-wrapper {\n  position: relative;\n  min-width: 300px;\n  min-height: 300px;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  background-color: #fff;\n  z-index: 1500;\n  text-align: left;\n  border: 1px solid #f2f6fc;\n  border-radius: 4px;\n}\n.v-note-wrapper.fullscreen {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  margin: 0;\n  height: auto;\n  z-index: 1501;\n}\n.v-note-wrapper .v-note-op {\n  padding: 1px;\n  width: 100%;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  white-space: pre-line;\n  -webkit-box-flex: 0;\n  -webkit-flex: none;\n      -ms-flex: none;\n          flex: none;\n  min-height: 40px;\n  -webkit-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  border-bottom: 1px solid #f2f6fc;\n  border-radius: 4px 4px 0 0;\n  background-color: #fff;\n  z-index: 1;\n}\n.v-note-wrapper .v-note-op .v-left-item,\n.v-note-wrapper .v-note-op .v-right-item {\n  -webkit-box-flex: 1;\n  -webkit-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  min-height: 40px;\n  box-sizing: border-box;\n}\n.v-note-wrapper .v-note-op .v-left-item .op-icon-divider,\n.v-note-wrapper .v-note-op .v-right-item .op-icon-divider {\n  height: 40px;\n  border-left: 1px solid #e5e5e5;\n  margin: 0 6px 0 4px;\n}\n.v-note-wrapper .v-note-op .v-left-item .op-icon,\n.v-note-wrapper .v-note-op .v-right-item .op-icon {\n  box-sizing: border-box;\n  display: inline-block;\n  cursor: pointer;\n  height: 28px;\n  width: 28px;\n  margin: 6px 0 5px 0px;\n  font-size: 14px;\n  padding: 4.5px 6px 5px 3.5px;\n  color: #757575;\n  border-radius: 5px;\n  text-align: center;\n  background: none;\n  border: none;\n  outline: none;\n  line-height: 1;\n}\n.v-note-wrapper .v-note-op .v-left-item .op-icon.dropdown-wrapper,\n.v-note-wrapper .v-note-op .v-right-item .op-icon.dropdown-wrapper {\n  line-height: 18px;\n}\n.v-note-wrapper .v-note-op .v-left-item .op-icon.selected,\n.v-note-wrapper .v-note-op .v-right-item .op-icon.selected {\n  color: rgba(0,0,0,0.8);\n  background: #eaeaea;\n}\n.v-note-wrapper .v-note-op .v-left-item .op-icon:hover,\n.v-note-wrapper .v-note-op .v-right-item .op-icon:hover {\n  color: rgba(0,0,0,0.8);\n  background: #e9e9eb;\n}\n.v-note-wrapper .v-note-op .v-left-item.transition .op-icon,\n.v-note-wrapper .v-note-op .v-right-item.transition .op-icon {\n  -webkit-transition: all 0.2s linear 0s;\n  transition: all 0.2s linear 0s;\n}\n.v-note-wrapper .v-note-op .v-right-item {\n  text-align: right;\n  padding-right: 6px;\n  max-width: 30%;\n}\n.v-note-wrapper .v-note-op .v-left-item {\n  text-align: left;\n  padding-left: 6px;\n}\n.v-note-wrapper .v-note-panel {\n  position: relative;\n  border-top: none;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 1;\n  -webkit-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  width: 100%;\n  box-sizing: border-box;\n  overflow: hidden;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 50%;\n      -ms-flex: 0 0 50%;\n          flex: 0 0 50%;\n  width: 50%;\n  padding: 0;\n  overflow-y: scroll;\n  overflow-x: hidden;\n  box-sizing: border-box;\n  cursor: text;\n  border-bottom-left-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.scroll-style::-webkit-scrollbar {\n  width: 6px;\n  background-color: #e5e5e5;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.scroll-style::-webkit-scrollbar-thumb {\n  background-color: #b7b7b7;\n  border-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.scroll-style::-webkit-scrollbar-thumb:hover {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.scroll-style::-webkit-scrollbar-thumb:active {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.scroll-style::-webkit-scrollbar-track {\n  -webkit-box-shadow: 0 0 0px #808080 inset;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.scroll-style-border-radius::-webkit-scrollbar {\n  border-bottom-right-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.transition {\n  -webkit-transition: all 0.2s linear 0s;\n  transition: all 0.2s linear 0s;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.single-edit {\n  width: 100%;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 100%;\n      -ms-flex: 0 0 100%;\n          flex: 0 0 100%;\n  overflow-y: auto;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.single-show {\n  width: 0;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 0;\n      -ms-flex: 0 0 0px;\n          flex: 0 0 0;\n  display: none;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper .content-div {\n  width: 100%;\n  padding: 20px 25px;\n  box-sizing: border-box;\n  outline: 0 none;\n  border: none !important;\n  color: #2c3e50;\n  font-size: 16px;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper .content-input-wrapper {\n  width: 100%;\n  padding: 8px 25px 15px 25px;\n}\n.v-note-wrapper .v-note-panel .v-note-show {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 50%;\n      -ms-flex: 0 0 50%;\n          flex: 0 0 50%;\n  width: 50%;\n  overflow-y: auto;\n  padding: 0 0;\n  -webkit-transition: all 0.2s linear 0s;\n  transition: all 0.2s linear 0s;\n}\n.v-note-wrapper .v-note-panel .v-note-show.single-show {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 100%;\n      -ms-flex: 0 0 100%;\n          flex: 0 0 100%;\n  width: 100%;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html {\n  width: 100%;\n  height: 100%;\n  padding: 8px 25px 15px 25px;\n  overflow-y: auto;\n  box-sizing: border-box;\n  overflow-x: hidden;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content.scroll-style::-webkit-scrollbar,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html.scroll-style::-webkit-scrollbar {\n  width: 6px;\n  background-color: #e5e5e5;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content.scroll-style::-webkit-scrollbar-thumb,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html.scroll-style::-webkit-scrollbar-thumb {\n  background-color: #b7b7b7;\n  border-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content.scroll-style::-webkit-scrollbar-thumb:hover,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html.scroll-style::-webkit-scrollbar-thumb:hover {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content.scroll-style::-webkit-scrollbar-thumb:active,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html.scroll-style::-webkit-scrollbar-thumb:active {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content.scroll-style::-webkit-scrollbar-track,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html.scroll-style::-webkit-scrollbar-track {\n  -webkit-box-shadow: 0 0 0px #808080 inset;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content.scroll-style-border-radius::-webkit-scrollbar,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html.scroll-style-border-radius::-webkit-scrollbar {\n  border-bottom-right-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  position: absolute;\n  width: 250px;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  height: 100%;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  background-color: rgba(255,255,255,0.98);\n  border-left: 1px solid #f2f6fc;\n  border-right: 1px solid #f2f6fc;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper.transition {\n  -webkit-transition: all 0.1s linear 0s;\n  transition: all 0.1s linear 0s;\n}\n@media only screen and (max-width: 768px) {\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper {\n    width: 50%;\n}\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper.slideTop-enter-active,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper.slideTop-leave-active {\n  height: 100%;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper.slideTop-enter,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper.slideTop-leave-active {\n  height: 0;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-title {\n  height: 50px;\n  width: 100%;\n  border-bottom: 1px solid #f2f6fc;\n  -webkit-box-flex: 0;\n  -webkit-flex: none;\n      -ms-flex: none;\n          flex: none;\n  line-height: 50px;\n  font-size: 16px;\n  box-sizing: border-box;\n  padding: 0 12px 0 18px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-title .v-note-navigation-close {\n  float: right;\n  color: #606266;\n  font-size: 18px;\n  cursor: pointer;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-title .v-note-navigation-close:hover {\n  color: #303133;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content {\n  overflow-y: auto;\n  -webkit-box-flex: 1;\n  -webkit-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  padding: 8px 0;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content.scroll-style::-webkit-scrollbar {\n  width: 6px;\n  background-color: #e5e5e5;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content.scroll-style::-webkit-scrollbar-thumb {\n  background-color: #b7b7b7;\n  border-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content.scroll-style::-webkit-scrollbar-thumb:hover {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content.scroll-style::-webkit-scrollbar-thumb:active {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content.scroll-style::-webkit-scrollbar-track {\n  -webkit-box-shadow: 0 0 0px #808080 inset;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content.scroll-style-border-radius::-webkit-scrollbar {\n  border-bottom-right-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h1,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h2,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h3,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h4,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h5,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h6 {\n  margin: 2px 0;\n  font-weight: 500;\n  font-size: 17px;\n  color: #2185d0;\n  cursor: pointer;\n  line-height: normal;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  padding: 0 12px;\n  border-bottom: none;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h1:hover,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h2:hover,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h3:hover,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h4:hover,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h5:hover,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h6:hover {\n  color: #483d8b;\n  -webkit-text-decoration-line: underline;\n          text-decoration-line: underline;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h2 {\n  padding-left: 27px;\n  font-size: 17px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h3 {\n  padding-left: 42px;\n  font-size: 17px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h4 {\n  padding-left: 58px;\n  font-size: 15px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h5 {\n  padding-left: 72px;\n  font-size: 15px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h6 {\n  padding-left: 87px;\n  font-size: 15px;\n}\n.v-note-wrapper .v-note-read-model {\n  position: relative;\n  display: none;\n  width: 100%;\n  height: 100%;\n  background: #fbfbfb;\n  padding: 30px 8% 50px 8%;\n  overflow-y: auto;\n  box-sizing: border-box;\n}\n.v-note-wrapper .v-note-read-model.scroll-style::-webkit-scrollbar {\n  width: 6px;\n  background-color: #e5e5e5;\n}\n.v-note-wrapper .v-note-read-model.scroll-style::-webkit-scrollbar-thumb {\n  background-color: #b7b7b7;\n  border-radius: 4px;\n}\n.v-note-wrapper .v-note-read-model.scroll-style::-webkit-scrollbar-thumb:hover {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-read-model.scroll-style::-webkit-scrollbar-thumb:active {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-read-model.scroll-style::-webkit-scrollbar-track {\n  -webkit-box-shadow: 0 0 0px #808080 inset;\n}\n.v-note-wrapper .v-note-read-model.scroll-style-border-radius::-webkit-scrollbar {\n  border-bottom-right-radius: 4px;\n}\n.v-note-wrapper .v-note-read-model.show {\n  display: block;\n}\n.v-note-wrapper.shadow {\n  border: none;\n}\n.v-note-help-wrapper {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  background: rgba(0,0,0,0.7);\n  z-index: 1600;\n  -webkit-transition: all 0.1s linear 0s;\n  transition: all 0.1s linear 0s;\n}\n.v-note-help-wrapper.fade-enter-active,\n.v-note-help-wrapper.fade-leave-active {\n  opacity: 1;\n}\n.v-note-help-wrapper.fade-enter,\n.v-note-help-wrapper.fade-leave-active {\n  opacity: 0;\n}\n.v-note-help-wrapper .v-note-help-content {\n  position: relative;\n  width: 60%;\n  max-width: 800px;\n  margin: 30px auto;\n  height: 90%;\n  min-width: 320px;\n  -webkit-transition: all 0.1s linear 0s;\n  transition: all 0.1s linear 0s;\n  z-index: 3;\n  border: 1px solid #f2f6fc;\n}\n.v-note-help-wrapper .v-note-help-content.shadow {\n  border: none;\n  box-shadow: 0 0px 5px rgba(0,0,0,0.157), 0 0px 5px rgba(0,0,0,0.227);\n}\n.v-note-help-wrapper .v-note-help-content i {\n  font-size: 28px;\n  position: absolute;\n  right: 15px;\n  top: 8px;\n  color: rgba(0,0,0,0.7);\n  cursor: pointer;\n}\n.v-note-help-wrapper .v-note-help-content i:hover {\n  color: #000;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show {\n  width: 100%;\n  height: 100%;\n  font-size: 18px;\n  background: #fbfbfb;\n  overflow-y: auto;\n  padding: 2% 6%;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show.scroll-style::-webkit-scrollbar {\n  width: 6px;\n  background-color: #e5e5e5;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show.scroll-style::-webkit-scrollbar-thumb {\n  background-color: #b7b7b7;\n  border-radius: 4px;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show.scroll-style::-webkit-scrollbar-thumb:hover {\n  background-color: #a1a1a1;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show.scroll-style::-webkit-scrollbar-thumb:active {\n  background-color: #a1a1a1;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show.scroll-style::-webkit-scrollbar-track {\n  -webkit-box-shadow: 0 0 0px #808080 inset;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show.scroll-style-border-radius::-webkit-scrollbar {\n  border-bottom-right-radius: 4px;\n}\n.v-note-img-wrapper {\n  position: fixed;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n      -ms-flex-align: center;\n          align-items: center;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  background: rgba(0,0,0,0.7);\n  z-index: 1600;\n  -webkit-transition: all 0.1s linear 0s;\n  transition: all 0.1s linear 0s;\n}\n.v-note-img-wrapper.fade-enter-active,\n.v-note-img-wrapper.fade-leave-active {\n  opacity: 1;\n}\n.v-note-img-wrapper.fade-enter,\n.v-note-img-wrapper.fade-leave-active {\n  opacity: 0;\n}\n.v-note-img-wrapper img {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 auto;\n      -ms-flex: 0 0 auto;\n          flex: 0 0 auto;\n  z-index: 3;\n}\n.v-note-img-wrapper i {\n  font-size: 28px;\n  position: absolute;\n  right: 15px;\n  top: 8px;\n  color: rgba(255,255,255,0.7);\n  cursor: pointer;\n}\n.v-note-img-wrapper i:hover {\n  color: #fff;\n}\n", "", {"version":3,"sources":["D:/work/songwang/test/mavonEditor/src/src/lib/css/mavon-editor.styl","D:/work/songwang/test/mavonEditor/src/mavon-editor.vue","D:/work/songwang/test/mavonEditor/src/src/lib/css/scroll.styl"],"names":[],"mappings":";AAEE;EACE,uBAAA;CCDH;ADIC;EACE,mBAAA;EACA,iBAAA;EACA,kBAAA;EACA,qBAAA;EAAA,sBAAA;EAAA,qBAAA;EAAA,cAAA;EACA,6BAAA;EAAA,8BAAA;EAAA,+BAAA;MAAA,2BAAA;UAAA,uBAAA;EACA,uBAAA;EACA,cAAA;EACA,iBAAA;EACA,0BAAA;EACA,mBAAA;CCFH;ADGG;EACE,gBAAA;EACA,QAAA;EACA,SAAA;EACA,UAAA;EACA,OAAA;EACA,UAAA;EACA,aAAA;EACA,cAAA;CCDL;ADEG;EACE,aAAA;EACA,YAAA;EACA,qBAAA;EAAA,sBAAA;EAAA,qBAAA;EAAA,cAAA;EACA,sBAAA;EACA,oBAAA;EAAA,mBAAA;MAAA,eAAA;UAAA,WAAA;EACA,iBAAA;EACA,0BAAA;MAAA,sBAAA;UAAA,kBAAA;EACA,iCAAA;EACA,2BAAA;EACA,uBAAA;EACA,WAAA;CCAL;ADCK;;EACE,oBAAA;EAAA,gBAAA;MAAA,YAAA;UAAA,QAAA;EACA,iBAAA;EACA,uBAAA;CCEP;ADDO;;EACE,aAAA;EACA,+BAAA;EACA,oBAAA;CCIT;ADHO;;EACE,uBAAA;EACA,sBAAA;EACA,gBAAA;EACA,aAAA;EACA,YAAA;EACA,sBAAA;EACA,gBAAA;EACA,6BAAA;EACA,eAAA;EACA,mBAAA;EACA,mBAAA;EACA,iBAAA;EACA,aAAA;EACA,cAAA;EACA,eAAA;CCMT;ADJS;;EACE,kBAAA;CCOX;ADNS;;EACE,uBAAA;EACA,oBAAA;CCSX;ADRS;;EACE,uBAAA;EACA,oBAAA;CCWX;ADTS;;EACE,uCAAA;EAAA,+BAAA;CCYX;ADXK;EACE,kBAAA;EACA,mBAAA;EACA,eAAA;CCaP;ADZK;EACE,iBAAA;EACA,kBAAA;CCcP;ADbG;EACE,mBAAA;EACA,iBAAA;EACA,qBAAA;EAAA,sBAAA;EAAA,qBAAA;EAAA,cAAA;EACA,oBAAA;EAAA,gBAAA;MAAA,YAAA;UAAA,QAAA;EACA,YAAA;EACA,uBAAA;EACA,iBAAA;CCeL;ADdK;EACE,oBAAA;EAAA,sBAAA;MAAA,kBAAA;UAAA,cAAA;EACA,WAAA;EACA,WAAA;EACA,mBAAA;EACA,mBAAA;EACA,uBAAA;EACA,aAAA;EACA,+BAAA;CCgBP;AChHC;EACE,WAAA;EACA,0BAAA;CDkHH;ACjHC;EACE,0BAAA;EACA,mBAAA;CDmHH;AClHC;EACE,0BAAA;CDoHH;ACnHC;EACE,0BAAA;CDqHH;ACpHC;EACE,0CAAA;CDsHH;ACrHC;EACE,gCAAA;CDuHH;ADlCO;EACE,uCAAA;EAAA,+BAAA;CCoCT;ADnCO;EACE,YAAA;EACA,oBAAA;EAAA,uBAAA;MAAA,mBAAA;UAAA,eAAA;EACA,iBAAA;CCqCT;ADpCO;EACE,SAAA;EACA,oBAAA;EAAA,oBAAA;MAAA,kBAAA;UAAA,YAAA;EACA,cAAA;CCsCT;ADrCO;EACE,YAAA;EACA,mBAAA;EACA,uBAAA;EACA,gBAAA;EACA,wBAAA;EACA,eAAA;EACA,gBAAA;CCuCT;ADtCO;EACE,YAAA;EACA,4BAAA;CCwCT;ADvCK;EACE,oBAAA;EAAA,sBAAA;MAAA,kBAAA;UAAA,cAAA;EACA,WAAA;EACA,iBAAA;EACA,aAAA;EACA,uCAAA;EAAA,+BAAA;CCyCP;ADxCO;EACE,oBAAA;EAAA,uBAAA;MAAA,mBAAA;UAAA,eAAA;EACA,YAAA;CC0CT;ADzCO;;EACE,YAAA;EACA,aAAA;EACA,4BAAA;EACA,iBAAA;EACA,uBAAA;EACA,mBAAA;CC4CT;AClLC;;EACE,WAAA;EACA,0BAAA;CDqLH;ACpLC;;EACE,0BAAA;EACA,mBAAA;CDuLH;ACtLC;;EACE,0BAAA;CDyLH;ACxLC;;EACE,0BAAA;CD2LH;AC1LC;;EACE,0CAAA;CD6LH;AC5LC;;EACE,gCAAA;CD+LH;ADpEK;EACE,qBAAA;EAAA,sBAAA;EAAA,qBAAA;EAAA,cAAA;EACA,mBAAA;EACA,aAAA;EACA,SAAA;EACA,OAAA;EACA,UAAA;EACA,aAAA;EACA,6BAAA;EAAA,8BAAA;EAAA,+BAAA;MAAA,2BAAA;UAAA,uBAAA;EACA,yCAAA;EACA,+BAAA;EACA,gCAAA;CCsEP;ADrEO;EACE,uCAAA;EAAA,+BAAA;CCuET;ADtE8C;AAAA;IACrC,WAAA;CCyEP;CACF;ADzEO;;EACE,aAAA;CC4ET;AD3EO;;EACE,UAAA;CC8ET;AD7EO;EACE,aAAA;EACA,YAAA;EACA,iCAAA;EACA,oBAAA;EAAA,mBAAA;MAAA,eAAA;UAAA,WAAA;EACA,kBAAA;EACA,gBAAA;EACA,uBAAA;EACA,uBAAA;CC+ET;AD9ES;EACE,aAAA;EACA,eAAA;EACA,gBAAA;EACA,gBAAA;CCgFX;AD/EW;EACE,eAAA;CCiFb;ADhFO;EACE,iBAAA;EACA,oBAAA;EAAA,gBAAA;MAAA,YAAA;UAAA,QAAA;EAEA,eAAA;CCiFT;ACjQC;EACE,WAAA;EACA,0BAAA;CDmQH;AClQC;EACE,0BAAA;EACA,mBAAA;CDoQH;ACnQC;EACE,0BAAA;CDqQH;ACpQC;EACE,0BAAA;CDsQH;ACrQC;EACE,0CAAA;CDuQH;ACtQC;EACE,gCAAA;CDwQH;ADpGS;;;;;;EACE,cAAA;EACA,iBAAA;EACA,gBAAA;EACA,eAAA;EACA,gBAAA;EACA,oBAAA;EACA,iBAAA;EACA,wBAAA;EACA,oBAAA;EACA,gBAAA;EACA,oBAAA;CC2GX;AD1GW;;;;;;EACE,eAAA;EACA,wCAAA;UAAA,gCAAA;CCiHb;ADhHS;EACE,mBAAA;EACA,gBAAA;CCkHX;ADjHS;EACE,mBAAA;EACA,gBAAA;CCmHX;ADlHS;EACE,mBAAA;EACA,gBAAA;CCoHX;ADnHS;EACE,mBAAA;EACA,gBAAA;CCqHX;ADpHS;EACE,mBAAA;EACA,gBAAA;CCsHX;ADrHG;EACE,mBAAA;EACA,cAAA;EACA,YAAA;EACA,aAAA;EACA,oBAAA;EACA,yBAAA;EACA,iBAAA;EAEA,uBAAA;CCsHL;AC9UC;EACE,WAAA;EACA,0BAAA;CDgVH;AC/UC;EACE,0BAAA;EACA,mBAAA;CDiVH;AChVC;EACE,0BAAA;CDkVH;ACjVC;EACE,0BAAA;CDmVH;AClVC;EACE,0CAAA;CDoVH;ACnVC;EACE,gCAAA;CDqVH;ADzIK;EACE,eAAA;CC2IP;AD1IG;EACE,aAAA;CC4IL;AD1ID;EACE,gBAAA;EACA,QAAA;EACA,SAAA;EACA,OAAA;EACA,UAAA;EACA,4BAAA;EACA,cAAA;EACA,uCAAA;EAAA,+BAAA;CC4ID;AD3IC;;EACE,WAAA;CC8IH;AD7IC;;EACE,WAAA;CCgJH;AD/IC;EACE,mBAAA;EACA,WAAA;EACA,iBAAA;EACA,kBAAA;EACA,YAAA;EACA,iBAAA;EACA,uCAAA;EAAA,+BAAA;EACA,WAAA;EACA,0BAAA;CCiJH;ADhJG;EACE,aAAA;EACA,qEAAA;CCkJL;ADjJG;EACE,gBAAA;EACA,mBAAA;EACA,YAAA;EACA,SAAA;EACA,uBAAA;EACA,gBAAA;CCmJL;ADlJK;EACE,YAAA;CCoJP;ADnJG;EACE,YAAA;EACA,aAAA;EACA,gBAAA;EACA,oBAAA;EACA,iBAAA;EACA,eAAA;CCqJL;AC5ZC;EACE,WAAA;EACA,0BAAA;CD8ZH;AC7ZC;EACE,0BAAA;EACA,mBAAA;CD+ZH;AC9ZC;EACE,0BAAA;CDgaH;AC/ZC;EACE,0BAAA;CDiaH;AChaC;EACE,0CAAA;CDkaH;ACjaC;EACE,gCAAA;CDmaH;ADrKD;EACE,gBAAA;EACA,qBAAA;EAAA,sBAAA;EAAA,qBAAA;EAAA,cAAA;EACA,yBAAA;EAAA,gCAAA;MAAA,sBAAA;UAAA,wBAAA;EACA,0BAAA;EAAA,4BAAA;MAAA,uBAAA;UAAA,oBAAA;EACA,QAAA;EACA,SAAA;EACA,OAAA;EACA,UAAA;EACA,4BAAA;EACA,cAAA;EACA,uCAAA;EAAA,+BAAA;CCuKD;ADtKC;;EACE,WAAA;CCyKH;ADxKC;;EACE,WAAA;CC2KH;AD1KC;EACE,oBAAA;EAAA,uBAAA;MAAA,mBAAA;UAAA,eAAA;EACA,WAAA;CC4KH;AD3KC;EACE,gBAAA;EACA,mBAAA;EACA,YAAA;EACA,SAAA;EACA,6BAAA;EACA,gBAAA;CC6KH;AD5KG;EACE,YAAA;CC8KL","file":"mavon-editor.vue","sourcesContent":["  border-color = 1px solid #F2F6FC\r\n  op-height = 40px\r\n  textarea:disabled\r\n    background-color #ffffff\r\n\r\n  /* 路由内容 */\r\n  .v-note-wrapper\r\n    position relative\r\n    min-width 300px\r\n    min-height 300px\r\n    display flex\r\n    flex-direction column\r\n    background-color #fff\r\n    z-index 1500\r\n    text-align left\r\n    border border-color\r\n    border-radius 4px\r\n    &.fullscreen\r\n      position fixed\r\n      left 0\r\n      right 0\r\n      bottom 0\r\n      top 0\r\n      margin 0\r\n      height auto\r\n      z-index 1501\r\n    .v-note-op\r\n      padding 1px\r\n      width 100%\r\n      display flex\r\n      white-space pre-line\r\n      flex none\r\n      min-height op-height\r\n      user-select none\r\n      border-bottom border-color\r\n      border-radius 4px 4px 0 0\r\n      background-color #fff\r\n      z-index 1\r\n      .v-left-item, .v-right-item\r\n        flex 1\r\n        min-height op-height\r\n        box-sizing border-box\r\n        .op-icon-divider\r\n          height op-height\r\n          border-left 1px solid #e5e5e5\r\n          margin 0 6px 0 4px\r\n        .op-icon\r\n          box-sizing border-box\r\n          display inline-block\r\n          cursor pointer\r\n          height 28px\r\n          width 28px\r\n          margin 6px 0 5px 0px\r\n          font-size 14px\r\n          padding 4.5px 6px 5px 3.5px\r\n          color #757575\r\n          border-radius 5px\r\n          text-align center\r\n          background none\r\n          border none\r\n          outline none\r\n          line-height 1\r\n          //vertical-align middle\r\n          &.dropdown-wrapper\r\n            line-height 18px\r\n          &.selected\r\n            color rgba(0, 0, 0, 0.8)\r\n            background #eaeaea\r\n          &:hover\r\n            color rgba(0, 0, 0, 0.8)\r\n            background #e9e9eb\r\n        &.transition\r\n          .op-icon\r\n            transition all 0.2s linear 0s\r\n      .v-right-item\r\n        text-align right\r\n        padding-right 6px\r\n        max-width 30%\r\n      .v-left-item\r\n        text-align left\r\n        padding-left 6px\r\n    .v-note-panel\r\n      position relative\r\n      border-top none\r\n      display flex\r\n      flex 1\r\n      width 100%\r\n      box-sizing border-box\r\n      overflow hidden\r\n      .v-note-edit.divarea-wrapper\r\n        flex 0 0 50%\r\n        width 50%\r\n        padding 0\r\n        overflow-y scroll\r\n        overflow-x hidden\r\n        box-sizing border-box\r\n        cursor text\r\n        border-bottom-left-radius: 4px;\r\n        scrollbar()\r\n        &.transition\r\n          transition all 0.2s linear 0s\r\n        &.single-edit\r\n          width 100%\r\n          flex 0 0 100%\r\n          overflow-y auto\r\n        &.single-show\r\n          width 0\r\n          flex 0 0 0\r\n          display none\r\n        .content-div\r\n          width 100%\r\n          padding 20px 25px\r\n          box-sizing border-box\r\n          outline 0 none\r\n          border none !important\r\n          color #2c3e50\r\n          font-size 16px\r\n        .content-input-wrapper\r\n          width 100%\r\n          padding 8px 25px 15px 25px\r\n      .v-note-show\r\n        flex 0 0 50%\r\n        width 50%\r\n        overflow-y auto\r\n        padding 0 0\r\n        transition all 0.2s linear 0s\r\n        &.single-show\r\n          flex 0 0 100%\r\n          width 100%\r\n        .v-show-content, .v-show-content-html\r\n          width 100%\r\n          height 100%\r\n          padding 8px 25px 15px 25px\r\n          overflow-y auto\r\n          box-sizing border-box\r\n          overflow-x hidden\r\n          scrollbar()\r\n      .v-note-navigation-wrapper\r\n        display flex\r\n        position absolute\r\n        width 250px\r\n        right 0\r\n        top 0\r\n        bottom 0\r\n        height 100%\r\n        flex-direction column\r\n        background-color rgba(255,255,255,0.98)\r\n        border-left border-color\r\n        border-right border-color\r\n        &.transition\r\n          transition all 0.1s linear 0s\r\n        @media only screen and (max-width 768px)\r\n          width 50%\r\n        &.slideTop-enter-active, &.slideTop-leave-active\r\n          height 100%\r\n        &.slideTop-enter, &.slideTop-leave-active\r\n          height 0\r\n        .v-note-navigation-title\r\n          height 50px\r\n          width 100%\r\n          border-bottom border-color\r\n          flex none\r\n          line-height @height\r\n          font-size 16px\r\n          box-sizing border-box\r\n          padding 0 12px 0 18px\r\n          .v-note-navigation-close\r\n            float right\r\n            color #606266\r\n            font-size 18px\r\n            cursor pointer\r\n            &:hover\r\n              color #303133\r\n        .v-note-navigation-content\r\n          overflow-y auto\r\n          flex 1\r\n          scrollbar()\r\n          padding 8px 0\r\n          h1, h2, h3, h4, h5, h6\r\n            margin 2px 0\r\n            font-weight 500\r\n            font-size 17px\r\n            color #2185d0\r\n            cursor pointer\r\n            line-height normal\r\n            overflow hidden\r\n            text-overflow ellipsis\r\n            white-space nowrap\r\n            padding 0 12px\r\n            border-bottom none\r\n            &:hover\r\n              color #483D8B\r\n              text-decoration-line underline\r\n          h2\r\n            padding-left  27px\r\n            font-size 17px\r\n          h3\r\n            padding-left  42px\r\n            font-size 17px\r\n          h4\r\n            padding-left  58px\r\n            font-size 15px\r\n          h5\r\n            padding-left  72px\r\n            font-size 15px\r\n          h6\r\n            padding-left  87px\r\n            font-size 15px\r\n    .v-note-read-model\r\n      position relative\r\n      display none\r\n      width 100%\r\n      height 100%\r\n      background #fbfbfb\r\n      padding 30px 8% 50px 8%\r\n      overflow-y auto\r\n      scrollbar()\r\n      box-sizing border-box\r\n      &.show\r\n        display block\r\n    &.shadow\r\n      border none\r\n      // box-shadow 0 2px 12px 0 rgba(0, 0, 0, 0.1) \r\n.v-note-help-wrapper\r\n  position fixed\r\n  left 0\r\n  right 0\r\n  top 0\r\n  bottom 0\r\n  background rgba(0, 0, 0, 0.7)\r\n  z-index 1600\r\n  transition all 0.1s linear 0s\r\n  &.fade-enter-active, &.fade-leave-active\r\n    opacity 1\r\n  &.fade-enter, &.fade-leave-active\r\n    opacity 0\r\n  .v-note-help-content\r\n    position relative\r\n    width 60%\r\n    max-width 800px\r\n    margin 30px auto\r\n    height 90%\r\n    min-width 320px\r\n    transition all 0.1s linear 0s\r\n    z-index 3\r\n    border border-color\r\n    &.shadow\r\n      border none\r\n      box-shadow 0 0px 5px rgba(0, 0, 0, .156863), 0 0px 5px rgba(0, 0, 0, .227451)\r\n    i\r\n      font-size 28px\r\n      position absolute\r\n      right 15px\r\n      top 8px\r\n      color rgba(0, 0, 0, 0.7)\r\n      cursor pointer\r\n      &:hover\r\n        color rgba(0, 0, 0, 1)\r\n    .v-note-help-show\r\n      width 100%\r\n      height 100%\r\n      font-size 18px\r\n      background #fbfbfb\r\n      overflow-y auto\r\n      padding 2% 6%\r\n      scrollbar()\r\n\r\n\r\n.v-note-img-wrapper\r\n  position fixed\r\n  display flex\r\n  justify-content center\r\n  align-items center\r\n  left 0\r\n  right 0\r\n  top 0\r\n  bottom 0\r\n  background rgba(0, 0, 0, 0.7)\r\n  z-index 1600\r\n  transition all 0.1s linear 0s\r\n  &.fade-enter-active, &.fade-leave-active\r\n    opacity 1\r\n  &.fade-enter, &.fade-leave-active\r\n    opacity 0\r\n  img\r\n    flex 0 0 auto\r\n    z-index 3\r\n  i\r\n    font-size 28px\r\n    position absolute\r\n    right 15px\r\n    top 8px\r\n    color rgba(255, 255, 255, 0.7)\r\n    cursor pointer\r\n    &:hover\r\n      color rgba(255, 255, 255, 1)\r\nalign()\r\n","textarea:disabled {\n  background-color: #fff;\n}\n.v-note-wrapper {\n  position: relative;\n  min-width: 300px;\n  min-height: 300px;\n  display: flex;\n  flex-direction: column;\n  background-color: #fff;\n  z-index: 1500;\n  text-align: left;\n  border: 1px solid #f2f6fc;\n  border-radius: 4px;\n}\n.v-note-wrapper.fullscreen {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  margin: 0;\n  height: auto;\n  z-index: 1501;\n}\n.v-note-wrapper .v-note-op {\n  padding: 1px;\n  width: 100%;\n  display: flex;\n  white-space: pre-line;\n  flex: none;\n  min-height: 40px;\n  user-select: none;\n  border-bottom: 1px solid #f2f6fc;\n  border-radius: 4px 4px 0 0;\n  background-color: #fff;\n  z-index: 1;\n}\n.v-note-wrapper .v-note-op .v-left-item,\n.v-note-wrapper .v-note-op .v-right-item {\n  flex: 1;\n  min-height: 40px;\n  box-sizing: border-box;\n}\n.v-note-wrapper .v-note-op .v-left-item .op-icon-divider,\n.v-note-wrapper .v-note-op .v-right-item .op-icon-divider {\n  height: 40px;\n  border-left: 1px solid #e5e5e5;\n  margin: 0 6px 0 4px;\n}\n.v-note-wrapper .v-note-op .v-left-item .op-icon,\n.v-note-wrapper .v-note-op .v-right-item .op-icon {\n  box-sizing: border-box;\n  display: inline-block;\n  cursor: pointer;\n  height: 28px;\n  width: 28px;\n  margin: 6px 0 5px 0px;\n  font-size: 14px;\n  padding: 4.5px 6px 5px 3.5px;\n  color: #757575;\n  border-radius: 5px;\n  text-align: center;\n  background: none;\n  border: none;\n  outline: none;\n  line-height: 1;\n}\n.v-note-wrapper .v-note-op .v-left-item .op-icon.dropdown-wrapper,\n.v-note-wrapper .v-note-op .v-right-item .op-icon.dropdown-wrapper {\n  line-height: 18px;\n}\n.v-note-wrapper .v-note-op .v-left-item .op-icon.selected,\n.v-note-wrapper .v-note-op .v-right-item .op-icon.selected {\n  color: rgba(0,0,0,0.8);\n  background: #eaeaea;\n}\n.v-note-wrapper .v-note-op .v-left-item .op-icon:hover,\n.v-note-wrapper .v-note-op .v-right-item .op-icon:hover {\n  color: rgba(0,0,0,0.8);\n  background: #e9e9eb;\n}\n.v-note-wrapper .v-note-op .v-left-item.transition .op-icon,\n.v-note-wrapper .v-note-op .v-right-item.transition .op-icon {\n  transition: all 0.2s linear 0s;\n}\n.v-note-wrapper .v-note-op .v-right-item {\n  text-align: right;\n  padding-right: 6px;\n  max-width: 30%;\n}\n.v-note-wrapper .v-note-op .v-left-item {\n  text-align: left;\n  padding-left: 6px;\n}\n.v-note-wrapper .v-note-panel {\n  position: relative;\n  border-top: none;\n  display: flex;\n  flex: 1;\n  width: 100%;\n  box-sizing: border-box;\n  overflow: hidden;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper {\n  flex: 0 0 50%;\n  width: 50%;\n  padding: 0;\n  overflow-y: scroll;\n  overflow-x: hidden;\n  box-sizing: border-box;\n  cursor: text;\n  border-bottom-left-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.scroll-style::-webkit-scrollbar {\n  width: 6px;\n  background-color: #e5e5e5;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.scroll-style::-webkit-scrollbar-thumb {\n  background-color: #b7b7b7;\n  border-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.scroll-style::-webkit-scrollbar-thumb:hover {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.scroll-style::-webkit-scrollbar-thumb:active {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.scroll-style::-webkit-scrollbar-track {\n  -webkit-box-shadow: 0 0 0px #808080 inset;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.scroll-style-border-radius::-webkit-scrollbar {\n  border-bottom-right-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.transition {\n  transition: all 0.2s linear 0s;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.single-edit {\n  width: 100%;\n  flex: 0 0 100%;\n  overflow-y: auto;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper.single-show {\n  width: 0;\n  flex: 0 0 0;\n  display: none;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper .content-div {\n  width: 100%;\n  padding: 20px 25px;\n  box-sizing: border-box;\n  outline: 0 none;\n  border: none !important;\n  color: #2c3e50;\n  font-size: 16px;\n}\n.v-note-wrapper .v-note-panel .v-note-edit.divarea-wrapper .content-input-wrapper {\n  width: 100%;\n  padding: 8px 25px 15px 25px;\n}\n.v-note-wrapper .v-note-panel .v-note-show {\n  flex: 0 0 50%;\n  width: 50%;\n  overflow-y: auto;\n  padding: 0 0;\n  transition: all 0.2s linear 0s;\n}\n.v-note-wrapper .v-note-panel .v-note-show.single-show {\n  flex: 0 0 100%;\n  width: 100%;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html {\n  width: 100%;\n  height: 100%;\n  padding: 8px 25px 15px 25px;\n  overflow-y: auto;\n  box-sizing: border-box;\n  overflow-x: hidden;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content.scroll-style::-webkit-scrollbar,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html.scroll-style::-webkit-scrollbar {\n  width: 6px;\n  background-color: #e5e5e5;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content.scroll-style::-webkit-scrollbar-thumb,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html.scroll-style::-webkit-scrollbar-thumb {\n  background-color: #b7b7b7;\n  border-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content.scroll-style::-webkit-scrollbar-thumb:hover,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html.scroll-style::-webkit-scrollbar-thumb:hover {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content.scroll-style::-webkit-scrollbar-thumb:active,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html.scroll-style::-webkit-scrollbar-thumb:active {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content.scroll-style::-webkit-scrollbar-track,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html.scroll-style::-webkit-scrollbar-track {\n  -webkit-box-shadow: 0 0 0px #808080 inset;\n}\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content.scroll-style-border-radius::-webkit-scrollbar,\n.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html.scroll-style-border-radius::-webkit-scrollbar {\n  border-bottom-right-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper {\n  display: flex;\n  position: absolute;\n  width: 250px;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  height: 100%;\n  flex-direction: column;\n  background-color: rgba(255,255,255,0.98);\n  border-left: 1px solid #f2f6fc;\n  border-right: 1px solid #f2f6fc;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper.transition {\n  transition: all 0.1s linear 0s;\n}\n@media only screen and (max-width: 768px) {\n  .v-note-wrapper .v-note-panel .v-note-navigation-wrapper {\n    width: 50%;\n  }\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper.slideTop-enter-active,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper.slideTop-leave-active {\n  height: 100%;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper.slideTop-enter,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper.slideTop-leave-active {\n  height: 0;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-title {\n  height: 50px;\n  width: 100%;\n  border-bottom: 1px solid #f2f6fc;\n  flex: none;\n  line-height: 50px;\n  font-size: 16px;\n  box-sizing: border-box;\n  padding: 0 12px 0 18px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-title .v-note-navigation-close {\n  float: right;\n  color: #606266;\n  font-size: 18px;\n  cursor: pointer;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-title .v-note-navigation-close:hover {\n  color: #303133;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content {\n  overflow-y: auto;\n  flex: 1;\n  padding: 8px 0;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content.scroll-style::-webkit-scrollbar {\n  width: 6px;\n  background-color: #e5e5e5;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content.scroll-style::-webkit-scrollbar-thumb {\n  background-color: #b7b7b7;\n  border-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content.scroll-style::-webkit-scrollbar-thumb:hover {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content.scroll-style::-webkit-scrollbar-thumb:active {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content.scroll-style::-webkit-scrollbar-track {\n  -webkit-box-shadow: 0 0 0px #808080 inset;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content.scroll-style-border-radius::-webkit-scrollbar {\n  border-bottom-right-radius: 4px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h1,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h2,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h3,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h4,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h5,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h6 {\n  margin: 2px 0;\n  font-weight: 500;\n  font-size: 17px;\n  color: #2185d0;\n  cursor: pointer;\n  line-height: normal;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  padding: 0 12px;\n  border-bottom: none;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h1:hover,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h2:hover,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h3:hover,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h4:hover,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h5:hover,\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h6:hover {\n  color: #483d8b;\n  text-decoration-line: underline;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h2 {\n  padding-left: 27px;\n  font-size: 17px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h3 {\n  padding-left: 42px;\n  font-size: 17px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h4 {\n  padding-left: 58px;\n  font-size: 15px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h5 {\n  padding-left: 72px;\n  font-size: 15px;\n}\n.v-note-wrapper .v-note-panel .v-note-navigation-wrapper .v-note-navigation-content h6 {\n  padding-left: 87px;\n  font-size: 15px;\n}\n.v-note-wrapper .v-note-read-model {\n  position: relative;\n  display: none;\n  width: 100%;\n  height: 100%;\n  background: #fbfbfb;\n  padding: 30px 8% 50px 8%;\n  overflow-y: auto;\n  box-sizing: border-box;\n}\n.v-note-wrapper .v-note-read-model.scroll-style::-webkit-scrollbar {\n  width: 6px;\n  background-color: #e5e5e5;\n}\n.v-note-wrapper .v-note-read-model.scroll-style::-webkit-scrollbar-thumb {\n  background-color: #b7b7b7;\n  border-radius: 4px;\n}\n.v-note-wrapper .v-note-read-model.scroll-style::-webkit-scrollbar-thumb:hover {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-read-model.scroll-style::-webkit-scrollbar-thumb:active {\n  background-color: #a1a1a1;\n}\n.v-note-wrapper .v-note-read-model.scroll-style::-webkit-scrollbar-track {\n  -webkit-box-shadow: 0 0 0px #808080 inset;\n}\n.v-note-wrapper .v-note-read-model.scroll-style-border-radius::-webkit-scrollbar {\n  border-bottom-right-radius: 4px;\n}\n.v-note-wrapper .v-note-read-model.show {\n  display: block;\n}\n.v-note-wrapper.shadow {\n  border: none;\n}\n.v-note-help-wrapper {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  background: rgba(0,0,0,0.7);\n  z-index: 1600;\n  transition: all 0.1s linear 0s;\n}\n.v-note-help-wrapper.fade-enter-active,\n.v-note-help-wrapper.fade-leave-active {\n  opacity: 1;\n}\n.v-note-help-wrapper.fade-enter,\n.v-note-help-wrapper.fade-leave-active {\n  opacity: 0;\n}\n.v-note-help-wrapper .v-note-help-content {\n  position: relative;\n  width: 60%;\n  max-width: 800px;\n  margin: 30px auto;\n  height: 90%;\n  min-width: 320px;\n  transition: all 0.1s linear 0s;\n  z-index: 3;\n  border: 1px solid #f2f6fc;\n}\n.v-note-help-wrapper .v-note-help-content.shadow {\n  border: none;\n  box-shadow: 0 0px 5px rgba(0,0,0,0.157), 0 0px 5px rgba(0,0,0,0.227);\n}\n.v-note-help-wrapper .v-note-help-content i {\n  font-size: 28px;\n  position: absolute;\n  right: 15px;\n  top: 8px;\n  color: rgba(0,0,0,0.7);\n  cursor: pointer;\n}\n.v-note-help-wrapper .v-note-help-content i:hover {\n  color: #000;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show {\n  width: 100%;\n  height: 100%;\n  font-size: 18px;\n  background: #fbfbfb;\n  overflow-y: auto;\n  padding: 2% 6%;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show.scroll-style::-webkit-scrollbar {\n  width: 6px;\n  background-color: #e5e5e5;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show.scroll-style::-webkit-scrollbar-thumb {\n  background-color: #b7b7b7;\n  border-radius: 4px;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show.scroll-style::-webkit-scrollbar-thumb:hover {\n  background-color: #a1a1a1;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show.scroll-style::-webkit-scrollbar-thumb:active {\n  background-color: #a1a1a1;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show.scroll-style::-webkit-scrollbar-track {\n  -webkit-box-shadow: 0 0 0px #808080 inset;\n}\n.v-note-help-wrapper .v-note-help-content .v-note-help-show.scroll-style-border-radius::-webkit-scrollbar {\n  border-bottom-right-radius: 4px;\n}\n.v-note-img-wrapper {\n  position: fixed;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  background: rgba(0,0,0,0.7);\n  z-index: 1600;\n  transition: all 0.1s linear 0s;\n}\n.v-note-img-wrapper.fade-enter-active,\n.v-note-img-wrapper.fade-leave-active {\n  opacity: 1;\n}\n.v-note-img-wrapper.fade-enter,\n.v-note-img-wrapper.fade-leave-active {\n  opacity: 0;\n}\n.v-note-img-wrapper img {\n  flex: 0 0 auto;\n  z-index: 3;\n}\n.v-note-img-wrapper i {\n  font-size: 28px;\n  position: absolute;\n  right: 15px;\n  top: 8px;\n  color: rgba(255,255,255,0.7);\n  cursor: pointer;\n}\n.v-note-img-wrapper i:hover {\n  color: #fff;\n}\n","scrollbar()\r\n  &.scroll-style::-webkit-scrollbar\r\n    width 6px\r\n    background-color #e5e5e5\r\n  &.scroll-style::-webkit-scrollbar-thumb\r\n    background-color #b7b7b7\r\n    border-radius 4px\r\n  &.scroll-style::-webkit-scrollbar-thumb:hover\r\n    background-color #a1a1a1\r\n  &.scroll-style::-webkit-scrollbar-thumb:active\r\n    background-color #a1a1a1\r\n  &.scroll-style::-webkit-scrollbar-track\r\n    -webkit-box-shadow 0 0 0px gray inset\r\n  &.scroll-style-border-radius::-webkit-scrollbar\r\n    border-bottom-right-radius 4px"],"sourceRoot":""}]);

// exports


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(true);
// imports


// module
exports.push([module.i, "\n.auto-textarea-wrapper[data-v-7a63e4b3] {\n    height: 100%;\n}\n", "", {"version":3,"sources":["D:/work/songwang/test/mavonEditor/src/mavon-editor.vue?194c32ff"],"names":[],"mappings":";AAutBA;IACA,aAAA;CACA","file":"mavon-editor.vue","sourcesContent":["<template>\n    <div :class=\"[{ 'fullscreen': s_fullScreen, 'shadow': boxShadow }]\" class=\"v-note-wrapper markdown-body\" :style=\"{'box-shadow': boxShadow ? boxShadowStyle : ''}\">\n        <!--工具栏-->\n        <div class=\"v-note-op\" v-show=\"toolbarsFlag\" :style=\"{'background': toolbarsBackground}\">\n            <v-md-toolbar-left ref=\"toolbar_left\" :editable=\"editable\" :transition=\"transition\" :d_words=\"d_words\"\n                               @toolbar_left_click=\"toolbar_left_click\" @toolbar_left_addlink=\"toolbar_left_addlink\" :toolbars=\"toolbars\"\n                               @imgAdd=\"$imgAdd\" @imgDel=\"$imgDel\" @imgTouch=\"$imgTouch\" :image_filter=\"imageFilter\"\n                               :class=\"{'transition': transition}\">\n                <slot name=\"left-toolbar-before\" slot=\"left-toolbar-before\" />\n                <slot name=\"left-toolbar-after\" slot=\"left-toolbar-after\" />\n            </v-md-toolbar-left>\n            <v-md-toolbar-right ref=\"toolbar_right\" :d_words=\"d_words\" @toolbar_right_click=\"toolbar_right_click\"\n                                :toolbars=\"toolbars\"\n                                :s_subfield=\"s_subfield\"\n                                :s_preview_switch=\"s_preview_switch\" :s_fullScreen=\"s_fullScreen\"\n                                :s_html_code=\"s_html_code\"\n                                :s_navigation=\"s_navigation\"\n                                :class=\"{'transition': transition}\">\n                <slot name=\"right-toolbar-before\" slot=\"right-toolbar-before\" />\n                <slot name=\"right-toolbar-after\" slot=\"right-toolbar-after\" />\n            </v-md-toolbar-right>\n        </div>\n        <!--编辑展示区域-->\n        <div class=\"v-note-panel\">\n            <!--编辑区-->\n            <div ref=\"vNoteEdit\" @scroll=\"$v_edit_scroll\" class=\"v-note-edit divarea-wrapper\"\n                 :class=\"{'scroll-style': s_scrollStyle, 'scroll-style-border-radius': s_scrollStyle && !s_preview_switch && !s_html_code, 'single-edit': !s_preview_switch && !s_html_code, 'single-show': (!s_subfield && s_preview_switch) || (!s_subfield && s_html_code), 'transition': transition}\"\n                 @click=\"textAreaFocus\">\n                <div class=\"content-input-wrapper\" :style=\"{'background-color': editorBackground}\">\n                    <!-- 双栏 -->\n                    <v-autoTextarea ref=\"vNoteTextarea\" :placeholder=\"placeholder ? placeholder : d_words.start_editor\"\n                                    class=\"content-input\" :fontSize=\"fontSize\"\n                                    lineHeight=\"1.5\" v-model=\"d_value\" fullHeight\n                                    :style=\"{'background-color': editorBackground}\"></v-autoTextarea>\n                </div>\n            </div>\n            <!--展示区-->\n            <div :class=\"{'single-show': (!s_subfield && s_preview_switch) || (!s_subfield && s_html_code)}\"\n                 v-show=\"s_preview_switch || s_html_code\" class=\"v-note-show\">\n                <div ref=\"vShowContent\" v-html=\"d_render\" v-show=\"!s_html_code\"\n                     :class=\"{'scroll-style': s_scrollStyle, 'scroll-style-border-radius': s_scrollStyle}\" class=\"v-show-content\"\n                     :style=\"{'background-color': previewBackground}\">\n                </div>\n                <div v-show=\"s_html_code\" :class=\"{'scroll-style': s_scrollStyle, 'scroll-style-border-radius': s_scrollStyle}\" class=\"v-show-content-html\"\n                  :style=\"{'background-color': previewBackground}\">\n                    {{d_render}}\n                </div>\n            </div>\n\n            <!--标题导航-->\n            <transition name=\"slideTop\">\n                <div v-show=\"s_navigation\" class=\"v-note-navigation-wrapper\" :class=\"{'transition': transition}\">\n                    <div class=\"v-note-navigation-title\">\n                        {{d_words.navigation_title}}<i @click=\"toolbar_right_click('navigation')\"\n                                                       class=\"fa fa-mavon-times v-note-navigation-close\"\n                                                       aria-hidden=\"true\"></i>\n                    </div>\n                    <div ref=\"navigationContent\" class=\"v-note-navigation-content\" :class=\"{'scroll-style': s_scrollStyle}\">\n                    </div>\n                </div>\n            </transition>\n\n        </div>\n        <!--帮助文档-->\n        <transition name=\"fade\">\n            <div ref=\"help\">\n                <div @click.self=\"toolbar_right_click('help')\" class=\"v-note-help-wrapper\" v-if=\"s_help\">\n                    <div class=\"v-note-help-content markdown-body\" :class=\"{'shadow': boxShadow}\">\n                        <i @click.stop.prevent=\"toolbar_right_click('help')\" class=\"fa fa-mavon-times\"\n                           aria-hidden=\"true\"></i>\n                        <div class=\"scroll-style v-note-help-show\" v-html=\"d_help\"></div>\n                    </div>\n                </div>\n            </div>\n        </transition>\n        <!-- 预览图片 -->\n        <transition name=\"fade\">\n            <div @click=\"d_preview_imgsrc=null\" class=\"v-note-img-wrapper\" v-if=\"d_preview_imgsrc\">\n                <img :src=\"d_preview_imgsrc\" alt=\"none\">\n            </div>\n        </transition>\n        <!--阅读模式-->\n        <div :class=\"{'show': s_readmodel}\" class=\"v-note-read-model scroll-style\" ref=\"vReadModel\">\n            <div ref=\"vNoteReadContent\" class=\"v-note-read-content\" v-html=\"d_render\">\n            </div>\n        </div>\n    </div>\n</template>\n\n<script>\n// import tomarkdown from './lib/core/to-markdown.js'\nimport {autoTextarea} from 'auto-textarea'\nimport {keydownListen} from './lib/core/keydown-listen.js'\nimport hljsCss from './lib/core/hljs/lang.hljs.css.js'\nimport {\n    fullscreenchange,\n   /* windowResize, */\n    scrollLink,\n    insertTextAtCaret,\n    getNavigation,\n    insertTab,\n    unInsertTab,\n    insertOl,\n    insertUl,\n    insertEnter,\n    removeLine,\n    insertCodeBlock,\n    loadLink,\n    loadScript,\n    ImagePreviewListener\n} from './lib/core/extra-function.js'\nimport {stopEvent} from './lib/util.js'\nimport {toolbar_left_click, toolbar_left_addlink} from './lib/toolbar_left_click.js'\nimport {toolbar_right_click} from './lib/toolbar_right_click.js'\nimport {CONFIG} from './lib/config.js'\nimport markdown, {initMarkdown} from './lib/mixins/markdown.js'\nimport md_toolbar_left from './components/md-toolbar-left.vue'\nimport md_toolbar_right from './components/md-toolbar-right.vue'\nimport \"./lib/font/css/fontello.css\"\nimport './lib/css/md.css'\n\nexport default {\n    mixins: [markdown],\n    props: {\n        scrollStyle: {  // 是否渲染滚动条样式(webkit)\n            type: Boolean,\n            default: true\n        },\n        boxShadow: { // 是否添加阴影\n            type: Boolean,\n            default: true\n        },\n        transition: { // 是否开启动画过渡\n            type: Boolean,\n            default: true\n        },\n        autofocus: { // 是否自动获取焦点\n            type: Boolean,\n            default: true\n        },\n        fontSize: { // 字体大小\n            type: String,\n            default: '14px'\n        },\n        toolbarsBackground: { // 工具栏背景色\n            type: String,\n            default: '#ffffff'\n        },\n        editorBackground: { // TODO: 编辑栏背景色\n            type: String,\n            default: '#ffffff'\n        },\n        previewBackground: { // 预览栏背景色\n            type: String,\n            default: '#fbfbfb'\n        },\n        boxShadowStyle: { // 阴影样式\n            type: String,\n            default: '0 2px 12px 0 rgba(0, 0, 0, 0.1)'\n        },\n        help: {\n            type: String,\n            default: null\n        },\n        value: { // 初始 value\n            type: String,\n            default: ''\n        },\n        language: {  // 初始语言\n            type: String,\n            default: 'zh-CN'\n        },\n        subfield: {\n            type: Boolean,\n            default: true\n        },\n        navigation: {\n            type: Boolean,\n            default: false\n        },\n        defaultOpen: {\n            type: String,\n            default: null\n        },\n        editable: { // 是否开启编辑\n            type: Boolean,\n            default: true\n        },\n        toolbarsFlag: { // 是否开启工具栏\n            type: Boolean,\n            default: true\n        },\n        toolbars: { // 工具栏\n            type: Object,\n            default() {\n                return CONFIG.toolbars\n            }\n        },\n        html: {// Enable HTML tags in source\n            type: Boolean,\n            default: true\n        },\n        xssOptions: { // XSS 选项\n            type: [Object, Boolean],\n            default() {\n                return {}\n            }\n        },\n        codeStyle: { // <code></code> 样式\n            type: String,\n            default() {\n                return 'github';\n            }\n        },\n        placeholder: { // 编辑器默认内容\n            type: String,\n            default: null\n        },\n        ishljs: {\n            type: Boolean,\n            default: true\n        },\n        externalLink: {\n            type: [Object, Boolean],\n            default: true\n        },\n        imageFilter: {\n            type: Function,\n            default: null\n        },\n        imageClick: {\n            type: Function,\n            default: null\n        },\n        tabSize: {\n            type: Number,\n            default: 0\n        },\n        shortCut:{\n            type: Boolean,\n            default: true\n        }\n    },\n    data() {\n        return {\n            s_right_click_menu_show: false,\n            right_click_menu_top: 0,\n            right_click_menu_left: 0,\n            s_subfield: (() => {\n                return this.subfield;\n            })(),\n            s_autofocus: true,\n            // 标题导航\n            s_navigation: (() => {\n                return this.navigation;\n            })(),\n            s_scrollStyle: (() => {\n                return this.scrollStyle\n            })(),// props 是否渲染滚动条样式\n            d_value: '',// props 文本内容\n            d_render: '',// props 文本内容render\n            s_preview_switch: (() => {\n                let default_open_ = this.defaultOpen;\n                if (!default_open_) {\n                    default_open_ = this.subfield ? 'preview' : 'edit';\n                }\n                return default_open_ === 'preview' ? true : false;\n            })(), // props true 展示编辑 false展示预览\n            s_fullScreen: false,// 全屏编辑标志\n            s_help: false,// markdown帮助\n            s_html_code: false,// 分栏情况下查看html\n            d_help: null,\n            d_words: null,\n            edit_scroll_height: -1,\n            s_readmodel: false,\n            s_table_enter: false, // 回车事件是否在表格中执行\n            d_history: (() => {\n                let temp_array = []\n                temp_array.push(this.value)\n                return temp_array;\n            })(), // 编辑记录\n            d_history_index: 0, // 编辑记录索引\n            currentTimeout: '',\n            d_image_file: [],\n            d_preview_imgsrc: null, // 图片预览地址\n            s_external_link: {\n                markdown_css: function() {\n                    return 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.9.0/github-markdown.min.css';\n                },\n                hljs_js: function() {\n                    return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/highlight.min.js';\n                },\n                hljs_lang: function(lang) {\n                    return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/languages/' + lang + '.min.js';\n                },\n                hljs_css: function(css) {\n                    if (hljsCss[css]) {\n                        return 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/' + css + '.min.css';\n                    }\n                    return '';\n                },\n                katex_js: function() {\n                    return 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3/katex.min.js';\n                },\n                katex_css: function() {\n                    return 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3/katex.min.css';\n                }\n            },\n            p_external_link: {},\n            textarea_selectionEnd: 0,\n            textarea_selectionEnds: [0],\n            _xssHandler: null\n        };\n    },\n    created() {\n        var $vm = this;\n        // 初始化语言\n        this.initLanguage();\n        this.initExternalFuc();\n        this.$nextTick(() => {\n            // 初始化Textarea编辑开关\n            $vm.editableTextarea();\n        })\n    },\n    mounted() {\n        var $vm = this;\n        this.$el.addEventListener('paste', function (e) {\n            $vm.$paste(e);\n        })\n        this.$el.addEventListener('drop', function (e) {\n            $vm.$drag(e);\n        })\n        // 浏览器siz大小\n       /* windowResize(this); */\n        keydownListen(this);\n        // 图片预览事件监听\n        ImagePreviewListener(this);\n        // 设置默认焦点\n        if (this.autofocus) {\n            this.getTextareaDom().focus();\n        }\n        // fullscreen事件\n        fullscreenchange(this);\n        this.d_value = this.value || \"\";\n        // 将help添加到末尾\n        document.body.appendChild(this.$refs.help);\n        this.loadExternalLink('markdown_css', 'css');\n        this.loadExternalLink('katex_css', 'css')\n        this.loadExternalLink('katex_js', 'js', function() {\n            $vm.iRender(true);\n        })\n        this.loadExternalLink('hljs_js', 'js', function() {\n            $vm.iRender(true);\n        })\n\n        $vm.codeStyleChange($vm.codeStyle, true)\n    },\n    beforeDestroy() {\n        document.body.removeChild(this.$refs.help);\n    },\n    getMarkdownIt() {\n        let mdIt = this.mixins[0].data().markdownIt;\n        if (!mdIt) {\n            mdIt = initMarkdown();\n        }\n        return mdIt\n    },\n    methods: {\n        loadExternalLink(name, type, callback) {\n            if (typeof this.p_external_link[name] !== 'function') {\n                if (this.p_external_link[name] !== false) {\n                    console.error('external_link.' + name, 'is not a function, if you want to disabled this error log, set external_link.' + name, 'to function or false');\n                }\n                return;\n            }\n            var _obj = {\n                'css': loadLink,\n                'js': loadScript\n            };\n            if (_obj.hasOwnProperty(type)) {\n                _obj[type](this.p_external_link[name](), callback);\n            }\n        },\n        initExternalFuc() {\n            var $vm = this;\n            var _external_ = ['markdown_css', 'hljs_js', 'hljs_css', 'hljs_lang', 'katex_js', 'katex_css'];\n            var _type_ = typeof $vm.externalLink;\n            var _is_object = (_type_ === 'object');\n            var _is_boolean = (_type_ === 'boolean');\n            for (var i = 0; i < _external_.length; i++) {\n                if ((_is_boolean && !$vm.externalLink) || (_is_object && $vm.externalLink[_external_[i]] === false)) {\n                    $vm.p_external_link[_external_[i]] = false;\n                } else if (_is_object && typeof $vm.externalLink[_external_[i]] === 'function') {\n                    $vm.p_external_link[_external_[i]] = $vm.externalLink[_external_[i]];\n                } else {\n                    $vm.p_external_link[_external_[i]] = $vm.s_external_link[_external_[i]];\n                }\n            }\n        },\n        textAreaFocus() {\n            this.$refs.vNoteTextarea.$refs.vTextarea.focus();\n        },\n        $drag($e) {\n            var dataTransfer = $e.dataTransfer;\n            if (dataTransfer) {\n                var files = dataTransfer.files;\n                if (files.length > 0) {\n                    $e.preventDefault();\n                    this.$refs.toolbar_left.$imgFilesAdd(files);\n                }\n            }\n        },\n        $paste($e) {\n            var clipboardData = $e.clipboardData;\n            if (clipboardData) {\n                var items = clipboardData.items;\n                if (!items) return;\n                var types = clipboardData.types || [];\n                var item = null;\n                for (var i = 0; i < types.length; i++) {\n                    if (types[i] === 'Files') {\n                        item = items[i];\n                        break;\n                    }\n                }\n                if (item && item.kind === 'file') {\n                    // prevent filename being pasted parallel along\n                    // with the image pasting process\n                    stopEvent($e)\n                    var oFile = item.getAsFile();\n                    this.$refs.toolbar_left.$imgFilesAdd([oFile]);\n                }\n            }\n        },\n        $imgTouch(file) {\n            var $vm = this;\n            // TODO 跳转到图片位置\n        },\n        $imgDel(file) {\n            this.markdownIt.image_del(file[1]);\n            // 删除所有markdown中的图片\n            let fileReg = file[0]\n            let reg = new RegExp(`\\\\!\\\\[${file[1]._name}\\\\]\\\\(${fileReg}\\\\)`, \"g\")\n\n            this.d_value = this.d_value.replace(reg, '');\n            this.iRender();\n            this.$emit('imgDel', file);\n        },\n        $imgAdd(pos, $file, isinsert) {\n            if (isinsert === undefined) isinsert = true;\n            var $vm = this;\n            if (this.__rFilter == null) {\n                // this.__rFilter = /^(?:image\\/bmp|image\\/cis\\-cod|image\\/gif|image\\/ief|image\\/jpeg|image\\/jpeg|image\\/jpeg|image\\/pipeg|image\\/png|image\\/svg\\+xml|image\\/tiff|image\\/x\\-cmu\\-raster|image\\/x\\-cmx|image\\/x\\-icon|image\\/x\\-portable\\-anymap|image\\/x\\-portable\\-bitmap|image\\/x\\-portable\\-graymap|image\\/x\\-portable\\-pixmap|image\\/x\\-rgb|image\\/x\\-xbitmap|image\\/x\\-xpixmap|image\\/x\\-xwindowdump)$/i;\n                this.__rFilter = /^image\\//i;\n            }\n            this.__oFReader = new FileReader();\n            this.__oFReader.onload = function (oFREvent) {\n                $vm.markdownIt.image_add(pos, oFREvent.target.result);\n                $file.miniurl = oFREvent.target.result;\n                if (isinsert === true) {\n                    // 去除特殊字符\n                    $file._name = $file.name.replace(/[\\[\\]\\(\\)\\+\\{\\}&\\|\\\\\\*^%$#@\\-]/g, '');\n\n                    $vm.insertText($vm.getTextareaDom(),\n                        {\n                            prefix: '![' + $file._name + '](' + pos + ')',\n                            subfix: '',\n                            str: ''\n                        });\n                    $vm.$nextTick(function () {\n                        $vm.$emit('imgAdd', pos, $file);\n                    })\n                }\n            }\n            if ($file) {\n                var oFile = $file;\n                if (this.__rFilter.test(oFile.type)) {\n                    this.__oFReader.readAsDataURL(oFile);\n                }\n            }\n        },\n        $imgUpdateByUrl(pos, url) {\n            var $vm = this;\n            this.markdownIt.image_add(pos, url);\n            this.$nextTick(function () {\n                $vm.d_render = this.markdownIt.render(this.d_value);\n            })\n        },\n        $imgAddByUrl(pos, url) {\n            if (this.$refs.toolbar_left.$imgAddByUrl(pos, url)) {\n                this.$imgUpdateByUrl(pos, url);\n                return true;\n            }\n            return false;\n        },\n        $img2Url(fileIndex, url) {\n            // x.replace(/(\\[[^\\[]*?\\](?=\\())\\(\\s*(\\.\\/2)\\s*\\)/g, \"$1(http://path/to/png.png)\")\n            var reg_str = \"/(!\\\\[\\[^\\\\[\\]*?\\\\]\\(?=\\\\(\\)\\)\\\\(\\\\s*\\(\" + fileIndex + \"\\)\\\\s*\\\\)/g\"\n            var reg = eval(reg_str);\n            this.d_value = this.d_value.replace(reg, \"$1(\" + url + \")\")\n            this.$refs.toolbar_left.$changeUrl(fileIndex, url)\n            this.iRender()\n        },\n        $imglst2Url(imglst) {\n            if (imglst instanceof Array) {\n                for (var i = 0; i < imglst.length; i++) {\n                    this.$img2Url(imglst[i][0], imglst[i][1]);\n                }\n            }\n        },\n        toolbar_left_click(_type) {\n            toolbar_left_click(_type, this);\n        },\n        toolbar_left_addlink(_type, text, link) {\n            toolbar_left_addlink(_type, text, link, this);\n        },\n        toolbar_right_click(_type) {\n            toolbar_right_click(_type, this);\n        },\n        getNavigation($vm, full) {\n            return getNavigation($vm, full);\n        },\n        // @event\n        // 修改数据触发 （val ， val_render）\n        change(val, render) {\n            this.$emit('change', val, render)\n        },\n        // 切换全屏触发 （status , val）\n        fullscreen(status, val) {\n            this.$emit('fullScreen', status, val)\n        },\n        // 打开阅读模式触发（status , val）\n        readmodel(status, val) {\n            this.$emit('readModel', status, val)\n        },\n        // 切换阅读编辑触发 （status , val）\n        previewtoggle(status, val) {\n            this.$emit('previewToggle', status, val)\n        },\n        // 切换分栏触发 （status , val）\n        subfieldtoggle(status, val) {\n            this.$emit('subfieldToggle', status, val)\n        },\n        // 切换htmlcode触发 （status , val）\n        htmlcode(status, val) {\n            this.$emit('htmlCode', status, val)\n        },\n        // 打开 , 关闭 help触发 （status , val）\n        helptoggle(status, val) {\n            this.$emit('helpToggle', status, val)\n        },\n        // 监听ctrl + s\n        save(val, render) {\n            this.$emit('save', val, render)\n        },\n        // 导航栏切换\n        navigationtoggle(status, val) {\n            this.$emit('navigationToggle', status, val)\n        },\n        $toolbar_right_read_change_status() {\n            this.s_readmodel = !this.s_readmodel\n            if (this.readmodel) {\n                this.readmodel(this.s_readmodel, this.d_value)\n            }\n            if (this.s_readmodel && this.toolbars.navigation) {\n                this.getNavigation(this, true)\n            }\n        },\n        // ---------------------------------------\n        // 滚动条联动\n        $v_edit_scroll($event) {\n            scrollLink($event, this);\n        },\n        // 获取textarea dom节点\n        getTextareaDom() {\n            return this.$refs.vNoteTextarea.$refs.vTextarea;\n        },\n        // 工具栏插入内容\n        insertText(obj, {prefix, subfix, str, type}) {\n            // if (this.s_preview_switch) {\n\n            insertTextAtCaret(obj, {prefix, subfix, str, type}, this);\n        },\n        insertTab() {\n            insertTab(this, this.tabSize)\n        },\n        insertOl() {\n            insertOl(this)\n        },\n        removeLine() {\n            removeLine(this)\n        },\n        insertUl() {\n            insertUl(this)\n        },\n        unInsertTab() {\n            unInsertTab(this, this.tabSize)\n        },\n        insertCodeBlock() {\n            insertCodeBlock(this);\n        },\n        insertEnter(event) {\n            insertEnter(this, event)\n        },\n        saveHistory() {\n            this.d_history.splice(this.d_history_index + 1, this.d_history.length)\n            this.d_history.push(this.d_value)\n            this.textarea_selectionEnds.splice(this.d_history_index + 1, this.textarea_selectionEnds.length)\n            this.textarea_selectionEnds.push(this.textarea_selectionEnd)\n            this.d_history_index = this.d_history.length - 1\n        },\n        saveSelectionEndsHistory() {\n            const textarea = this.$refs.vNoteTextarea && this.$refs.vNoteTextarea.$el.querySelector('textarea');\n            this.textarea_selectionEnd = textarea ? textarea.selectionEnd : this.textarea_selectionEnd;\n        },\n        initLanguage() {\n            let lang = CONFIG.langList.indexOf(this.language) >= 0 ? this.language : 'zh-CN';\n            var $vm = this;\n            $vm.$render(CONFIG[`help_${lang}`], function(res) {\n                $vm.d_help = res;\n            })\n            this.d_words = CONFIG[`words_${lang}`];\n        },\n        // 编辑开关\n        editableTextarea() {\n            let text_dom = this.$refs.vNoteTextarea.$refs.vTextarea;\n            if (this.editable) {\n                text_dom.removeAttribute('disabled');\n            } else {\n                text_dom.setAttribute('disabled', 'disabled');\n            }\n        },\n        codeStyleChange(val, isInit) {\n            isInit = isInit ? isInit : false;\n            if (typeof this.p_external_link.hljs_css !== 'function') {\n                if (this.p_external_link.hljs_css !== false)\n                { console.error('external_link.hljs_css is not a function, if you want to disabled this error log, set external_link.hljs_css to function or false'); }\n                return;\n            }\n            var url = this.p_external_link.hljs_css(val);\n            if (url.length === 0 && isInit) {\n                console.warn('hljs color scheme', val, 'do not exist, loading default github');\n                url = this.p_external_link.hljs_css('github')\n            }\n            if (url.length > 0) {\n                loadLink(url,null,\"md-code-style\");\n            } else {\n                console.warn('hljs color scheme', val, 'do not exist, hljs color scheme will not change');\n            }\n        },\n        iRender(toggleChange) {\n            var $vm = this;\n            this.$render($vm.d_value, function(res) {\n                $vm.d_render = res;\n                // change回调  toggleChange == false 时候触发change回调\n                if (!toggleChange)\n                {\n                    if ($vm.change) $vm.change($vm.d_value, $vm.d_render);\n                }\n                // 改变标题导航\n                if ($vm.s_navigation) getNavigation($vm, false);\n                // v-model 语法糖\n                $vm.$emit('input', $vm.d_value)\n                // 塞入编辑记录数组\n                if ($vm.d_value === $vm.d_history[$vm.d_history_index]) return\n                window.clearTimeout($vm.currentTimeout)\n                $vm.currentTimeout = setTimeout(() => {\n                    $vm.saveHistory();\n                }, 500);\n            })\n        },\n        // 清空上一步 下一步缓存\n        $emptyHistory() {\n            this.d_history = [this.d_value] // 编辑记录\n            this.d_history_index = 0 // 编辑记录索引\n        }\n    },\n    watch: {\n        d_value: function (val, oldVal) {\n            this.saveSelectionEndsHistory();\n            this.iRender();\n        },\n        value: function (val, oldVal) {\n            if (val !== this.d_value) {\n                this.d_value = val\n            }\n        },\n        subfield: function (val, oldVal) {\n            this.s_subfield = val\n        },\n        d_history_index() {\n            if (this.d_history_index > 20) {\n                this.d_history.shift()\n                this.d_history_index = this.d_history_index - 1\n            }\n            this.d_value = this.d_history[this.d_history_index]\n        },\n        language: function (val) {\n            this.initLanguage();\n        },\n        editable: function () {\n            this.editableTextarea();\n        },\n        defaultOpen: function (val) {\n            let default_open_ = val;\n            if (!default_open_) {\n                default_open_ = this.subfield ? 'preview' : 'edit';\n            }\n            this.s_preview_switch = default_open_ === 'preview' ? true : false;\n            return this.s_preview_switch;\n        },\n        codeStyle: function (val) {\n            this.codeStyleChange(val)\n        }\n    },\n    components: {\n        'v-autoTextarea': autoTextarea,\n        'v-md-toolbar-left': md_toolbar_left,\n        'v-md-toolbar-right': md_toolbar_right\n    }\n};\n</script>\n<style lang=\"stylus\" rel=\"stylesheet/stylus\">\n    @import \"lib/css/scroll.styl\"\n    @import \"lib/css/mavon-editor.styl\"\n</style>\n<style lang=\"css\" scoped>\n    .auto-textarea-wrapper {\n        height: 100%;\n    }\n</style>\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(true);
// imports


// module
exports.push([module.i, "\n.navigate {\n  text-align: center;\n  font-size: 18px;\n  color: blue;\n}\n.navigate span {\n  margin-right: 5px;\n}\n.navigate span:hover {\n  cursor: pointer;\n  font-weight: bolder;\n}\n", "", {"version":3,"sources":["D:/work/songwang/test/mavonEditor/src/dev/demo.vue?21c208ba"],"names":[],"mappings":";AA+BA;EACA,mBAAA;EACA,gBAAA;EACA,YAAA;CACA;AAEA;EACA,kBAAA;CACA;AAEA;EACA,gBAAA;EACA,oBAAA;CACA","file":"demo.vue","sourcesContent":["<template>\n  <div>\n    <div class=\"navigate\">\n      <span @click=\"viewIndex = 1\">Full demo</span>\n      <span @click=\"viewIndex = 2\">Simple demo</span>\n    </div>\n    <div>\n      <App v-if=\"viewIndex == 1\"></App>\n      <Editor v-else-if=\"viewIndex == 2\"></Editor>\n    </div>\n  </div>\n</template>\n\n<script>\nimport app from './app.vue';\nimport editor from './editor.vue';\n\nexport default {\n  name: 'demo',\n  components: {\n    App: app,\n    Editor: editor\n  },\n  data() {\n    return {\n      viewIndex: 1\n    };\n  }\n};\n</script>\n<style>\n.navigate {\n  text-align: center;\n  font-size: 18px;\n  color: blue;\n}\n\n.navigate span {\n  margin-right: 5px;\n}\n\n.navigate span:hover {\n  cursor: pointer;\n  font-weight: bolder;\n}\n</style>\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(true);
// imports


// module
exports.push([module.i, "\nbody {\n  margin: 0;\n  padding: 0;\n  padding-bottom: 50px;\n}\n.switch-code-style {\n  display: inline;\n  margin-left: 8px;\n}\n.page-lang {\n  position: absolute;\n  top: 15px;\n  right: 2%;\n}\n.page-header {\n  box-sizing: border-box;\n  padding: 90px 15px;\n  width: 100%;\n  height: 380px;\n  color: #fff;\n  text-align: center;\n  background-color: #159957;\n  background-image: linear-gradient(120deg, #155799, #159957);\n}\n@media only screen and (max-width: 958px) {\n.page-header {\n    height: 300px;\n    padding: 60px 15px;\n}\n}\n@media only screen and (max-width: 768px) {\n.page-header {\n    height: 370px;\n    padding: 50px 15px;\n}\n}\n.page-header .project-name {\n  margin-top: 0;\n  margin-bottom: 0.1rem;\n  font-size: 2.25rem;\n}\n@media only screen and (max-width: 768px) {\n.page-header .project-name {\n    font-size: 25px;\n}\n}\n.page-header .project-tagline {\n  margin-bottom: 2rem;\n  font-weight: normal;\n  opacity: 0.7;\n}\n@media only screen and (max-width: 768px) {\n.page-header .project-tagline {\n    font-size: 16px;\n}\n}\n.page-header .btn {\n  padding: 0.6rem 0.9rem;\n  font-size: 0.9rem;\n  display: inline-block;\n  margin-bottom: 1rem;\n  color: rgba(255,255,255,0.7);\n  background-color: rgba(255,255,255,0.08);\n  border-color: rgba(255,255,255,0.2);\n  border-style: solid;\n  border-width: 1px;\n  border-radius: 0.3rem;\n  -webkit-transition: color 0.2s, background-color 0.2s, border-color 0.2s;\n  transition: color 0.2s, background-color 0.2s, border-color 0.2s;\n  text-decoration: none;\n  margin-left: 20px;\n  box-sizing: border-box;\n}\n.page-header .btn:hover {\n  color: rgba(255,255,255,0.8);\n  text-decoration: none;\n  background-color: rgba(255,255,255,0.2);\n  border-color: rgba(255,255,255,0.3);\n}\n@media only screen and (max-width: 768px) {\n.page-header .btn {\n    display: block;\n    width: 90%;\n    padding: 0.75rem;\n    font-size: 0.9rem;\n    margin-left: 5%;\n}\n}\n.item {\n  width: 75%;\n  margin-left: 12.5%;\n}\n@media only screen and (max-width: 1100px) {\n.item {\n    width: 85%;\n    margin-left: 7.5%;\n}\n}\n@media only screen and (max-width: 768px) {\n.item {\n    width: 92%;\n    margin-left: 4%;\n}\n}\n.item .item-header {\n  margin-top: 3.5rem;\n  margin-bottom: 2rem;\n  font-weight: normal;\n  color: #159957;\n}\n@media only screen and (max-width: 768px) {\n.item .item-header {\n    margin-top: 2rem;\n    margin-bottom: 1rem;\n}\n}\n.item .item-button {\n  margin-bottom: 4rem;\n}\n.item .item-editor {\n  width: 100%;\n  height: 700px;\n}\n@media only screen and (max-width: 1600px) {\n.item .item-editor {\n    height: 550px;\n}\n}\n", "", {"version":3,"sources":["D:/work/songwang/test/mavonEditor/src/dev/src/dev/app.vue","D:/work/songwang/test/mavonEditor/src/dev/app.vue"],"names":[],"mappings":";AA6RA;EACI,UAAA;EACA,WAAA;EACA,qBAAA;CC5RH;AD6RD;EACI,gBAAA;EACA,iBAAA;CC3RH;AD4RD;EACI,mBAAA;EACA,UAAA;EACA,UAAA;CC1RH;AD2RD;EACI,uBAAA;EACA,mBAAA;EACA,YAAA;EACA,cAAA;EACA,YAAA;EACA,mBAAA;EACA,0BAAA;EACA,4DAAA;CCzRH;AD0R0C;AAAA;IACnC,cAAA;IACA,mBAAA;CCvRL;CACF;ADuR0C;AAAA;IACnC,cAAA;IACA,mBAAA;CCpRL;CACF;ADoRG;EACI,cAAA;EACA,sBAAA;EACA,mBAAA;CClRP;ADmR8C;AAAA;IACnC,gBAAA;CChRT;CACF;ADgRG;EACI,oBAAA;EACA,oBAAA;EACA,aAAA;CC9QP;AD+Q8C;AAAA;IACnC,gBAAA;CC5QT;CACF;AD4QG;EACI,uBAAA;EACA,kBAAA;EACA,sBAAA;EACA,oBAAA;EACA,6BAAA;EACA,yCAAA;EACA,oCAAA;EACA,oBAAA;EACA,kBAAA;EACA,sBAAA;EACA,yEAAA;EAAA,iEAAA;EACA,sBAAA;EACA,kBAAA;EACA,uBAAA;CC1QP;AD2QO;EACI,6BAAA;EACA,sBAAA;EACA,wCAAA;EACA,oCAAA;CCzQX;AD0Q8C;AAAA;IACnC,eAAA;IACA,WAAA;IACA,iBAAA;IACA,kBAAA;IACA,gBAAA;CCvQT;CACF;ADuQD;EACI,WAAA;EACA,mBAAA;CCrQH;ADsQ2C;AAAA;IACpC,WAAA;IACA,kBAAA;CCnQL;CACF;ADmQ0C;AAAA;IACnC,WAAA;IACA,gBAAA;CChQL;CACF;ADgQG;EACI,mBAAA;EACA,oBAAA;EACA,oBAAA;EACA,eAAA;CC9PP;AD+P8C;AAAA;IACnC,iBAAA;IACA,oBAAA;CC5PT;CACF;AD4PG;EACI,oBAAA;CC1PP;AD2PG;EACI,YAAA;EACA,cAAA;CCzPP;AD0P+C;AAAA;IACpC,cAAA;CCvPT;CACF","file":"app.vue","sourcesContent":["\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nbody\n    margin 0\n    padding 0\n    padding-bottom 50px\n.switch-code-style\n    display inline\n    margin-left 8px\n.page-lang\n    position absolute\n    top 15px\n    right 2%\n.page-header\n    box-sizing border-box\n    padding 90px 15px\n    width 100%\n    height 380px\n    color #fff\n    text-align center\n    background-color #159957\n    background-image linear-gradient(120deg, #155799, #159957)\n    @media only screen and (max-width 958px)\n        height 300px\n        padding 60px 15px\n    @media only screen and (max-width 768px)\n        height 370px\n        padding 50px 15px\n    .project-name\n        margin-top 0\n        margin-bottom 0.1rem\n        font-size 2.25rem\n        @media only screen and (max-width 768px)\n            font-size 25px\n    .project-tagline\n        margin-bottom 2rem\n        font-weight normal\n        opacity 0.7\n        @media only screen and (max-width 768px)\n            font-size 16px\n    .btn\n        padding: 0.6rem 0.9rem\n        font-size: 0.9rem\n        display: inline-block\n        margin-bottom: 1rem\n        color: rgba(255, 255, 255, 0.7)\n        background-color: rgba(255, 255, 255, 0.08)\n        border-color: rgba(255, 255, 255, 0.2)\n        border-style: solid\n        border-width: 1px\n        border-radius: 0.3rem\n        transition: color 0.2s, background-color 0.2s, border-color 0.2s\n        text-decoration: none\n        margin-left 20px\n        box-sizing border-box\n        &:hover\n            color: rgba(255, 255, 255, 0.8)\n            text-decoration: none\n            background-color: rgba(255, 255, 255, 0.2)\n            border-color: rgba(255, 255, 255, 0.3)\n        @media only screen and (max-width 768px)\n            display: block\n            width: 90%\n            padding: 0.75rem\n            font-size: 0.9rem\n            margin-left 5%\n.item\n    width 75%\n    margin-left 12.5%\n    @media only screen and (max-width 1100px)\n        width 85%\n        margin-left 7.5%\n    @media only screen and (max-width 768px)\n        width 92%\n        margin-left 4%\n    .item-header\n        margin-top: 3.5rem\n        margin-bottom: 2rem\n        font-weight: normal\n        color: #159957\n        @media only screen and (max-width 768px)\n            margin-top: 2rem\n            margin-bottom: 1rem\n    .item-button\n        margin-bottom: 4rem\n    .item-editor\n        width 100%\n        height 700px\n        @media only screen and (max-width 1600px)\n            height 550px\n","body {\n  margin: 0;\n  padding: 0;\n  padding-bottom: 50px;\n}\n.switch-code-style {\n  display: inline;\n  margin-left: 8px;\n}\n.page-lang {\n  position: absolute;\n  top: 15px;\n  right: 2%;\n}\n.page-header {\n  box-sizing: border-box;\n  padding: 90px 15px;\n  width: 100%;\n  height: 380px;\n  color: #fff;\n  text-align: center;\n  background-color: #159957;\n  background-image: linear-gradient(120deg, #155799, #159957);\n}\n@media only screen and (max-width: 958px) {\n  .page-header {\n    height: 300px;\n    padding: 60px 15px;\n  }\n}\n@media only screen and (max-width: 768px) {\n  .page-header {\n    height: 370px;\n    padding: 50px 15px;\n  }\n}\n.page-header .project-name {\n  margin-top: 0;\n  margin-bottom: 0.1rem;\n  font-size: 2.25rem;\n}\n@media only screen and (max-width: 768px) {\n  .page-header .project-name {\n    font-size: 25px;\n  }\n}\n.page-header .project-tagline {\n  margin-bottom: 2rem;\n  font-weight: normal;\n  opacity: 0.7;\n}\n@media only screen and (max-width: 768px) {\n  .page-header .project-tagline {\n    font-size: 16px;\n  }\n}\n.page-header .btn {\n  padding: 0.6rem 0.9rem;\n  font-size: 0.9rem;\n  display: inline-block;\n  margin-bottom: 1rem;\n  color: rgba(255,255,255,0.7);\n  background-color: rgba(255,255,255,0.08);\n  border-color: rgba(255,255,255,0.2);\n  border-style: solid;\n  border-width: 1px;\n  border-radius: 0.3rem;\n  transition: color 0.2s, background-color 0.2s, border-color 0.2s;\n  text-decoration: none;\n  margin-left: 20px;\n  box-sizing: border-box;\n}\n.page-header .btn:hover {\n  color: rgba(255,255,255,0.8);\n  text-decoration: none;\n  background-color: rgba(255,255,255,0.2);\n  border-color: rgba(255,255,255,0.3);\n}\n@media only screen and (max-width: 768px) {\n  .page-header .btn {\n    display: block;\n    width: 90%;\n    padding: 0.75rem;\n    font-size: 0.9rem;\n    margin-left: 5%;\n  }\n}\n.item {\n  width: 75%;\n  margin-left: 12.5%;\n}\n@media only screen and (max-width: 1100px) {\n  .item {\n    width: 85%;\n    margin-left: 7.5%;\n  }\n}\n@media only screen and (max-width: 768px) {\n  .item {\n    width: 92%;\n    margin-left: 4%;\n  }\n}\n.item .item-header {\n  margin-top: 3.5rem;\n  margin-bottom: 2rem;\n  font-weight: normal;\n  color: #159957;\n}\n@media only screen and (max-width: 768px) {\n  .item .item-header {\n    margin-top: 2rem;\n    margin-bottom: 1rem;\n  }\n}\n.item .item-button {\n  margin-bottom: 4rem;\n}\n.item .item-editor {\n  width: 100%;\n  height: 700px;\n}\n@media only screen and (max-width: 1600px) {\n  .item .item-editor {\n    height: 550px;\n  }\n}\n"],"sourceRoot":""}]);

// exports


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * cssfilter
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var DEFAULT = __webpack_require__(52);
var parseStyle = __webpack_require__(122);
var _ = __webpack_require__(53);


/**
 * 返回值是否为空
 *
 * @param {Object} obj
 * @return {Boolean}
 */
function isNull (obj) {
  return (obj === undefined || obj === null);
}

/**
 * 浅拷贝对象
 *
 * @param {Object} obj
 * @return {Object}
 */
function shallowCopyObject (obj) {
  var ret = {};
  for (var i in obj) {
    ret[i] = obj[i];
  }
  return ret;
}

/**
 * 创建CSS过滤器
 *
 * @param {Object} options
 *   - {Object} whiteList
 *   - {Function} onAttr
 *   - {Function} onIgnoreAttr
 *   - {Function} safeAttrValue
 */
function FilterCSS (options) {
  options = shallowCopyObject(options || {});
  options.whiteList = options.whiteList || DEFAULT.whiteList;
  options.onAttr = options.onAttr || DEFAULT.onAttr;
  options.onIgnoreAttr = options.onIgnoreAttr || DEFAULT.onIgnoreAttr;
  options.safeAttrValue = options.safeAttrValue || DEFAULT.safeAttrValue;
  this.options = options;
}

FilterCSS.prototype.process = function (css) {
  // 兼容各种奇葩输入
  css = css || '';
  css = css.toString();
  if (!css) return '';

  var me = this;
  var options = me.options;
  var whiteList = options.whiteList;
  var onAttr = options.onAttr;
  var onIgnoreAttr = options.onIgnoreAttr;
  var safeAttrValue = options.safeAttrValue;

  var retCSS = parseStyle(css, function (sourcePosition, position, name, value, source) {

    var check = whiteList[name];
    var isWhite = false;
    if (check === true) isWhite = check;
    else if (typeof check === 'function') isWhite = check(value);
    else if (check instanceof RegExp) isWhite = check.test(value);
    if (isWhite !== true) isWhite = false;

    // 如果过滤后 value 为空则直接忽略
    value = safeAttrValue(name, value);
    if (!value) return;

    var opts = {
      position: position,
      sourcePosition: sourcePosition,
      source: source,
      isWhite: isWhite
    };

    if (isWhite) {

      var ret = onAttr(name, value, opts);
      if (isNull(ret)) {
        return name + ':' + value;
      } else {
        return ret;
      }

    } else {

      var ret = onIgnoreAttr(name, value, opts);
      if (!isNull(ret)) {
        return ret;
      }

    }
  });

  return retCSS;
};


module.exports = FilterCSS;


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * cssfilter
 *
 * @author 老雷<leizongmin@gmail.com>
 */

var _ = __webpack_require__(53);


/**
 * 解析style
 *
 * @param {String} css
 * @param {Function} onAttr 处理属性的函数
 *   参数格式： function (sourcePosition, position, name, value, source)
 * @return {String}
 */
function parseStyle (css, onAttr) {
  css = _.trimRight(css);
  if (css[css.length - 1] !== ';') css += ';';
  var cssLength = css.length;
  var isParenthesisOpen = false;
  var lastPos = 0;
  var i = 0;
  var retCSS = '';

  function addNewAttr () {
    // 如果没有正常的闭合圆括号，则直接忽略当前属性
    if (!isParenthesisOpen) {
      var source = _.trim(css.slice(lastPos, i));
      var j = source.indexOf(':');
      if (j !== -1) {
        var name = _.trim(source.slice(0, j));
        var value = _.trim(source.slice(j + 1));
        // 必须有属性名称
        if (name) {
          var ret = onAttr(lastPos, retCSS.length, name, value, source);
          if (ret) retCSS += ret + '; ';
        }
      }
    }
    lastPos = i + 1;
  }

  for (; i < cssLength; i++) {
    var c = css[i];
    if (c === '/' && css[i + 1] === '*') {
      // 备注开始
      var j = css.indexOf('*/', i + 2);
      // 如果没有正常的备注结束，则后面的部分全部跳过
      if (j === -1) break;
      // 直接将当前位置调到备注结尾，并且初始化状态
      i = j + 1;
      lastPos = i + 1;
      isParenthesisOpen = false;
    } else if (c === '(') {
      isParenthesisOpen = true;
    } else if (c === ')') {
      isParenthesisOpen = false;
    } else if (c === ';') {
      if (isParenthesisOpen) {
        // 在圆括号里面，忽略
      } else {
        addNewAttr();
      }
    } else if (c === '\n') {
      addNewAttr();
    }
  }

  return _.trim(retCSS);
}

module.exports = parseStyle;


/***/ }),
/* 123 */
/***/ (function(module, exports) {

module.exports = {"Aacute":"Á","aacute":"á","Abreve":"Ă","abreve":"ă","ac":"∾","acd":"∿","acE":"∾̳","Acirc":"Â","acirc":"â","acute":"´","Acy":"А","acy":"а","AElig":"Æ","aelig":"æ","af":"⁡","Afr":"𝔄","afr":"𝔞","Agrave":"À","agrave":"à","alefsym":"ℵ","aleph":"ℵ","Alpha":"Α","alpha":"α","Amacr":"Ā","amacr":"ā","amalg":"⨿","amp":"&","AMP":"&","andand":"⩕","And":"⩓","and":"∧","andd":"⩜","andslope":"⩘","andv":"⩚","ang":"∠","ange":"⦤","angle":"∠","angmsdaa":"⦨","angmsdab":"⦩","angmsdac":"⦪","angmsdad":"⦫","angmsdae":"⦬","angmsdaf":"⦭","angmsdag":"⦮","angmsdah":"⦯","angmsd":"∡","angrt":"∟","angrtvb":"⊾","angrtvbd":"⦝","angsph":"∢","angst":"Å","angzarr":"⍼","Aogon":"Ą","aogon":"ą","Aopf":"𝔸","aopf":"𝕒","apacir":"⩯","ap":"≈","apE":"⩰","ape":"≊","apid":"≋","apos":"'","ApplyFunction":"⁡","approx":"≈","approxeq":"≊","Aring":"Å","aring":"å","Ascr":"𝒜","ascr":"𝒶","Assign":"≔","ast":"*","asymp":"≈","asympeq":"≍","Atilde":"Ã","atilde":"ã","Auml":"Ä","auml":"ä","awconint":"∳","awint":"⨑","backcong":"≌","backepsilon":"϶","backprime":"‵","backsim":"∽","backsimeq":"⋍","Backslash":"∖","Barv":"⫧","barvee":"⊽","barwed":"⌅","Barwed":"⌆","barwedge":"⌅","bbrk":"⎵","bbrktbrk":"⎶","bcong":"≌","Bcy":"Б","bcy":"б","bdquo":"„","becaus":"∵","because":"∵","Because":"∵","bemptyv":"⦰","bepsi":"϶","bernou":"ℬ","Bernoullis":"ℬ","Beta":"Β","beta":"β","beth":"ℶ","between":"≬","Bfr":"𝔅","bfr":"𝔟","bigcap":"⋂","bigcirc":"◯","bigcup":"⋃","bigodot":"⨀","bigoplus":"⨁","bigotimes":"⨂","bigsqcup":"⨆","bigstar":"★","bigtriangledown":"▽","bigtriangleup":"△","biguplus":"⨄","bigvee":"⋁","bigwedge":"⋀","bkarow":"⤍","blacklozenge":"⧫","blacksquare":"▪","blacktriangle":"▴","blacktriangledown":"▾","blacktriangleleft":"◂","blacktriangleright":"▸","blank":"␣","blk12":"▒","blk14":"░","blk34":"▓","block":"█","bne":"=⃥","bnequiv":"≡⃥","bNot":"⫭","bnot":"⌐","Bopf":"𝔹","bopf":"𝕓","bot":"⊥","bottom":"⊥","bowtie":"⋈","boxbox":"⧉","boxdl":"┐","boxdL":"╕","boxDl":"╖","boxDL":"╗","boxdr":"┌","boxdR":"╒","boxDr":"╓","boxDR":"╔","boxh":"─","boxH":"═","boxhd":"┬","boxHd":"╤","boxhD":"╥","boxHD":"╦","boxhu":"┴","boxHu":"╧","boxhU":"╨","boxHU":"╩","boxminus":"⊟","boxplus":"⊞","boxtimes":"⊠","boxul":"┘","boxuL":"╛","boxUl":"╜","boxUL":"╝","boxur":"└","boxuR":"╘","boxUr":"╙","boxUR":"╚","boxv":"│","boxV":"║","boxvh":"┼","boxvH":"╪","boxVh":"╫","boxVH":"╬","boxvl":"┤","boxvL":"╡","boxVl":"╢","boxVL":"╣","boxvr":"├","boxvR":"╞","boxVr":"╟","boxVR":"╠","bprime":"‵","breve":"˘","Breve":"˘","brvbar":"¦","bscr":"𝒷","Bscr":"ℬ","bsemi":"⁏","bsim":"∽","bsime":"⋍","bsolb":"⧅","bsol":"\\","bsolhsub":"⟈","bull":"•","bullet":"•","bump":"≎","bumpE":"⪮","bumpe":"≏","Bumpeq":"≎","bumpeq":"≏","Cacute":"Ć","cacute":"ć","capand":"⩄","capbrcup":"⩉","capcap":"⩋","cap":"∩","Cap":"⋒","capcup":"⩇","capdot":"⩀","CapitalDifferentialD":"ⅅ","caps":"∩︀","caret":"⁁","caron":"ˇ","Cayleys":"ℭ","ccaps":"⩍","Ccaron":"Č","ccaron":"č","Ccedil":"Ç","ccedil":"ç","Ccirc":"Ĉ","ccirc":"ĉ","Cconint":"∰","ccups":"⩌","ccupssm":"⩐","Cdot":"Ċ","cdot":"ċ","cedil":"¸","Cedilla":"¸","cemptyv":"⦲","cent":"¢","centerdot":"·","CenterDot":"·","cfr":"𝔠","Cfr":"ℭ","CHcy":"Ч","chcy":"ч","check":"✓","checkmark":"✓","Chi":"Χ","chi":"χ","circ":"ˆ","circeq":"≗","circlearrowleft":"↺","circlearrowright":"↻","circledast":"⊛","circledcirc":"⊚","circleddash":"⊝","CircleDot":"⊙","circledR":"®","circledS":"Ⓢ","CircleMinus":"⊖","CirclePlus":"⊕","CircleTimes":"⊗","cir":"○","cirE":"⧃","cire":"≗","cirfnint":"⨐","cirmid":"⫯","cirscir":"⧂","ClockwiseContourIntegral":"∲","CloseCurlyDoubleQuote":"”","CloseCurlyQuote":"’","clubs":"♣","clubsuit":"♣","colon":":","Colon":"∷","Colone":"⩴","colone":"≔","coloneq":"≔","comma":",","commat":"@","comp":"∁","compfn":"∘","complement":"∁","complexes":"ℂ","cong":"≅","congdot":"⩭","Congruent":"≡","conint":"∮","Conint":"∯","ContourIntegral":"∮","copf":"𝕔","Copf":"ℂ","coprod":"∐","Coproduct":"∐","copy":"©","COPY":"©","copysr":"℗","CounterClockwiseContourIntegral":"∳","crarr":"↵","cross":"✗","Cross":"⨯","Cscr":"𝒞","cscr":"𝒸","csub":"⫏","csube":"⫑","csup":"⫐","csupe":"⫒","ctdot":"⋯","cudarrl":"⤸","cudarrr":"⤵","cuepr":"⋞","cuesc":"⋟","cularr":"↶","cularrp":"⤽","cupbrcap":"⩈","cupcap":"⩆","CupCap":"≍","cup":"∪","Cup":"⋓","cupcup":"⩊","cupdot":"⊍","cupor":"⩅","cups":"∪︀","curarr":"↷","curarrm":"⤼","curlyeqprec":"⋞","curlyeqsucc":"⋟","curlyvee":"⋎","curlywedge":"⋏","curren":"¤","curvearrowleft":"↶","curvearrowright":"↷","cuvee":"⋎","cuwed":"⋏","cwconint":"∲","cwint":"∱","cylcty":"⌭","dagger":"†","Dagger":"‡","daleth":"ℸ","darr":"↓","Darr":"↡","dArr":"⇓","dash":"‐","Dashv":"⫤","dashv":"⊣","dbkarow":"⤏","dblac":"˝","Dcaron":"Ď","dcaron":"ď","Dcy":"Д","dcy":"д","ddagger":"‡","ddarr":"⇊","DD":"ⅅ","dd":"ⅆ","DDotrahd":"⤑","ddotseq":"⩷","deg":"°","Del":"∇","Delta":"Δ","delta":"δ","demptyv":"⦱","dfisht":"⥿","Dfr":"𝔇","dfr":"𝔡","dHar":"⥥","dharl":"⇃","dharr":"⇂","DiacriticalAcute":"´","DiacriticalDot":"˙","DiacriticalDoubleAcute":"˝","DiacriticalGrave":"`","DiacriticalTilde":"˜","diam":"⋄","diamond":"⋄","Diamond":"⋄","diamondsuit":"♦","diams":"♦","die":"¨","DifferentialD":"ⅆ","digamma":"ϝ","disin":"⋲","div":"÷","divide":"÷","divideontimes":"⋇","divonx":"⋇","DJcy":"Ђ","djcy":"ђ","dlcorn":"⌞","dlcrop":"⌍","dollar":"$","Dopf":"𝔻","dopf":"𝕕","Dot":"¨","dot":"˙","DotDot":"⃜","doteq":"≐","doteqdot":"≑","DotEqual":"≐","dotminus":"∸","dotplus":"∔","dotsquare":"⊡","doublebarwedge":"⌆","DoubleContourIntegral":"∯","DoubleDot":"¨","DoubleDownArrow":"⇓","DoubleLeftArrow":"⇐","DoubleLeftRightArrow":"⇔","DoubleLeftTee":"⫤","DoubleLongLeftArrow":"⟸","DoubleLongLeftRightArrow":"⟺","DoubleLongRightArrow":"⟹","DoubleRightArrow":"⇒","DoubleRightTee":"⊨","DoubleUpArrow":"⇑","DoubleUpDownArrow":"⇕","DoubleVerticalBar":"∥","DownArrowBar":"⤓","downarrow":"↓","DownArrow":"↓","Downarrow":"⇓","DownArrowUpArrow":"⇵","DownBreve":"̑","downdownarrows":"⇊","downharpoonleft":"⇃","downharpoonright":"⇂","DownLeftRightVector":"⥐","DownLeftTeeVector":"⥞","DownLeftVectorBar":"⥖","DownLeftVector":"↽","DownRightTeeVector":"⥟","DownRightVectorBar":"⥗","DownRightVector":"⇁","DownTeeArrow":"↧","DownTee":"⊤","drbkarow":"⤐","drcorn":"⌟","drcrop":"⌌","Dscr":"𝒟","dscr":"𝒹","DScy":"Ѕ","dscy":"ѕ","dsol":"⧶","Dstrok":"Đ","dstrok":"đ","dtdot":"⋱","dtri":"▿","dtrif":"▾","duarr":"⇵","duhar":"⥯","dwangle":"⦦","DZcy":"Џ","dzcy":"џ","dzigrarr":"⟿","Eacute":"É","eacute":"é","easter":"⩮","Ecaron":"Ě","ecaron":"ě","Ecirc":"Ê","ecirc":"ê","ecir":"≖","ecolon":"≕","Ecy":"Э","ecy":"э","eDDot":"⩷","Edot":"Ė","edot":"ė","eDot":"≑","ee":"ⅇ","efDot":"≒","Efr":"𝔈","efr":"𝔢","eg":"⪚","Egrave":"È","egrave":"è","egs":"⪖","egsdot":"⪘","el":"⪙","Element":"∈","elinters":"⏧","ell":"ℓ","els":"⪕","elsdot":"⪗","Emacr":"Ē","emacr":"ē","empty":"∅","emptyset":"∅","EmptySmallSquare":"◻","emptyv":"∅","EmptyVerySmallSquare":"▫","emsp13":" ","emsp14":" ","emsp":" ","ENG":"Ŋ","eng":"ŋ","ensp":" ","Eogon":"Ę","eogon":"ę","Eopf":"𝔼","eopf":"𝕖","epar":"⋕","eparsl":"⧣","eplus":"⩱","epsi":"ε","Epsilon":"Ε","epsilon":"ε","epsiv":"ϵ","eqcirc":"≖","eqcolon":"≕","eqsim":"≂","eqslantgtr":"⪖","eqslantless":"⪕","Equal":"⩵","equals":"=","EqualTilde":"≂","equest":"≟","Equilibrium":"⇌","equiv":"≡","equivDD":"⩸","eqvparsl":"⧥","erarr":"⥱","erDot":"≓","escr":"ℯ","Escr":"ℰ","esdot":"≐","Esim":"⩳","esim":"≂","Eta":"Η","eta":"η","ETH":"Ð","eth":"ð","Euml":"Ë","euml":"ë","euro":"€","excl":"!","exist":"∃","Exists":"∃","expectation":"ℰ","exponentiale":"ⅇ","ExponentialE":"ⅇ","fallingdotseq":"≒","Fcy":"Ф","fcy":"ф","female":"♀","ffilig":"ﬃ","fflig":"ﬀ","ffllig":"ﬄ","Ffr":"𝔉","ffr":"𝔣","filig":"ﬁ","FilledSmallSquare":"◼","FilledVerySmallSquare":"▪","fjlig":"fj","flat":"♭","fllig":"ﬂ","fltns":"▱","fnof":"ƒ","Fopf":"𝔽","fopf":"𝕗","forall":"∀","ForAll":"∀","fork":"⋔","forkv":"⫙","Fouriertrf":"ℱ","fpartint":"⨍","frac12":"½","frac13":"⅓","frac14":"¼","frac15":"⅕","frac16":"⅙","frac18":"⅛","frac23":"⅔","frac25":"⅖","frac34":"¾","frac35":"⅗","frac38":"⅜","frac45":"⅘","frac56":"⅚","frac58":"⅝","frac78":"⅞","frasl":"⁄","frown":"⌢","fscr":"𝒻","Fscr":"ℱ","gacute":"ǵ","Gamma":"Γ","gamma":"γ","Gammad":"Ϝ","gammad":"ϝ","gap":"⪆","Gbreve":"Ğ","gbreve":"ğ","Gcedil":"Ģ","Gcirc":"Ĝ","gcirc":"ĝ","Gcy":"Г","gcy":"г","Gdot":"Ġ","gdot":"ġ","ge":"≥","gE":"≧","gEl":"⪌","gel":"⋛","geq":"≥","geqq":"≧","geqslant":"⩾","gescc":"⪩","ges":"⩾","gesdot":"⪀","gesdoto":"⪂","gesdotol":"⪄","gesl":"⋛︀","gesles":"⪔","Gfr":"𝔊","gfr":"𝔤","gg":"≫","Gg":"⋙","ggg":"⋙","gimel":"ℷ","GJcy":"Ѓ","gjcy":"ѓ","gla":"⪥","gl":"≷","glE":"⪒","glj":"⪤","gnap":"⪊","gnapprox":"⪊","gne":"⪈","gnE":"≩","gneq":"⪈","gneqq":"≩","gnsim":"⋧","Gopf":"𝔾","gopf":"𝕘","grave":"`","GreaterEqual":"≥","GreaterEqualLess":"⋛","GreaterFullEqual":"≧","GreaterGreater":"⪢","GreaterLess":"≷","GreaterSlantEqual":"⩾","GreaterTilde":"≳","Gscr":"𝒢","gscr":"ℊ","gsim":"≳","gsime":"⪎","gsiml":"⪐","gtcc":"⪧","gtcir":"⩺","gt":">","GT":">","Gt":"≫","gtdot":"⋗","gtlPar":"⦕","gtquest":"⩼","gtrapprox":"⪆","gtrarr":"⥸","gtrdot":"⋗","gtreqless":"⋛","gtreqqless":"⪌","gtrless":"≷","gtrsim":"≳","gvertneqq":"≩︀","gvnE":"≩︀","Hacek":"ˇ","hairsp":" ","half":"½","hamilt":"ℋ","HARDcy":"Ъ","hardcy":"ъ","harrcir":"⥈","harr":"↔","hArr":"⇔","harrw":"↭","Hat":"^","hbar":"ℏ","Hcirc":"Ĥ","hcirc":"ĥ","hearts":"♥","heartsuit":"♥","hellip":"…","hercon":"⊹","hfr":"𝔥","Hfr":"ℌ","HilbertSpace":"ℋ","hksearow":"⤥","hkswarow":"⤦","hoarr":"⇿","homtht":"∻","hookleftarrow":"↩","hookrightarrow":"↪","hopf":"𝕙","Hopf":"ℍ","horbar":"―","HorizontalLine":"─","hscr":"𝒽","Hscr":"ℋ","hslash":"ℏ","Hstrok":"Ħ","hstrok":"ħ","HumpDownHump":"≎","HumpEqual":"≏","hybull":"⁃","hyphen":"‐","Iacute":"Í","iacute":"í","ic":"⁣","Icirc":"Î","icirc":"î","Icy":"И","icy":"и","Idot":"İ","IEcy":"Е","iecy":"е","iexcl":"¡","iff":"⇔","ifr":"𝔦","Ifr":"ℑ","Igrave":"Ì","igrave":"ì","ii":"ⅈ","iiiint":"⨌","iiint":"∭","iinfin":"⧜","iiota":"℩","IJlig":"Ĳ","ijlig":"ĳ","Imacr":"Ī","imacr":"ī","image":"ℑ","ImaginaryI":"ⅈ","imagline":"ℐ","imagpart":"ℑ","imath":"ı","Im":"ℑ","imof":"⊷","imped":"Ƶ","Implies":"⇒","incare":"℅","in":"∈","infin":"∞","infintie":"⧝","inodot":"ı","intcal":"⊺","int":"∫","Int":"∬","integers":"ℤ","Integral":"∫","intercal":"⊺","Intersection":"⋂","intlarhk":"⨗","intprod":"⨼","InvisibleComma":"⁣","InvisibleTimes":"⁢","IOcy":"Ё","iocy":"ё","Iogon":"Į","iogon":"į","Iopf":"𝕀","iopf":"𝕚","Iota":"Ι","iota":"ι","iprod":"⨼","iquest":"¿","iscr":"𝒾","Iscr":"ℐ","isin":"∈","isindot":"⋵","isinE":"⋹","isins":"⋴","isinsv":"⋳","isinv":"∈","it":"⁢","Itilde":"Ĩ","itilde":"ĩ","Iukcy":"І","iukcy":"і","Iuml":"Ï","iuml":"ï","Jcirc":"Ĵ","jcirc":"ĵ","Jcy":"Й","jcy":"й","Jfr":"𝔍","jfr":"𝔧","jmath":"ȷ","Jopf":"𝕁","jopf":"𝕛","Jscr":"𝒥","jscr":"𝒿","Jsercy":"Ј","jsercy":"ј","Jukcy":"Є","jukcy":"є","Kappa":"Κ","kappa":"κ","kappav":"ϰ","Kcedil":"Ķ","kcedil":"ķ","Kcy":"К","kcy":"к","Kfr":"𝔎","kfr":"𝔨","kgreen":"ĸ","KHcy":"Х","khcy":"х","KJcy":"Ќ","kjcy":"ќ","Kopf":"𝕂","kopf":"𝕜","Kscr":"𝒦","kscr":"𝓀","lAarr":"⇚","Lacute":"Ĺ","lacute":"ĺ","laemptyv":"⦴","lagran":"ℒ","Lambda":"Λ","lambda":"λ","lang":"⟨","Lang":"⟪","langd":"⦑","langle":"⟨","lap":"⪅","Laplacetrf":"ℒ","laquo":"«","larrb":"⇤","larrbfs":"⤟","larr":"←","Larr":"↞","lArr":"⇐","larrfs":"⤝","larrhk":"↩","larrlp":"↫","larrpl":"⤹","larrsim":"⥳","larrtl":"↢","latail":"⤙","lAtail":"⤛","lat":"⪫","late":"⪭","lates":"⪭︀","lbarr":"⤌","lBarr":"⤎","lbbrk":"❲","lbrace":"{","lbrack":"[","lbrke":"⦋","lbrksld":"⦏","lbrkslu":"⦍","Lcaron":"Ľ","lcaron":"ľ","Lcedil":"Ļ","lcedil":"ļ","lceil":"⌈","lcub":"{","Lcy":"Л","lcy":"л","ldca":"⤶","ldquo":"“","ldquor":"„","ldrdhar":"⥧","ldrushar":"⥋","ldsh":"↲","le":"≤","lE":"≦","LeftAngleBracket":"⟨","LeftArrowBar":"⇤","leftarrow":"←","LeftArrow":"←","Leftarrow":"⇐","LeftArrowRightArrow":"⇆","leftarrowtail":"↢","LeftCeiling":"⌈","LeftDoubleBracket":"⟦","LeftDownTeeVector":"⥡","LeftDownVectorBar":"⥙","LeftDownVector":"⇃","LeftFloor":"⌊","leftharpoondown":"↽","leftharpoonup":"↼","leftleftarrows":"⇇","leftrightarrow":"↔","LeftRightArrow":"↔","Leftrightarrow":"⇔","leftrightarrows":"⇆","leftrightharpoons":"⇋","leftrightsquigarrow":"↭","LeftRightVector":"⥎","LeftTeeArrow":"↤","LeftTee":"⊣","LeftTeeVector":"⥚","leftthreetimes":"⋋","LeftTriangleBar":"⧏","LeftTriangle":"⊲","LeftTriangleEqual":"⊴","LeftUpDownVector":"⥑","LeftUpTeeVector":"⥠","LeftUpVectorBar":"⥘","LeftUpVector":"↿","LeftVectorBar":"⥒","LeftVector":"↼","lEg":"⪋","leg":"⋚","leq":"≤","leqq":"≦","leqslant":"⩽","lescc":"⪨","les":"⩽","lesdot":"⩿","lesdoto":"⪁","lesdotor":"⪃","lesg":"⋚︀","lesges":"⪓","lessapprox":"⪅","lessdot":"⋖","lesseqgtr":"⋚","lesseqqgtr":"⪋","LessEqualGreater":"⋚","LessFullEqual":"≦","LessGreater":"≶","lessgtr":"≶","LessLess":"⪡","lesssim":"≲","LessSlantEqual":"⩽","LessTilde":"≲","lfisht":"⥼","lfloor":"⌊","Lfr":"𝔏","lfr":"𝔩","lg":"≶","lgE":"⪑","lHar":"⥢","lhard":"↽","lharu":"↼","lharul":"⥪","lhblk":"▄","LJcy":"Љ","ljcy":"љ","llarr":"⇇","ll":"≪","Ll":"⋘","llcorner":"⌞","Lleftarrow":"⇚","llhard":"⥫","lltri":"◺","Lmidot":"Ŀ","lmidot":"ŀ","lmoustache":"⎰","lmoust":"⎰","lnap":"⪉","lnapprox":"⪉","lne":"⪇","lnE":"≨","lneq":"⪇","lneqq":"≨","lnsim":"⋦","loang":"⟬","loarr":"⇽","lobrk":"⟦","longleftarrow":"⟵","LongLeftArrow":"⟵","Longleftarrow":"⟸","longleftrightarrow":"⟷","LongLeftRightArrow":"⟷","Longleftrightarrow":"⟺","longmapsto":"⟼","longrightarrow":"⟶","LongRightArrow":"⟶","Longrightarrow":"⟹","looparrowleft":"↫","looparrowright":"↬","lopar":"⦅","Lopf":"𝕃","lopf":"𝕝","loplus":"⨭","lotimes":"⨴","lowast":"∗","lowbar":"_","LowerLeftArrow":"↙","LowerRightArrow":"↘","loz":"◊","lozenge":"◊","lozf":"⧫","lpar":"(","lparlt":"⦓","lrarr":"⇆","lrcorner":"⌟","lrhar":"⇋","lrhard":"⥭","lrm":"‎","lrtri":"⊿","lsaquo":"‹","lscr":"𝓁","Lscr":"ℒ","lsh":"↰","Lsh":"↰","lsim":"≲","lsime":"⪍","lsimg":"⪏","lsqb":"[","lsquo":"‘","lsquor":"‚","Lstrok":"Ł","lstrok":"ł","ltcc":"⪦","ltcir":"⩹","lt":"<","LT":"<","Lt":"≪","ltdot":"⋖","lthree":"⋋","ltimes":"⋉","ltlarr":"⥶","ltquest":"⩻","ltri":"◃","ltrie":"⊴","ltrif":"◂","ltrPar":"⦖","lurdshar":"⥊","luruhar":"⥦","lvertneqq":"≨︀","lvnE":"≨︀","macr":"¯","male":"♂","malt":"✠","maltese":"✠","Map":"⤅","map":"↦","mapsto":"↦","mapstodown":"↧","mapstoleft":"↤","mapstoup":"↥","marker":"▮","mcomma":"⨩","Mcy":"М","mcy":"м","mdash":"—","mDDot":"∺","measuredangle":"∡","MediumSpace":" ","Mellintrf":"ℳ","Mfr":"𝔐","mfr":"𝔪","mho":"℧","micro":"µ","midast":"*","midcir":"⫰","mid":"∣","middot":"·","minusb":"⊟","minus":"−","minusd":"∸","minusdu":"⨪","MinusPlus":"∓","mlcp":"⫛","mldr":"…","mnplus":"∓","models":"⊧","Mopf":"𝕄","mopf":"𝕞","mp":"∓","mscr":"𝓂","Mscr":"ℳ","mstpos":"∾","Mu":"Μ","mu":"μ","multimap":"⊸","mumap":"⊸","nabla":"∇","Nacute":"Ń","nacute":"ń","nang":"∠⃒","nap":"≉","napE":"⩰̸","napid":"≋̸","napos":"ŉ","napprox":"≉","natural":"♮","naturals":"ℕ","natur":"♮","nbsp":" ","nbump":"≎̸","nbumpe":"≏̸","ncap":"⩃","Ncaron":"Ň","ncaron":"ň","Ncedil":"Ņ","ncedil":"ņ","ncong":"≇","ncongdot":"⩭̸","ncup":"⩂","Ncy":"Н","ncy":"н","ndash":"–","nearhk":"⤤","nearr":"↗","neArr":"⇗","nearrow":"↗","ne":"≠","nedot":"≐̸","NegativeMediumSpace":"​","NegativeThickSpace":"​","NegativeThinSpace":"​","NegativeVeryThinSpace":"​","nequiv":"≢","nesear":"⤨","nesim":"≂̸","NestedGreaterGreater":"≫","NestedLessLess":"≪","NewLine":"\n","nexist":"∄","nexists":"∄","Nfr":"𝔑","nfr":"𝔫","ngE":"≧̸","nge":"≱","ngeq":"≱","ngeqq":"≧̸","ngeqslant":"⩾̸","nges":"⩾̸","nGg":"⋙̸","ngsim":"≵","nGt":"≫⃒","ngt":"≯","ngtr":"≯","nGtv":"≫̸","nharr":"↮","nhArr":"⇎","nhpar":"⫲","ni":"∋","nis":"⋼","nisd":"⋺","niv":"∋","NJcy":"Њ","njcy":"њ","nlarr":"↚","nlArr":"⇍","nldr":"‥","nlE":"≦̸","nle":"≰","nleftarrow":"↚","nLeftarrow":"⇍","nleftrightarrow":"↮","nLeftrightarrow":"⇎","nleq":"≰","nleqq":"≦̸","nleqslant":"⩽̸","nles":"⩽̸","nless":"≮","nLl":"⋘̸","nlsim":"≴","nLt":"≪⃒","nlt":"≮","nltri":"⋪","nltrie":"⋬","nLtv":"≪̸","nmid":"∤","NoBreak":"⁠","NonBreakingSpace":" ","nopf":"𝕟","Nopf":"ℕ","Not":"⫬","not":"¬","NotCongruent":"≢","NotCupCap":"≭","NotDoubleVerticalBar":"∦","NotElement":"∉","NotEqual":"≠","NotEqualTilde":"≂̸","NotExists":"∄","NotGreater":"≯","NotGreaterEqual":"≱","NotGreaterFullEqual":"≧̸","NotGreaterGreater":"≫̸","NotGreaterLess":"≹","NotGreaterSlantEqual":"⩾̸","NotGreaterTilde":"≵","NotHumpDownHump":"≎̸","NotHumpEqual":"≏̸","notin":"∉","notindot":"⋵̸","notinE":"⋹̸","notinva":"∉","notinvb":"⋷","notinvc":"⋶","NotLeftTriangleBar":"⧏̸","NotLeftTriangle":"⋪","NotLeftTriangleEqual":"⋬","NotLess":"≮","NotLessEqual":"≰","NotLessGreater":"≸","NotLessLess":"≪̸","NotLessSlantEqual":"⩽̸","NotLessTilde":"≴","NotNestedGreaterGreater":"⪢̸","NotNestedLessLess":"⪡̸","notni":"∌","notniva":"∌","notnivb":"⋾","notnivc":"⋽","NotPrecedes":"⊀","NotPrecedesEqual":"⪯̸","NotPrecedesSlantEqual":"⋠","NotReverseElement":"∌","NotRightTriangleBar":"⧐̸","NotRightTriangle":"⋫","NotRightTriangleEqual":"⋭","NotSquareSubset":"⊏̸","NotSquareSubsetEqual":"⋢","NotSquareSuperset":"⊐̸","NotSquareSupersetEqual":"⋣","NotSubset":"⊂⃒","NotSubsetEqual":"⊈","NotSucceeds":"⊁","NotSucceedsEqual":"⪰̸","NotSucceedsSlantEqual":"⋡","NotSucceedsTilde":"≿̸","NotSuperset":"⊃⃒","NotSupersetEqual":"⊉","NotTilde":"≁","NotTildeEqual":"≄","NotTildeFullEqual":"≇","NotTildeTilde":"≉","NotVerticalBar":"∤","nparallel":"∦","npar":"∦","nparsl":"⫽⃥","npart":"∂̸","npolint":"⨔","npr":"⊀","nprcue":"⋠","nprec":"⊀","npreceq":"⪯̸","npre":"⪯̸","nrarrc":"⤳̸","nrarr":"↛","nrArr":"⇏","nrarrw":"↝̸","nrightarrow":"↛","nRightarrow":"⇏","nrtri":"⋫","nrtrie":"⋭","nsc":"⊁","nsccue":"⋡","nsce":"⪰̸","Nscr":"𝒩","nscr":"𝓃","nshortmid":"∤","nshortparallel":"∦","nsim":"≁","nsime":"≄","nsimeq":"≄","nsmid":"∤","nspar":"∦","nsqsube":"⋢","nsqsupe":"⋣","nsub":"⊄","nsubE":"⫅̸","nsube":"⊈","nsubset":"⊂⃒","nsubseteq":"⊈","nsubseteqq":"⫅̸","nsucc":"⊁","nsucceq":"⪰̸","nsup":"⊅","nsupE":"⫆̸","nsupe":"⊉","nsupset":"⊃⃒","nsupseteq":"⊉","nsupseteqq":"⫆̸","ntgl":"≹","Ntilde":"Ñ","ntilde":"ñ","ntlg":"≸","ntriangleleft":"⋪","ntrianglelefteq":"⋬","ntriangleright":"⋫","ntrianglerighteq":"⋭","Nu":"Ν","nu":"ν","num":"#","numero":"№","numsp":" ","nvap":"≍⃒","nvdash":"⊬","nvDash":"⊭","nVdash":"⊮","nVDash":"⊯","nvge":"≥⃒","nvgt":">⃒","nvHarr":"⤄","nvinfin":"⧞","nvlArr":"⤂","nvle":"≤⃒","nvlt":"<⃒","nvltrie":"⊴⃒","nvrArr":"⤃","nvrtrie":"⊵⃒","nvsim":"∼⃒","nwarhk":"⤣","nwarr":"↖","nwArr":"⇖","nwarrow":"↖","nwnear":"⤧","Oacute":"Ó","oacute":"ó","oast":"⊛","Ocirc":"Ô","ocirc":"ô","ocir":"⊚","Ocy":"О","ocy":"о","odash":"⊝","Odblac":"Ő","odblac":"ő","odiv":"⨸","odot":"⊙","odsold":"⦼","OElig":"Œ","oelig":"œ","ofcir":"⦿","Ofr":"𝔒","ofr":"𝔬","ogon":"˛","Ograve":"Ò","ograve":"ò","ogt":"⧁","ohbar":"⦵","ohm":"Ω","oint":"∮","olarr":"↺","olcir":"⦾","olcross":"⦻","oline":"‾","olt":"⧀","Omacr":"Ō","omacr":"ō","Omega":"Ω","omega":"ω","Omicron":"Ο","omicron":"ο","omid":"⦶","ominus":"⊖","Oopf":"𝕆","oopf":"𝕠","opar":"⦷","OpenCurlyDoubleQuote":"“","OpenCurlyQuote":"‘","operp":"⦹","oplus":"⊕","orarr":"↻","Or":"⩔","or":"∨","ord":"⩝","order":"ℴ","orderof":"ℴ","ordf":"ª","ordm":"º","origof":"⊶","oror":"⩖","orslope":"⩗","orv":"⩛","oS":"Ⓢ","Oscr":"𝒪","oscr":"ℴ","Oslash":"Ø","oslash":"ø","osol":"⊘","Otilde":"Õ","otilde":"õ","otimesas":"⨶","Otimes":"⨷","otimes":"⊗","Ouml":"Ö","ouml":"ö","ovbar":"⌽","OverBar":"‾","OverBrace":"⏞","OverBracket":"⎴","OverParenthesis":"⏜","para":"¶","parallel":"∥","par":"∥","parsim":"⫳","parsl":"⫽","part":"∂","PartialD":"∂","Pcy":"П","pcy":"п","percnt":"%","period":".","permil":"‰","perp":"⊥","pertenk":"‱","Pfr":"𝔓","pfr":"𝔭","Phi":"Φ","phi":"φ","phiv":"ϕ","phmmat":"ℳ","phone":"☎","Pi":"Π","pi":"π","pitchfork":"⋔","piv":"ϖ","planck":"ℏ","planckh":"ℎ","plankv":"ℏ","plusacir":"⨣","plusb":"⊞","pluscir":"⨢","plus":"+","plusdo":"∔","plusdu":"⨥","pluse":"⩲","PlusMinus":"±","plusmn":"±","plussim":"⨦","plustwo":"⨧","pm":"±","Poincareplane":"ℌ","pointint":"⨕","popf":"𝕡","Popf":"ℙ","pound":"£","prap":"⪷","Pr":"⪻","pr":"≺","prcue":"≼","precapprox":"⪷","prec":"≺","preccurlyeq":"≼","Precedes":"≺","PrecedesEqual":"⪯","PrecedesSlantEqual":"≼","PrecedesTilde":"≾","preceq":"⪯","precnapprox":"⪹","precneqq":"⪵","precnsim":"⋨","pre":"⪯","prE":"⪳","precsim":"≾","prime":"′","Prime":"″","primes":"ℙ","prnap":"⪹","prnE":"⪵","prnsim":"⋨","prod":"∏","Product":"∏","profalar":"⌮","profline":"⌒","profsurf":"⌓","prop":"∝","Proportional":"∝","Proportion":"∷","propto":"∝","prsim":"≾","prurel":"⊰","Pscr":"𝒫","pscr":"𝓅","Psi":"Ψ","psi":"ψ","puncsp":" ","Qfr":"𝔔","qfr":"𝔮","qint":"⨌","qopf":"𝕢","Qopf":"ℚ","qprime":"⁗","Qscr":"𝒬","qscr":"𝓆","quaternions":"ℍ","quatint":"⨖","quest":"?","questeq":"≟","quot":"\"","QUOT":"\"","rAarr":"⇛","race":"∽̱","Racute":"Ŕ","racute":"ŕ","radic":"√","raemptyv":"⦳","rang":"⟩","Rang":"⟫","rangd":"⦒","range":"⦥","rangle":"⟩","raquo":"»","rarrap":"⥵","rarrb":"⇥","rarrbfs":"⤠","rarrc":"⤳","rarr":"→","Rarr":"↠","rArr":"⇒","rarrfs":"⤞","rarrhk":"↪","rarrlp":"↬","rarrpl":"⥅","rarrsim":"⥴","Rarrtl":"⤖","rarrtl":"↣","rarrw":"↝","ratail":"⤚","rAtail":"⤜","ratio":"∶","rationals":"ℚ","rbarr":"⤍","rBarr":"⤏","RBarr":"⤐","rbbrk":"❳","rbrace":"}","rbrack":"]","rbrke":"⦌","rbrksld":"⦎","rbrkslu":"⦐","Rcaron":"Ř","rcaron":"ř","Rcedil":"Ŗ","rcedil":"ŗ","rceil":"⌉","rcub":"}","Rcy":"Р","rcy":"р","rdca":"⤷","rdldhar":"⥩","rdquo":"”","rdquor":"”","rdsh":"↳","real":"ℜ","realine":"ℛ","realpart":"ℜ","reals":"ℝ","Re":"ℜ","rect":"▭","reg":"®","REG":"®","ReverseElement":"∋","ReverseEquilibrium":"⇋","ReverseUpEquilibrium":"⥯","rfisht":"⥽","rfloor":"⌋","rfr":"𝔯","Rfr":"ℜ","rHar":"⥤","rhard":"⇁","rharu":"⇀","rharul":"⥬","Rho":"Ρ","rho":"ρ","rhov":"ϱ","RightAngleBracket":"⟩","RightArrowBar":"⇥","rightarrow":"→","RightArrow":"→","Rightarrow":"⇒","RightArrowLeftArrow":"⇄","rightarrowtail":"↣","RightCeiling":"⌉","RightDoubleBracket":"⟧","RightDownTeeVector":"⥝","RightDownVectorBar":"⥕","RightDownVector":"⇂","RightFloor":"⌋","rightharpoondown":"⇁","rightharpoonup":"⇀","rightleftarrows":"⇄","rightleftharpoons":"⇌","rightrightarrows":"⇉","rightsquigarrow":"↝","RightTeeArrow":"↦","RightTee":"⊢","RightTeeVector":"⥛","rightthreetimes":"⋌","RightTriangleBar":"⧐","RightTriangle":"⊳","RightTriangleEqual":"⊵","RightUpDownVector":"⥏","RightUpTeeVector":"⥜","RightUpVectorBar":"⥔","RightUpVector":"↾","RightVectorBar":"⥓","RightVector":"⇀","ring":"˚","risingdotseq":"≓","rlarr":"⇄","rlhar":"⇌","rlm":"‏","rmoustache":"⎱","rmoust":"⎱","rnmid":"⫮","roang":"⟭","roarr":"⇾","robrk":"⟧","ropar":"⦆","ropf":"𝕣","Ropf":"ℝ","roplus":"⨮","rotimes":"⨵","RoundImplies":"⥰","rpar":")","rpargt":"⦔","rppolint":"⨒","rrarr":"⇉","Rrightarrow":"⇛","rsaquo":"›","rscr":"𝓇","Rscr":"ℛ","rsh":"↱","Rsh":"↱","rsqb":"]","rsquo":"’","rsquor":"’","rthree":"⋌","rtimes":"⋊","rtri":"▹","rtrie":"⊵","rtrif":"▸","rtriltri":"⧎","RuleDelayed":"⧴","ruluhar":"⥨","rx":"℞","Sacute":"Ś","sacute":"ś","sbquo":"‚","scap":"⪸","Scaron":"Š","scaron":"š","Sc":"⪼","sc":"≻","sccue":"≽","sce":"⪰","scE":"⪴","Scedil":"Ş","scedil":"ş","Scirc":"Ŝ","scirc":"ŝ","scnap":"⪺","scnE":"⪶","scnsim":"⋩","scpolint":"⨓","scsim":"≿","Scy":"С","scy":"с","sdotb":"⊡","sdot":"⋅","sdote":"⩦","searhk":"⤥","searr":"↘","seArr":"⇘","searrow":"↘","sect":"§","semi":";","seswar":"⤩","setminus":"∖","setmn":"∖","sext":"✶","Sfr":"𝔖","sfr":"𝔰","sfrown":"⌢","sharp":"♯","SHCHcy":"Щ","shchcy":"щ","SHcy":"Ш","shcy":"ш","ShortDownArrow":"↓","ShortLeftArrow":"←","shortmid":"∣","shortparallel":"∥","ShortRightArrow":"→","ShortUpArrow":"↑","shy":"­","Sigma":"Σ","sigma":"σ","sigmaf":"ς","sigmav":"ς","sim":"∼","simdot":"⩪","sime":"≃","simeq":"≃","simg":"⪞","simgE":"⪠","siml":"⪝","simlE":"⪟","simne":"≆","simplus":"⨤","simrarr":"⥲","slarr":"←","SmallCircle":"∘","smallsetminus":"∖","smashp":"⨳","smeparsl":"⧤","smid":"∣","smile":"⌣","smt":"⪪","smte":"⪬","smtes":"⪬︀","SOFTcy":"Ь","softcy":"ь","solbar":"⌿","solb":"⧄","sol":"/","Sopf":"𝕊","sopf":"𝕤","spades":"♠","spadesuit":"♠","spar":"∥","sqcap":"⊓","sqcaps":"⊓︀","sqcup":"⊔","sqcups":"⊔︀","Sqrt":"√","sqsub":"⊏","sqsube":"⊑","sqsubset":"⊏","sqsubseteq":"⊑","sqsup":"⊐","sqsupe":"⊒","sqsupset":"⊐","sqsupseteq":"⊒","square":"□","Square":"□","SquareIntersection":"⊓","SquareSubset":"⊏","SquareSubsetEqual":"⊑","SquareSuperset":"⊐","SquareSupersetEqual":"⊒","SquareUnion":"⊔","squarf":"▪","squ":"□","squf":"▪","srarr":"→","Sscr":"𝒮","sscr":"𝓈","ssetmn":"∖","ssmile":"⌣","sstarf":"⋆","Star":"⋆","star":"☆","starf":"★","straightepsilon":"ϵ","straightphi":"ϕ","strns":"¯","sub":"⊂","Sub":"⋐","subdot":"⪽","subE":"⫅","sube":"⊆","subedot":"⫃","submult":"⫁","subnE":"⫋","subne":"⊊","subplus":"⪿","subrarr":"⥹","subset":"⊂","Subset":"⋐","subseteq":"⊆","subseteqq":"⫅","SubsetEqual":"⊆","subsetneq":"⊊","subsetneqq":"⫋","subsim":"⫇","subsub":"⫕","subsup":"⫓","succapprox":"⪸","succ":"≻","succcurlyeq":"≽","Succeeds":"≻","SucceedsEqual":"⪰","SucceedsSlantEqual":"≽","SucceedsTilde":"≿","succeq":"⪰","succnapprox":"⪺","succneqq":"⪶","succnsim":"⋩","succsim":"≿","SuchThat":"∋","sum":"∑","Sum":"∑","sung":"♪","sup1":"¹","sup2":"²","sup3":"³","sup":"⊃","Sup":"⋑","supdot":"⪾","supdsub":"⫘","supE":"⫆","supe":"⊇","supedot":"⫄","Superset":"⊃","SupersetEqual":"⊇","suphsol":"⟉","suphsub":"⫗","suplarr":"⥻","supmult":"⫂","supnE":"⫌","supne":"⊋","supplus":"⫀","supset":"⊃","Supset":"⋑","supseteq":"⊇","supseteqq":"⫆","supsetneq":"⊋","supsetneqq":"⫌","supsim":"⫈","supsub":"⫔","supsup":"⫖","swarhk":"⤦","swarr":"↙","swArr":"⇙","swarrow":"↙","swnwar":"⤪","szlig":"ß","Tab":"\t","target":"⌖","Tau":"Τ","tau":"τ","tbrk":"⎴","Tcaron":"Ť","tcaron":"ť","Tcedil":"Ţ","tcedil":"ţ","Tcy":"Т","tcy":"т","tdot":"⃛","telrec":"⌕","Tfr":"𝔗","tfr":"𝔱","there4":"∴","therefore":"∴","Therefore":"∴","Theta":"Θ","theta":"θ","thetasym":"ϑ","thetav":"ϑ","thickapprox":"≈","thicksim":"∼","ThickSpace":"  ","ThinSpace":" ","thinsp":" ","thkap":"≈","thksim":"∼","THORN":"Þ","thorn":"þ","tilde":"˜","Tilde":"∼","TildeEqual":"≃","TildeFullEqual":"≅","TildeTilde":"≈","timesbar":"⨱","timesb":"⊠","times":"×","timesd":"⨰","tint":"∭","toea":"⤨","topbot":"⌶","topcir":"⫱","top":"⊤","Topf":"𝕋","topf":"𝕥","topfork":"⫚","tosa":"⤩","tprime":"‴","trade":"™","TRADE":"™","triangle":"▵","triangledown":"▿","triangleleft":"◃","trianglelefteq":"⊴","triangleq":"≜","triangleright":"▹","trianglerighteq":"⊵","tridot":"◬","trie":"≜","triminus":"⨺","TripleDot":"⃛","triplus":"⨹","trisb":"⧍","tritime":"⨻","trpezium":"⏢","Tscr":"𝒯","tscr":"𝓉","TScy":"Ц","tscy":"ц","TSHcy":"Ћ","tshcy":"ћ","Tstrok":"Ŧ","tstrok":"ŧ","twixt":"≬","twoheadleftarrow":"↞","twoheadrightarrow":"↠","Uacute":"Ú","uacute":"ú","uarr":"↑","Uarr":"↟","uArr":"⇑","Uarrocir":"⥉","Ubrcy":"Ў","ubrcy":"ў","Ubreve":"Ŭ","ubreve":"ŭ","Ucirc":"Û","ucirc":"û","Ucy":"У","ucy":"у","udarr":"⇅","Udblac":"Ű","udblac":"ű","udhar":"⥮","ufisht":"⥾","Ufr":"𝔘","ufr":"𝔲","Ugrave":"Ù","ugrave":"ù","uHar":"⥣","uharl":"↿","uharr":"↾","uhblk":"▀","ulcorn":"⌜","ulcorner":"⌜","ulcrop":"⌏","ultri":"◸","Umacr":"Ū","umacr":"ū","uml":"¨","UnderBar":"_","UnderBrace":"⏟","UnderBracket":"⎵","UnderParenthesis":"⏝","Union":"⋃","UnionPlus":"⊎","Uogon":"Ų","uogon":"ų","Uopf":"𝕌","uopf":"𝕦","UpArrowBar":"⤒","uparrow":"↑","UpArrow":"↑","Uparrow":"⇑","UpArrowDownArrow":"⇅","updownarrow":"↕","UpDownArrow":"↕","Updownarrow":"⇕","UpEquilibrium":"⥮","upharpoonleft":"↿","upharpoonright":"↾","uplus":"⊎","UpperLeftArrow":"↖","UpperRightArrow":"↗","upsi":"υ","Upsi":"ϒ","upsih":"ϒ","Upsilon":"Υ","upsilon":"υ","UpTeeArrow":"↥","UpTee":"⊥","upuparrows":"⇈","urcorn":"⌝","urcorner":"⌝","urcrop":"⌎","Uring":"Ů","uring":"ů","urtri":"◹","Uscr":"𝒰","uscr":"𝓊","utdot":"⋰","Utilde":"Ũ","utilde":"ũ","utri":"▵","utrif":"▴","uuarr":"⇈","Uuml":"Ü","uuml":"ü","uwangle":"⦧","vangrt":"⦜","varepsilon":"ϵ","varkappa":"ϰ","varnothing":"∅","varphi":"ϕ","varpi":"ϖ","varpropto":"∝","varr":"↕","vArr":"⇕","varrho":"ϱ","varsigma":"ς","varsubsetneq":"⊊︀","varsubsetneqq":"⫋︀","varsupsetneq":"⊋︀","varsupsetneqq":"⫌︀","vartheta":"ϑ","vartriangleleft":"⊲","vartriangleright":"⊳","vBar":"⫨","Vbar":"⫫","vBarv":"⫩","Vcy":"В","vcy":"в","vdash":"⊢","vDash":"⊨","Vdash":"⊩","VDash":"⊫","Vdashl":"⫦","veebar":"⊻","vee":"∨","Vee":"⋁","veeeq":"≚","vellip":"⋮","verbar":"|","Verbar":"‖","vert":"|","Vert":"‖","VerticalBar":"∣","VerticalLine":"|","VerticalSeparator":"❘","VerticalTilde":"≀","VeryThinSpace":" ","Vfr":"𝔙","vfr":"𝔳","vltri":"⊲","vnsub":"⊂⃒","vnsup":"⊃⃒","Vopf":"𝕍","vopf":"𝕧","vprop":"∝","vrtri":"⊳","Vscr":"𝒱","vscr":"𝓋","vsubnE":"⫋︀","vsubne":"⊊︀","vsupnE":"⫌︀","vsupne":"⊋︀","Vvdash":"⊪","vzigzag":"⦚","Wcirc":"Ŵ","wcirc":"ŵ","wedbar":"⩟","wedge":"∧","Wedge":"⋀","wedgeq":"≙","weierp":"℘","Wfr":"𝔚","wfr":"𝔴","Wopf":"𝕎","wopf":"𝕨","wp":"℘","wr":"≀","wreath":"≀","Wscr":"𝒲","wscr":"𝓌","xcap":"⋂","xcirc":"◯","xcup":"⋃","xdtri":"▽","Xfr":"𝔛","xfr":"𝔵","xharr":"⟷","xhArr":"⟺","Xi":"Ξ","xi":"ξ","xlarr":"⟵","xlArr":"⟸","xmap":"⟼","xnis":"⋻","xodot":"⨀","Xopf":"𝕏","xopf":"𝕩","xoplus":"⨁","xotime":"⨂","xrarr":"⟶","xrArr":"⟹","Xscr":"𝒳","xscr":"𝓍","xsqcup":"⨆","xuplus":"⨄","xutri":"△","xvee":"⋁","xwedge":"⋀","Yacute":"Ý","yacute":"ý","YAcy":"Я","yacy":"я","Ycirc":"Ŷ","ycirc":"ŷ","Ycy":"Ы","ycy":"ы","yen":"¥","Yfr":"𝔜","yfr":"𝔶","YIcy":"Ї","yicy":"ї","Yopf":"𝕐","yopf":"𝕪","Yscr":"𝒴","yscr":"𝓎","YUcy":"Ю","yucy":"ю","yuml":"ÿ","Yuml":"Ÿ","Zacute":"Ź","zacute":"ź","Zcaron":"Ž","zcaron":"ž","Zcy":"З","zcy":"з","Zdot":"Ż","zdot":"ż","zeetrf":"ℨ","ZeroWidthSpace":"​","Zeta":"Ζ","zeta":"ζ","zfr":"𝔷","Zfr":"ℨ","ZHcy":"Ж","zhcy":"ж","zigrarr":"⇝","zopf":"𝕫","Zopf":"ℤ","Zscr":"𝒵","zscr":"𝓏","zwj":"‍","zwnj":"‌"}

/***/ }),
/* 124 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 125 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



////////////////////////////////////////////////////////////////////////////////
// Helpers

// Merge objects
//
function assign(obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function (source) {
    if (!source) { return; }

    Object.keys(source).forEach(function (key) {
      obj[key] = source[key];
    });
  });

  return obj;
}

function _class(obj) { return Object.prototype.toString.call(obj); }
function isString(obj) { return _class(obj) === '[object String]'; }
function isObject(obj) { return _class(obj) === '[object Object]'; }
function isRegExp(obj) { return _class(obj) === '[object RegExp]'; }
function isFunction(obj) { return _class(obj) === '[object Function]'; }


function escapeRE(str) { return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&'); }

////////////////////////////////////////////////////////////////////////////////


var defaultOptions = {
  fuzzyLink: true,
  fuzzyEmail: true,
  fuzzyIP: false
};


function isOptionsObj(obj) {
  return Object.keys(obj || {}).reduce(function (acc, k) {
    return acc || defaultOptions.hasOwnProperty(k);
  }, false);
}


var defaultSchemas = {
  'http:': {
    validate: function (text, pos, self) {
      var tail = text.slice(pos);

      if (!self.re.http) {
        // compile lazily, because "host"-containing variables can change on tlds update.
        self.re.http =  new RegExp(
          '^\\/\\/' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i'
        );
      }
      if (self.re.http.test(tail)) {
        return tail.match(self.re.http)[0].length;
      }
      return 0;
    }
  },
  'https:':  'http:',
  'ftp:':    'http:',
  '//':      {
    validate: function (text, pos, self) {
      var tail = text.slice(pos);

      if (!self.re.no_http) {
      // compile lazily, because "host"-containing variables can change on tlds update.
        self.re.no_http =  new RegExp(
          '^' +
          self.re.src_auth +
          // Don't allow single-level domains, because of false positives like '//test'
          // with code comments
          '(?:localhost|(?:(?:' + self.re.src_domain + ')\\.)+' + self.re.src_domain_root + ')' +
          self.re.src_port +
          self.re.src_host_terminator +
          self.re.src_path,

          'i'
        );
      }

      if (self.re.no_http.test(tail)) {
        // should not be `://` & `///`, that protects from errors in protocol name
        if (pos >= 3 && text[pos - 3] === ':') { return 0; }
        if (pos >= 3 && text[pos - 3] === '/') { return 0; }
        return tail.match(self.re.no_http)[0].length;
      }
      return 0;
    }
  },
  'mailto:': {
    validate: function (text, pos, self) {
      var tail = text.slice(pos);

      if (!self.re.mailto) {
        self.re.mailto =  new RegExp(
          '^' + self.re.src_email_name + '@' + self.re.src_host_strict, 'i'
        );
      }
      if (self.re.mailto.test(tail)) {
        return tail.match(self.re.mailto)[0].length;
      }
      return 0;
    }
  }
};

/*eslint-disable max-len*/

// RE pattern for 2-character tlds (autogenerated by ./support/tlds_2char_gen.js)
var tlds_2ch_src_re = 'a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]';

// DON'T try to make PRs with changes. Extend TLDs with LinkifyIt.tlds() instead
var tlds_default = 'biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф'.split('|');

/*eslint-enable max-len*/

////////////////////////////////////////////////////////////////////////////////

function resetScanCache(self) {
  self.__index__ = -1;
  self.__text_cache__   = '';
}

function createValidator(re) {
  return function (text, pos) {
    var tail = text.slice(pos);

    if (re.test(tail)) {
      return tail.match(re)[0].length;
    }
    return 0;
  };
}

function createNormalizer() {
  return function (match, self) {
    self.normalize(match);
  };
}

// Schemas compiler. Build regexps.
//
function compile(self) {

  // Load & clone RE patterns.
  var re = self.re = __webpack_require__(127)(self.__opts__);

  // Define dynamic patterns
  var tlds = self.__tlds__.slice();

  self.onCompile();

  if (!self.__tlds_replaced__) {
    tlds.push(tlds_2ch_src_re);
  }
  tlds.push(re.src_xn);

  re.src_tlds = tlds.join('|');

  function untpl(tpl) { return tpl.replace('%TLDS%', re.src_tlds); }

  re.email_fuzzy      = RegExp(untpl(re.tpl_email_fuzzy), 'i');
  re.link_fuzzy       = RegExp(untpl(re.tpl_link_fuzzy), 'i');
  re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), 'i');
  re.host_fuzzy_test  = RegExp(untpl(re.tpl_host_fuzzy_test), 'i');

  //
  // Compile each schema
  //

  var aliases = [];

  self.__compiled__ = {}; // Reset compiled data

  function schemaError(name, val) {
    throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val);
  }

  Object.keys(self.__schemas__).forEach(function (name) {
    var val = self.__schemas__[name];

    // skip disabled methods
    if (val === null) { return; }

    var compiled = { validate: null, link: null };

    self.__compiled__[name] = compiled;

    if (isObject(val)) {
      if (isRegExp(val.validate)) {
        compiled.validate = createValidator(val.validate);
      } else if (isFunction(val.validate)) {
        compiled.validate = val.validate;
      } else {
        schemaError(name, val);
      }

      if (isFunction(val.normalize)) {
        compiled.normalize = val.normalize;
      } else if (!val.normalize) {
        compiled.normalize = createNormalizer();
      } else {
        schemaError(name, val);
      }

      return;
    }

    if (isString(val)) {
      aliases.push(name);
      return;
    }

    schemaError(name, val);
  });

  //
  // Compile postponed aliases
  //

  aliases.forEach(function (alias) {
    if (!self.__compiled__[self.__schemas__[alias]]) {
      // Silently fail on missed schemas to avoid errons on disable.
      // schemaError(alias, self.__schemas__[alias]);
      return;
    }

    self.__compiled__[alias].validate =
      self.__compiled__[self.__schemas__[alias]].validate;
    self.__compiled__[alias].normalize =
      self.__compiled__[self.__schemas__[alias]].normalize;
  });

  //
  // Fake record for guessed links
  //
  self.__compiled__[''] = { validate: null, normalize: createNormalizer() };

  //
  // Build schema condition
  //
  var slist = Object.keys(self.__compiled__)
                      .filter(function (name) {
                        // Filter disabled & fake schemas
                        return name.length > 0 && self.__compiled__[name];
                      })
                      .map(escapeRE)
                      .join('|');
  // (?!_) cause 1.5x slowdown
  self.re.schema_test   = RegExp('(^|(?!_)(?:[><\uff5c]|' + re.src_ZPCc + '))(' + slist + ')', 'i');
  self.re.schema_search = RegExp('(^|(?!_)(?:[><\uff5c]|' + re.src_ZPCc + '))(' + slist + ')', 'ig');

  self.re.pretest = RegExp(
    '(' + self.re.schema_test.source + ')|(' + self.re.host_fuzzy_test.source + ')|@',
    'i'
  );

  //
  // Cleanup
  //

  resetScanCache(self);
}

/**
 * class Match
 *
 * Match result. Single element of array, returned by [[LinkifyIt#match]]
 **/
function Match(self, shift) {
  var start = self.__index__,
      end   = self.__last_index__,
      text  = self.__text_cache__.slice(start, end);

  /**
   * Match#schema -> String
   *
   * Prefix (protocol) for matched string.
   **/
  this.schema    = self.__schema__.toLowerCase();
  /**
   * Match#index -> Number
   *
   * First position of matched string.
   **/
  this.index     = start + shift;
  /**
   * Match#lastIndex -> Number
   *
   * Next position after matched string.
   **/
  this.lastIndex = end + shift;
  /**
   * Match#raw -> String
   *
   * Matched string.
   **/
  this.raw       = text;
  /**
   * Match#text -> String
   *
   * Notmalized text of matched string.
   **/
  this.text      = text;
  /**
   * Match#url -> String
   *
   * Normalized url of matched string.
   **/
  this.url       = text;
}

function createMatch(self, shift) {
  var match = new Match(self, shift);

  self.__compiled__[match.schema].normalize(match, self);

  return match;
}


/**
 * class LinkifyIt
 **/

/**
 * new LinkifyIt(schemas, options)
 * - schemas (Object): Optional. Additional schemas to validate (prefix/validator)
 * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
 *
 * Creates new linkifier instance with optional additional schemas.
 * Can be called without `new` keyword for convenience.
 *
 * By default understands:
 *
 * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
 * - "fuzzy" links and emails (example.com, foo@bar.com).
 *
 * `schemas` is an object, where each key/value describes protocol/rule:
 *
 * - __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
 *   for example). `linkify-it` makes shure that prefix is not preceeded with
 *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
 * - __value__ - rule to check tail after link prefix
 *   - _String_ - just alias to existing rule
 *   - _Object_
 *     - _validate_ - validator function (should return matched length on success),
 *       or `RegExp`.
 *     - _normalize_ - optional function to normalize text & url of matched result
 *       (for example, for @twitter mentions).
 *
 * `options`:
 *
 * - __fuzzyLink__ - recognige URL-s without `http(s):` prefix. Default `true`.
 * - __fuzzyIP__ - allow IPs in fuzzy links above. Can conflict with some texts
 *   like version numbers. Default `false`.
 * - __fuzzyEmail__ - recognize emails without `mailto:` prefix.
 *
 **/
function LinkifyIt(schemas, options) {
  if (!(this instanceof LinkifyIt)) {
    return new LinkifyIt(schemas, options);
  }

  if (!options) {
    if (isOptionsObj(schemas)) {
      options = schemas;
      schemas = {};
    }
  }

  this.__opts__           = assign({}, defaultOptions, options);

  // Cache last tested result. Used to skip repeating steps on next `match` call.
  this.__index__          = -1;
  this.__last_index__     = -1; // Next scan position
  this.__schema__         = '';
  this.__text_cache__     = '';

  this.__schemas__        = assign({}, defaultSchemas, schemas);
  this.__compiled__       = {};

  this.__tlds__           = tlds_default;
  this.__tlds_replaced__  = false;

  this.re = {};

  compile(this);
}


/** chainable
 * LinkifyIt#add(schema, definition)
 * - schema (String): rule name (fixed pattern prefix)
 * - definition (String|RegExp|Object): schema definition
 *
 * Add new rule definition. See constructor description for details.
 **/
LinkifyIt.prototype.add = function add(schema, definition) {
  this.__schemas__[schema] = definition;
  compile(this);
  return this;
};


/** chainable
 * LinkifyIt#set(options)
 * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
 *
 * Set recognition options for links without schema.
 **/
LinkifyIt.prototype.set = function set(options) {
  this.__opts__ = assign(this.__opts__, options);
  return this;
};


/**
 * LinkifyIt#test(text) -> Boolean
 *
 * Searches linkifiable pattern and returns `true` on success or `false` on fail.
 **/
LinkifyIt.prototype.test = function test(text) {
  // Reset scan cache
  this.__text_cache__ = text;
  this.__index__      = -1;

  if (!text.length) { return false; }

  var m, ml, me, len, shift, next, re, tld_pos, at_pos;

  // try to scan for link with schema - that's the most simple rule
  if (this.re.schema_test.test(text)) {
    re = this.re.schema_search;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      len = this.testSchemaAt(text, m[2], re.lastIndex);
      if (len) {
        this.__schema__     = m[2];
        this.__index__      = m.index + m[1].length;
        this.__last_index__ = m.index + m[0].length + len;
        break;
      }
    }
  }

  if (this.__opts__.fuzzyLink && this.__compiled__['http:']) {
    // guess schemaless links
    tld_pos = text.search(this.re.host_fuzzy_test);
    if (tld_pos >= 0) {
      // if tld is located after found link - no need to check fuzzy pattern
      if (this.__index__ < 0 || tld_pos < this.__index__) {
        if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) {

          shift = ml.index + ml[1].length;

          if (this.__index__ < 0 || shift < this.__index__) {
            this.__schema__     = '';
            this.__index__      = shift;
            this.__last_index__ = ml.index + ml[0].length;
          }
        }
      }
    }
  }

  if (this.__opts__.fuzzyEmail && this.__compiled__['mailto:']) {
    // guess schemaless emails
    at_pos = text.indexOf('@');
    if (at_pos >= 0) {
      // We can't skip this check, because this cases are possible:
      // 192.168.1.1@gmail.com, my.in@example.com
      if ((me = text.match(this.re.email_fuzzy)) !== null) {

        shift = me.index + me[1].length;
        next  = me.index + me[0].length;

        if (this.__index__ < 0 || shift < this.__index__ ||
            (shift === this.__index__ && next > this.__last_index__)) {
          this.__schema__     = 'mailto:';
          this.__index__      = shift;
          this.__last_index__ = next;
        }
      }
    }
  }

  return this.__index__ >= 0;
};


/**
 * LinkifyIt#pretest(text) -> Boolean
 *
 * Very quick check, that can give false positives. Returns true if link MAY BE
 * can exists. Can be used for speed optimization, when you need to check that
 * link NOT exists.
 **/
LinkifyIt.prototype.pretest = function pretest(text) {
  return this.re.pretest.test(text);
};


/**
 * LinkifyIt#testSchemaAt(text, name, position) -> Number
 * - text (String): text to scan
 * - name (String): rule (schema) name
 * - position (Number): text offset to check from
 *
 * Similar to [[LinkifyIt#test]] but checks only specific protocol tail exactly
 * at given position. Returns length of found pattern (0 on fail).
 **/
LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text, schema, pos) {
  // If not supported schema check requested - terminate
  if (!this.__compiled__[schema.toLowerCase()]) {
    return 0;
  }
  return this.__compiled__[schema.toLowerCase()].validate(text, pos, this);
};


/**
 * LinkifyIt#match(text) -> Array|null
 *
 * Returns array of found link descriptions or `null` on fail. We strongly
 * recommend to use [[LinkifyIt#test]] first, for best speed.
 *
 * ##### Result match description
 *
 * - __schema__ - link schema, can be empty for fuzzy links, or `//` for
 *   protocol-neutral  links.
 * - __index__ - offset of matched text
 * - __lastIndex__ - index of next char after mathch end
 * - __raw__ - matched text
 * - __text__ - normalized text
 * - __url__ - link, generated from matched text
 **/
LinkifyIt.prototype.match = function match(text) {
  var shift = 0, result = [];

  // Try to take previous element from cache, if .test() called before
  if (this.__index__ >= 0 && this.__text_cache__ === text) {
    result.push(createMatch(this, shift));
    shift = this.__last_index__;
  }

  // Cut head if cache was used
  var tail = shift ? text.slice(shift) : text;

  // Scan string until end reached
  while (this.test(tail)) {
    result.push(createMatch(this, shift));

    tail = tail.slice(this.__last_index__);
    shift += this.__last_index__;
  }

  if (result.length) {
    return result;
  }

  return null;
};


/** chainable
 * LinkifyIt#tlds(list [, keepOld]) -> this
 * - list (Array): list of tlds
 * - keepOld (Boolean): merge with current list if `true` (`false` by default)
 *
 * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
 * to avoid false positives. By default this algorythm used:
 *
 * - hostname with any 2-letter root zones are ok.
 * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
 *   are ok.
 * - encoded (`xn--...`) root zones are ok.
 *
 * If list is replaced, then exact match for 2-chars root zones will be checked.
 **/
LinkifyIt.prototype.tlds = function tlds(list, keepOld) {
  list = Array.isArray(list) ? list : [ list ];

  if (!keepOld) {
    this.__tlds__ = list.slice();
    this.__tlds_replaced__ = true;
    compile(this);
    return this;
  }

  this.__tlds__ = this.__tlds__.concat(list)
                                  .sort()
                                  .filter(function (el, idx, arr) {
                                    return el !== arr[idx - 1];
                                  })
                                  .reverse();

  compile(this);
  return this;
};

/**
 * LinkifyIt#normalize(match)
 *
 * Default normalizer (if schema does not define it's own).
 **/
LinkifyIt.prototype.normalize = function normalize(match) {

  // Do minimal possible changes by default. Need to collect feedback prior
  // to move forward https://github.com/markdown-it/linkify-it/issues/1

  if (!match.schema) { match.url = 'http://' + match.url; }

  if (match.schema === 'mailto:' && !/^mailto:/i.test(match.url)) {
    match.url = 'mailto:' + match.url;
  }
};


/**
 * LinkifyIt#onCompile()
 *
 * Override to modify basic RegExp-s.
 **/
LinkifyIt.prototype.onCompile = function onCompile() {
};


module.exports = LinkifyIt;


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports = function (opts) {
  var re = {};

  // Use direct extract instead of `regenerate` to reduse browserified size
  re.src_Any = __webpack_require__(62).source;
  re.src_Cc  = __webpack_require__(60).source;
  re.src_Z   = __webpack_require__(61).source;
  re.src_P   = __webpack_require__(37).source;

  // \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
  re.src_ZPCc = [ re.src_Z, re.src_P, re.src_Cc ].join('|');

  // \p{\Z\Cc} (white spaces + control)
  re.src_ZCc = [ re.src_Z, re.src_Cc ].join('|');

  // Experimental. List of chars, completely prohibited in links
  // because can separate it from other part of text
  var text_separators = '[><\uff5c]';

  // All possible word characters (everything without punctuation, spaces & controls)
  // Defined via punctuation & spaces to save space
  // Should be something like \p{\L\N\S\M} (\w but without `_`)
  re.src_pseudo_letter       = '(?:(?!' + text_separators + '|' + re.src_ZPCc + ')' + re.src_Any + ')';
  // The same as abothe but without [0-9]
  // var src_pseudo_letter_non_d = '(?:(?![0-9]|' + src_ZPCc + ')' + src_Any + ')';

  ////////////////////////////////////////////////////////////////////////////////

  re.src_ip4 =

    '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

  // Prohibit any of "@/[]()" in user/pass to avoid wrong domain fetch.
  re.src_auth    = '(?:(?:(?!' + re.src_ZCc + '|[@/\\[\\]()]).)+@)?';

  re.src_port =

    '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?';

  re.src_host_terminator =

    '(?=$|' + text_separators + '|' + re.src_ZPCc + ')(?!-|_|:\\d|\\.-|\\.(?!$|' + re.src_ZPCc + '))';

  re.src_path =

    '(?:' +
      '[/?#]' +
        '(?:' +
          '(?!' + re.src_ZCc + '|' + text_separators + '|[()[\\]{}.,"\'?!\\-]).|' +
          '\\[(?:(?!' + re.src_ZCc + '|\\]).)*\\]|' +
          '\\((?:(?!' + re.src_ZCc + '|[)]).)*\\)|' +
          '\\{(?:(?!' + re.src_ZCc + '|[}]).)*\\}|' +
          '\\"(?:(?!' + re.src_ZCc + '|["]).)+\\"|' +
          "\\'(?:(?!" + re.src_ZCc + "|[']).)+\\'|" +
          "\\'(?=" + re.src_pseudo_letter + '|[-]).|' +  // allow `I'm_king` if no pair found
          '\\.{2,4}[a-zA-Z0-9%/]|' + // github has ... in commit range links,
                                     // google has .... in links (issue #66)
                                     // Restrict to
                                     // - english
                                     // - percent-encoded
                                     // - parts of file path
                                     // until more examples found.
          '\\.(?!' + re.src_ZCc + '|[.]).|' +
          (opts && opts['---'] ?
            '\\-(?!--(?:[^-]|$))(?:-*)|' // `---` => long dash, terminate
            :
            '\\-+|'
          ) +
          '\\,(?!' + re.src_ZCc + ').|' +      // allow `,,,` in paths
          '\\!(?!' + re.src_ZCc + '|[!]).|' +
          '\\?(?!' + re.src_ZCc + '|[?]).' +
        ')+' +
      '|\\/' +
    ')?';

  // Allow anything in markdown spec, forbid quote (") at the first position
  // because emails enclosed in quotes are far more common
  re.src_email_name =

    '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*';

  re.src_xn =

    'xn--[a-z0-9\\-]{1,59}';

  // More to read about domain names
  // http://serverfault.com/questions/638260/

  re.src_domain_root =

    // Allow letters & digits (http://test1)
    '(?:' +
      re.src_xn +
      '|' +
      re.src_pseudo_letter + '{1,63}' +
    ')';

  re.src_domain =

    '(?:' +
      re.src_xn +
      '|' +
      '(?:' + re.src_pseudo_letter + ')' +
      '|' +
      '(?:' + re.src_pseudo_letter + '(?:-|' + re.src_pseudo_letter + '){0,61}' + re.src_pseudo_letter + ')' +
    ')';

  re.src_host =

    '(?:' +
    // Don't need IP check, because digits are already allowed in normal domain names
    //   src_ip4 +
    // '|' +
      '(?:(?:(?:' + re.src_domain + ')\\.)*' + re.src_domain/*_root*/ + ')' +
    ')';

  re.tpl_host_fuzzy =

    '(?:' +
      re.src_ip4 +
    '|' +
      '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))' +
    ')';

  re.tpl_host_no_ip_fuzzy =

    '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))';

  re.src_host_strict =

    re.src_host + re.src_host_terminator;

  re.tpl_host_fuzzy_strict =

    re.tpl_host_fuzzy + re.src_host_terminator;

  re.src_host_port_strict =

    re.src_host + re.src_port + re.src_host_terminator;

  re.tpl_host_port_fuzzy_strict =

    re.tpl_host_fuzzy + re.src_port + re.src_host_terminator;

  re.tpl_host_port_no_ip_fuzzy_strict =

    re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator;


  ////////////////////////////////////////////////////////////////////////////////
  // Main rules

  // Rude test fuzzy links by host, for quick deny
  re.tpl_host_fuzzy_test =

    'localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:' + re.src_ZPCc + '|>|$))';

  re.tpl_email_fuzzy =

      '(^|' + text_separators + '|"|\\(|' + re.src_ZCc + ')' +
      '(' + re.src_email_name + '@' + re.tpl_host_fuzzy_strict + ')';

  re.tpl_link_fuzzy =
      // Fuzzy link can't be prepended with .:/\- and non punctuation.
      // but can start with > (markdown blockquote)
      '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' +
      '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_fuzzy_strict + re.src_path + ')';

  re.tpl_link_no_ip_fuzzy =
      // Fuzzy link can't be prepended with .:/\- and non punctuation.
      // but can start with > (markdown blockquote)
      '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' +
      '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_no_ip_fuzzy_strict + re.src_path + ')';

  return re;
};


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Enclose abbreviations in <abbr> tags
//



module.exports = function sub_plugin(md) {
  var escapeRE        = md.utils.escapeRE,
      arrayReplaceAt  = md.utils.arrayReplaceAt;

  // ASCII characters in Cc, Sc, Sm, Sk categories we should terminate on;
  // you can check character classes here:
  // http://www.unicode.org/Public/UNIDATA/UnicodeData.txt
  var OTHER_CHARS      = ' \r\n$+<=>^`|~';

  var UNICODE_PUNCT_RE = md.utils.lib.ucmicro.P.source;
  var UNICODE_SPACE_RE = md.utils.lib.ucmicro.Z.source;


  function abbr_def(state, startLine, endLine, silent) {
    var label, title, ch, labelStart, labelEnd,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    if (pos + 2 >= max) { return false; }

    if (state.src.charCodeAt(pos++) !== 0x2A/* * */) { return false; }
    if (state.src.charCodeAt(pos++) !== 0x5B/* [ */) { return false; }

    labelStart = pos;

    for (; pos < max; pos++) {
      ch = state.src.charCodeAt(pos);
      if (ch === 0x5B /* [ */) {
        return false;
      } else if (ch === 0x5D /* ] */) {
        labelEnd = pos;
        break;
      } else if (ch === 0x5C /* \ */) {
        pos++;
      }
    }

    if (labelEnd < 0 || state.src.charCodeAt(labelEnd + 1) !== 0x3A/* : */) {
      return false;
    }

    if (silent) { return true; }

    label = state.src.slice(labelStart, labelEnd).replace(/\\(.)/g, '$1');
    title = state.src.slice(labelEnd + 2, max).trim();
    if (label.length === 0) { return false; }
    if (title.length === 0) { return false; }
    if (!state.env.abbreviations) { state.env.abbreviations = {}; }
    // prepend ':' to avoid conflict with Object.prototype members
    if (typeof state.env.abbreviations[':' + label] === 'undefined') {
      state.env.abbreviations[':' + label] = title;
    }

    state.line = startLine + 1;
    return true;
  }


  function abbr_replace(state) {
    var i, j, l, tokens, token, text, nodes, pos, reg, m, regText, regSimple,
        currentToken,
        blockTokens = state.tokens;

    if (!state.env.abbreviations) { return; }

    regSimple = new RegExp('(?:' +
      Object.keys(state.env.abbreviations).map(function (x) {
        return x.substr(1);
      }).sort(function (a, b) {
        return b.length - a.length;
      }).map(escapeRE).join('|') +
    ')');

    regText = '(^|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE +
                    '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])'
            + '(' + Object.keys(state.env.abbreviations).map(function (x) {
                      return x.substr(1);
                    }).sort(function (a, b) {
                      return b.length - a.length;
                    }).map(escapeRE).join('|') + ')'
            + '($|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE +
                    '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])';

    reg = new RegExp(regText, 'g');

    for (j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type !== 'inline') { continue; }
      tokens = blockTokens[j].children;

      // We scan from the end, to keep position when new tags added.
      for (i = tokens.length - 1; i >= 0; i--) {
        currentToken = tokens[i];
        if (currentToken.type !== 'text') { continue; }

        pos = 0;
        text = currentToken.content;
        reg.lastIndex = 0;
        nodes = [];

        // fast regexp run to determine whether there are any abbreviated words
        // in the current token
        if (!regSimple.test(text)) { continue; }

        while ((m = reg.exec(text))) {
          if (m.index > 0 || m[1].length > 0) {
            token         = new state.Token('text', '', 0);
            token.content = text.slice(pos, m.index + m[1].length);
            nodes.push(token);
          }

          token         = new state.Token('abbr_open', 'abbr', 1);
          token.attrs   = [ [ 'title', state.env.abbreviations[':' + m[2]] ] ];
          nodes.push(token);

          token         = new state.Token('text', '', 0);
          token.content = m[2];
          nodes.push(token);

          token         = new state.Token('abbr_close', 'abbr', -1);
          nodes.push(token);

          reg.lastIndex -= m[3].length;
          pos = reg.lastIndex;
        }

        if (!nodes.length) { continue; }

        if (pos < text.length) {
          token         = new state.Token('text', '', 0);
          token.content = text.slice(pos);
          nodes.push(token);
        }

        // replace current node
        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  }

  md.block.ruler.before('reference', 'abbr_def', abbr_def, { alt: [ 'paragraph', 'reference' ] });

  md.core.ruler.after('linkify', 'abbr_replace', abbr_replace);
};


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process block-level custom containers
//



module.exports = function container_plugin(md, name, options) {

  function validateDefault(params) {
    return params.trim().split(' ', 2)[0] === name;
  }

  function renderDefault(tokens, idx, _options, env, self) {

    // add a class to the opening tag
    if (tokens[idx].nesting === 1) {
      tokens[idx].attrPush([ 'class', name ]);
    }

    return self.renderToken(tokens, idx, _options, env, self);
  }

  options = options || {};

  var min_markers = 3,
      marker_str  = options.marker || ':',
      marker_char = marker_str.charCodeAt(0),
      marker_len  = marker_str.length,
      validate    = options.validate || validateDefault,
      render      = options.render || renderDefault;

  function container(state, startLine, endLine, silent) {
    var pos, nextLine, marker_count, markup, params, token,
        old_parent, old_line_max,
        auto_closed = false,
        start = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // Check out the first character quickly,
    // this should filter out most of non-containers
    //
    if (marker_char !== state.src.charCodeAt(start)) { return false; }

    // Check out the rest of the marker string
    //
    for (pos = start + 1; pos <= max; pos++) {
      if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
        break;
      }
    }

    marker_count = Math.floor((pos - start) / marker_len);
    if (marker_count < min_markers) { return false; }
    pos -= (pos - start) % marker_len;

    markup = state.src.slice(start, pos);
    params = state.src.slice(pos, max);
    if (!validate(params)) { return false; }

    // Since start is found, we can report success here in validation mode
    //
    if (silent) { return true; }

    // Search for the end of the block
    //
    nextLine = startLine;

    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }

      start = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (start < max && state.sCount[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        // - ```
        //  test
        break;
      }

      if (marker_char !== state.src.charCodeAt(start)) { continue; }

      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        // closing fence should be indented less than 4 spaces
        continue;
      }

      for (pos = start + 1; pos <= max; pos++) {
        if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
          break;
        }
      }

      // closing code fence must be at least as long as the opening one
      if (Math.floor((pos - start) / marker_len) < marker_count) { continue; }

      // make sure tail has spaces only
      pos -= (pos - start) % marker_len;
      pos = state.skipSpaces(pos);

      if (pos < max) { continue; }

      // found!
      auto_closed = true;
      break;
    }

    old_parent = state.parentType;
    old_line_max = state.lineMax;
    state.parentType = 'container';

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    token        = state.push('container_' + name + '_open', 'div', 1);
    token.markup = markup;
    token.block  = true;
    token.info   = params;
    token.map    = [ startLine, nextLine ];

    state.md.block.tokenize(state, startLine + 1, nextLine);

    token        = state.push('container_' + name + '_close', 'div', -1);
    token.markup = state.src.slice(start, pos);
    token.block  = true;

    state.parentType = old_parent;
    state.lineMax = old_line_max;
    state.line = nextLine + (auto_closed ? 1 : 0);

    return true;
  }

  md.block.ruler.before('fence', 'container_' + name, container, {
    alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
  });
  md.renderer.rules['container_' + name + '_open'] = render;
  md.renderer.rules['container_' + name + '_close'] = render;
};


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process definition lists
//



module.exports = function deflist_plugin(md) {
  var isSpace = md.utils.isSpace;

  // Search `[:~][\n ]`, returns next pos after marker on success
  // or -1 on fail.
  function skipMarker(state, line) {
    var pos, marker,
        start = state.bMarks[line] + state.tShift[line],
        max = state.eMarks[line];

    if (start >= max) { return -1; }

    // Check bullet
    marker = state.src.charCodeAt(start++);
    if (marker !== 0x7E/* ~ */ && marker !== 0x3A/* : */) { return -1; }

    pos = state.skipSpaces(start);

    // require space after ":"
    if (start === pos) { return -1; }

    // no empty definitions, e.g. "  : "
    if (pos >= max) { return -1; }

    return start;
  }

  function markTightParagraphs(state, idx) {
    var i, l,
        level = state.level + 2;

    for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
      if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
        state.tokens[i + 2].hidden = true;
        state.tokens[i].hidden = true;
        i += 2;
      }
    }
  }

  function deflist(state, startLine, endLine, silent) {
    var ch,
        contentStart,
        ddLine,
        dtLine,
        itemLines,
        listLines,
        listTokIdx,
        max,
        nextLine,
        offset,
        oldDDIndent,
        oldIndent,
        oldParentType,
        oldSCount,
        oldTShift,
        oldTight,
        pos,
        prevEmptyEnd,
        tight,
        token;

    if (silent) {
      // quirk: validation mode validates a dd block only, not a whole deflist
      if (state.ddIndent < 0) { return false; }
      return skipMarker(state, startLine) >= 0;
    }

    nextLine = startLine + 1;
    if (nextLine >= endLine) { return false; }

    if (state.isEmpty(nextLine)) {
      nextLine++;
      if (nextLine >= endLine) { return false; }
    }

    if (state.sCount[nextLine] < state.blkIndent) { return false; }
    contentStart = skipMarker(state, nextLine);
    if (contentStart < 0) { return false; }

    // Start list
    listTokIdx = state.tokens.length;
    tight = true;

    token     = state.push('dl_open', 'dl', 1);
    token.map = listLines = [ startLine, 0 ];

    //
    // Iterate list items
    //

    dtLine = startLine;
    ddLine = nextLine;

    // One definition list can contain multiple DTs,
    // and one DT can be followed by multiple DDs.
    //
    // Thus, there is two loops here, and label is
    // needed to break out of the second one
    //
    /*eslint no-labels:0,block-scoped-var:0*/
    OUTER:
    for (;;) {
      prevEmptyEnd = false;

      token          = state.push('dt_open', 'dt', 1);
      token.map      = [ dtLine, dtLine ];

      token          = state.push('inline', '', 0);
      token.map      = [ dtLine, dtLine ];
      token.content  = state.getLines(dtLine, dtLine + 1, state.blkIndent, false).trim();
      token.children = [];

      token          = state.push('dt_close', 'dt', -1);

      for (;;) {
        token     = state.push('dd_open', 'dd', 1);
        token.map = itemLines = [ nextLine, 0 ];

        pos = contentStart;
        max = state.eMarks[ddLine];
        offset = state.sCount[ddLine] + contentStart - (state.bMarks[ddLine] + state.tShift[ddLine]);

        while (pos < max) {
          ch = state.src.charCodeAt(pos);

          if (isSpace(ch)) {
            if (ch === 0x09) {
              offset += 4 - offset % 4;
            } else {
              offset++;
            }
          } else {
            break;
          }

          pos++;
        }

        contentStart = pos;

        oldTight = state.tight;
        oldDDIndent = state.ddIndent;
        oldIndent = state.blkIndent;
        oldTShift = state.tShift[ddLine];
        oldSCount = state.sCount[ddLine];
        oldParentType = state.parentType;
        state.blkIndent = state.ddIndent = state.sCount[ddLine] + 2;
        state.tShift[ddLine] = contentStart - state.bMarks[ddLine];
        state.sCount[ddLine] = offset;
        state.tight = true;
        state.parentType = 'deflist';

        state.md.block.tokenize(state, ddLine, endLine, true);

        // If any of list item is tight, mark list as tight
        if (!state.tight || prevEmptyEnd) {
          tight = false;
        }
        // Item become loose if finish with empty line,
        // but we should filter last element, because it means list finish
        prevEmptyEnd = (state.line - ddLine) > 1 && state.isEmpty(state.line - 1);

        state.tShift[ddLine] = oldTShift;
        state.sCount[ddLine] = oldSCount;
        state.tight = oldTight;
        state.parentType = oldParentType;
        state.blkIndent = oldIndent;
        state.ddIndent = oldDDIndent;

        token = state.push('dd_close', 'dd', -1);

        itemLines[1] = nextLine = state.line;

        if (nextLine >= endLine) { break OUTER; }

        if (state.sCount[nextLine] < state.blkIndent) { break OUTER; }
        contentStart = skipMarker(state, nextLine);
        if (contentStart < 0) { break; }

        ddLine = nextLine;

        // go to the next loop iteration:
        // insert DD tag and repeat checking
      }

      if (nextLine >= endLine) { break; }
      dtLine = nextLine;

      if (state.isEmpty(dtLine)) { break; }
      if (state.sCount[dtLine] < state.blkIndent) { break; }

      ddLine = dtLine + 1;
      if (ddLine >= endLine) { break; }
      if (state.isEmpty(ddLine)) { ddLine++; }
      if (ddLine >= endLine) { break; }

      if (state.sCount[ddLine] < state.blkIndent) { break; }
      contentStart = skipMarker(state, ddLine);
      if (contentStart < 0) { break; }

      // go to the next loop iteration:
      // insert DT and DD tags and repeat checking
    }

    // Finilize list
    token = state.push('dl_close', 'dl', -1);

    listLines[1] = nextLine;

    state.line = nextLine;

    // mark paragraphs tight if needed
    if (tight) {
      markTightParagraphs(state, listTokIdx);
    }

    return true;
  }


  md.block.ruler.before('paragraph', 'deflist', deflist, { alt: [ 'paragraph', 'reference' ] });
};


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var emojies_defs      = __webpack_require__(132);
var emojies_shortcuts = __webpack_require__(133);
var emoji_html        = __webpack_require__(135);
var emoji_replace     = __webpack_require__(136);
var normalize_opts    = __webpack_require__(134);


module.exports = function emoji_plugin(md, options) {
  var defaults = {
    defs: emojies_defs,
    shortcuts: emojies_shortcuts,
    enabled: []
  };

  var opts = normalize_opts(md.utils.assign({}, defaults, options || {}));

  md.renderer.rules.emoji = emoji_html;

  md.core.ruler.push('emoji', emoji_replace(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE));
};


/***/ }),
/* 132 */
/***/ (function(module, exports) {

module.exports = {"100":"💯","1234":"🔢","grinning":"😀","smiley":"😃","smile":"😄","grin":"😁","laughing":"😆","satisfied":"😆","sweat_smile":"😅","joy":"😂","rofl":"🤣","relaxed":"☺️","blush":"😊","innocent":"😇","slightly_smiling_face":"🙂","upside_down_face":"🙃","wink":"😉","relieved":"😌","heart_eyes":"😍","kissing_heart":"😘","kissing":"😗","kissing_smiling_eyes":"😙","kissing_closed_eyes":"😚","yum":"😋","stuck_out_tongue_winking_eye":"😜","stuck_out_tongue_closed_eyes":"😝","stuck_out_tongue":"😛","money_mouth_face":"🤑","hugs":"🤗","nerd_face":"🤓","sunglasses":"😎","clown_face":"🤡","cowboy_hat_face":"🤠","smirk":"😏","unamused":"😒","disappointed":"😞","pensive":"😔","worried":"😟","confused":"😕","slightly_frowning_face":"🙁","frowning_face":"☹️","persevere":"😣","confounded":"😖","tired_face":"😫","weary":"😩","triumph":"😤","angry":"😠","rage":"😡","pout":"😡","no_mouth":"😶","neutral_face":"😐","expressionless":"😑","hushed":"😯","frowning":"😦","anguished":"😧","open_mouth":"😮","astonished":"😲","dizzy_face":"😵","flushed":"😳","scream":"😱","fearful":"😨","cold_sweat":"😰","cry":"😢","disappointed_relieved":"😥","drooling_face":"🤤","sob":"😭","sweat":"😓","sleepy":"😪","sleeping":"😴","roll_eyes":"🙄","thinking":"🤔","lying_face":"🤥","grimacing":"😬","zipper_mouth_face":"🤐","nauseated_face":"🤢","sneezing_face":"🤧","mask":"😷","face_with_thermometer":"🤒","face_with_head_bandage":"🤕","smiling_imp":"😈","imp":"👿","japanese_ogre":"👹","japanese_goblin":"👺","hankey":"💩","poop":"💩","shit":"💩","ghost":"👻","skull":"💀","skull_and_crossbones":"☠️","alien":"👽","space_invader":"👾","robot":"🤖","jack_o_lantern":"🎃","smiley_cat":"😺","smile_cat":"😸","joy_cat":"😹","heart_eyes_cat":"😻","smirk_cat":"😼","kissing_cat":"😽","scream_cat":"🙀","crying_cat_face":"😿","pouting_cat":"😾","open_hands":"👐","raised_hands":"🙌","clap":"👏","pray":"🙏","handshake":"🤝","+1":"👍","thumbsup":"👍","-1":"👎","thumbsdown":"👎","fist_oncoming":"👊","facepunch":"👊","punch":"👊","fist_raised":"✊","fist":"✊","fist_left":"🤛","fist_right":"🤜","crossed_fingers":"🤞","v":"✌️","metal":"🤘","ok_hand":"👌","point_left":"👈","point_right":"👉","point_up_2":"👆","point_down":"👇","point_up":"☝️","hand":"✋","raised_hand":"✋","raised_back_of_hand":"🤚","raised_hand_with_fingers_splayed":"🖐","vulcan_salute":"🖖","wave":"👋","call_me_hand":"🤙","muscle":"💪","middle_finger":"🖕","fu":"🖕","writing_hand":"✍️","selfie":"🤳","nail_care":"💅","ring":"💍","lipstick":"💄","kiss":"💋","lips":"👄","tongue":"👅","ear":"👂","nose":"👃","footprints":"👣","eye":"👁","eyes":"👀","speaking_head":"🗣","bust_in_silhouette":"👤","busts_in_silhouette":"👥","baby":"👶","boy":"👦","girl":"👧","man":"👨","woman":"👩","blonde_woman":"👱‍♀","blonde_man":"👱","person_with_blond_hair":"👱","older_man":"👴","older_woman":"👵","man_with_gua_pi_mao":"👲","woman_with_turban":"👳‍♀","man_with_turban":"👳","policewoman":"👮‍♀","policeman":"👮","cop":"👮","construction_worker_woman":"👷‍♀","construction_worker_man":"👷","construction_worker":"👷","guardswoman":"💂‍♀","guardsman":"💂","female_detective":"🕵️‍♀️","male_detective":"🕵","detective":"🕵","woman_health_worker":"👩‍⚕","man_health_worker":"👨‍⚕","woman_farmer":"👩‍🌾","man_farmer":"👨‍🌾","woman_cook":"👩‍🍳","man_cook":"👨‍🍳","woman_student":"👩‍🎓","man_student":"👨‍🎓","woman_singer":"👩‍🎤","man_singer":"👨‍🎤","woman_teacher":"👩‍🏫","man_teacher":"👨‍🏫","woman_factory_worker":"👩‍🏭","man_factory_worker":"👨‍🏭","woman_technologist":"👩‍💻","man_technologist":"👨‍💻","woman_office_worker":"👩‍💼","man_office_worker":"👨‍💼","woman_mechanic":"👩‍🔧","man_mechanic":"👨‍🔧","woman_scientist":"👩‍🔬","man_scientist":"👨‍🔬","woman_artist":"👩‍🎨","man_artist":"👨‍🎨","woman_firefighter":"👩‍🚒","man_firefighter":"👨‍🚒","woman_pilot":"👩‍✈","man_pilot":"👨‍✈","woman_astronaut":"👩‍🚀","man_astronaut":"👨‍🚀","woman_judge":"👩‍⚖","man_judge":"👨‍⚖","mrs_claus":"🤶","santa":"🎅","princess":"👸","prince":"🤴","bride_with_veil":"👰","man_in_tuxedo":"🤵","angel":"👼","pregnant_woman":"🤰","bowing_woman":"🙇‍♀","bowing_man":"🙇","bow":"🙇","tipping_hand_woman":"💁","information_desk_person":"💁","sassy_woman":"💁","tipping_hand_man":"💁‍♂","sassy_man":"💁‍♂","no_good_woman":"🙅","no_good":"🙅","ng_woman":"🙅","no_good_man":"🙅‍♂","ng_man":"🙅‍♂","ok_woman":"🙆","ok_man":"🙆‍♂","raising_hand_woman":"🙋","raising_hand":"🙋","raising_hand_man":"🙋‍♂","woman_facepalming":"🤦‍♀","man_facepalming":"🤦‍♂","woman_shrugging":"🤷‍♀","man_shrugging":"🤷‍♂","pouting_woman":"🙎","person_with_pouting_face":"🙎","pouting_man":"🙎‍♂","frowning_woman":"🙍","person_frowning":"🙍","frowning_man":"🙍‍♂","haircut_woman":"💇","haircut":"💇","haircut_man":"💇‍♂","massage_woman":"💆","massage":"💆","massage_man":"💆‍♂","business_suit_levitating":"🕴","dancer":"💃","man_dancing":"🕺","dancing_women":"👯","dancers":"👯","dancing_men":"👯‍♂","walking_woman":"🚶‍♀","walking_man":"🚶","walking":"🚶","running_woman":"🏃‍♀","running_man":"🏃","runner":"🏃","running":"🏃","couple":"👫","two_women_holding_hands":"👭","two_men_holding_hands":"👬","couple_with_heart_woman_man":"💑","couple_with_heart":"💑","couple_with_heart_woman_woman":"👩‍❤️‍👩","couple_with_heart_man_man":"👨‍❤️‍👨","couplekiss_man_woman":"💏","couplekiss_woman_woman":"👩‍❤️‍💋‍👩","couplekiss_man_man":"👨‍❤️‍💋‍👨","family_man_woman_boy":"👪","family":"👪","family_man_woman_girl":"👨‍👩‍👧","family_man_woman_girl_boy":"👨‍👩‍👧‍👦","family_man_woman_boy_boy":"👨‍👩‍👦‍👦","family_man_woman_girl_girl":"👨‍👩‍👧‍👧","family_woman_woman_boy":"👩‍👩‍👦","family_woman_woman_girl":"👩‍👩‍👧","family_woman_woman_girl_boy":"👩‍👩‍👧‍👦","family_woman_woman_boy_boy":"👩‍👩‍👦‍👦","family_woman_woman_girl_girl":"👩‍👩‍👧‍👧","family_man_man_boy":"👨‍👨‍👦","family_man_man_girl":"👨‍👨‍👧","family_man_man_girl_boy":"👨‍👨‍👧‍👦","family_man_man_boy_boy":"👨‍👨‍👦‍👦","family_man_man_girl_girl":"👨‍👨‍👧‍👧","family_woman_boy":"👩‍👦","family_woman_girl":"👩‍👧","family_woman_girl_boy":"👩‍👧‍👦","family_woman_boy_boy":"👩‍👦‍👦","family_woman_girl_girl":"👩‍👧‍👧","family_man_boy":"👨‍👦","family_man_girl":"👨‍👧","family_man_girl_boy":"👨‍👧‍👦","family_man_boy_boy":"👨‍👦‍👦","family_man_girl_girl":"👨‍👧‍👧","womans_clothes":"👚","shirt":"👕","tshirt":"👕","jeans":"👖","necktie":"👔","dress":"👗","bikini":"👙","kimono":"👘","high_heel":"👠","sandal":"👡","boot":"👢","mans_shoe":"👞","shoe":"👞","athletic_shoe":"👟","womans_hat":"👒","tophat":"🎩","mortar_board":"🎓","crown":"👑","rescue_worker_helmet":"⛑","school_satchel":"🎒","pouch":"👝","purse":"👛","handbag":"👜","briefcase":"💼","eyeglasses":"👓","dark_sunglasses":"🕶","closed_umbrella":"🌂","open_umbrella":"☂️","dog":"🐶","cat":"🐱","mouse":"🐭","hamster":"🐹","rabbit":"🐰","fox_face":"🦊","bear":"🐻","panda_face":"🐼","koala":"🐨","tiger":"🐯","lion":"🦁","cow":"🐮","pig":"🐷","pig_nose":"🐽","frog":"🐸","monkey_face":"🐵","see_no_evil":"🙈","hear_no_evil":"🙉","speak_no_evil":"🙊","monkey":"🐒","chicken":"🐔","penguin":"🐧","bird":"🐦","baby_chick":"🐤","hatching_chick":"🐣","hatched_chick":"🐥","duck":"🦆","eagle":"🦅","owl":"🦉","bat":"🦇","wolf":"🐺","boar":"🐗","horse":"🐴","unicorn":"🦄","bee":"🐝","honeybee":"🐝","bug":"🐛","butterfly":"🦋","snail":"🐌","shell":"🐚","beetle":"🐞","ant":"🐜","spider":"🕷","spider_web":"🕸","turtle":"🐢","snake":"🐍","lizard":"🦎","scorpion":"🦂","crab":"🦀","squid":"🦑","octopus":"🐙","shrimp":"🦐","tropical_fish":"🐠","fish":"🐟","blowfish":"🐡","dolphin":"🐬","flipper":"🐬","shark":"🦈","whale":"🐳","whale2":"🐋","crocodile":"🐊","leopard":"🐆","tiger2":"🐅","water_buffalo":"🐃","ox":"🐂","cow2":"🐄","deer":"🦌","dromedary_camel":"🐪","camel":"🐫","elephant":"🐘","rhinoceros":"🦏","gorilla":"🦍","racehorse":"🐎","pig2":"🐖","goat":"🐐","ram":"🐏","sheep":"🐑","dog2":"🐕","poodle":"🐩","cat2":"🐈","rooster":"🐓","turkey":"🦃","dove":"🕊","rabbit2":"🐇","mouse2":"🐁","rat":"🐀","chipmunk":"🐿","feet":"🐾","paw_prints":"🐾","dragon":"🐉","dragon_face":"🐲","cactus":"🌵","christmas_tree":"🎄","evergreen_tree":"🌲","deciduous_tree":"🌳","palm_tree":"🌴","seedling":"🌱","herb":"🌿","shamrock":"☘️","four_leaf_clover":"🍀","bamboo":"🎍","tanabata_tree":"🎋","leaves":"🍃","fallen_leaf":"🍂","maple_leaf":"🍁","mushroom":"🍄","ear_of_rice":"🌾","bouquet":"💐","tulip":"🌷","rose":"🌹","wilted_flower":"🥀","sunflower":"🌻","blossom":"🌼","cherry_blossom":"🌸","hibiscus":"🌺","earth_americas":"🌎","earth_africa":"🌍","earth_asia":"🌏","full_moon":"🌕","waning_gibbous_moon":"🌖","last_quarter_moon":"🌗","waning_crescent_moon":"🌘","new_moon":"🌑","waxing_crescent_moon":"🌒","first_quarter_moon":"🌓","moon":"🌔","waxing_gibbous_moon":"🌔","new_moon_with_face":"🌚","full_moon_with_face":"🌝","sun_with_face":"🌞","first_quarter_moon_with_face":"🌛","last_quarter_moon_with_face":"🌜","crescent_moon":"🌙","dizzy":"💫","star":"⭐️","star2":"🌟","sparkles":"✨","zap":"⚡️","fire":"🔥","boom":"💥","collision":"💥","comet":"☄","sunny":"☀️","sun_behind_small_cloud":"🌤","partly_sunny":"⛅️","sun_behind_large_cloud":"🌥","sun_behind_rain_cloud":"🌦","rainbow":"🌈","cloud":"☁️","cloud_with_rain":"🌧","cloud_with_lightning_and_rain":"⛈","cloud_with_lightning":"🌩","cloud_with_snow":"🌨","snowman_with_snow":"☃️","snowman":"⛄️","snowflake":"❄️","wind_face":"🌬","dash":"💨","tornado":"🌪","fog":"🌫","ocean":"🌊","droplet":"💧","sweat_drops":"💦","umbrella":"☔️","green_apple":"🍏","apple":"🍎","pear":"🍐","tangerine":"🍊","orange":"🍊","mandarin":"🍊","lemon":"🍋","banana":"🍌","watermelon":"🍉","grapes":"🍇","strawberry":"🍓","melon":"🍈","cherries":"🍒","peach":"🍑","pineapple":"🍍","kiwi_fruit":"🥝","avocado":"🥑","tomato":"🍅","eggplant":"🍆","cucumber":"🥒","carrot":"🥕","corn":"🌽","hot_pepper":"🌶","potato":"🥔","sweet_potato":"🍠","chestnut":"🌰","peanuts":"🥜","honey_pot":"🍯","croissant":"🥐","bread":"🍞","baguette_bread":"🥖","cheese":"🧀","egg":"🥚","fried_egg":"🍳","bacon":"🥓","pancakes":"🥞","fried_shrimp":"🍤","poultry_leg":"🍗","meat_on_bone":"🍖","pizza":"🍕","hotdog":"🌭","hamburger":"🍔","fries":"🍟","stuffed_flatbread":"🥙","taco":"🌮","burrito":"🌯","green_salad":"🥗","shallow_pan_of_food":"🥘","spaghetti":"🍝","ramen":"🍜","stew":"🍲","fish_cake":"🍥","sushi":"🍣","bento":"🍱","curry":"🍛","rice":"🍚","rice_ball":"🍙","rice_cracker":"🍘","oden":"🍢","dango":"🍡","shaved_ice":"🍧","ice_cream":"🍨","icecream":"🍦","cake":"🍰","birthday":"🎂","custard":"🍮","lollipop":"🍭","candy":"🍬","chocolate_bar":"🍫","popcorn":"🍿","doughnut":"🍩","cookie":"🍪","milk_glass":"🥛","baby_bottle":"🍼","coffee":"☕️","tea":"🍵","sake":"🍶","beer":"🍺","beers":"🍻","clinking_glasses":"🥂","wine_glass":"🍷","tumbler_glass":"🥃","cocktail":"🍸","tropical_drink":"🍹","champagne":"🍾","spoon":"🥄","fork_and_knife":"🍴","plate_with_cutlery":"🍽","soccer":"⚽️","basketball":"🏀","football":"🏈","baseball":"⚾️","tennis":"🎾","volleyball":"🏐","rugby_football":"🏉","8ball":"🎱","ping_pong":"🏓","badminton":"🏸","goal_net":"🥅","ice_hockey":"🏒","field_hockey":"🏑","cricket":"🏏","golf":"⛳️","bow_and_arrow":"🏹","fishing_pole_and_fish":"🎣","boxing_glove":"🥊","martial_arts_uniform":"🥋","ice_skate":"⛸","ski":"🎿","skier":"⛷","snowboarder":"🏂","weight_lifting_woman":"🏋️‍♀️","weight_lifting_man":"🏋","person_fencing":"🤺","women_wrestling":"🤼‍♀","men_wrestling":"🤼‍♂","woman_cartwheeling":"🤸‍♀","man_cartwheeling":"🤸‍♂","basketball_woman":"⛹️‍♀️","basketball_man":"⛹","woman_playing_handball":"🤾‍♀","man_playing_handball":"🤾‍♂","golfing_woman":"🏌️‍♀️","golfing_man":"🏌","surfing_woman":"🏄‍♀","surfing_man":"🏄","surfer":"🏄","swimming_woman":"🏊‍♀","swimming_man":"🏊","swimmer":"🏊","woman_playing_water_polo":"🤽‍♀","man_playing_water_polo":"🤽‍♂","rowing_woman":"🚣‍♀","rowing_man":"🚣","rowboat":"🚣","horse_racing":"🏇","biking_woman":"🚴‍♀","biking_man":"🚴","bicyclist":"🚴","mountain_biking_woman":"🚵‍♀","mountain_biking_man":"🚵","mountain_bicyclist":"🚵","running_shirt_with_sash":"🎽","medal_sports":"🏅","medal_military":"🎖","1st_place_medal":"🥇","2nd_place_medal":"🥈","3rd_place_medal":"🥉","trophy":"🏆","rosette":"🏵","reminder_ribbon":"🎗","ticket":"🎫","tickets":"🎟","circus_tent":"🎪","woman_juggling":"🤹‍♀","man_juggling":"🤹‍♂","performing_arts":"🎭","art":"🎨","clapper":"🎬","microphone":"🎤","headphones":"🎧","musical_score":"🎼","musical_keyboard":"🎹","drum":"🥁","saxophone":"🎷","trumpet":"🎺","guitar":"🎸","violin":"🎻","game_die":"🎲","dart":"🎯","bowling":"🎳","video_game":"🎮","slot_machine":"🎰","car":"🚗","red_car":"🚗","taxi":"🚕","blue_car":"🚙","bus":"🚌","trolleybus":"🚎","racing_car":"🏎","police_car":"🚓","ambulance":"🚑","fire_engine":"🚒","minibus":"🚐","truck":"🚚","articulated_lorry":"🚛","tractor":"🚜","kick_scooter":"🛴","bike":"🚲","motor_scooter":"🛵","motorcycle":"🏍","rotating_light":"🚨","oncoming_police_car":"🚔","oncoming_bus":"🚍","oncoming_automobile":"🚘","oncoming_taxi":"🚖","aerial_tramway":"🚡","mountain_cableway":"🚠","suspension_railway":"🚟","railway_car":"🚃","train":"🚋","mountain_railway":"🚞","monorail":"🚝","bullettrain_side":"🚄","bullettrain_front":"🚅","light_rail":"🚈","steam_locomotive":"🚂","train2":"🚆","metro":"🚇","tram":"🚊","station":"🚉","helicopter":"🚁","small_airplane":"🛩","airplane":"✈️","flight_departure":"🛫","flight_arrival":"🛬","rocket":"🚀","artificial_satellite":"🛰","seat":"💺","canoe":"🛶","boat":"⛵️","sailboat":"⛵️","motor_boat":"🛥","speedboat":"🚤","passenger_ship":"🛳","ferry":"⛴","ship":"🚢","anchor":"⚓️","construction":"🚧","fuelpump":"⛽️","busstop":"🚏","vertical_traffic_light":"🚦","traffic_light":"🚥","world_map":"🗺","moyai":"🗿","statue_of_liberty":"🗽","fountain":"⛲️","tokyo_tower":"🗼","european_castle":"🏰","japanese_castle":"🏯","stadium":"🏟","ferris_wheel":"🎡","roller_coaster":"🎢","carousel_horse":"🎠","parasol_on_ground":"⛱","beach_umbrella":"🏖","desert_island":"🏝","mountain":"⛰","mountain_snow":"🏔","mount_fuji":"🗻","volcano":"🌋","desert":"🏜","camping":"🏕","tent":"⛺️","railway_track":"🛤","motorway":"🛣","building_construction":"🏗","factory":"🏭","house":"🏠","house_with_garden":"🏡","houses":"🏘","derelict_house":"🏚","office":"🏢","department_store":"🏬","post_office":"🏣","european_post_office":"🏤","hospital":"🏥","bank":"🏦","hotel":"🏨","convenience_store":"🏪","school":"🏫","love_hotel":"🏩","wedding":"💒","classical_building":"🏛","church":"⛪️","mosque":"🕌","synagogue":"🕍","kaaba":"🕋","shinto_shrine":"⛩","japan":"🗾","rice_scene":"🎑","national_park":"🏞","sunrise":"🌅","sunrise_over_mountains":"🌄","stars":"🌠","sparkler":"🎇","fireworks":"🎆","city_sunrise":"🌇","city_sunset":"🌆","cityscape":"🏙","night_with_stars":"🌃","milky_way":"🌌","bridge_at_night":"🌉","foggy":"🌁","watch":"⌚️","iphone":"📱","calling":"📲","computer":"💻","keyboard":"⌨️","desktop_computer":"🖥","printer":"🖨","computer_mouse":"🖱","trackball":"🖲","joystick":"🕹","clamp":"🗜","minidisc":"💽","floppy_disk":"💾","cd":"💿","dvd":"📀","vhs":"📼","camera":"📷","camera_flash":"📸","video_camera":"📹","movie_camera":"🎥","film_projector":"📽","film_strip":"🎞","telephone_receiver":"📞","phone":"☎️","telephone":"☎️","pager":"📟","fax":"📠","tv":"📺","radio":"📻","studio_microphone":"🎙","level_slider":"🎚","control_knobs":"🎛","stopwatch":"⏱","timer_clock":"⏲","alarm_clock":"⏰","mantelpiece_clock":"🕰","hourglass":"⌛️","hourglass_flowing_sand":"⏳","satellite":"📡","battery":"🔋","electric_plug":"🔌","bulb":"💡","flashlight":"🔦","candle":"🕯","wastebasket":"🗑","oil_drum":"🛢","money_with_wings":"💸","dollar":"💵","yen":"💴","euro":"💶","pound":"💷","moneybag":"💰","credit_card":"💳","gem":"💎","balance_scale":"⚖️","wrench":"🔧","hammer":"🔨","hammer_and_pick":"⚒","hammer_and_wrench":"🛠","pick":"⛏","nut_and_bolt":"🔩","gear":"⚙️","chains":"⛓","gun":"🔫","bomb":"💣","hocho":"🔪","knife":"🔪","dagger":"🗡","crossed_swords":"⚔️","shield":"🛡","smoking":"🚬","coffin":"⚰️","funeral_urn":"⚱️","amphora":"🏺","crystal_ball":"🔮","prayer_beads":"📿","barber":"💈","alembic":"⚗️","telescope":"🔭","microscope":"🔬","hole":"🕳","pill":"💊","syringe":"💉","thermometer":"🌡","toilet":"🚽","potable_water":"🚰","shower":"🚿","bathtub":"🛁","bath":"🛀","bellhop_bell":"🛎","key":"🔑","old_key":"🗝","door":"🚪","couch_and_lamp":"🛋","bed":"🛏","sleeping_bed":"🛌","framed_picture":"🖼","shopping":"🛍","shopping_cart":"🛒","gift":"🎁","balloon":"🎈","flags":"🎏","ribbon":"🎀","confetti_ball":"🎊","tada":"🎉","dolls":"🎎","izakaya_lantern":"🏮","lantern":"🏮","wind_chime":"🎐","email":"✉️","envelope":"✉️","envelope_with_arrow":"📩","incoming_envelope":"📨","e-mail":"📧","love_letter":"💌","inbox_tray":"📥","outbox_tray":"📤","package":"📦","label":"🏷","mailbox_closed":"📪","mailbox":"📫","mailbox_with_mail":"📬","mailbox_with_no_mail":"📭","postbox":"📮","postal_horn":"📯","scroll":"📜","page_with_curl":"📃","page_facing_up":"📄","bookmark_tabs":"📑","bar_chart":"📊","chart_with_upwards_trend":"📈","chart_with_downwards_trend":"📉","spiral_notepad":"🗒","spiral_calendar":"🗓","calendar":"📆","date":"📅","card_index":"📇","card_file_box":"🗃","ballot_box":"🗳","file_cabinet":"🗄","clipboard":"📋","file_folder":"📁","open_file_folder":"📂","card_index_dividers":"🗂","newspaper_roll":"🗞","newspaper":"📰","notebook":"📓","notebook_with_decorative_cover":"📔","ledger":"📒","closed_book":"📕","green_book":"📗","blue_book":"📘","orange_book":"📙","books":"📚","book":"📖","open_book":"📖","bookmark":"🔖","link":"🔗","paperclip":"📎","paperclips":"🖇","triangular_ruler":"📐","straight_ruler":"📏","pushpin":"📌","round_pushpin":"📍","scissors":"✂️","pen":"🖊","fountain_pen":"🖋","black_nib":"✒️","paintbrush":"🖌","crayon":"🖍","memo":"📝","pencil":"📝","pencil2":"✏️","mag":"🔍","mag_right":"🔎","lock_with_ink_pen":"🔏","closed_lock_with_key":"🔐","lock":"🔒","unlock":"🔓","heart":"❤️","yellow_heart":"💛","green_heart":"💚","blue_heart":"💙","purple_heart":"💜","black_heart":"🖤","broken_heart":"💔","heavy_heart_exclamation":"❣️","two_hearts":"💕","revolving_hearts":"💞","heartbeat":"💓","heartpulse":"💗","sparkling_heart":"💖","cupid":"💘","gift_heart":"💝","heart_decoration":"💟","peace_symbol":"☮️","latin_cross":"✝️","star_and_crescent":"☪️","om":"🕉","wheel_of_dharma":"☸️","star_of_david":"✡️","six_pointed_star":"🔯","menorah":"🕎","yin_yang":"☯️","orthodox_cross":"☦️","place_of_worship":"🛐","ophiuchus":"⛎","aries":"♈️","taurus":"♉️","gemini":"♊️","cancer":"♋️","leo":"♌️","virgo":"♍️","libra":"♎️","scorpius":"♏️","sagittarius":"♐️","capricorn":"♑️","aquarius":"♒️","pisces":"♓️","id":"🆔","atom_symbol":"⚛️","accept":"🉑","radioactive":"☢️","biohazard":"☣️","mobile_phone_off":"📴","vibration_mode":"📳","eight_pointed_black_star":"✴️","vs":"🆚","white_flower":"💮","ideograph_advantage":"🉐","secret":"㊙️","congratulations":"㊗️","u6e80":"🈵","a":"🅰️","b":"🅱️","ab":"🆎","cl":"🆑","o2":"🅾️","sos":"🆘","x":"❌","o":"⭕️","stop_sign":"🛑","no_entry":"⛔️","name_badge":"📛","no_entry_sign":"🚫","anger":"💢","hotsprings":"♨️","no_pedestrians":"🚷","do_not_litter":"🚯","no_bicycles":"🚳","non-potable_water":"🚱","underage":"🔞","no_mobile_phones":"📵","no_smoking":"🚭","exclamation":"❗️","heavy_exclamation_mark":"❗️","grey_exclamation":"❕","question":"❓","grey_question":"❔","bangbang":"‼️","interrobang":"⁉️","low_brightness":"🔅","high_brightness":"🔆","part_alternation_mark":"〽️","warning":"⚠️","children_crossing":"🚸","trident":"🔱","fleur_de_lis":"⚜️","beginner":"🔰","recycle":"♻️","white_check_mark":"✅","chart":"💹","sparkle":"❇️","eight_spoked_asterisk":"✳️","negative_squared_cross_mark":"❎","globe_with_meridians":"🌐","diamond_shape_with_a_dot_inside":"💠","m":"Ⓜ️","cyclone":"🌀","zzz":"💤","atm":"🏧","wc":"🚾","wheelchair":"♿️","parking":"🅿️","sa":"🈂️","passport_control":"🛂","customs":"🛃","baggage_claim":"🛄","left_luggage":"🛅","mens":"🚹","womens":"🚺","baby_symbol":"🚼","restroom":"🚻","put_litter_in_its_place":"🚮","cinema":"🎦","signal_strength":"📶","koko":"🈁","symbols":"🔣","information_source":"ℹ️","abc":"🔤","abcd":"🔡","capital_abcd":"🔠","ng":"🆖","ok":"🆗","up":"🆙","cool":"🆒","new":"🆕","free":"🆓","zero":"0️⃣","one":"1️⃣","two":"2️⃣","three":"3️⃣","four":"4️⃣","five":"5️⃣","six":"6️⃣","seven":"7️⃣","eight":"8️⃣","nine":"9️⃣","keycap_ten":"🔟","hash":"#️⃣","asterisk":"*️⃣","arrow_forward":"▶️","pause_button":"⏸","play_or_pause_button":"⏯","stop_button":"⏹","record_button":"⏺","next_track_button":"⏭","previous_track_button":"⏮","fast_forward":"⏩","rewind":"⏪","arrow_double_up":"⏫","arrow_double_down":"⏬","arrow_backward":"◀️","arrow_up_small":"🔼","arrow_down_small":"🔽","arrow_right":"➡️","arrow_left":"⬅️","arrow_up":"⬆️","arrow_down":"⬇️","arrow_upper_right":"↗️","arrow_lower_right":"↘️","arrow_lower_left":"↙️","arrow_upper_left":"↖️","arrow_up_down":"↕️","left_right_arrow":"↔️","arrow_right_hook":"↪️","leftwards_arrow_with_hook":"↩️","arrow_heading_up":"⤴️","arrow_heading_down":"⤵️","twisted_rightwards_arrows":"🔀","repeat":"🔁","repeat_one":"🔂","arrows_counterclockwise":"🔄","arrows_clockwise":"🔃","musical_note":"🎵","notes":"🎶","heavy_plus_sign":"➕","heavy_minus_sign":"➖","heavy_division_sign":"➗","heavy_multiplication_x":"✖️","heavy_dollar_sign":"💲","currency_exchange":"💱","tm":"™️","copyright":"©️","registered":"®️","wavy_dash":"〰️","curly_loop":"➰","loop":"➿","end":"🔚","back":"🔙","on":"🔛","top":"🔝","soon":"🔜","heavy_check_mark":"✔️","ballot_box_with_check":"☑️","radio_button":"🔘","white_circle":"⚪️","black_circle":"⚫️","red_circle":"🔴","large_blue_circle":"🔵","small_red_triangle":"🔺","small_red_triangle_down":"🔻","small_orange_diamond":"🔸","small_blue_diamond":"🔹","large_orange_diamond":"🔶","large_blue_diamond":"🔷","white_square_button":"🔳","black_square_button":"🔲","black_small_square":"▪️","white_small_square":"▫️","black_medium_small_square":"◾️","white_medium_small_square":"◽️","black_medium_square":"◼️","white_medium_square":"◻️","black_large_square":"⬛️","white_large_square":"⬜️","speaker":"🔈","mute":"🔇","sound":"🔉","loud_sound":"🔊","bell":"🔔","no_bell":"🔕","mega":"📣","loudspeaker":"📢","eye_speech_bubble":"👁‍🗨","speech_balloon":"💬","thought_balloon":"💭","right_anger_bubble":"🗯","spades":"♠️","clubs":"♣️","hearts":"♥️","diamonds":"♦️","black_joker":"🃏","flower_playing_cards":"🎴","mahjong":"🀄️","clock1":"🕐","clock2":"🕑","clock3":"🕒","clock4":"🕓","clock5":"🕔","clock6":"🕕","clock7":"🕖","clock8":"🕗","clock9":"🕘","clock10":"🕙","clock11":"🕚","clock12":"🕛","clock130":"🕜","clock230":"🕝","clock330":"🕞","clock430":"🕟","clock530":"🕠","clock630":"🕡","clock730":"🕢","clock830":"🕣","clock930":"🕤","clock1030":"🕥","clock1130":"🕦","clock1230":"🕧","white_flag":"🏳️","black_flag":"🏴","checkered_flag":"🏁","triangular_flag_on_post":"🚩","rainbow_flag":"🏳️‍🌈","afghanistan":"🇦🇫","aland_islands":"🇦🇽","albania":"🇦🇱","algeria":"🇩🇿","american_samoa":"🇦🇸","andorra":"🇦🇩","angola":"🇦🇴","anguilla":"🇦🇮","antarctica":"🇦🇶","antigua_barbuda":"🇦🇬","argentina":"🇦🇷","armenia":"🇦🇲","aruba":"🇦🇼","australia":"🇦🇺","austria":"🇦🇹","azerbaijan":"🇦🇿","bahamas":"🇧🇸","bahrain":"🇧🇭","bangladesh":"🇧🇩","barbados":"🇧🇧","belarus":"🇧🇾","belgium":"🇧🇪","belize":"🇧🇿","benin":"🇧🇯","bermuda":"🇧🇲","bhutan":"🇧🇹","bolivia":"🇧🇴","caribbean_netherlands":"🇧🇶","bosnia_herzegovina":"🇧🇦","botswana":"🇧🇼","brazil":"🇧🇷","british_indian_ocean_territory":"🇮🇴","british_virgin_islands":"🇻🇬","brunei":"🇧🇳","bulgaria":"🇧🇬","burkina_faso":"🇧🇫","burundi":"🇧🇮","cape_verde":"🇨🇻","cambodia":"🇰🇭","cameroon":"🇨🇲","canada":"🇨🇦","canary_islands":"🇮🇨","cayman_islands":"🇰🇾","central_african_republic":"🇨🇫","chad":"🇹🇩","chile":"🇨🇱","cn":"🇨🇳","christmas_island":"🇨🇽","cocos_islands":"🇨🇨","colombia":"🇨🇴","comoros":"🇰🇲","congo_brazzaville":"🇨🇬","congo_kinshasa":"🇨🇩","cook_islands":"🇨🇰","costa_rica":"🇨🇷","cote_divoire":"🇨🇮","croatia":"🇭🇷","cuba":"🇨🇺","curacao":"🇨🇼","cyprus":"🇨🇾","czech_republic":"🇨🇿","denmark":"🇩🇰","djibouti":"🇩🇯","dominica":"🇩🇲","dominican_republic":"🇩🇴","ecuador":"🇪🇨","egypt":"🇪🇬","el_salvador":"🇸🇻","equatorial_guinea":"🇬🇶","eritrea":"🇪🇷","estonia":"🇪🇪","ethiopia":"🇪🇹","eu":"🇪🇺","european_union":"🇪🇺","falkland_islands":"🇫🇰","faroe_islands":"🇫🇴","fiji":"🇫🇯","finland":"🇫🇮","fr":"🇫🇷","french_guiana":"🇬🇫","french_polynesia":"🇵🇫","french_southern_territories":"🇹🇫","gabon":"🇬🇦","gambia":"🇬🇲","georgia":"🇬🇪","de":"🇩🇪","ghana":"🇬🇭","gibraltar":"🇬🇮","greece":"🇬🇷","greenland":"🇬🇱","grenada":"🇬🇩","guadeloupe":"🇬🇵","guam":"🇬🇺","guatemala":"🇬🇹","guernsey":"🇬🇬","guinea":"🇬🇳","guinea_bissau":"🇬🇼","guyana":"🇬🇾","haiti":"🇭🇹","honduras":"🇭🇳","hong_kong":"🇭🇰","hungary":"🇭🇺","iceland":"🇮🇸","india":"🇮🇳","indonesia":"🇮🇩","iran":"🇮🇷","iraq":"🇮🇶","ireland":"🇮🇪","isle_of_man":"🇮🇲","israel":"🇮🇱","it":"🇮🇹","jamaica":"🇯🇲","jp":"🇯🇵","crossed_flags":"🎌","jersey":"🇯🇪","jordan":"🇯🇴","kazakhstan":"🇰🇿","kenya":"🇰🇪","kiribati":"🇰🇮","kosovo":"🇽🇰","kuwait":"🇰🇼","kyrgyzstan":"🇰🇬","laos":"🇱🇦","latvia":"🇱🇻","lebanon":"🇱🇧","lesotho":"🇱🇸","liberia":"🇱🇷","libya":"🇱🇾","liechtenstein":"🇱🇮","lithuania":"🇱🇹","luxembourg":"🇱🇺","macau":"🇲🇴","macedonia":"🇲🇰","madagascar":"🇲🇬","malawi":"🇲🇼","malaysia":"🇲🇾","maldives":"🇲🇻","mali":"🇲🇱","malta":"🇲🇹","marshall_islands":"🇲🇭","martinique":"🇲🇶","mauritania":"🇲🇷","mauritius":"🇲🇺","mayotte":"🇾🇹","mexico":"🇲🇽","micronesia":"🇫🇲","moldova":"🇲🇩","monaco":"🇲🇨","mongolia":"🇲🇳","montenegro":"🇲🇪","montserrat":"🇲🇸","morocco":"🇲🇦","mozambique":"🇲🇿","myanmar":"🇲🇲","namibia":"🇳🇦","nauru":"🇳🇷","nepal":"🇳🇵","netherlands":"🇳🇱","new_caledonia":"🇳🇨","new_zealand":"🇳🇿","nicaragua":"🇳🇮","niger":"🇳🇪","nigeria":"🇳🇬","niue":"🇳🇺","norfolk_island":"🇳🇫","northern_mariana_islands":"🇲🇵","north_korea":"🇰🇵","norway":"🇳🇴","oman":"🇴🇲","pakistan":"🇵🇰","palau":"🇵🇼","palestinian_territories":"🇵🇸","panama":"🇵🇦","papua_new_guinea":"🇵🇬","paraguay":"🇵🇾","peru":"🇵🇪","philippines":"🇵🇭","pitcairn_islands":"🇵🇳","poland":"🇵🇱","portugal":"🇵🇹","puerto_rico":"🇵🇷","qatar":"🇶🇦","reunion":"🇷🇪","romania":"🇷🇴","ru":"🇷🇺","rwanda":"🇷🇼","st_barthelemy":"🇧🇱","st_helena":"🇸🇭","st_kitts_nevis":"🇰🇳","st_lucia":"🇱🇨","st_pierre_miquelon":"🇵🇲","st_vincent_grenadines":"🇻🇨","samoa":"🇼🇸","san_marino":"🇸🇲","sao_tome_principe":"🇸🇹","saudi_arabia":"🇸🇦","senegal":"🇸🇳","serbia":"🇷🇸","seychelles":"🇸🇨","sierra_leone":"🇸🇱","singapore":"🇸🇬","sint_maarten":"🇸🇽","slovakia":"🇸🇰","slovenia":"🇸🇮","solomon_islands":"🇸🇧","somalia":"🇸🇴","south_africa":"🇿🇦","south_georgia_south_sandwich_islands":"🇬🇸","kr":"🇰🇷","south_sudan":"🇸🇸","es":"🇪🇸","sri_lanka":"🇱🇰","sudan":"🇸🇩","suriname":"🇸🇷","swaziland":"🇸🇿","sweden":"🇸🇪","switzerland":"🇨🇭","syria":"🇸🇾","taiwan":"🇹🇼","tajikistan":"🇹🇯","tanzania":"🇹🇿","thailand":"🇹🇭","timor_leste":"🇹🇱","togo":"🇹🇬","tokelau":"🇹🇰","tonga":"🇹🇴","trinidad_tobago":"🇹🇹","tunisia":"🇹🇳","tr":"🇹🇷","turkmenistan":"🇹🇲","turks_caicos_islands":"🇹🇨","tuvalu":"🇹🇻","uganda":"🇺🇬","ukraine":"🇺🇦","united_arab_emirates":"🇦🇪","gb":"🇬🇧","uk":"🇬🇧","us":"🇺🇸","us_virgin_islands":"🇻🇮","uruguay":"🇺🇾","uzbekistan":"🇺🇿","vanuatu":"🇻🇺","vatican_city":"🇻🇦","venezuela":"🇻🇪","vietnam":"🇻🇳","wallis_futuna":"🇼🇫","western_sahara":"🇪🇭","yemen":"🇾🇪","zambia":"🇿🇲","zimbabwe":"🇿🇼"}

/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Emoticons -> Emoji mapping.
//
// (!) Some patterns skipped, to avoid collisions
// without increase matcher complicity. Than can change in future.
//
// Places to look for more emoticons info:
//
// - http://en.wikipedia.org/wiki/List_of_emoticons#Western
// - https://github.com/wooorm/emoticon/blob/master/Support.md
// - http://factoryjoe.com/projects/emoticons/
//


module.exports = {
  angry:            [ '>:(', '>:-(' ],
  blush:            [ ':")', ':-")' ],
  broken_heart:     [ '</3', '<\\3' ],
  // :\ and :-\ not used because of conflict with markdown escaping
  confused:         [ ':/', ':-/' ], // twemoji shows question
  cry:              [ ":'(", ":'-(", ':,(', ':,-(' ],
  frowning:         [ ':(', ':-(' ],
  heart:            [ '<3' ],
  imp:              [ ']:(', ']:-(' ],
  innocent:         [ 'o:)', 'O:)', 'o:-)', 'O:-)', '0:)', '0:-)' ],
  joy:              [ ":')", ":'-)", ':,)', ':,-)', ":'D", ":'-D", ':,D', ':,-D' ],
  kissing:          [ ':*', ':-*' ],
  laughing:         [ 'x-)', 'X-)' ],
  neutral_face:     [ ':|', ':-|' ],
  open_mouth:       [ ':o', ':-o', ':O', ':-O' ],
  rage:             [ ':@', ':-@' ],
  smile:            [ ':D', ':-D' ],
  smiley:           [ ':)', ':-)' ],
  smiling_imp:      [ ']:)', ']:-)' ],
  sob:              [ ":,'(", ":,'-(", ';(', ';-(' ],
  stuck_out_tongue: [ ':P', ':-P' ],
  sunglasses:       [ '8-)', 'B-)' ],
  sweat:            [ ',:(', ',:-(' ],
  sweat_smile:      [ ',:)', ',:-)' ],
  unamused:         [ ':s', ':-S', ':z', ':-Z', ':$', ':-$' ],
  wink:             [ ';)', ';-)' ]
};


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Convert input options to more useable format
// and compile search regexp




function quoteRE(str) {
  return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
}


module.exports = function normalize_opts(options) {
  var emojies = options.defs,
      shortcuts;

  // Filter emojies by whitelist, if needed
  if (options.enabled.length) {
    emojies = Object.keys(emojies).reduce(function (acc, key) {
      if (options.enabled.indexOf(key) >= 0) {
        acc[key] = emojies[key];
      }
      return acc;
    }, {});
  }

  // Flatten shortcuts to simple object: { alias: emoji_name }
  shortcuts = Object.keys(options.shortcuts).reduce(function (acc, key) {
    // Skip aliases for filtered emojies, to reduce regexp
    if (!emojies[key]) { return acc; }

    if (Array.isArray(options.shortcuts[key])) {
      options.shortcuts[key].forEach(function (alias) {
        acc[alias] = key;
      });
      return acc;
    }

    acc[options.shortcuts[key]] = key;
    return acc;
  }, {});

  // Compile regexp
  var names = Object.keys(emojies)
                .map(function (name) { return ':' + name + ':'; })
                .concat(Object.keys(shortcuts))
                .sort()
                .reverse()
                .map(function (name) { return quoteRE(name); })
                .join('|');
  var scanRE = RegExp(names);
  var replaceRE = RegExp(names, 'g');

  return {
    defs: emojies,
    shortcuts: shortcuts,
    scanRE: scanRE,
    replaceRE: replaceRE
  };
};


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function emoji_html(tokens, idx /*, options, env */) {
  return tokens[idx].content;
};


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Emojies & shortcuts replacement logic.
//
// Note: In theory, it could be faster to parse :smile: in inline chain and
// leave only shortcuts here. But, who care...
//




module.exports = function create_rule(md, emojies, shortcuts, scanRE, replaceRE) {
  var arrayReplaceAt = md.utils.arrayReplaceAt,
      ucm = md.utils.lib.ucmicro,
      ZPCc = new RegExp([ ucm.Z.source, ucm.P.source, ucm.Cc.source ].join('|'));

  function splitTextToken(text, level, Token) {
    var token, last_pos = 0, nodes = [];

    text.replace(replaceRE, function (match, offset, src) {
      var emoji_name;
      // Validate emoji name
      if (shortcuts.hasOwnProperty(match)) {
        // replace shortcut with full name
        emoji_name = shortcuts[match];

        // Don't allow letters before any shortcut (as in no ":/" in http://)
        if (offset > 0 && !ZPCc.test(src[offset - 1])) {
          return;
        }

        // Don't allow letters after any shortcut
        if (offset + match.length < src.length && !ZPCc.test(src[offset + match.length])) {
          return;
        }
      } else {
        emoji_name = match.slice(1, -1);
      }

      // Add new tokens to pending list
      if (offset > last_pos) {
        token         = new Token('text', '', 0);
        token.content = text.slice(last_pos, offset);
        nodes.push(token);
      }

      token         = new Token('emoji', '', 0);
      token.markup  = emoji_name;
      token.content = emojies[emoji_name];
      nodes.push(token);

      last_pos = offset + match.length;
    });

    if (last_pos < text.length) {
      token         = new Token('text', '', 0);
      token.content = text.slice(last_pos);
      nodes.push(token);
    }

    return nodes;
  }

  return function emoji_replace(state) {
    var i, j, l, tokens, token,
        blockTokens = state.tokens,
        autolinkLevel = 0;

    for (j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type !== 'inline') { continue; }
      tokens = blockTokens[j].children;

      // We scan from the end, to keep position when new tags added.
      // Use reversed logic in links start/end match
      for (i = tokens.length - 1; i >= 0; i--) {
        token = tokens[i];

        if (token.type === 'link_open' || token.type === 'link_close') {
          if (token.info === 'auto') { autolinkLevel -= token.nesting; }
        }

        if (token.type === 'text' && autolinkLevel === 0 && scanRE.test(token.content)) {
          // replace current node
          blockTokens[j].children = tokens = arrayReplaceAt(
            tokens, i, splitTextToken(token.content, token.level, state.Token)
          );
        }
      }
    }
  };
};


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process footnotes
//


////////////////////////////////////////////////////////////////////////////////
// Renderer partials

function render_footnote_anchor_name(tokens, idx, options, env/*, slf*/) {
  var n = Number(tokens[idx].meta.id + 1).toString();
  var prefix = '';

  if (typeof env.docId === 'string') {
    prefix = '-' + env.docId + '-';
  }

  return prefix + n;
}

function render_footnote_caption(tokens, idx/*, options, env, slf*/) {
  var n = Number(tokens[idx].meta.id + 1).toString();

  if (tokens[idx].meta.subId > 0) {
    n += ':' + tokens[idx].meta.subId;
  }

  return '[' + n + ']';
}

function render_footnote_ref(tokens, idx, options, env, slf) {
  var id      = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
  var caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
  var refid   = id;

  if (tokens[idx].meta.subId > 0) {
    refid += ':' + tokens[idx].meta.subId;
  }

  return '<sup class="footnote-ref"><a href="#fn' + id + '" id="fnref' + refid + '">' + caption + '</a></sup>';
}

function render_footnote_block_open(tokens, idx, options) {
  return (options.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n') +
         '<section class="footnotes">\n' +
         '<ol class="footnotes-list">\n';
}

function render_footnote_block_close() {
  return '</ol>\n</section>\n';
}

function render_footnote_open(tokens, idx, options, env, slf) {
  var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

  if (tokens[idx].meta.subId > 0) {
    id += ':' + tokens[idx].meta.subId;
  }

  return '<li id="fn' + id + '" class="footnote-item">';
}

function render_footnote_close() {
  return '</li>\n';
}

function render_footnote_anchor(tokens, idx, options, env, slf) {
  var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

  if (tokens[idx].meta.subId > 0) {
    id += ':' + tokens[idx].meta.subId;
  }

  /* ↩ with escape code to prevent display as Apple Emoji on iOS */
  return ' <a href="#fnref' + id + '" class="footnote-backref">\u21a9\uFE0E</a>';
}


module.exports = function footnote_plugin(md) {
  var parseLinkLabel = md.helpers.parseLinkLabel,
      isSpace = md.utils.isSpace;

  md.renderer.rules.footnote_ref          = render_footnote_ref;
  md.renderer.rules.footnote_block_open   = render_footnote_block_open;
  md.renderer.rules.footnote_block_close  = render_footnote_block_close;
  md.renderer.rules.footnote_open         = render_footnote_open;
  md.renderer.rules.footnote_close        = render_footnote_close;
  md.renderer.rules.footnote_anchor       = render_footnote_anchor;

  // helpers (only used in other rules, no tokens are attached to those)
  md.renderer.rules.footnote_caption      = render_footnote_caption;
  md.renderer.rules.footnote_anchor_name  = render_footnote_anchor_name;

  // Process footnote block definition
  function footnote_def(state, startLine, endLine, silent) {
    var oldBMark, oldTShift, oldSCount, oldParentType, pos, label, token,
        initial, offset, ch, posAfterColon,
        start = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    // line should be at least 5 chars - "[^x]:"
    if (start + 4 > max) { return false; }

    if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false; }
    if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false; }

    for (pos = start + 2; pos < max; pos++) {
      if (state.src.charCodeAt(pos) === 0x20) { return false; }
      if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
        break;
      }
    }

    if (pos === start + 2) { return false; } // no empty footnote labels
    if (pos + 1 >= max || state.src.charCodeAt(++pos) !== 0x3A /* : */) { return false; }
    if (silent) { return true; }
    pos++;

    if (!state.env.footnotes) { state.env.footnotes = {}; }
    if (!state.env.footnotes.refs) { state.env.footnotes.refs = {}; }
    label = state.src.slice(start + 2, pos - 2);
    state.env.footnotes.refs[':' + label] = -1;

    token       = new state.Token('footnote_reference_open', '', 1);
    token.meta  = { label: label };
    token.level = state.level++;
    state.tokens.push(token);

    oldBMark = state.bMarks[startLine];
    oldTShift = state.tShift[startLine];
    oldSCount = state.sCount[startLine];
    oldParentType = state.parentType;

    posAfterColon = pos;
    initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

    while (pos < max) {
      ch = state.src.charCodeAt(pos);

      if (isSpace(ch)) {
        if (ch === 0x09) {
          offset += 4 - offset % 4;
        } else {
          offset++;
        }
      } else {
        break;
      }

      pos++;
    }

    state.tShift[startLine] = pos - posAfterColon;
    state.sCount[startLine] = offset - initial;

    state.bMarks[startLine] = posAfterColon;
    state.blkIndent += 4;
    state.parentType = 'footnote';

    if (state.sCount[startLine] < state.blkIndent) {
      state.sCount[startLine] += state.blkIndent;
    }

    state.md.block.tokenize(state, startLine, endLine, true);

    state.parentType = oldParentType;
    state.blkIndent -= 4;
    state.tShift[startLine] = oldTShift;
    state.sCount[startLine] = oldSCount;
    state.bMarks[startLine] = oldBMark;

    token       = new state.Token('footnote_reference_close', '', -1);
    token.level = --state.level;
    state.tokens.push(token);

    return true;
  }

  // Process inline footnotes (^[...])
  function footnote_inline(state, silent) {
    var labelStart,
        labelEnd,
        footnoteId,
        token,
        tokens,
        max = state.posMax,
        start = state.pos;

    if (start + 2 >= max) { return false; }
    if (state.src.charCodeAt(start) !== 0x5E/* ^ */) { return false; }
    if (state.src.charCodeAt(start + 1) !== 0x5B/* [ */) { return false; }

    labelStart = start + 2;
    labelEnd = parseLinkLabel(state, start + 1);

    // parser failed to find ']', so it's not a valid note
    if (labelEnd < 0) { return false; }

    // We found the end of the link, and know for a fact it's a valid link;
    // so all that's left to do is to call tokenizer.
    //
    if (!silent) {
      if (!state.env.footnotes) { state.env.footnotes = {}; }
      if (!state.env.footnotes.list) { state.env.footnotes.list = []; }
      footnoteId = state.env.footnotes.list.length;

      state.md.inline.parse(
        state.src.slice(labelStart, labelEnd),
        state.md,
        state.env,
        tokens = []
      );

      token      = state.push('footnote_ref', '', 0);
      token.meta = { id: footnoteId };

      state.env.footnotes.list[footnoteId] = {
        content: state.src.slice(labelStart, labelEnd),
        tokens: tokens
      };
    }

    state.pos = labelEnd + 1;
    state.posMax = max;
    return true;
  }

  // Process footnote references ([^...])
  function footnote_ref(state, silent) {
    var label,
        pos,
        footnoteId,
        footnoteSubId,
        token,
        max = state.posMax,
        start = state.pos;

    // should be at least 4 chars - "[^x]"
    if (start + 3 > max) { return false; }

    if (!state.env.footnotes || !state.env.footnotes.refs) { return false; }
    if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false; }
    if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false; }

    for (pos = start + 2; pos < max; pos++) {
      if (state.src.charCodeAt(pos) === 0x20) { return false; }
      if (state.src.charCodeAt(pos) === 0x0A) { return false; }
      if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
        break;
      }
    }

    if (pos === start + 2) { return false; } // no empty footnote labels
    if (pos >= max) { return false; }
    pos++;

    label = state.src.slice(start + 2, pos - 1);
    if (typeof state.env.footnotes.refs[':' + label] === 'undefined') { return false; }

    if (!silent) {
      if (!state.env.footnotes.list) { state.env.footnotes.list = []; }

      if (state.env.footnotes.refs[':' + label] < 0) {
        footnoteId = state.env.footnotes.list.length;
        state.env.footnotes.list[footnoteId] = { label: label, count: 0 };
        state.env.footnotes.refs[':' + label] = footnoteId;
      } else {
        footnoteId = state.env.footnotes.refs[':' + label];
      }

      footnoteSubId = state.env.footnotes.list[footnoteId].count;
      state.env.footnotes.list[footnoteId].count++;

      token      = state.push('footnote_ref', '', 0);
      token.meta = { id: footnoteId, subId: footnoteSubId, label: label };
    }

    state.pos = pos;
    state.posMax = max;
    return true;
  }

  // Glue footnote tokens to end of token stream
  function footnote_tail(state) {
    var i, l, j, t, lastParagraph, list, token, tokens, current, currentLabel,
        insideRef = false,
        refTokens = {};

    if (!state.env.footnotes) { return; }

    state.tokens = state.tokens.filter(function (tok) {
      if (tok.type === 'footnote_reference_open') {
        insideRef = true;
        current = [];
        currentLabel = tok.meta.label;
        return false;
      }
      if (tok.type === 'footnote_reference_close') {
        insideRef = false;
        // prepend ':' to avoid conflict with Object.prototype members
        refTokens[':' + currentLabel] = current;
        return false;
      }
      if (insideRef) { current.push(tok); }
      return !insideRef;
    });

    if (!state.env.footnotes.list) { return; }
    list = state.env.footnotes.list;

    token = new state.Token('footnote_block_open', '', 1);
    state.tokens.push(token);

    for (i = 0, l = list.length; i < l; i++) {
      token      = new state.Token('footnote_open', '', 1);
      token.meta = { id: i, label: list[i].label };
      state.tokens.push(token);

      if (list[i].tokens) {
        tokens = [];

        token          = new state.Token('paragraph_open', 'p', 1);
        token.block    = true;
        tokens.push(token);

        token          = new state.Token('inline', '', 0);
        token.children = list[i].tokens;
        token.content  = list[i].content;
        tokens.push(token);

        token          = new state.Token('paragraph_close', 'p', -1);
        token.block    = true;
        tokens.push(token);

      } else if (list[i].label) {
        tokens = refTokens[':' + list[i].label];
      }

      state.tokens = state.tokens.concat(tokens);
      if (state.tokens[state.tokens.length - 1].type === 'paragraph_close') {
        lastParagraph = state.tokens.pop();
      } else {
        lastParagraph = null;
      }

      t = list[i].count > 0 ? list[i].count : 1;
      for (j = 0; j < t; j++) {
        token      = new state.Token('footnote_anchor', '', 0);
        token.meta = { id: i, subId: j, label: list[i].label };
        state.tokens.push(token);
      }

      if (lastParagraph) {
        state.tokens.push(lastParagraph);
      }

      token = new state.Token('footnote_close', '', -1);
      state.tokens.push(token);
    }

    token = new state.Token('footnote_block_close', '', -1);
    state.tokens.push(token);
  }

  md.block.ruler.before('reference', 'footnote_def', footnote_def, { alt: [ 'paragraph', 'reference' ] });
  md.inline.ruler.after('image', 'footnote_inline', footnote_inline);
  md.inline.ruler.after('footnote_inline', 'footnote_ref', footnote_ref);
  md.core.ruler.after('inline', 'footnote_tail', footnote_tail);
};


/***/ }),
/* 138 */
/***/ (function(module, exports) {

/**
 * @Author: HuaChao Chen <CHC>
 * @Date:   2017-11-28T01:01:47+08:00
 * @Email:  chenhuachaoxyz@gmail.com
 * @Filename: highlight.js
 * @Last modified by:   chenhuachao
 * @Last modified time: 2017-12-12T21:48:52+08:00
 * @License: MIT
 * @Copyright: 2017
 */

var hljs = function(md, opts) {
    opts = opts || { };
    if (opts.highlighted === void (0)) {
        opts.highlighted = true;
    }
    if (opts.hljs === void (0)) {
        opts.hljs = 'auto';
    }
    if (typeof opts.langCheck !== 'function') {
        opts.langCheck = function() { };
    }
    md.options.highlight = function(code, lang) {
        var hljs = opts.hljs;
        if (opts.hljs === 'auto') hljs = window.hljs;
        if (opts.highlighted && lang && hljs) {
            if (hljs.getLanguage(lang)) {
                return '<pre><div class="hljs"><code class="' + md.options.langPrefix + lang + '">' + hljs.highlight(lang, code, true).value + '</code></div></pre>';
            } else {
                if (typeof opts.langCheck === 'function') {
                    opts.langCheck(lang);
                }
            }
        }
        return '<pre><code class="' + md.options.langPrefix + lang + '">' + md.utils.escapeHtml(code) + '</code></pre>';
    }
}
module.exports = hljs;


/***/ }),
/* 139 */
/***/ (function(module, exports) {

/**
 * @Author: HuaChao Chen <chc>
 * @Date:   2017-06-12T21:06:58+08:00
 * @Email:  chenhuachaoxyz@gmail.com
 * @Filename: index.js
 * @Last modified by:   chc
 * @Last modified time: 2017-06-12T21:18:15+08:00
 * @License: MIT
 * @Copyright: 2017
 */

module.exports = function(md, config){
    md.image_add = function(src, data){
        if(!(md.__image instanceof Object))
            md.__image = {}
        md.__image[src] = data;
    }
    md.image_del = function(src){
        if(!(md.__image instanceof Object))
            md.__image = {}
        delete md.__image[src];
    }
    var imagedefault = md.renderer.rules.image;
    md.renderer.rules.image = function(tokens, idx, options, env, slf){
        var _attrs = tokens[idx].attrs;
        if(md.__image instanceof Object){
            for(var i = 0;i < _attrs.length;i++){
                if(_attrs[i][0] == 'src' && md.__image.hasOwnProperty(tokens[idx].attrs[i][1])){
                    _attrs.push(['rel', _attrs[i][1]]);
                    _attrs[i][1] = md.__image[tokens[idx].attrs[i][1]]
                    break;
                }
            }
        }
        return imagedefault(tokens, idx, options, env, slf);
    }
}


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports = function ins_plugin(md) {
  // Insert each marker as a separate text token, and add it to delimiter list
  //
  function tokenize(state, silent) {
    var i, scanned, token, len, ch,
        start = state.pos,
        marker = state.src.charCodeAt(start);

    if (silent) { return false; }

    if (marker !== 0x2B/* + */) { return false; }

    scanned = state.scanDelims(state.pos, true);
    len = scanned.length;
    ch = String.fromCharCode(marker);

    if (len < 2) { return false; }

    if (len % 2) {
      token         = state.push('text', '', 0);
      token.content = ch;
      len--;
    }

    for (i = 0; i < len; i += 2) {
      token         = state.push('text', '', 0);
      token.content = ch + ch;

      state.delimiters.push({
        marker: marker,
        jump:   i,
        token:  state.tokens.length - 1,
        level:  state.level,
        end:    -1,
        open:   scanned.can_open,
        close:  scanned.can_close
      });
    }

    state.pos += scanned.length;

    return true;
  }


  // Walk through delimiter list and replace text tokens with tags
  //
  function postProcess(state) {
    var i, j,
        startDelim,
        endDelim,
        token,
        loneMarkers = [],
        delimiters = state.delimiters,
        max = state.delimiters.length;

    for (i = 0; i < max; i++) {
      startDelim = delimiters[i];

      if (startDelim.marker !== 0x2B/* + */) {
        continue;
      }

      if (startDelim.end === -1) {
        continue;
      }

      endDelim = delimiters[startDelim.end];

      token         = state.tokens[startDelim.token];
      token.type    = 'ins_open';
      token.tag     = 'ins';
      token.nesting = 1;
      token.markup  = '++';
      token.content = '';

      token         = state.tokens[endDelim.token];
      token.type    = 'ins_close';
      token.tag     = 'ins';
      token.nesting = -1;
      token.markup  = '++';
      token.content = '';

      if (state.tokens[endDelim.token - 1].type === 'text' &&
          state.tokens[endDelim.token - 1].content === '+') {

        loneMarkers.push(endDelim.token - 1);
      }
    }

    // If a marker sequence has an odd number of characters, it's splitted
    // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
    // start of the sequence.
    //
    // So, we have to move all those markers after subsequent s_close tags.
    //
    while (loneMarkers.length) {
      i = loneMarkers.pop();
      j = i + 1;

      while (j < state.tokens.length && state.tokens[j].type === 'ins_close') {
        j++;
      }

      j--;

      if (i !== j) {
        token = state.tokens[j];
        state.tokens[j] = state.tokens[i];
        state.tokens[i] = token;
      }
    }
  }

  md.inline.ruler.before('emphasis', 'ins', tokenize);
  md.inline.ruler2.before('emphasis', 'ins', postProcess);
};


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * @Author: chenhuachao <chc>
 * @Date:   2017-11-26T15:57:48+08:00
 * @Email:  chenhuachaoxyz@gmail.com
 * @Filename: index.js
 * @Last modified by:   chc
 * @Last modified time: 2017-11-26T16:00:49+08:00
 * @License: MIT
 * @Copyright: 2017
 */
/**
 * This is fork from https://github.com/waylonflinn/markdown-it-katex and support for external_link.
 */
/* Process inline math */
/*
Like markdown-it-simplemath, this is a stripped down, simplified version of:
https://github.com/runarberg/markdown-it-math

It differs in that it takes (a subset of) LaTeX as input and relies on KaTeX
for rendering output.
*/

/*jslint node: true */


var katex = null;

// Test if potential opening or closing delimieter
// Assumes that there is a "$" at state.src[pos]
function isValidDelim(state, pos) {
    var prevChar, nextChar,
        max = state.posMax,
        can_open = true,
        can_close = true;

    prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
    nextChar = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1;

    // Check non-whitespace conditions for opening and closing, and
    // check that closing delimeter isn't followed by a number
    if (prevChar === 0x20/* " " */ || prevChar === 0x09/* \t */ ||
            (nextChar >= 0x30/* "0" */ && nextChar <= 0x39/* "9" */)) {
        can_close = false;
    }
    if (nextChar === 0x20/* " " */ || nextChar === 0x09/* \t */) {
        can_open = false;
    }

    return {
        can_open: can_open,
        can_close: can_close
    };
}

function math_inline(state, silent) {
    if (!katex && window.katex) katex = window.katex;
    if (!katex) return false;
    var start, match, token, res, pos, esc_count;

    if (state.src[state.pos] !== "$") { return false; }

    res = isValidDelim(state, state.pos);
    if (!res.can_open) {
        if (!silent) { state.pending += "$"; }
        state.pos += 1;
        return true;
    }

    // First check for and bypass all properly escaped delimieters
    // This loop will assume that the first leading backtick can not
    // be the first character in state.src, which is known since
    // we have found an opening delimieter already.
    start = state.pos + 1;
    match = start;
    while ( (match = state.src.indexOf("$", match)) !== -1) {
        // Found potential $, look for escapes, pos will point to
        // first non escape when complete
        pos = match - 1;
        while (state.src[pos] === "\\") { pos -= 1; }

        // Even number of escapes, potential closing delimiter found
        if ( ((match - pos) % 2) == 1 ) { break; }
        match += 1;
    }

    // No closing delimter found.  Consume $ and continue.
    if (match === -1) {
        if (!silent) { state.pending += "$"; }
        state.pos = start;
        return true;
    }

    // Check if we have empty content, ie: $$.  Do not parse.
    if (match - start === 0) {
        if (!silent) { state.pending += "$$"; }
        state.pos = start + 1;
        return true;
    }

    // Check for valid closing delimiter
    res = isValidDelim(state, match);
    if (!res.can_close) {
        if (!silent) { state.pending += "$"; }
        state.pos = start;
        return true;
    }

    if (!silent) {
        token         = state.push('math_inline', 'math', 0);
        token.markup  = "$";
        token.content = state.src.slice(start, match);
    }

    state.pos = match + 1;
    return true;
}

function math_block(state, start, end, silent){
    if (!katex && window.katex) katex = window.katex;
    if (!katex) return false;
    var firstLine, lastLine, next, lastPos, found = false, token,
        pos = state.bMarks[start] + state.tShift[start],
        max = state.eMarks[start]

    if(pos + 2 > max){ return false; }
    if(state.src.slice(pos,pos+2)!=='$$'){ return false; }

    pos += 2;
    firstLine = state.src.slice(pos,max);

    if(silent){ return true; }
    if(firstLine.trim().slice(-2)==='$$'){
        // Single line expression
        firstLine = firstLine.trim().slice(0, -2);
        found = true;
    }

    for(next = start; !found; ){

        next++;

        if(next >= end){ break; }

        pos = state.bMarks[next]+state.tShift[next];
        max = state.eMarks[next];

        if(pos < max && state.tShift[next] < state.blkIndent){
            // non-empty line with negative indent should stop the list:
            break;
        }

        if(state.src.slice(pos,max).trim().slice(-2)==='$$'){
            lastPos = state.src.slice(0,max).lastIndexOf('$$');
            lastLine = state.src.slice(pos,lastPos);
            found = true;
        }

    }

    state.line = next + 1;

    token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = (firstLine && firstLine.trim() ? firstLine + '\n' : '')
    + state.getLines(start + 1, next, state.tShift[start], true)
    + (lastLine && lastLine.trim() ? lastLine : '');
    token.map = [ start, state.line ];
    token.markup = '$$';
    return true;
}

module.exports = function math_plugin(md, options) {
    // Default options

    options = options || {};

    // set KaTeX as the renderer for markdown-it-simplemath
    var katexInline = function(latex){
        if(!katex && window.katex) katex = window.katex;
        options.displayMode = false;
        try{
            return katex.renderToString(latex, options);
        }
        catch(error){
            if(options.throwOnError){ console.log(error); }
            return latex;
        }
    };

    var inlineRenderer = function(tokens, idx){
        return katexInline(tokens[idx].content);
    };

    var katexBlock = function(latex){
        if(!katex && window.katex) katex = window.katex;
        options.displayMode = true;
        try{
            return "<p>" + katex.renderToString(latex, options) + "</p>";
        }
        catch(error){
            if(options.throwOnError){ console.log(error); }
            return latex;
        }
    }

    var blockRenderer = function(tokens, idx){
        return  katexBlock(tokens[idx].content) + '\n';
    }

    md.inline.ruler.after('escape', 'math_inline', math_inline);
    md.block.ruler.after('blockquote', 'math_block', math_block, {
        alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
    });
    md.renderer.rules.math_inline = inlineRenderer;
    md.renderer.rules.math_block = blockRenderer;
};


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports = function ins_plugin(md) {
  // Insert each marker as a separate text token, and add it to delimiter list
  //
  function tokenize(state, silent) {
    var i, scanned, token, len, ch,
        start = state.pos,
        marker = state.src.charCodeAt(start);

    if (silent) { return false; }

    if (marker !== 0x3D/* = */) { return false; }

    scanned = state.scanDelims(state.pos, true);
    len = scanned.length;
    ch = String.fromCharCode(marker);

    if (len < 2) { return false; }

    if (len % 2) {
      token         = state.push('text', '', 0);
      token.content = ch;
      len--;
    }

    for (i = 0; i < len; i += 2) {
      token         = state.push('text', '', 0);
      token.content = ch + ch;

      state.delimiters.push({
        marker: marker,
        jump:   i,
        token:  state.tokens.length - 1,
        level:  state.level,
        end:    -1,
        open:   scanned.can_open,
        close:  scanned.can_close
      });
    }

    state.pos += scanned.length;

    return true;
  }


  // Walk through delimiter list and replace text tokens with tags
  //
  function postProcess(state) {
    var i, j,
        startDelim,
        endDelim,
        token,
        loneMarkers = [],
        delimiters = state.delimiters,
        max = state.delimiters.length;

    for (i = 0; i < max; i++) {
      startDelim = delimiters[i];

      if (startDelim.marker !== 0x3D/* = */) {
        continue;
      }

      if (startDelim.end === -1) {
        continue;
      }

      endDelim = delimiters[startDelim.end];

      token         = state.tokens[startDelim.token];
      token.type    = 'mark_open';
      token.tag     = 'mark';
      token.nesting = 1;
      token.markup  = '==';
      token.content = '';

      token         = state.tokens[endDelim.token];
      token.type    = 'mark_close';
      token.tag     = 'mark';
      token.nesting = -1;
      token.markup  = '==';
      token.content = '';

      if (state.tokens[endDelim.token - 1].type === 'text' &&
          state.tokens[endDelim.token - 1].content === '=') {

        loneMarkers.push(endDelim.token - 1);
      }
    }

    // If a marker sequence has an odd number of characters, it's splitted
    // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
    // start of the sequence.
    //
    // So, we have to move all those markers after subsequent s_close tags.
    //
    while (loneMarkers.length) {
      i = loneMarkers.pop();
      j = i + 1;

      while (j < state.tokens.length && state.tokens[j].type === 'mark_close') {
        j++;
      }

      j--;

      if (i !== j) {
        token = state.tokens[j];
        state.tokens[j] = state.tokens[i];
        state.tokens[i] = token;
      }
    }
  }

  md.inline.ruler.before('emphasis', 'mark', tokenize);
  md.inline.ruler2.before('emphasis', 'mark', postProcess);
};


/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process ~subscript~



// same as UNESCAPE_MD_RE plus a space
var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;


function subscript(state, silent) {
  var found,
      content,
      token,
      max = state.posMax,
      start = state.pos;

  if (state.src.charCodeAt(start) !== 0x7E/* ~ */) { return false; }
  if (silent) { return false; } // don't run any pairs in validation mode
  if (start + 2 >= max) { return false; }

  state.pos = start + 1;

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === 0x7E/* ~ */) {
      found = true;
      break;
    }

    state.md.inline.skipToken(state);
  }

  if (!found || start + 1 === state.pos) {
    state.pos = start;
    return false;
  }

  content = state.src.slice(start + 1, state.pos);

  // don't allow unescaped spaces/newlines inside
  if (content.match(/(^|[^\\])(\\\\)*\s/)) {
    state.pos = start;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + 1;

  // Earlier we checked !silent, but this implementation does not need it
  token         = state.push('sub_open', 'sub', 1);
  token.markup  = '~';

  token         = state.push('text', '', 0);
  token.content = content.replace(UNESCAPE_RE, '$1');

  token         = state.push('sub_close', 'sub', -1);
  token.markup  = '~';

  state.pos = state.posMax + 1;
  state.posMax = max;
  return true;
}


module.exports = function sub_plugin(md) {
  md.inline.ruler.after('emphasis', 'sub', subscript);
};


/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process ^superscript^



// same as UNESCAPE_MD_RE plus a space
var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;

function superscript(state, silent) {
  var found,
      content,
      token,
      max = state.posMax,
      start = state.pos;

  if (state.src.charCodeAt(start) !== 0x5E/* ^ */) { return false; }
  if (silent) { return false; } // don't run any pairs in validation mode
  if (start + 2 >= max) { return false; }

  state.pos = start + 1;

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === 0x5E/* ^ */) {
      found = true;
      break;
    }

    state.md.inline.skipToken(state);
  }

  if (!found || start + 1 === state.pos) {
    state.pos = start;
    return false;
  }

  content = state.src.slice(start + 1, state.pos);

  // don't allow unescaped spaces/newlines inside
  if (content.match(/(^|[^\\])(\\\\)*\s/)) {
    state.pos = start;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + 1;

  // Earlier we checked !silent, but this implementation does not need it
  token         = state.push('sup_open', 'sup', 1);
  token.markup  = '^';

  token         = state.push('text', '', 0);
  token.content = content.replace(UNESCAPE_RE, '$1');

  token         = state.push('sup_close', 'sup', -1);
  token.markup  = '^';

  state.pos = state.posMax + 1;
  state.posMax = max;
  return true;
}


module.exports = function sup_plugin(md) {
  md.inline.ruler.after('emphasis', 'sup', superscript);
};


/***/ }),
/* 145 */
/***/ (function(module, exports) {

// Markdown-it plugin to render GitHub-style task lists; see
//
// https://github.com/blog/1375-task-lists-in-gfm-issues-pulls-comments
// https://github.com/blog/1825-task-lists-in-all-markdown-documents

var disableCheckboxes = true;
var useLabelWrapper = false;
var useLabelAfter = false;

module.exports = function(md, options) {
	if (options) {
		disableCheckboxes = !options.enabled;
		useLabelWrapper = !!options.label;
		useLabelAfter = !!options.labelAfter;
	}

	md.core.ruler.after('inline', 'github-task-lists', function(state) {
		var tokens = state.tokens;
		for (var i = 2; i < tokens.length; i++) {
			if (isTodoItem(tokens, i)) {
				todoify(tokens[i], state.Token);
				attrSet(tokens[i-2], 'class', 'task-list-item' + (!disableCheckboxes ? ' enabled' : ''));
				attrSet(tokens[parentToken(tokens, i-2)], 'class', 'contains-task-list');
			}
		}
	});
};

function attrSet(token, name, value) {
	var index = token.attrIndex(name);
	var attr = [name, value];

	if (index < 0) {
		token.attrPush(attr);
	} else {
		token.attrs[index] = attr;
	}
}

function parentToken(tokens, index) {
	var targetLevel = tokens[index].level - 1;
	for (var i = index - 1; i >= 0; i--) {
		if (tokens[i].level === targetLevel) {
			return i;
		}
	}
	return -1;
}

function isTodoItem(tokens, index) {
	return isInline(tokens[index]) &&
	       isParagraph(tokens[index - 1]) &&
	       isListItem(tokens[index - 2]) &&
	       startsWithTodoMarkdown(tokens[index]);
}

function todoify(token, TokenConstructor) {
	token.children.unshift(makeCheckbox(token, TokenConstructor));
	token.children[1].content = token.children[1].content.slice(3);
	token.content = token.content.slice(3);

	if (useLabelWrapper) {
		if (useLabelAfter) {
			token.children.pop();

			// Use large random number as id property of the checkbox.
			var id = 'task-item-' + Math.ceil(Math.random() * (10000 * 1000) - 1000);
			token.children[0].content = token.children[0].content.slice(0, -1) + ' id="' + id + '">';
			token.children.push(afterLabel(token.content, id, TokenConstructor));
		} else {
			token.children.unshift(beginLabel(TokenConstructor));
			token.children.push(endLabel(TokenConstructor));
		}
	}
}

function makeCheckbox(token, TokenConstructor) {
	var checkbox = new TokenConstructor('html_inline', '', 0);
	var disabledAttr = disableCheckboxes ? ' disabled="" ' : '';
	if (token.content.indexOf('[ ] ') === 0) {
		checkbox.content = '<input class="task-list-item-checkbox"' + disabledAttr + 'type="checkbox">';
	} else if (token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0) {
		checkbox.content = '<input class="task-list-item-checkbox" checked=""' + disabledAttr + 'type="checkbox">';
	}
	return checkbox;
}

// these next two functions are kind of hacky; probably should really be a
// true block-level token with .tag=='label'
function beginLabel(TokenConstructor) {
	var token = new TokenConstructor('html_inline', '', 0);
	token.content = '<label>';
	return token;
}

function endLabel(TokenConstructor) {
	var token = new TokenConstructor('html_inline', '', 0);
	token.content = '</label>';
	return token;
}

function afterLabel(content, id, TokenConstructor) {
	var token = new TokenConstructor('html_inline', '', 0);
	token.content = '<label class="task-list-item-label" for="' + id + '">' + content + '</label>';
	token.attrs = [{for: id}];
	return token;
}

function isInline(token) { return token.type === 'inline'; }
function isParagraph(token) { return token.type === 'paragraph_open'; }
function isListItem(token) { return token.type === 'list_item_open'; }

function startsWithTodoMarkdown(token) {
	// leading whitespace in a list item is already trimmed off by markdown-it
	return token.content.indexOf('[ ] ') === 0 || token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0;
}


/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process @[toc](|Title)



module.exports = function(md) {

    var TOC_REGEXP = /^@\[toc\](?:\((?:\s+)?([^\)]+)(?:\s+)?\)?)?(?:\s+?)?$/im;
    var TOC_DEFAULT = 'Table of Contents';
    var gstate;

    function toc(state, silent) {
        while (state.src.indexOf('\n') >= 0 && state.src.indexOf('\n') < state.src.indexOf('@[toc]')) {
            if (state.tokens.slice(-1)[0].type === 'softbreak') {
                state.src = state.src.split('\n').slice(1).join('\n');
                state.pos = 0;
            }
        }
        var token;

        // trivial rejections
        if (state.src.charCodeAt(state.pos) !== 0x40 /* @ */ ) {
            return false;
        }
        if (state.src.charCodeAt(state.pos + 1) !== 0x5B /* [ */ ) {
            return false;
        }

        var match = TOC_REGEXP.exec(state.src);
        if (!match) {
            return false;
        }
        match = match.filter(function(m) {
            return m;
        });
        if (match.length < 1) {
            return false;
        }
        if (silent) { // don't run any pairs in validation mode
            return false;
        }

        token = state.push('toc_open', 'toc', 1);
        token.markup = '@[toc]';

        token = state.push('toc_body', '', 0);
        var label = TOC_DEFAULT;
        if (match.length > 1) {
            label = match.pop();
        }
        token.content = label;

        token = state.push('toc_close', 'toc', -1);

        var offset = 0;
        var newline = state.src.indexOf('\n');
        if (newline !== -1) {
            offset = state.pos + newline;
        } else {
            offset = state.pos + state.posMax + 1;
        }
        state.pos = offset;

        return true;
    }
    var makeSafe = function(label) {
        return label.replace(/[^\w\s]/gi, '').split(' ').join('_');
    };

    md.renderer.rules.heading_open = function(tokens, index) {
        var level = tokens[index].tag;
        var label = tokens[index + 1];
        if (label.type === 'inline') {
            var anchor = makeSafe(label.content) + '_' + label.map[0];
            return '<' + level + '><a id="' + anchor + '"></a>';
        } else {
            return '</h1>';
        }
    };

    md.renderer.rules.toc_open = function(tokens, index) {
        return '';
    };

    md.renderer.rules.toc_close = function(tokens, index) {
        return '';
    };

    md.renderer.rules.toc_body = function(tokens, index) {
        // Wanted to avoid linear search through tokens here, 
        // but this seems the only reliable way to identify headings
        var headings = [];
        var gtokens = gstate.tokens;
        var size = gtokens.length;
        for (var i = 0; i < size; i++) {
            if (gtokens[i].type !== 'heading_close') {
                continue;
            }
            var token = gtokens[i];
            var heading = gtokens[i - 1];
            if (heading.type === 'inline') {
                headings.push({
                    level: +token.tag.substr(1, 1),
                    anchor: makeSafe(heading.content) + '_' + heading.map[0],
                    content: heading.content
                });
            }
        }

        var indent = 0;
        var list = headings.map(function(heading) {
            var res = [];
            if (heading.level > indent) {
                var ldiff = (heading.level - indent);
                for (var i = 0; i < ldiff; i++) {
                    res.push('<ul>');
                    indent++;
                }
            } else if (heading.level < indent) {
                var ldiff = (indent - heading.level);
                for (var i = 0; i < ldiff; i++) {
                    res.push('</ul>');
                    indent--;
                }
            }
            res = res.concat(['<li><a href="#', heading.anchor, '">', heading.content, '</a></li>']);
            return res.join('');
        });

        return '<h3>' + tokens[index].content + '</h3>' + list.join('') + new Array(indent + 1).join('</ul>');
    };

    md.core.ruler.push('grab_state', function(state) {
        gstate = state;
    });
    md.inline.ruler.after('emphasis', 'toc', toc);
};


/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports = __webpack_require__(153);


/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// List of valid html blocks names, accorting to commonmark spec
// http://jgm.github.io/CommonMark/spec.html#html-blocks




module.exports = [
  'address',
  'article',
  'aside',
  'base',
  'basefont',
  'blockquote',
  'body',
  'caption',
  'center',
  'col',
  'colgroup',
  'dd',
  'details',
  'dialog',
  'dir',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'frame',
  'frameset',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hr',
  'html',
  'iframe',
  'legend',
  'li',
  'link',
  'main',
  'menu',
  'menuitem',
  'meta',
  'nav',
  'noframes',
  'ol',
  'optgroup',
  'option',
  'p',
  'param',
  'section',
  'source',
  'summary',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'title',
  'tr',
  'track',
  'ul'
];


/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Just a shortcut for bulk export



exports.parseLinkLabel       = __webpack_require__(151);
exports.parseLinkDestination = __webpack_require__(150);
exports.parseLinkTitle       = __webpack_require__(152);


/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Parse link destination
//



var unescapeAll = __webpack_require__(0).unescapeAll;


module.exports = function parseLinkDestination(str, pos, max) {
  var code, level,
      lines = 0,
      start = pos,
      result = {
        ok: false,
        pos: 0,
        lines: 0,
        str: ''
      };

  if (str.charCodeAt(pos) === 0x3C /* < */) {
    pos++;
    while (pos < max) {
      code = str.charCodeAt(pos);
      if (code === 0x0A /* \n */) { return result; }
      if (code === 0x3E /* > */) {
        result.pos = pos + 1;
        result.str = unescapeAll(str.slice(start + 1, pos));
        result.ok = true;
        return result;
      }
      if (code === 0x5C /* \ */ && pos + 1 < max) {
        pos += 2;
        continue;
      }

      pos++;
    }

    // no closing '>'
    return result;
  }

  // this should be ... } else { ... branch

  level = 0;
  while (pos < max) {
    code = str.charCodeAt(pos);

    if (code === 0x20) { break; }

    // ascii control characters
    if (code < 0x20 || code === 0x7F) { break; }

    if (code === 0x5C /* \ */ && pos + 1 < max) {
      pos += 2;
      continue;
    }

    if (code === 0x28 /* ( */) {
      level++;
    }

    if (code === 0x29 /* ) */) {
      if (level === 0) { break; }
      level--;
    }

    pos++;
  }

  if (start === pos) { return result; }
  if (level !== 0) { return result; }

  result.str = unescapeAll(str.slice(start, pos));
  result.lines = lines;
  result.pos = pos;
  result.ok = true;
  return result;
};


/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Parse link label
//
// this function assumes that first character ("[") already matches;
// returns the end of the label
//


module.exports = function parseLinkLabel(state, start, disableNested) {
  var level, found, marker, prevPos,
      labelEnd = -1,
      max = state.posMax,
      oldPos = state.pos;

  state.pos = start + 1;
  level = 1;

  while (state.pos < max) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 0x5D /* ] */) {
      level--;
      if (level === 0) {
        found = true;
        break;
      }
    }

    prevPos = state.pos;
    state.md.inline.skipToken(state);
    if (marker === 0x5B /* [ */) {
      if (prevPos === state.pos - 1) {
        // increase level if we find text `[`, which is not a part of any token
        level++;
      } else if (disableNested) {
        state.pos = oldPos;
        return -1;
      }
    }
  }

  if (found) {
    labelEnd = state.pos;
  }

  // restore old state
  state.pos = oldPos;

  return labelEnd;
};


/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Parse link title
//



var unescapeAll = __webpack_require__(0).unescapeAll;


module.exports = function parseLinkTitle(str, pos, max) {
  var code,
      marker,
      lines = 0,
      start = pos,
      result = {
        ok: false,
        pos: 0,
        lines: 0,
        str: ''
      };

  if (pos >= max) { return result; }

  marker = str.charCodeAt(pos);

  if (marker !== 0x22 /* " */ && marker !== 0x27 /* ' */ && marker !== 0x28 /* ( */) { return result; }

  pos++;

  // if opening marker is "(", switch it to closing marker ")"
  if (marker === 0x28) { marker = 0x29; }

  while (pos < max) {
    code = str.charCodeAt(pos);
    if (code === marker) {
      result.pos = pos + 1;
      result.lines = lines;
      result.str = unescapeAll(str.slice(start + 1, pos));
      result.ok = true;
      return result;
    } else if (code === 0x0A) {
      lines++;
    } else if (code === 0x5C /* \ */ && pos + 1 < max) {
      pos++;
      if (str.charCodeAt(pos) === 0x0A) {
        lines++;
      }
    }

    pos++;
  }

  return result;
};


/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Main parser class




var utils        = __webpack_require__(0);
var helpers      = __webpack_require__(149);
var Renderer     = __webpack_require__(160);
var ParserCore   = __webpack_require__(155);
var ParserBlock  = __webpack_require__(154);
var ParserInline = __webpack_require__(156);
var LinkifyIt    = __webpack_require__(126);
var mdurl        = __webpack_require__(58);
var punycode     = __webpack_require__(196);


var config = {
  'default': __webpack_require__(158),
  zero: __webpack_require__(159),
  commonmark: __webpack_require__(157)
};

////////////////////////////////////////////////////////////////////////////////
//
// This validator can prohibit more than really needed to prevent XSS. It's a
// tradeoff to keep code simple and to be secure by default.
//
// If you need different setup - override validator method as you wish. Or
// replace it with dummy function and use external sanitizer.
//

var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;

function validateLink(url) {
  // url should be normalized at this point, and existing entities are decoded
  var str = url.trim().toLowerCase();

  return BAD_PROTO_RE.test(str) ? (GOOD_DATA_RE.test(str) ? true : false) : true;
}

////////////////////////////////////////////////////////////////////////////////


var RECODE_HOSTNAME_FOR = [ 'http:', 'https:', 'mailto:' ];

function normalizeLink(url) {
  var parsed = mdurl.parse(url, true);

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toASCII(parsed.hostname);
      } catch (er) { /**/ }
    }
  }

  return mdurl.encode(mdurl.format(parsed));
}

function normalizeLinkText(url) {
  var parsed = mdurl.parse(url, true);

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toUnicode(parsed.hostname);
      } catch (er) { /**/ }
    }
  }

  return mdurl.decode(mdurl.format(parsed));
}


/**
 * class MarkdownIt
 *
 * Main parser/renderer class.
 *
 * ##### Usage
 *
 * ```javascript
 * // node.js, "classic" way:
 * var MarkdownIt = require('markdown-it'),
 *     md = new MarkdownIt();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // node.js, the same, but with sugar:
 * var md = require('markdown-it')();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // browser without AMD, added to "window" on script load
 * // Note, there are no dash.
 * var md = window.markdownit();
 * var result = md.render('# markdown-it rulezz!');
 * ```
 *
 * Single line rendering, without paragraph wrap:
 *
 * ```javascript
 * var md = require('markdown-it')();
 * var result = md.renderInline('__markdown-it__ rulezz!');
 * ```
 **/

/**
 * new MarkdownIt([presetName, options])
 * - presetName (String): optional, `commonmark` / `zero`
 * - options (Object)
 *
 * Creates parser instanse with given config. Can be called without `new`.
 *
 * ##### presetName
 *
 * MarkdownIt provides named presets as a convenience to quickly
 * enable/disable active syntax rules and options for common use cases.
 *
 * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.js) -
 *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
 * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.js) -
 *   similar to GFM, used when no preset name given. Enables all available rules,
 *   but still without html, typographer & autolinker.
 * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.js) -
 *   all rules disabled. Useful to quickly setup your config via `.enable()`.
 *   For example, when you need only `bold` and `italic` markup and nothing else.
 *
 * ##### options:
 *
 * - __html__ - `false`. Set `true` to enable HTML tags in source. Be careful!
 *   That's not safe! You may need external sanitizer to protect output from XSS.
 *   It's better to extend features via plugins, instead of enabling HTML.
 * - __xhtmlOut__ - `false`. Set `true` to add '/' when closing single tags
 *   (`<br />`). This is needed only for full CommonMark compatibility. In real
 *   world you will need HTML output.
 * - __breaks__ - `false`. Set `true` to convert `\n` in paragraphs into `<br>`.
 * - __langPrefix__ - `language-`. CSS language class prefix for fenced blocks.
 *   Can be useful for external highlighters.
 * - __linkify__ - `false`. Set `true` to autoconvert URL-like text to links.
 * - __typographer__  - `false`. Set `true` to enable [some language-neutral
 *   replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js) +
 *   quotes beautification (smartquotes).
 * - __quotes__ - `“”‘’`, String or Array. Double + single quotes replacement
 *   pairs, when typographer enabled and smartquotes on. For example, you can
 *   use `'«»„“'` for Russian, `'„“‚‘'` for German, and
 *   `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
 * - __highlight__ - `null`. Highlighter function for fenced code blocks.
 *   Highlighter `function (str, lang)` should return escaped HTML. It can also
 *   return empty string if the source was not changed and should be escaped
 *   externaly. If result starts with <pre... internal wrapper is skipped.
 *
 * ##### Example
 *
 * ```javascript
 * // commonmark mode
 * var md = require('markdown-it')('commonmark');
 *
 * // default mode
 * var md = require('markdown-it')();
 *
 * // enable everything
 * var md = require('markdown-it')({
 *   html: true,
 *   linkify: true,
 *   typographer: true
 * });
 * ```
 *
 * ##### Syntax highlighting
 *
 * ```js
 * var hljs = require('highlight.js') // https://highlightjs.org/
 *
 * var md = require('markdown-it')({
 *   highlight: function (str, lang) {
 *     if (lang && hljs.getLanguage(lang)) {
 *       try {
 *         return hljs.highlight(lang, str, true).value;
 *       } catch (__) {}
 *     }
 *
 *     return ''; // use external default escaping
 *   }
 * });
 * ```
 *
 * Or with full wrapper override (if you need assign class to `<pre>`):
 *
 * ```javascript
 * var hljs = require('highlight.js') // https://highlightjs.org/
 *
 * // Actual default values
 * var md = require('markdown-it')({
 *   highlight: function (str, lang) {
 *     if (lang && hljs.getLanguage(lang)) {
 *       try {
 *         return '<pre class="hljs"><code>' +
 *                hljs.highlight(lang, str, true).value +
 *                '</code></pre>';
 *       } catch (__) {}
 *     }
 *
 *     return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
 *   }
 * });
 * ```
 *
 **/
function MarkdownIt(presetName, options) {
  if (!(this instanceof MarkdownIt)) {
    return new MarkdownIt(presetName, options);
  }

  if (!options) {
    if (!utils.isString(presetName)) {
      options = presetName || {};
      presetName = 'default';
    }
  }

  /**
   * MarkdownIt#inline -> ParserInline
   *
   * Instance of [[ParserInline]]. You may need it to add new rules when
   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
   * [[MarkdownIt.enable]].
   **/
  this.inline = new ParserInline();

  /**
   * MarkdownIt#block -> ParserBlock
   *
   * Instance of [[ParserBlock]]. You may need it to add new rules when
   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
   * [[MarkdownIt.enable]].
   **/
  this.block = new ParserBlock();

  /**
   * MarkdownIt#core -> Core
   *
   * Instance of [[Core]] chain executor. You may need it to add new rules when
   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
   * [[MarkdownIt.enable]].
   **/
  this.core = new ParserCore();

  /**
   * MarkdownIt#renderer -> Renderer
   *
   * Instance of [[Renderer]]. Use it to modify output look. Or to add rendering
   * rules for new token types, generated by plugins.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * function myToken(tokens, idx, options, env, self) {
   *   //...
   *   return result;
   * };
   *
   * md.renderer.rules['my_token'] = myToken
   * ```
   *
   * See [[Renderer]] docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js).
   **/
  this.renderer = new Renderer();

  /**
   * MarkdownIt#linkify -> LinkifyIt
   *
   * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
   * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/linkify.js)
   * rule.
   **/
  this.linkify = new LinkifyIt();

  /**
   * MarkdownIt#validateLink(url) -> Boolean
   *
   * Link validation function. CommonMark allows too much in links. By default
   * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
   * except some embedded image types.
   *
   * You can change this behaviour:
   *
   * ```javascript
   * var md = require('markdown-it')();
   * // enable everything
   * md.validateLink = function () { return true; }
   * ```
   **/
  this.validateLink = validateLink;

  /**
   * MarkdownIt#normalizeLink(url) -> String
   *
   * Function used to encode link url to a machine-readable format,
   * which includes url-encoding, punycode, etc.
   **/
  this.normalizeLink = normalizeLink;

  /**
   * MarkdownIt#normalizeLinkText(url) -> String
   *
   * Function used to decode link url to a human-readable format`
   **/
  this.normalizeLinkText = normalizeLinkText;


  // Expose utils & helpers for easy acces from plugins

  /**
   * MarkdownIt#utils -> utils
   *
   * Assorted utility functions, useful to write plugins. See details
   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.js).
   **/
  this.utils = utils;

  /**
   * MarkdownIt#helpers -> helpers
   *
   * Link components parser functions, useful to write plugins. See details
   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/helpers).
   **/
  this.helpers = utils.assign({}, helpers);


  this.options = {};
  this.configure(presetName);

  if (options) { this.set(options); }
}


/** chainable
 * MarkdownIt.set(options)
 *
 * Set parser options (in the same format as in constructor). Probably, you
 * will never need it, but you can change options after constructor call.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')()
 *             .set({ html: true, breaks: true })
 *             .set({ typographer, true });
 * ```
 *
 * __Note:__ To achieve the best possible performance, don't modify a
 * `markdown-it` instance options on the fly. If you need multiple configurations
 * it's best to create multiple instances and initialize each with separate
 * config.
 **/
MarkdownIt.prototype.set = function (options) {
  utils.assign(this.options, options);
  return this;
};


/** chainable, internal
 * MarkdownIt.configure(presets)
 *
 * Batch load of all options and compenent settings. This is internal method,
 * and you probably will not need it. But if you with - see available presets
 * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
 *
 * We strongly recommend to use presets instead of direct config loads. That
 * will give better compatibility with next versions.
 **/
MarkdownIt.prototype.configure = function (presets) {
  var self = this, presetName;

  if (utils.isString(presets)) {
    presetName = presets;
    presets = config[presetName];
    if (!presets) { throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name'); }
  }

  if (!presets) { throw new Error('Wrong `markdown-it` preset, can\'t be empty'); }

  if (presets.options) { self.set(presets.options); }

  if (presets.components) {
    Object.keys(presets.components).forEach(function (name) {
      if (presets.components[name].rules) {
        self[name].ruler.enableOnly(presets.components[name].rules);
      }
      if (presets.components[name].rules2) {
        self[name].ruler2.enableOnly(presets.components[name].rules2);
      }
    });
  }
  return this;
};


/** chainable
 * MarkdownIt.enable(list, ignoreInvalid)
 * - list (String|Array): rule name or list of rule names to enable
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Enable list or rules. It will automatically find appropriate components,
 * containing rules with given names. If rule not found, and `ignoreInvalid`
 * not set - throws exception.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')()
 *             .enable(['sub', 'sup'])
 *             .disable('smartquotes');
 * ```
 **/
MarkdownIt.prototype.enable = function (list, ignoreInvalid) {
  var result = [];

  if (!Array.isArray(list)) { list = [ list ]; }

  [ 'core', 'block', 'inline' ].forEach(function (chain) {
    result = result.concat(this[chain].ruler.enable(list, true));
  }, this);

  result = result.concat(this.inline.ruler2.enable(list, true));

  var missed = list.filter(function (name) { return result.indexOf(name) < 0; });

  if (missed.length && !ignoreInvalid) {
    throw new Error('MarkdownIt. Failed to enable unknown rule(s): ' + missed);
  }

  return this;
};


/** chainable
 * MarkdownIt.disable(list, ignoreInvalid)
 * - list (String|Array): rule name or list of rule names to disable.
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * The same as [[MarkdownIt.enable]], but turn specified rules off.
 **/
MarkdownIt.prototype.disable = function (list, ignoreInvalid) {
  var result = [];

  if (!Array.isArray(list)) { list = [ list ]; }

  [ 'core', 'block', 'inline' ].forEach(function (chain) {
    result = result.concat(this[chain].ruler.disable(list, true));
  }, this);

  result = result.concat(this.inline.ruler2.disable(list, true));

  var missed = list.filter(function (name) { return result.indexOf(name) < 0; });

  if (missed.length && !ignoreInvalid) {
    throw new Error('MarkdownIt. Failed to disable unknown rule(s): ' + missed);
  }
  return this;
};


/** chainable
 * MarkdownIt.use(plugin, params)
 *
 * Load specified plugin with given params into current parser instance.
 * It's just a sugar to call `plugin(md, params)` with curring.
 *
 * ##### Example
 *
 * ```javascript
 * var iterator = require('markdown-it-for-inline');
 * var md = require('markdown-it')()
 *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
 *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
 *             });
 * ```
 **/
MarkdownIt.prototype.use = function (plugin /*, params, ... */) {
  var args = [ this ].concat(Array.prototype.slice.call(arguments, 1));
  plugin.apply(plugin, args);
  return this;
};


/** internal
 * MarkdownIt.parse(src, env) -> Array
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * Parse input string and returns list of block tokens (special token type
 * "inline" will contain list of inline tokens). You should not call this
 * method directly, until you write custom renderer (for example, to produce
 * AST).
 *
 * `env` is used to pass data between "distributed" rules and return additional
 * metadata like reference info, needed for the renderer. It also can be used to
 * inject data in specific cases. Usually, you will be ok to pass `{}`,
 * and then pass updated object to renderer.
 **/
MarkdownIt.prototype.parse = function (src, env) {
  if (typeof src !== 'string') {
    throw new Error('Input data should be a String');
  }

  var state = new this.core.State(src, this, env);

  this.core.process(state);

  return state.tokens;
};


/**
 * MarkdownIt.render(src [, env]) -> String
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * Render markdown string into html. It does all magic for you :).
 *
 * `env` can be used to inject additional metadata (`{}` by default).
 * But you will not need it with high probability. See also comment
 * in [[MarkdownIt.parse]].
 **/
MarkdownIt.prototype.render = function (src, env) {
  env = env || {};

  return this.renderer.render(this.parse(src, env), this.options, env);
};


/** internal
 * MarkdownIt.parseInline(src, env) -> Array
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * The same as [[MarkdownIt.parse]] but skip all block rules. It returns the
 * block tokens list with the single `inline` element, containing parsed inline
 * tokens in `children` property. Also updates `env` object.
 **/
MarkdownIt.prototype.parseInline = function (src, env) {
  var state = new this.core.State(src, this, env);

  state.inlineMode = true;
  this.core.process(state);

  return state.tokens;
};


/**
 * MarkdownIt.renderInline(src [, env]) -> String
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * Similar to [[MarkdownIt.render]] but for single paragraph content. Result
 * will NOT be wrapped into `<p>` tags.
 **/
MarkdownIt.prototype.renderInline = function (src, env) {
  env = env || {};

  return this.renderer.render(this.parseInline(src, env), this.options, env);
};


module.exports = MarkdownIt;


/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** internal
 * class ParserBlock
 *
 * Block-level tokenizer.
 **/



var Ruler           = __webpack_require__(35);


var _rules = [
  // First 2 params - rule name & source. Secondary array - list of rules,
  // which can be terminated by this one.
  [ 'table',      __webpack_require__(172),      [ 'paragraph', 'reference' ] ],
  [ 'code',       __webpack_require__(162) ],
  [ 'fence',      __webpack_require__(163),      [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'blockquote', __webpack_require__(161), [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'hr',         __webpack_require__(165),         [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'list',       __webpack_require__(168),       [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'reference',  __webpack_require__(170) ],
  [ 'heading',    __webpack_require__(164),    [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'lheading',   __webpack_require__(167) ],
  [ 'html_block', __webpack_require__(166), [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'paragraph',  __webpack_require__(169) ]
];


/**
 * new ParserBlock()
 **/
function ParserBlock() {
  /**
   * ParserBlock#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of block rules.
   **/
  this.ruler = new Ruler();

  for (var i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1], { alt: (_rules[i][2] || []).slice() });
  }
}


// Generate tokens for input range
//
ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
  var ok, i,
      rules = this.ruler.getRules(''),
      len = rules.length,
      line = startLine,
      hasEmptyLines = false,
      maxNesting = state.md.options.maxNesting;

  while (line < endLine) {
    state.line = line = state.skipEmptyLines(line);
    if (line >= endLine) { break; }

    // Termination condition for nested calls.
    // Nested calls currently used for blockquotes & lists
    if (state.sCount[line] < state.blkIndent) { break; }

    // If nesting level exceeded - skip tail to the end. That's not ordinary
    // situation and we should not care about content.
    if (state.level >= maxNesting) {
      state.line = endLine;
      break;
    }

    // Try all possible rules.
    // On success, rule should:
    //
    // - update `state.line`
    // - update `state.tokens`
    // - return true

    for (i = 0; i < len; i++) {
      ok = rules[i](state, line, endLine, false);
      if (ok) { break; }
    }

    // set state.tight if we had an empty line before current tag
    // i.e. latest empty line should not count
    state.tight = !hasEmptyLines;

    // paragraph might "eat" one newline after it in nested lists
    if (state.isEmpty(state.line - 1)) {
      hasEmptyLines = true;
    }

    line = state.line;

    if (line < endLine && state.isEmpty(line)) {
      hasEmptyLines = true;
      line++;
      state.line = line;
    }
  }
};


/**
 * ParserBlock.parse(str, md, env, outTokens)
 *
 * Process input string and push block tokens into `outTokens`
 **/
ParserBlock.prototype.parse = function (src, md, env, outTokens) {
  var state;

  if (!src) { return; }

  state = new this.State(src, md, env, outTokens);

  this.tokenize(state, state.line, state.lineMax);
};


ParserBlock.prototype.State = __webpack_require__(171);


module.exports = ParserBlock;


/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** internal
 * class Core
 *
 * Top-level rules executor. Glues block/inline parsers and does intermediate
 * transformations.
 **/



var Ruler  = __webpack_require__(35);


var _rules = [
  [ 'normalize',      __webpack_require__(176)      ],
  [ 'block',          __webpack_require__(173)          ],
  [ 'inline',         __webpack_require__(174)         ],
  [ 'linkify',        __webpack_require__(175)        ],
  [ 'replacements',   __webpack_require__(177)   ],
  [ 'smartquotes',    __webpack_require__(178)    ]
];


/**
 * new Core()
 **/
function Core() {
  /**
   * Core#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of core rules.
   **/
  this.ruler = new Ruler();

  for (var i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }
}


/**
 * Core.process(state)
 *
 * Executes core chain rules.
 **/
Core.prototype.process = function (state) {
  var i, l, rules;

  rules = this.ruler.getRules('');

  for (i = 0, l = rules.length; i < l; i++) {
    rules[i](state);
  }
};

Core.prototype.State = __webpack_require__(179);


module.exports = Core;


/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** internal
 * class ParserInline
 *
 * Tokenizes paragraph content.
 **/



var Ruler           = __webpack_require__(35);


////////////////////////////////////////////////////////////////////////////////
// Parser rules

var _rules = [
  [ 'text',            __webpack_require__(190) ],
  [ 'newline',         __webpack_require__(188) ],
  [ 'escape',          __webpack_require__(184) ],
  [ 'backticks',       __webpack_require__(181) ],
  [ 'strikethrough',   __webpack_require__(57).tokenize ],
  [ 'emphasis',        __webpack_require__(56).tokenize ],
  [ 'link',            __webpack_require__(187) ],
  [ 'image',           __webpack_require__(186) ],
  [ 'autolink',        __webpack_require__(180) ],
  [ 'html_inline',     __webpack_require__(185) ],
  [ 'entity',          __webpack_require__(183) ]
];

var _rules2 = [
  [ 'balance_pairs',   __webpack_require__(182) ],
  [ 'strikethrough',   __webpack_require__(57).postProcess ],
  [ 'emphasis',        __webpack_require__(56).postProcess ],
  [ 'text_collapse',   __webpack_require__(191) ]
];


/**
 * new ParserInline()
 **/
function ParserInline() {
  var i;

  /**
   * ParserInline#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of inline rules.
   **/
  this.ruler = new Ruler();

  for (i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }

  /**
   * ParserInline#ruler2 -> Ruler
   *
   * [[Ruler]] instance. Second ruler used for post-processing
   * (e.g. in emphasis-like rules).
   **/
  this.ruler2 = new Ruler();

  for (i = 0; i < _rules2.length; i++) {
    this.ruler2.push(_rules2[i][0], _rules2[i][1]);
  }
}


// Skip single token by running all rules in validation mode;
// returns `true` if any rule reported success
//
ParserInline.prototype.skipToken = function (state) {
  var ok, i, pos = state.pos,
      rules = this.ruler.getRules(''),
      len = rules.length,
      maxNesting = state.md.options.maxNesting,
      cache = state.cache;


  if (typeof cache[pos] !== 'undefined') {
    state.pos = cache[pos];
    return;
  }

  if (state.level < maxNesting) {
    for (i = 0; i < len; i++) {
      // Increment state.level and decrement it later to limit recursion.
      // It's harmless to do here, because no tokens are created. But ideally,
      // we'd need a separate private state variable for this purpose.
      //
      state.level++;
      ok = rules[i](state, true);
      state.level--;

      if (ok) { break; }
    }
  } else {
    // Too much nesting, just skip until the end of the paragraph.
    //
    // NOTE: this will cause links to behave incorrectly in the following case,
    //       when an amount of `[` is exactly equal to `maxNesting + 1`:
    //
    //       [[[[[[[[[[[[[[[[[[[[[foo]()
    //
    // TODO: remove this workaround when CM standard will allow nested links
    //       (we can replace it by preventing links from being parsed in
    //       validation mode)
    //
    state.pos = state.posMax;
  }

  if (!ok) { state.pos++; }
  cache[pos] = state.pos;
};


// Generate tokens for input range
//
ParserInline.prototype.tokenize = function (state) {
  var ok, i,
      rules = this.ruler.getRules(''),
      len = rules.length,
      end = state.posMax,
      maxNesting = state.md.options.maxNesting;

  while (state.pos < end) {
    // Try all possible rules.
    // On success, rule should:
    //
    // - update `state.pos`
    // - update `state.tokens`
    // - return true

    if (state.level < maxNesting) {
      for (i = 0; i < len; i++) {
        ok = rules[i](state, false);
        if (ok) { break; }
      }
    }

    if (ok) {
      if (state.pos >= end) { break; }
      continue;
    }

    state.pending += state.src[state.pos++];
  }

  if (state.pending) {
    state.pushPending();
  }
};


/**
 * ParserInline.parse(str, md, env, outTokens)
 *
 * Process input string and push inline tokens into `outTokens`
 **/
ParserInline.prototype.parse = function (str, md, env, outTokens) {
  var i, rules, len;
  var state = new this.State(str, md, env, outTokens);

  this.tokenize(state);

  rules = this.ruler2.getRules('');
  len = rules.length;

  for (i = 0; i < len; i++) {
    rules[i](state);
  }
};


ParserInline.prototype.State = __webpack_require__(189);


module.exports = ParserInline;


/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Commonmark default options




module.exports = {
  options: {
    html:         true,         // Enable HTML tags in source
    xhtmlOut:     true,         // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      false,        // autoconvert URL-like texts to links

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   20            // Internal protection, recursion limit
  },

  components: {

    core: {
      rules: [
        'normalize',
        'block',
        'inline'
      ]
    },

    block: {
      rules: [
        'blockquote',
        'code',
        'fence',
        'heading',
        'hr',
        'html_block',
        'lheading',
        'list',
        'reference',
        'paragraph'
      ]
    },

    inline: {
      rules: [
        'autolink',
        'backticks',
        'emphasis',
        'entity',
        'escape',
        'html_inline',
        'image',
        'link',
        'newline',
        'text'
      ],
      rules2: [
        'balance_pairs',
        'emphasis',
        'text_collapse'
      ]
    }
  }
};


/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// markdown-it default options




module.exports = {
  options: {
    html:         false,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      false,        // autoconvert URL-like texts to links

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   100            // Internal protection, recursion limit
  },

  components: {

    core: {},
    block: {},
    inline: {}
  }
};


/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// "Zero" preset, with nothing enabled. Useful for manual configuring of simple
// modes. For example, to parse bold/italic only.




module.exports = {
  options: {
    html:         false,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      false,        // autoconvert URL-like texts to links

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   20            // Internal protection, recursion limit
  },

  components: {

    core: {
      rules: [
        'normalize',
        'block',
        'inline'
      ]
    },

    block: {
      rules: [
        'paragraph'
      ]
    },

    inline: {
      rules: [
        'text'
      ],
      rules2: [
        'balance_pairs',
        'text_collapse'
      ]
    }
  }
};


/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * class Renderer
 *
 * Generates HTML from parsed token stream. Each instance has independent
 * copy of rules. Those can be rewritten with ease. Also, you can add new
 * rules if you create plugin and adds new token types.
 **/



var assign          = __webpack_require__(0).assign;
var unescapeAll     = __webpack_require__(0).unescapeAll;
var escapeHtml      = __webpack_require__(0).escapeHtml;


////////////////////////////////////////////////////////////////////////////////

var default_rules = {};


default_rules.code_inline = function (tokens, idx, options, env, slf) {
  var token = tokens[idx];

  return  '<code' + slf.renderAttrs(token) + '>' +
          escapeHtml(tokens[idx].content) +
          '</code>';
};


default_rules.code_block = function (tokens, idx, options, env, slf) {
  var token = tokens[idx];

  return  '<pre' + slf.renderAttrs(token) + '><code>' +
          escapeHtml(tokens[idx].content) +
          '</code></pre>\n';
};


default_rules.fence = function (tokens, idx, options, env, slf) {
  var token = tokens[idx],
      info = token.info ? unescapeAll(token.info).trim() : '',
      langName = '',
      highlighted, i, tmpAttrs, tmpToken;

  if (info) {
    langName = info.split(/\s+/g)[0];
  }

  if (options.highlight) {
    highlighted = options.highlight(token.content, langName) || escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }

  if (highlighted.indexOf('<pre') === 0) {
    return highlighted + '\n';
  }

  // If language exists, inject class gently, without modifying original token.
  // May be, one day we will add .clone() for token and simplify this part, but
  // now we prefer to keep things local.
  if (info) {
    i        = token.attrIndex('class');
    tmpAttrs = token.attrs ? token.attrs.slice() : [];

    if (i < 0) {
      tmpAttrs.push([ 'class', options.langPrefix + langName ]);
    } else {
      tmpAttrs[i][1] += ' ' + options.langPrefix + langName;
    }

    // Fake token just to render attributes
    tmpToken = {
      attrs: tmpAttrs
    };

    return  '<pre><code' + slf.renderAttrs(tmpToken) + '>'
          + highlighted
          + '</code></pre>\n';
  }


  return  '<pre><code' + slf.renderAttrs(token) + '>'
        + highlighted
        + '</code></pre>\n';
};


default_rules.image = function (tokens, idx, options, env, slf) {
  var token = tokens[idx];

  // "alt" attr MUST be set, even if empty. Because it's mandatory and
  // should be placed on proper position for tests.
  //
  // Replace content with actual value

  token.attrs[token.attrIndex('alt')][1] =
    slf.renderInlineAsText(token.children, options, env);

  return slf.renderToken(tokens, idx, options);
};


default_rules.hardbreak = function (tokens, idx, options /*, env */) {
  return options.xhtmlOut ? '<br />\n' : '<br>\n';
};
default_rules.softbreak = function (tokens, idx, options /*, env */) {
  return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n';
};


default_rules.text = function (tokens, idx /*, options, env */) {
  return escapeHtml(tokens[idx].content);
};


default_rules.html_block = function (tokens, idx /*, options, env */) {
  return tokens[idx].content;
};
default_rules.html_inline = function (tokens, idx /*, options, env */) {
  return tokens[idx].content;
};


/**
 * new Renderer()
 *
 * Creates new [[Renderer]] instance and fill [[Renderer#rules]] with defaults.
 **/
function Renderer() {

  /**
   * Renderer#rules -> Object
   *
   * Contains render rules for tokens. Can be updated and extended.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.renderer.rules.strong_open  = function () { return '<b>'; };
   * md.renderer.rules.strong_close = function () { return '</b>'; };
   *
   * var result = md.renderInline(...);
   * ```
   *
   * Each rule is called as independent static function with fixed signature:
   *
   * ```javascript
   * function my_token_render(tokens, idx, options, env, renderer) {
   *   // ...
   *   return renderedHTML;
   * }
   * ```
   *
   * See [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js)
   * for more details and examples.
   **/
  this.rules = assign({}, default_rules);
}


/**
 * Renderer.renderAttrs(token) -> String
 *
 * Render token attributes to string.
 **/
Renderer.prototype.renderAttrs = function renderAttrs(token) {
  var i, l, result;

  if (!token.attrs) { return ''; }

  result = '';

  for (i = 0, l = token.attrs.length; i < l; i++) {
    result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
  }

  return result;
};


/**
 * Renderer.renderToken(tokens, idx, options) -> String
 * - tokens (Array): list of tokens
 * - idx (Numbed): token index to render
 * - options (Object): params of parser instance
 *
 * Default token renderer. Can be overriden by custom function
 * in [[Renderer#rules]].
 **/
Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
  var nextToken,
      result = '',
      needLf = false,
      token = tokens[idx];

  // Tight list paragraphs
  if (token.hidden) {
    return '';
  }

  // Insert a newline between hidden paragraph and subsequent opening
  // block-level tag.
  //
  // For example, here we should insert a newline before blockquote:
  //  - a
  //    >
  //
  if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
    result += '\n';
  }

  // Add token name, e.g. `<img`
  result += (token.nesting === -1 ? '</' : '<') + token.tag;

  // Encode attributes, e.g. `<img src="foo"`
  result += this.renderAttrs(token);

  // Add a slash for self-closing tags, e.g. `<img src="foo" /`
  if (token.nesting === 0 && options.xhtmlOut) {
    result += ' /';
  }

  // Check if we need to add a newline after this tag
  if (token.block) {
    needLf = true;

    if (token.nesting === 1) {
      if (idx + 1 < tokens.length) {
        nextToken = tokens[idx + 1];

        if (nextToken.type === 'inline' || nextToken.hidden) {
          // Block-level tag containing an inline tag.
          //
          needLf = false;

        } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
          // Opening tag + closing tag of the same type. E.g. `<li></li>`.
          //
          needLf = false;
        }
      }
    }
  }

  result += needLf ? '>\n' : '>';

  return result;
};


/**
 * Renderer.renderInline(tokens, options, env) -> String
 * - tokens (Array): list on block tokens to renter
 * - options (Object): params of parser instance
 * - env (Object): additional data from parsed input (references, for example)
 *
 * The same as [[Renderer.render]], but for single token of `inline` type.
 **/
Renderer.prototype.renderInline = function (tokens, options, env) {
  var type,
      result = '',
      rules = this.rules;

  for (var i = 0, len = tokens.length; i < len; i++) {
    type = tokens[i].type;

    if (typeof rules[type] !== 'undefined') {
      result += rules[type](tokens, i, options, env, this);
    } else {
      result += this.renderToken(tokens, i, options);
    }
  }

  return result;
};


/** internal
 * Renderer.renderInlineAsText(tokens, options, env) -> String
 * - tokens (Array): list on block tokens to renter
 * - options (Object): params of parser instance
 * - env (Object): additional data from parsed input (references, for example)
 *
 * Special kludge for image `alt` attributes to conform CommonMark spec.
 * Don't try to use it! Spec requires to show `alt` content with stripped markup,
 * instead of simple escaping.
 **/
Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
  var result = '';

  for (var i = 0, len = tokens.length; i < len; i++) {
    if (tokens[i].type === 'text') {
      result += tokens[i].content;
    } else if (tokens[i].type === 'image') {
      result += this.renderInlineAsText(tokens[i].children, options, env);
    }
  }

  return result;
};


/**
 * Renderer.render(tokens, options, env) -> String
 * - tokens (Array): list on block tokens to renter
 * - options (Object): params of parser instance
 * - env (Object): additional data from parsed input (references, for example)
 *
 * Takes token stream and generates HTML. Probably, you will never need to call
 * this method directly.
 **/
Renderer.prototype.render = function (tokens, options, env) {
  var i, len, type,
      result = '',
      rules = this.rules;

  for (i = 0, len = tokens.length; i < len; i++) {
    type = tokens[i].type;

    if (type === 'inline') {
      result += this.renderInline(tokens[i].children, options, env);
    } else if (typeof rules[type] !== 'undefined') {
      result += rules[tokens[i].type](tokens, i, options, env, this);
    } else {
      result += this.renderToken(tokens, i, options, env);
    }
  }

  return result;
};

module.exports = Renderer;


/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Block quotes



var isSpace = __webpack_require__(0).isSpace;


module.exports = function blockquote(state, startLine, endLine, silent) {
  var adjustTab,
      ch,
      i,
      initial,
      l,
      lastLineEmpty,
      lines,
      nextLine,
      offset,
      oldBMarks,
      oldBSCount,
      oldIndent,
      oldParentType,
      oldSCount,
      oldTShift,
      spaceAfterMarker,
      terminate,
      terminatorRules,
      token,
      wasOutdented,
      oldLineMax = state.lineMax,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  // check the block quote marker
  if (state.src.charCodeAt(pos++) !== 0x3E/* > */) { return false; }

  // we know that it's going to be a valid blockquote,
  // so no point trying to find the end of it in silent mode
  if (silent) { return true; }

  // skip spaces after ">" and re-calculate offset
  initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

  // skip one optional space after '>'
  if (state.src.charCodeAt(pos) === 0x20 /* space */) {
    // ' >   test '
    //     ^ -- position start of line here:
    pos++;
    initial++;
    offset++;
    adjustTab = false;
    spaceAfterMarker = true;
  } else if (state.src.charCodeAt(pos) === 0x09 /* tab */) {
    spaceAfterMarker = true;

    if ((state.bsCount[startLine] + offset) % 4 === 3) {
      // '  >\t  test '
      //       ^ -- position start of line here (tab has width===1)
      pos++;
      initial++;
      offset++;
      adjustTab = false;
    } else {
      // ' >\t  test '
      //    ^ -- position start of line here + shift bsCount slightly
      //         to make extra space appear
      adjustTab = true;
    }
  } else {
    spaceAfterMarker = false;
  }

  oldBMarks = [ state.bMarks[startLine] ];
  state.bMarks[startLine] = pos;

  while (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (isSpace(ch)) {
      if (ch === 0x09) {
        offset += 4 - (offset + state.bsCount[startLine] + (adjustTab ? 1 : 0)) % 4;
      } else {
        offset++;
      }
    } else {
      break;
    }

    pos++;
  }

  oldBSCount = [ state.bsCount[startLine] ];
  state.bsCount[startLine] = state.sCount[startLine] + 1 + (spaceAfterMarker ? 1 : 0);

  lastLineEmpty = pos >= max;

  oldSCount = [ state.sCount[startLine] ];
  state.sCount[startLine] = offset - initial;

  oldTShift = [ state.tShift[startLine] ];
  state.tShift[startLine] = pos - state.bMarks[startLine];

  terminatorRules = state.md.block.ruler.getRules('blockquote');

  oldParentType = state.parentType;
  state.parentType = 'blockquote';
  wasOutdented = false;

  // Search the end of the block
  //
  // Block ends with either:
  //  1. an empty line outside:
  //     ```
  //     > test
  //
  //     ```
  //  2. an empty line inside:
  //     ```
  //     >
  //     test
  //     ```
  //  3. another tag:
  //     ```
  //     > test
  //      - - -
  //     ```
  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
    // check if it's outdented, i.e. it's inside list item and indented
    // less than said list item:
    //
    // ```
    // 1. anything
    //    > current blockquote
    // 2. checking this line
    // ```
    if (state.sCount[nextLine] < state.blkIndent) wasOutdented = true;

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos >= max) {
      // Case 1: line is not inside the blockquote, and this line is empty.
      break;
    }

    if (state.src.charCodeAt(pos++) === 0x3E/* > */ && !wasOutdented) {
      // This line is inside the blockquote.

      // skip spaces after ">" and re-calculate offset
      initial = offset = state.sCount[nextLine] + pos - (state.bMarks[nextLine] + state.tShift[nextLine]);

      // skip one optional space after '>'
      if (state.src.charCodeAt(pos) === 0x20 /* space */) {
        // ' >   test '
        //     ^ -- position start of line here:
        pos++;
        initial++;
        offset++;
        adjustTab = false;
        spaceAfterMarker = true;
      } else if (state.src.charCodeAt(pos) === 0x09 /* tab */) {
        spaceAfterMarker = true;

        if ((state.bsCount[nextLine] + offset) % 4 === 3) {
          // '  >\t  test '
          //       ^ -- position start of line here (tab has width===1)
          pos++;
          initial++;
          offset++;
          adjustTab = false;
        } else {
          // ' >\t  test '
          //    ^ -- position start of line here + shift bsCount slightly
          //         to make extra space appear
          adjustTab = true;
        }
      } else {
        spaceAfterMarker = false;
      }

      oldBMarks.push(state.bMarks[nextLine]);
      state.bMarks[nextLine] = pos;

      while (pos < max) {
        ch = state.src.charCodeAt(pos);

        if (isSpace(ch)) {
          if (ch === 0x09) {
            offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
          } else {
            offset++;
          }
        } else {
          break;
        }

        pos++;
      }

      lastLineEmpty = pos >= max;

      oldBSCount.push(state.bsCount[nextLine]);
      state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);

      oldSCount.push(state.sCount[nextLine]);
      state.sCount[nextLine] = offset - initial;

      oldTShift.push(state.tShift[nextLine]);
      state.tShift[nextLine] = pos - state.bMarks[nextLine];
      continue;
    }

    // Case 2: line is not inside the blockquote, and the last line was empty.
    if (lastLineEmpty) { break; }

    // Case 3: another tag found.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }

    if (terminate) {
      // Quirk to enforce "hard termination mode" for paragraphs;
      // normally if you call `tokenize(state, startLine, nextLine)`,
      // paragraphs will look below nextLine for paragraph continuation,
      // but if blockquote is terminated by another tag, they shouldn't
      state.lineMax = nextLine;

      if (state.blkIndent !== 0) {
        // state.blkIndent was non-zero, we now set it to zero,
        // so we need to re-calculate all offsets to appear as
        // if indent wasn't changed
        oldBMarks.push(state.bMarks[nextLine]);
        oldBSCount.push(state.bsCount[nextLine]);
        oldTShift.push(state.tShift[nextLine]);
        oldSCount.push(state.sCount[nextLine]);
        state.sCount[nextLine] -= state.blkIndent;
      }

      break;
    }

    oldBMarks.push(state.bMarks[nextLine]);
    oldBSCount.push(state.bsCount[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    oldSCount.push(state.sCount[nextLine]);

    // A negative indentation means that this is a paragraph continuation
    //
    state.sCount[nextLine] = -1;
  }

  oldIndent = state.blkIndent;
  state.blkIndent = 0;

  token        = state.push('blockquote_open', 'blockquote', 1);
  token.markup = '>';
  token.map    = lines = [ startLine, 0 ];

  state.md.block.tokenize(state, startLine, nextLine);

  token        = state.push('blockquote_close', 'blockquote', -1);
  token.markup = '>';

  state.lineMax = oldLineMax;
  state.parentType = oldParentType;
  lines[1] = state.line;

  // Restore original tShift; this might not be necessary since the parser
  // has already been here, but just to make sure we can do that.
  for (i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
    state.sCount[i + startLine] = oldSCount[i];
    state.bsCount[i + startLine] = oldBSCount[i];
  }
  state.blkIndent = oldIndent;

  return true;
};


/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Code block (4 spaces padded)




module.exports = function code(state, startLine, endLine/*, silent*/) {
  var nextLine, last, token;

  if (state.sCount[startLine] - state.blkIndent < 4) { return false; }

  last = nextLine = startLine + 1;

  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }

    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }

  state.line = last;

  token         = state.push('code_block', 'code', 0);
  token.content = state.getLines(startLine, last, 4 + state.blkIndent, true);
  token.map     = [ startLine, state.line ];

  return true;
};


/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// fences (``` lang, ~~~ lang)




module.exports = function fence(state, startLine, endLine, silent) {
  var marker, len, params, nextLine, mem, token, markup,
      haveEndMarker = false,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  if (pos + 3 > max) { return false; }

  marker = state.src.charCodeAt(pos);

  if (marker !== 0x7E/* ~ */ && marker !== 0x60 /* ` */) {
    return false;
  }

  // scan marker length
  mem = pos;
  pos = state.skipChars(pos, marker);

  len = pos - mem;

  if (len < 3) { return false; }

  markup = state.src.slice(mem, pos);
  params = state.src.slice(pos, max);

  if (marker === 0x60 /* ` */) {
    if (params.indexOf(String.fromCharCode(marker)) >= 0) {
      return false;
    }
  }

  // Since start is found, we can report success here in validation mode
  if (silent) { return true; }

  // search end of block
  nextLine = startLine;

  for (;;) {
    nextLine++;
    if (nextLine >= endLine) {
      // unclosed block should be autoclosed by end of document.
      // also block seems to be autoclosed by end of parent
      break;
    }

    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
      // non-empty line with negative indent should stop the list:
      // - ```
      //  test
      break;
    }

    if (state.src.charCodeAt(pos) !== marker) { continue; }

    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      // closing fence should be indented less than 4 spaces
      continue;
    }

    pos = state.skipChars(pos, marker);

    // closing code fence must be at least as long as the opening one
    if (pos - mem < len) { continue; }

    // make sure tail has spaces only
    pos = state.skipSpaces(pos);

    if (pos < max) { continue; }

    haveEndMarker = true;
    // found!
    break;
  }

  // If a fence has heading spaces, they should be removed from its inner block
  len = state.sCount[startLine];

  state.line = nextLine + (haveEndMarker ? 1 : 0);

  token         = state.push('fence', 'code', 0);
  token.info    = params;
  token.content = state.getLines(startLine + 1, nextLine, len, true);
  token.markup  = markup;
  token.map     = [ startLine, state.line ];

  return true;
};


/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// heading (#, ##, ...)



var isSpace = __webpack_require__(0).isSpace;


module.exports = function heading(state, startLine, endLine, silent) {
  var ch, level, tmp, token,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  ch  = state.src.charCodeAt(pos);

  if (ch !== 0x23/* # */ || pos >= max) { return false; }

  // count heading level
  level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 0x23/* # */ && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }

  if (level > 6 || (pos < max && !isSpace(ch))) { return false; }

  if (silent) { return true; }

  // Let's cut tails like '    ###  ' from the end of string

  max = state.skipSpacesBack(max, pos);
  tmp = state.skipCharsBack(max, 0x23, pos); // #
  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
    max = tmp;
  }

  state.line = startLine + 1;

  token        = state.push('heading_open', 'h' + String(level), 1);
  token.markup = '########'.slice(0, level);
  token.map    = [ startLine, state.line ];

  token          = state.push('inline', '', 0);
  token.content  = state.src.slice(pos, max).trim();
  token.map      = [ startLine, state.line ];
  token.children = [];

  token        = state.push('heading_close', 'h' + String(level), -1);
  token.markup = '########'.slice(0, level);

  return true;
};


/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Horizontal rule



var isSpace = __webpack_require__(0).isSpace;


module.exports = function hr(state, startLine, endLine, silent) {
  var marker, cnt, ch, token,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  marker = state.src.charCodeAt(pos++);

  // Check hr marker
  if (marker !== 0x2A/* * */ &&
      marker !== 0x2D/* - */ &&
      marker !== 0x5F/* _ */) {
    return false;
  }

  // markers can be mixed with spaces, but there should be at least 3 of them

  cnt = 1;
  while (pos < max) {
    ch = state.src.charCodeAt(pos++);
    if (ch !== marker && !isSpace(ch)) { return false; }
    if (ch === marker) { cnt++; }
  }

  if (cnt < 3) { return false; }

  if (silent) { return true; }

  state.line = startLine + 1;

  token        = state.push('hr', 'hr', 0);
  token.map    = [ startLine, state.line ];
  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));

  return true;
};


/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// HTML block




var block_names = __webpack_require__(148);
var HTML_OPEN_CLOSE_TAG_RE = __webpack_require__(55).HTML_OPEN_CLOSE_TAG_RE;

// An array of opening and corresponding closing sequences for html tags,
// last argument defines whether it can terminate a paragraph or not
//
var HTML_SEQUENCES = [
  [ /^<(script|pre|style)(?=(\s|>|$))/i, /<\/(script|pre|style)>/i, true ],
  [ /^<!--/,        /-->/,   true ],
  [ /^<\?/,         /\?>/,   true ],
  [ /^<![A-Z]/,     />/,     true ],
  [ /^<!\[CDATA\[/, /\]\]>/, true ],
  [ new RegExp('^</?(' + block_names.join('|') + ')(?=(\\s|/?>|$))', 'i'), /^$/, true ],
  [ new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + '\\s*$'),  /^$/, false ]
];


module.exports = function html_block(state, startLine, endLine, silent) {
  var i, nextLine, token, lineText,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  if (!state.md.options.html) { return false; }

  if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

  lineText = state.src.slice(pos, max);

  for (i = 0; i < HTML_SEQUENCES.length; i++) {
    if (HTML_SEQUENCES[i][0].test(lineText)) { break; }
  }

  if (i === HTML_SEQUENCES.length) { return false; }

  if (silent) {
    // true if this sequence can be a terminator, false otherwise
    return HTML_SEQUENCES[i][2];
  }

  nextLine = startLine + 1;

  // If we are here - we detected HTML block.
  // Let's roll down till block end.
  if (!HTML_SEQUENCES[i][1].test(lineText)) {
    for (; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) { break; }

      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      lineText = state.src.slice(pos, max);

      if (HTML_SEQUENCES[i][1].test(lineText)) {
        if (lineText.length !== 0) { nextLine++; }
        break;
      }
    }
  }

  state.line = nextLine;

  token         = state.push('html_block', '', 0);
  token.map     = [ startLine, nextLine ];
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);

  return true;
};


/***/ }),
/* 167 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// lheading (---, ===)




module.exports = function lheading(state, startLine, endLine/*, silent*/) {
  var content, terminate, i, l, token, pos, max, level, marker,
      nextLine = startLine + 1, oldParentType,
      terminatorRules = state.md.block.ruler.getRules('paragraph');

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  oldParentType = state.parentType;
  state.parentType = 'paragraph'; // use paragraph to match terminatorRules

  // jump line-by-line until empty one or EOF
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    // this would be a code block normally, but after paragraph
    // it's considered a lazy continuation regardless of what's there
    if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

    //
    // Check for underline in setext header
    //
    if (state.sCount[nextLine] >= state.blkIndent) {
      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos < max) {
        marker = state.src.charCodeAt(pos);

        if (marker === 0x2D/* - */ || marker === 0x3D/* = */) {
          pos = state.skipChars(pos, marker);
          pos = state.skipSpaces(pos);

          if (pos >= max) {
            level = (marker === 0x3D/* = */ ? 1 : 2);
            break;
          }
        }
      }
    }

    // quirk for blockquotes, this line should already be checked by that rule
    if (state.sCount[nextLine] < 0) { continue; }

    // Some tags can terminate paragraph without empty line.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }
  }

  if (!level) {
    // Didn't find valid underline
    return false;
  }

  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

  state.line = nextLine + 1;

  token          = state.push('heading_open', 'h' + String(level), 1);
  token.markup   = String.fromCharCode(marker);
  token.map      = [ startLine, state.line ];

  token          = state.push('inline', '', 0);
  token.content  = content;
  token.map      = [ startLine, state.line - 1 ];
  token.children = [];

  token          = state.push('heading_close', 'h' + String(level), -1);
  token.markup   = String.fromCharCode(marker);

  state.parentType = oldParentType;

  return true;
};


/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Lists



var isSpace = __webpack_require__(0).isSpace;


// Search `[-+*][\n ]`, returns next pos after marker on success
// or -1 on fail.
function skipBulletListMarker(state, startLine) {
  var marker, pos, max, ch;

  pos = state.bMarks[startLine] + state.tShift[startLine];
  max = state.eMarks[startLine];

  marker = state.src.charCodeAt(pos++);
  // Check bullet
  if (marker !== 0x2A/* * */ &&
      marker !== 0x2D/* - */ &&
      marker !== 0x2B/* + */) {
    return -1;
  }

  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (!isSpace(ch)) {
      // " -test " - is not a list item
      return -1;
    }
  }

  return pos;
}

// Search `\d+[.)][\n ]`, returns next pos after marker on success
// or -1 on fail.
function skipOrderedListMarker(state, startLine) {
  var ch,
      start = state.bMarks[startLine] + state.tShift[startLine],
      pos = start,
      max = state.eMarks[startLine];

  // List marker should have at least 2 chars (digit + dot)
  if (pos + 1 >= max) { return -1; }

  ch = state.src.charCodeAt(pos++);

  if (ch < 0x30/* 0 */ || ch > 0x39/* 9 */) { return -1; }

  for (;;) {
    // EOL -> fail
    if (pos >= max) { return -1; }

    ch = state.src.charCodeAt(pos++);

    if (ch >= 0x30/* 0 */ && ch <= 0x39/* 9 */) {

      // List marker should have no more than 9 digits
      // (prevents integer overflow in browsers)
      if (pos - start >= 10) { return -1; }

      continue;
    }

    // found valid marker
    if (ch === 0x29/* ) */ || ch === 0x2e/* . */) {
      break;
    }

    return -1;
  }


  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (!isSpace(ch)) {
      // " 1.test " - is not a list item
      return -1;
    }
  }
  return pos;
}

function markTightParagraphs(state, idx) {
  var i, l,
      level = state.level + 2;

  for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
      state.tokens[i + 2].hidden = true;
      state.tokens[i].hidden = true;
      i += 2;
    }
  }
}


module.exports = function list(state, startLine, endLine, silent) {
  var ch,
      contentStart,
      i,
      indent,
      indentAfterMarker,
      initial,
      isOrdered,
      itemLines,
      l,
      listLines,
      listTokIdx,
      markerCharCode,
      markerValue,
      max,
      nextLine,
      offset,
      oldListIndent,
      oldParentType,
      oldSCount,
      oldTShift,
      oldTight,
      pos,
      posAfterMarker,
      prevEmptyEnd,
      start,
      terminate,
      terminatorRules,
      token,
      isTerminatingParagraph = false,
      tight = true;

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  // Special case:
  //  - item 1
  //   - item 2
  //    - item 3
  //     - item 4
  //      - this one is a paragraph continuation
  if (state.listIndent >= 0 &&
      state.sCount[startLine] - state.listIndent >= 4 &&
      state.sCount[startLine] < state.blkIndent) {
    return false;
  }

  // limit conditions when list can interrupt
  // a paragraph (validation mode only)
  if (silent && state.parentType === 'paragraph') {
    // Next list item should still terminate previous list item;
    //
    // This code can fail if plugins use blkIndent as well as lists,
    // but I hope the spec gets fixed long before that happens.
    //
    if (state.tShift[startLine] >= state.blkIndent) {
      isTerminatingParagraph = true;
    }
  }

  // Detect list type and position after marker
  if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) {
    isOrdered = true;
    start = state.bMarks[startLine] + state.tShift[startLine];
    markerValue = Number(state.src.substr(start, posAfterMarker - start - 1));

    // If we're starting a new ordered list right after
    // a paragraph, it should start with 1.
    if (isTerminatingParagraph && markerValue !== 1) return false;

  } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) {
    isOrdered = false;

  } else {
    return false;
  }

  // If we're starting a new unordered list right after
  // a paragraph, first line should not be empty.
  if (isTerminatingParagraph) {
    if (state.skipSpaces(posAfterMarker) >= state.eMarks[startLine]) return false;
  }

  // We should terminate list on style change. Remember first one to compare.
  markerCharCode = state.src.charCodeAt(posAfterMarker - 1);

  // For validation mode we can terminate immediately
  if (silent) { return true; }

  // Start list
  listTokIdx = state.tokens.length;

  if (isOrdered) {
    token       = state.push('ordered_list_open', 'ol', 1);
    if (markerValue !== 1) {
      token.attrs = [ [ 'start', markerValue ] ];
    }

  } else {
    token       = state.push('bullet_list_open', 'ul', 1);
  }

  token.map    = listLines = [ startLine, 0 ];
  token.markup = String.fromCharCode(markerCharCode);

  //
  // Iterate list items
  //

  nextLine = startLine;
  prevEmptyEnd = false;
  terminatorRules = state.md.block.ruler.getRules('list');

  oldParentType = state.parentType;
  state.parentType = 'list';

  while (nextLine < endLine) {
    pos = posAfterMarker;
    max = state.eMarks[nextLine];

    initial = offset = state.sCount[nextLine] + posAfterMarker - (state.bMarks[startLine] + state.tShift[startLine]);

    while (pos < max) {
      ch = state.src.charCodeAt(pos);

      if (ch === 0x09) {
        offset += 4 - (offset + state.bsCount[nextLine]) % 4;
      } else if (ch === 0x20) {
        offset++;
      } else {
        break;
      }

      pos++;
    }

    contentStart = pos;

    if (contentStart >= max) {
      // trimming space in "-    \n  3" case, indent is 1 here
      indentAfterMarker = 1;
    } else {
      indentAfterMarker = offset - initial;
    }

    // If we have more than 4 spaces, the indent is 1
    // (the rest is just indented code block)
    if (indentAfterMarker > 4) { indentAfterMarker = 1; }

    // "  -  test"
    //  ^^^^^ - calculating total length of this thing
    indent = initial + indentAfterMarker;

    // Run subparser & write tokens
    token        = state.push('list_item_open', 'li', 1);
    token.markup = String.fromCharCode(markerCharCode);
    token.map    = itemLines = [ startLine, 0 ];

    // change current state, then restore it after parser subcall
    oldTight = state.tight;
    oldTShift = state.tShift[startLine];
    oldSCount = state.sCount[startLine];

    //  - example list
    // ^ listIndent position will be here
    //   ^ blkIndent position will be here
    //
    oldListIndent = state.listIndent;
    state.listIndent = state.blkIndent;
    state.blkIndent = indent;

    state.tight = true;
    state.tShift[startLine] = contentStart - state.bMarks[startLine];
    state.sCount[startLine] = offset;

    if (contentStart >= max && state.isEmpty(startLine + 1)) {
      // workaround for this case
      // (list item is empty, list terminates before "foo"):
      // ~~~~~~~~
      //   -
      //
      //     foo
      // ~~~~~~~~
      state.line = Math.min(state.line + 2, endLine);
    } else {
      state.md.block.tokenize(state, startLine, endLine, true);
    }

    // If any of list item is tight, mark list as tight
    if (!state.tight || prevEmptyEnd) {
      tight = false;
    }
    // Item become loose if finish with empty line,
    // but we should filter last element, because it means list finish
    prevEmptyEnd = (state.line - startLine) > 1 && state.isEmpty(state.line - 1);

    state.blkIndent = state.listIndent;
    state.listIndent = oldListIndent;
    state.tShift[startLine] = oldTShift;
    state.sCount[startLine] = oldSCount;
    state.tight = oldTight;

    token        = state.push('list_item_close', 'li', -1);
    token.markup = String.fromCharCode(markerCharCode);

    nextLine = startLine = state.line;
    itemLines[1] = nextLine;
    contentStart = state.bMarks[startLine];

    if (nextLine >= endLine) { break; }

    //
    // Try to check if list is terminated or continued.
    //
    if (state.sCount[nextLine] < state.blkIndent) { break; }

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[startLine] - state.blkIndent >= 4) { break; }

    // fail if terminating block found
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }

    // fail if list has another type
    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) { break; }
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) { break; }
    }

    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) { break; }
  }

  // Finalize list
  if (isOrdered) {
    token = state.push('ordered_list_close', 'ol', -1);
  } else {
    token = state.push('bullet_list_close', 'ul', -1);
  }
  token.markup = String.fromCharCode(markerCharCode);

  listLines[1] = nextLine;
  state.line = nextLine;

  state.parentType = oldParentType;

  // mark paragraphs tight if needed
  if (tight) {
    markTightParagraphs(state, listTokIdx);
  }

  return true;
};


/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Paragraph




module.exports = function paragraph(state, startLine/*, endLine*/) {
  var content, terminate, i, l, token, oldParentType,
      nextLine = startLine + 1,
      terminatorRules = state.md.block.ruler.getRules('paragraph'),
      endLine = state.lineMax;

  oldParentType = state.parentType;
  state.parentType = 'paragraph';

  // jump line-by-line until empty one or EOF
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    // this would be a code block normally, but after paragraph
    // it's considered a lazy continuation regardless of what's there
    if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

    // quirk for blockquotes, this line should already be checked by that rule
    if (state.sCount[nextLine] < 0) { continue; }

    // Some tags can terminate paragraph without empty line.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }
  }

  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

  state.line = nextLine;

  token          = state.push('paragraph_open', 'p', 1);
  token.map      = [ startLine, state.line ];

  token          = state.push('inline', '', 0);
  token.content  = content;
  token.map      = [ startLine, state.line ];
  token.children = [];

  token          = state.push('paragraph_close', 'p', -1);

  state.parentType = oldParentType;

  return true;
};


/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var normalizeReference   = __webpack_require__(0).normalizeReference;
var isSpace              = __webpack_require__(0).isSpace;


module.exports = function reference(state, startLine, _endLine, silent) {
  var ch,
      destEndPos,
      destEndLineNo,
      endLine,
      href,
      i,
      l,
      label,
      labelEnd,
      oldParentType,
      res,
      start,
      str,
      terminate,
      terminatorRules,
      title,
      lines = 0,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine],
      nextLine = startLine + 1;

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  if (state.src.charCodeAt(pos) !== 0x5B/* [ */) { return false; }

  // Simple check to quickly interrupt scan on [link](url) at the start of line.
  // Can be useful on practice: https://github.com/markdown-it/markdown-it/issues/54
  while (++pos < max) {
    if (state.src.charCodeAt(pos) === 0x5D /* ] */ &&
        state.src.charCodeAt(pos - 1) !== 0x5C/* \ */) {
      if (pos + 1 === max) { return false; }
      if (state.src.charCodeAt(pos + 1) !== 0x3A/* : */) { return false; }
      break;
    }
  }

  endLine = state.lineMax;

  // jump line-by-line until empty one or EOF
  terminatorRules = state.md.block.ruler.getRules('reference');

  oldParentType = state.parentType;
  state.parentType = 'reference';

  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    // this would be a code block normally, but after paragraph
    // it's considered a lazy continuation regardless of what's there
    if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

    // quirk for blockquotes, this line should already be checked by that rule
    if (state.sCount[nextLine] < 0) { continue; }

    // Some tags can terminate paragraph without empty line.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }
  }

  str = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
  max = str.length;

  for (pos = 1; pos < max; pos++) {
    ch = str.charCodeAt(pos);
    if (ch === 0x5B /* [ */) {
      return false;
    } else if (ch === 0x5D /* ] */) {
      labelEnd = pos;
      break;
    } else if (ch === 0x0A /* \n */) {
      lines++;
    } else if (ch === 0x5C /* \ */) {
      pos++;
      if (pos < max && str.charCodeAt(pos) === 0x0A) {
        lines++;
      }
    }
  }

  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A/* : */) { return false; }

  // [label]:   destination   'title'
  //         ^^^ skip optional whitespace here
  for (pos = labelEnd + 2; pos < max; pos++) {
    ch = str.charCodeAt(pos);
    if (ch === 0x0A) {
      lines++;
    } else if (isSpace(ch)) {
      /*eslint no-empty:0*/
    } else {
      break;
    }
  }

  // [label]:   destination   'title'
  //            ^^^^^^^^^^^ parse this
  res = state.md.helpers.parseLinkDestination(str, pos, max);
  if (!res.ok) { return false; }

  href = state.md.normalizeLink(res.str);
  if (!state.md.validateLink(href)) { return false; }

  pos = res.pos;
  lines += res.lines;

  // save cursor state, we could require to rollback later
  destEndPos = pos;
  destEndLineNo = lines;

  // [label]:   destination   'title'
  //                       ^^^ skipping those spaces
  start = pos;
  for (; pos < max; pos++) {
    ch = str.charCodeAt(pos);
    if (ch === 0x0A) {
      lines++;
    } else if (isSpace(ch)) {
      /*eslint no-empty:0*/
    } else {
      break;
    }
  }

  // [label]:   destination   'title'
  //                          ^^^^^^^ parse this
  res = state.md.helpers.parseLinkTitle(str, pos, max);
  if (pos < max && start !== pos && res.ok) {
    title = res.str;
    pos = res.pos;
    lines += res.lines;
  } else {
    title = '';
    pos = destEndPos;
    lines = destEndLineNo;
  }

  // skip trailing spaces until the rest of the line
  while (pos < max) {
    ch = str.charCodeAt(pos);
    if (!isSpace(ch)) { break; }
    pos++;
  }

  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
    if (title) {
      // garbage at the end of the line after title,
      // but it could still be a valid reference if we roll back
      title = '';
      pos = destEndPos;
      lines = destEndLineNo;
      while (pos < max) {
        ch = str.charCodeAt(pos);
        if (!isSpace(ch)) { break; }
        pos++;
      }
    }
  }

  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
    // garbage at the end of the line
    return false;
  }

  label = normalizeReference(str.slice(1, labelEnd));
  if (!label) {
    // CommonMark 0.20 disallows empty labels
    return false;
  }

  // Reference can not terminate anything. This check is for safety only.
  /*istanbul ignore if*/
  if (silent) { return true; }

  if (typeof state.env.references === 'undefined') {
    state.env.references = {};
  }
  if (typeof state.env.references[label] === 'undefined') {
    state.env.references[label] = { title: title, href: href };
  }

  state.parentType = oldParentType;

  state.line = startLine + lines + 1;
  return true;
};


/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Parser state class



var Token = __webpack_require__(36);
var isSpace = __webpack_require__(0).isSpace;


function StateBlock(src, md, env, tokens) {
  var ch, s, start, pos, len, indent, offset, indent_found;

  this.src = src;

  // link to parser instance
  this.md     = md;

  this.env = env;

  //
  // Internal state vartiables
  //

  this.tokens = tokens;

  this.bMarks = [];  // line begin offsets for fast jumps
  this.eMarks = [];  // line end offsets for fast jumps
  this.tShift = [];  // offsets of the first non-space characters (tabs not expanded)
  this.sCount = [];  // indents for each line (tabs expanded)

  // An amount of virtual spaces (tabs expanded) between beginning
  // of each line (bMarks) and real beginning of that line.
  //
  // It exists only as a hack because blockquotes override bMarks
  // losing information in the process.
  //
  // It's used only when expanding tabs, you can think about it as
  // an initial tab length, e.g. bsCount=21 applied to string `\t123`
  // means first tab should be expanded to 4-21%4 === 3 spaces.
  //
  this.bsCount = [];

  // block parser variables
  this.blkIndent  = 0; // required block content indent (for example, if we are
                       // inside a list, it would be positioned after list marker)
  this.line       = 0; // line index in src
  this.lineMax    = 0; // lines count
  this.tight      = false;  // loose/tight mode for lists
  this.ddIndent   = -1; // indent of the current dd block (-1 if there isn't any)
  this.listIndent = -1; // indent of the current list block (-1 if there isn't any)

  // can be 'blockquote', 'list', 'root', 'paragraph' or 'reference'
  // used in lists to determine if they interrupt a paragraph
  this.parentType = 'root';

  this.level = 0;

  // renderer
  this.result = '';

  // Create caches
  // Generate markers.
  s = this.src;
  indent_found = false;

  for (start = pos = indent = offset = 0, len = s.length; pos < len; pos++) {
    ch = s.charCodeAt(pos);

    if (!indent_found) {
      if (isSpace(ch)) {
        indent++;

        if (ch === 0x09) {
          offset += 4 - offset % 4;
        } else {
          offset++;
        }
        continue;
      } else {
        indent_found = true;
      }
    }

    if (ch === 0x0A || pos === len - 1) {
      if (ch !== 0x0A) { pos++; }
      this.bMarks.push(start);
      this.eMarks.push(pos);
      this.tShift.push(indent);
      this.sCount.push(offset);
      this.bsCount.push(0);

      indent_found = false;
      indent = 0;
      offset = 0;
      start = pos + 1;
    }
  }

  // Push fake entry to simplify cache bounds checks
  this.bMarks.push(s.length);
  this.eMarks.push(s.length);
  this.tShift.push(0);
  this.sCount.push(0);
  this.bsCount.push(0);

  this.lineMax = this.bMarks.length - 1; // don't count last fake line
}

// Push new token to "stream".
//
StateBlock.prototype.push = function (type, tag, nesting) {
  var token = new Token(type, tag, nesting);
  token.block = true;

  if (nesting < 0) this.level--; // closing tag
  token.level = this.level;
  if (nesting > 0) this.level++; // opening tag

  this.tokens.push(token);
  return token;
};

StateBlock.prototype.isEmpty = function isEmpty(line) {
  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
};

StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
  for (var max = this.lineMax; from < max; from++) {
    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
      break;
    }
  }
  return from;
};

// Skip spaces from given position.
StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
  var ch;

  for (var max = this.src.length; pos < max; pos++) {
    ch = this.src.charCodeAt(pos);
    if (!isSpace(ch)) { break; }
  }
  return pos;
};

// Skip spaces from given position in reverse.
StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
  if (pos <= min) { return pos; }

  while (pos > min) {
    if (!isSpace(this.src.charCodeAt(--pos))) { return pos + 1; }
  }
  return pos;
};

// Skip char codes from given position
StateBlock.prototype.skipChars = function skipChars(pos, code) {
  for (var max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== code) { break; }
  }
  return pos;
};

// Skip char codes reverse from given position - 1
StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
  if (pos <= min) { return pos; }

  while (pos > min) {
    if (code !== this.src.charCodeAt(--pos)) { return pos + 1; }
  }
  return pos;
};

// cut lines range from source.
StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
  var i, lineIndent, ch, first, last, queue, lineStart,
      line = begin;

  if (begin >= end) {
    return '';
  }

  queue = new Array(end - begin);

  for (i = 0; line < end; line++, i++) {
    lineIndent = 0;
    lineStart = first = this.bMarks[line];

    if (line + 1 < end || keepLastLF) {
      // No need for bounds check because we have fake entry on tail.
      last = this.eMarks[line] + 1;
    } else {
      last = this.eMarks[line];
    }

    while (first < last && lineIndent < indent) {
      ch = this.src.charCodeAt(first);

      if (isSpace(ch)) {
        if (ch === 0x09) {
          lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
        } else {
          lineIndent++;
        }
      } else if (first - lineStart < this.tShift[line]) {
        // patched tShift masked characters to look like spaces (blockquotes, list markers)
        lineIndent++;
      } else {
        break;
      }

      first++;
    }

    if (lineIndent > indent) {
      // partially expanding tabs in code blocks, e.g '\t\tfoobar'
      // with indent=2 becomes '  \tfoobar'
      queue[i] = new Array(lineIndent - indent + 1).join(' ') + this.src.slice(first, last);
    } else {
      queue[i] = this.src.slice(first, last);
    }
  }

  return queue.join('');
};

// re-export Token class to use in block rules
StateBlock.prototype.Token = Token;


module.exports = StateBlock;


/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// GFM table, non-standard



var isSpace = __webpack_require__(0).isSpace;


function getLine(state, line) {
  var pos = state.bMarks[line] + state.blkIndent,
      max = state.eMarks[line];

  return state.src.substr(pos, max - pos);
}

function escapedSplit(str) {
  var result = [],
      pos = 0,
      max = str.length,
      ch,
      escapes = 0,
      lastPos = 0,
      backTicked = false,
      lastBackTick = 0;

  ch  = str.charCodeAt(pos);

  while (pos < max) {
    if (ch === 0x60/* ` */) {
      if (backTicked) {
        // make \` close code sequence, but not open it;
        // the reason is: `\` is correct code block
        backTicked = false;
        lastBackTick = pos;
      } else if (escapes % 2 === 0) {
        backTicked = true;
        lastBackTick = pos;
      }
    } else if (ch === 0x7c/* | */ && (escapes % 2 === 0) && !backTicked) {
      result.push(str.substring(lastPos, pos));
      lastPos = pos + 1;
    }

    if (ch === 0x5c/* \ */) {
      escapes++;
    } else {
      escapes = 0;
    }

    pos++;

    // If there was an un-closed backtick, go back to just after
    // the last backtick, but as if it was a normal character
    if (pos === max && backTicked) {
      backTicked = false;
      pos = lastBackTick + 1;
    }

    ch = str.charCodeAt(pos);
  }

  result.push(str.substring(lastPos));

  return result;
}


module.exports = function table(state, startLine, endLine, silent) {
  var ch, lineText, pos, i, nextLine, columns, columnCount, token,
      aligns, t, tableLines, tbodyLines;

  // should have at least two lines
  if (startLine + 2 > endLine) { return false; }

  nextLine = startLine + 1;

  if (state.sCount[nextLine] < state.blkIndent) { return false; }

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[nextLine] - state.blkIndent >= 4) { return false; }

  // first character of the second line should be '|', '-', ':',
  // and no other characters are allowed but spaces;
  // basically, this is the equivalent of /^[-:|][-:|\s]*$/ regexp

  pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) { return false; }

  ch = state.src.charCodeAt(pos++);
  if (ch !== 0x7C/* | */ && ch !== 0x2D/* - */ && ch !== 0x3A/* : */) { return false; }

  while (pos < state.eMarks[nextLine]) {
    ch = state.src.charCodeAt(pos);

    if (ch !== 0x7C/* | */ && ch !== 0x2D/* - */ && ch !== 0x3A/* : */ && !isSpace(ch)) { return false; }

    pos++;
  }

  lineText = getLine(state, startLine + 1);

  columns = lineText.split('|');
  aligns = [];
  for (i = 0; i < columns.length; i++) {
    t = columns[i].trim();
    if (!t) {
      // allow empty columns before and after table, but not in between columns;
      // e.g. allow ` |---| `, disallow ` ---||--- `
      if (i === 0 || i === columns.length - 1) {
        continue;
      } else {
        return false;
      }
    }

    if (!/^:?-+:?$/.test(t)) { return false; }
    if (t.charCodeAt(t.length - 1) === 0x3A/* : */) {
      aligns.push(t.charCodeAt(0) === 0x3A/* : */ ? 'center' : 'right');
    } else if (t.charCodeAt(0) === 0x3A/* : */) {
      aligns.push('left');
    } else {
      aligns.push('');
    }
  }

  lineText = getLine(state, startLine).trim();
  if (lineText.indexOf('|') === -1) { return false; }
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
  columns = escapedSplit(lineText.replace(/^\||\|$/g, ''));

  // header row will define an amount of columns in the entire table,
  // and align row shouldn't be smaller than that (the rest of the rows can)
  columnCount = columns.length;
  if (columnCount > aligns.length) { return false; }

  if (silent) { return true; }

  token     = state.push('table_open', 'table', 1);
  token.map = tableLines = [ startLine, 0 ];

  token     = state.push('thead_open', 'thead', 1);
  token.map = [ startLine, startLine + 1 ];

  token     = state.push('tr_open', 'tr', 1);
  token.map = [ startLine, startLine + 1 ];

  for (i = 0; i < columns.length; i++) {
    token          = state.push('th_open', 'th', 1);
    token.map      = [ startLine, startLine + 1 ];
    if (aligns[i]) {
      token.attrs  = [ [ 'style', 'text-align:' + aligns[i] ] ];
    }

    token          = state.push('inline', '', 0);
    token.content  = columns[i].trim();
    token.map      = [ startLine, startLine + 1 ];
    token.children = [];

    token          = state.push('th_close', 'th', -1);
  }

  token     = state.push('tr_close', 'tr', -1);
  token     = state.push('thead_close', 'thead', -1);

  token     = state.push('tbody_open', 'tbody', 1);
  token.map = tbodyLines = [ startLine + 2, 0 ];

  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) { break; }

    lineText = getLine(state, nextLine).trim();
    if (lineText.indexOf('|') === -1) { break; }
    if (state.sCount[nextLine] - state.blkIndent >= 4) { break; }
    columns = escapedSplit(lineText.replace(/^\||\|$/g, ''));

    token = state.push('tr_open', 'tr', 1);
    for (i = 0; i < columnCount; i++) {
      token          = state.push('td_open', 'td', 1);
      if (aligns[i]) {
        token.attrs  = [ [ 'style', 'text-align:' + aligns[i] ] ];
      }

      token          = state.push('inline', '', 0);
      token.content  = columns[i] ? columns[i].trim() : '';
      token.children = [];

      token          = state.push('td_close', 'td', -1);
    }
    token = state.push('tr_close', 'tr', -1);
  }
  token = state.push('tbody_close', 'tbody', -1);
  token = state.push('table_close', 'table', -1);

  tableLines[1] = tbodyLines[1] = nextLine;
  state.line = nextLine;
  return true;
};


/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports = function block(state) {
  var token;

  if (state.inlineMode) {
    token          = new state.Token('inline', '', 0);
    token.content  = state.src;
    token.map      = [ 0, 1 ];
    token.children = [];
    state.tokens.push(token);
  } else {
    state.md.block.parse(state.src, state.md, state.env, state.tokens);
  }
};


/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function inline(state) {
  var tokens = state.tokens, tok, i, l;

  // Parse inlines
  for (i = 0, l = tokens.length; i < l; i++) {
    tok = tokens[i];
    if (tok.type === 'inline') {
      state.md.inline.parse(tok.content, state.md, state.env, tok.children);
    }
  }
};


/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Replace link-like texts with link nodes.
//
// Currently restricted by `md.validateLink()` to http/https/ftp
//



var arrayReplaceAt = __webpack_require__(0).arrayReplaceAt;


function isLinkOpen(str) {
  return /^<a[>\s]/i.test(str);
}
function isLinkClose(str) {
  return /^<\/a\s*>/i.test(str);
}


module.exports = function linkify(state) {
  var i, j, l, tokens, token, currentToken, nodes, ln, text, pos, lastPos,
      level, htmlLinkLevel, url, fullUrl, urlText,
      blockTokens = state.tokens,
      links;

  if (!state.md.options.linkify) { return; }

  for (j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== 'inline' ||
        !state.md.linkify.pretest(blockTokens[j].content)) {
      continue;
    }

    tokens = blockTokens[j].children;

    htmlLinkLevel = 0;

    // We scan from the end, to keep position when new tags added.
    // Use reversed logic in links start/end match
    for (i = tokens.length - 1; i >= 0; i--) {
      currentToken = tokens[i];

      // Skip content of markdown links
      if (currentToken.type === 'link_close') {
        i--;
        while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
          i--;
        }
        continue;
      }

      // Skip content of html tag links
      if (currentToken.type === 'html_inline') {
        if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
          htmlLinkLevel--;
        }
        if (isLinkClose(currentToken.content)) {
          htmlLinkLevel++;
        }
      }
      if (htmlLinkLevel > 0) { continue; }

      if (currentToken.type === 'text' && state.md.linkify.test(currentToken.content)) {

        text = currentToken.content;
        links = state.md.linkify.match(text);

        // Now split string to nodes
        nodes = [];
        level = currentToken.level;
        lastPos = 0;

        for (ln = 0; ln < links.length; ln++) {

          url = links[ln].url;
          fullUrl = state.md.normalizeLink(url);
          if (!state.md.validateLink(fullUrl)) { continue; }

          urlText = links[ln].text;

          // Linkifier might send raw hostnames like "example.com", where url
          // starts with domain name. So we prepend http:// in those cases,
          // and remove it afterwards.
          //
          if (!links[ln].schema) {
            urlText = state.md.normalizeLinkText('http://' + urlText).replace(/^http:\/\//, '');
          } else if (links[ln].schema === 'mailto:' && !/^mailto:/i.test(urlText)) {
            urlText = state.md.normalizeLinkText('mailto:' + urlText).replace(/^mailto:/, '');
          } else {
            urlText = state.md.normalizeLinkText(urlText);
          }

          pos = links[ln].index;

          if (pos > lastPos) {
            token         = new state.Token('text', '', 0);
            token.content = text.slice(lastPos, pos);
            token.level   = level;
            nodes.push(token);
          }

          token         = new state.Token('link_open', 'a', 1);
          token.attrs   = [ [ 'href', fullUrl ] ];
          token.level   = level++;
          token.markup  = 'linkify';
          token.info    = 'auto';
          nodes.push(token);

          token         = new state.Token('text', '', 0);
          token.content = urlText;
          token.level   = level;
          nodes.push(token);

          token         = new state.Token('link_close', 'a', -1);
          token.level   = --level;
          token.markup  = 'linkify';
          token.info    = 'auto';
          nodes.push(token);

          lastPos = links[ln].lastIndex;
        }
        if (lastPos < text.length) {
          token         = new state.Token('text', '', 0);
          token.content = text.slice(lastPos);
          token.level   = level;
          nodes.push(token);
        }

        // replace current node
        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  }
};


/***/ }),
/* 176 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Normalize input string




// https://spec.commonmark.org/0.29/#line-ending
var NEWLINES_RE  = /\r\n?|\n/g;
var NULL_RE      = /\0/g;


module.exports = function normalize(state) {
  var str;

  // Normalize newlines
  str = state.src.replace(NEWLINES_RE, '\n');

  // Replace NULL characters
  str = str.replace(NULL_RE, '\uFFFD');

  state.src = str;
};


/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Simple typographic replacements
//
// (c) (C) → ©
// (tm) (TM) → ™
// (r) (R) → ®
// +- → ±
// (p) (P) -> §
// ... → … (also ?.... → ?.., !.... → !..)
// ???????? → ???, !!!!! → !!!, `,,` → `,`
// -- → &ndash;, --- → &mdash;
//


// TODO:
// - fractionals 1/2, 1/4, 3/4 -> ½, ¼, ¾
// - miltiplication 2 x 4 -> 2 × 4

var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;

// Workaround for phantomjs - need regex without /g flag,
// or root check will fail every second time
var SCOPED_ABBR_TEST_RE = /\((c|tm|r|p)\)/i;

var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/ig;
var SCOPED_ABBR = {
  c: '©',
  r: '®',
  p: '§',
  tm: '™'
};

function replaceFn(match, name) {
  return SCOPED_ABBR[name.toLowerCase()];
}

function replace_scoped(inlineTokens) {
  var i, token, inside_autolink = 0;

  for (i = inlineTokens.length - 1; i >= 0; i--) {
    token = inlineTokens[i];

    if (token.type === 'text' && !inside_autolink) {
      token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
    }

    if (token.type === 'link_open' && token.info === 'auto') {
      inside_autolink--;
    }

    if (token.type === 'link_close' && token.info === 'auto') {
      inside_autolink++;
    }
  }
}

function replace_rare(inlineTokens) {
  var i, token, inside_autolink = 0;

  for (i = inlineTokens.length - 1; i >= 0; i--) {
    token = inlineTokens[i];

    if (token.type === 'text' && !inside_autolink) {
      if (RARE_RE.test(token.content)) {
        token.content = token.content
          .replace(/\+-/g, '±')
          // .., ..., ....... -> …
          // but ?..... & !..... -> ?.. & !..
          .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..')
          .replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
          // em-dash
          .replace(/(^|[^-])---([^-]|$)/mg, '$1\u2014$2')
          // en-dash
          .replace(/(^|\s)--(\s|$)/mg, '$1\u2013$2')
          .replace(/(^|[^-\s])--([^-\s]|$)/mg, '$1\u2013$2');
      }
    }

    if (token.type === 'link_open' && token.info === 'auto') {
      inside_autolink--;
    }

    if (token.type === 'link_close' && token.info === 'auto') {
      inside_autolink++;
    }
  }
}


module.exports = function replace(state) {
  var blkIdx;

  if (!state.md.options.typographer) { return; }

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

    if (state.tokens[blkIdx].type !== 'inline') { continue; }

    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
      replace_scoped(state.tokens[blkIdx].children);
    }

    if (RARE_RE.test(state.tokens[blkIdx].content)) {
      replace_rare(state.tokens[blkIdx].children);
    }

  }
};


/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Convert straight quotation marks to typographic ones
//



var isWhiteSpace   = __webpack_require__(0).isWhiteSpace;
var isPunctChar    = __webpack_require__(0).isPunctChar;
var isMdAsciiPunct = __webpack_require__(0).isMdAsciiPunct;

var QUOTE_TEST_RE = /['"]/;
var QUOTE_RE = /['"]/g;
var APOSTROPHE = '\u2019'; /* ’ */


function replaceAt(str, index, ch) {
  return str.substr(0, index) + ch + str.substr(index + 1);
}

function process_inlines(tokens, state) {
  var i, token, text, t, pos, max, thisLevel, item, lastChar, nextChar,
      isLastPunctChar, isNextPunctChar, isLastWhiteSpace, isNextWhiteSpace,
      canOpen, canClose, j, isSingle, stack, openQuote, closeQuote;

  stack = [];

  for (i = 0; i < tokens.length; i++) {
    token = tokens[i];

    thisLevel = tokens[i].level;

    for (j = stack.length - 1; j >= 0; j--) {
      if (stack[j].level <= thisLevel) { break; }
    }
    stack.length = j + 1;

    if (token.type !== 'text') { continue; }

    text = token.content;
    pos = 0;
    max = text.length;

    /*eslint no-labels:0,block-scoped-var:0*/
    OUTER:
    while (pos < max) {
      QUOTE_RE.lastIndex = pos;
      t = QUOTE_RE.exec(text);
      if (!t) { break; }

      canOpen = canClose = true;
      pos = t.index + 1;
      isSingle = (t[0] === "'");

      // Find previous character,
      // default to space if it's the beginning of the line
      //
      lastChar = 0x20;

      if (t.index - 1 >= 0) {
        lastChar = text.charCodeAt(t.index - 1);
      } else {
        for (j = i - 1; j >= 0; j--) {
          if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak') break; // lastChar defaults to 0x20
          if (tokens[j].type !== 'text') continue;

          lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
          break;
        }
      }

      // Find next character,
      // default to space if it's the end of the line
      //
      nextChar = 0x20;

      if (pos < max) {
        nextChar = text.charCodeAt(pos);
      } else {
        for (j = i + 1; j < tokens.length; j++) {
          if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak') break; // nextChar defaults to 0x20
          if (tokens[j].type !== 'text') continue;

          nextChar = tokens[j].content.charCodeAt(0);
          break;
        }
      }

      isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
      isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

      isLastWhiteSpace = isWhiteSpace(lastChar);
      isNextWhiteSpace = isWhiteSpace(nextChar);

      if (isNextWhiteSpace) {
        canOpen = false;
      } else if (isNextPunctChar) {
        if (!(isLastWhiteSpace || isLastPunctChar)) {
          canOpen = false;
        }
      }

      if (isLastWhiteSpace) {
        canClose = false;
      } else if (isLastPunctChar) {
        if (!(isNextWhiteSpace || isNextPunctChar)) {
          canClose = false;
        }
      }

      if (nextChar === 0x22 /* " */ && t[0] === '"') {
        if (lastChar >= 0x30 /* 0 */ && lastChar <= 0x39 /* 9 */) {
          // special case: 1"" - count first quote as an inch
          canClose = canOpen = false;
        }
      }

      if (canOpen && canClose) {
        // treat this as the middle of the word
        canOpen = false;
        canClose = isNextPunctChar;
      }

      if (!canOpen && !canClose) {
        // middle of word
        if (isSingle) {
          token.content = replaceAt(token.content, t.index, APOSTROPHE);
        }
        continue;
      }

      if (canClose) {
        // this could be a closing quote, rewind the stack to get a match
        for (j = stack.length - 1; j >= 0; j--) {
          item = stack[j];
          if (stack[j].level < thisLevel) { break; }
          if (item.single === isSingle && stack[j].level === thisLevel) {
            item = stack[j];

            if (isSingle) {
              openQuote = state.md.options.quotes[2];
              closeQuote = state.md.options.quotes[3];
            } else {
              openQuote = state.md.options.quotes[0];
              closeQuote = state.md.options.quotes[1];
            }

            // replace token.content *before* tokens[item.token].content,
            // because, if they are pointing at the same token, replaceAt
            // could mess up indices when quote length != 1
            token.content = replaceAt(token.content, t.index, closeQuote);
            tokens[item.token].content = replaceAt(
              tokens[item.token].content, item.pos, openQuote);

            pos += closeQuote.length - 1;
            if (item.token === i) { pos += openQuote.length - 1; }

            text = token.content;
            max = text.length;

            stack.length = j;
            continue OUTER;
          }
        }
      }

      if (canOpen) {
        stack.push({
          token: i,
          pos: t.index,
          single: isSingle,
          level: thisLevel
        });
      } else if (canClose && isSingle) {
        token.content = replaceAt(token.content, t.index, APOSTROPHE);
      }
    }
  }
}


module.exports = function smartquotes(state) {
  /*eslint max-depth:0*/
  var blkIdx;

  if (!state.md.options.typographer) { return; }

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

    if (state.tokens[blkIdx].type !== 'inline' ||
        !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
      continue;
    }

    process_inlines(state.tokens[blkIdx].children, state);
  }
};


/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Core state object
//


var Token = __webpack_require__(36);


function StateCore(src, md, env) {
  this.src = src;
  this.env = env;
  this.tokens = [];
  this.inlineMode = false;
  this.md = md; // link to parser instance
}

// re-export Token class to use in core rules
StateCore.prototype.Token = Token;


module.exports = StateCore;


/***/ }),
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process autolinks '<protocol:...>'




/*eslint max-len:0*/
var EMAIL_RE    = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
var AUTOLINK_RE = /^<([a-zA-Z][a-zA-Z0-9+.\-]{1,31}):([^<>\x00-\x20]*)>/;


module.exports = function autolink(state, silent) {
  var tail, linkMatch, emailMatch, url, fullUrl, token,
      pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

  tail = state.src.slice(pos);

  if (tail.indexOf('>') < 0) { return false; }

  if (AUTOLINK_RE.test(tail)) {
    linkMatch = tail.match(AUTOLINK_RE);

    url = linkMatch[0].slice(1, -1);
    fullUrl = state.md.normalizeLink(url);
    if (!state.md.validateLink(fullUrl)) { return false; }

    if (!silent) {
      token         = state.push('link_open', 'a', 1);
      token.attrs   = [ [ 'href', fullUrl ] ];
      token.markup  = 'autolink';
      token.info    = 'auto';

      token         = state.push('text', '', 0);
      token.content = state.md.normalizeLinkText(url);

      token         = state.push('link_close', 'a', -1);
      token.markup  = 'autolink';
      token.info    = 'auto';
    }

    state.pos += linkMatch[0].length;
    return true;
  }

  if (EMAIL_RE.test(tail)) {
    emailMatch = tail.match(EMAIL_RE);

    url = emailMatch[0].slice(1, -1);
    fullUrl = state.md.normalizeLink('mailto:' + url);
    if (!state.md.validateLink(fullUrl)) { return false; }

    if (!silent) {
      token         = state.push('link_open', 'a', 1);
      token.attrs   = [ [ 'href', fullUrl ] ];
      token.markup  = 'autolink';
      token.info    = 'auto';

      token         = state.push('text', '', 0);
      token.content = state.md.normalizeLinkText(url);

      token         = state.push('link_close', 'a', -1);
      token.markup  = 'autolink';
      token.info    = 'auto';
    }

    state.pos += emailMatch[0].length;
    return true;
  }

  return false;
};


/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Parse backticks



module.exports = function backtick(state, silent) {
  var start, max, marker, matchStart, matchEnd, token,
      pos = state.pos,
      ch = state.src.charCodeAt(pos);

  if (ch !== 0x60/* ` */) { return false; }

  start = pos;
  pos++;
  max = state.posMax;

  while (pos < max && state.src.charCodeAt(pos) === 0x60/* ` */) { pos++; }

  marker = state.src.slice(start, pos);

  matchStart = matchEnd = pos;

  while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
    matchEnd = matchStart + 1;

    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60/* ` */) { matchEnd++; }

    if (matchEnd - matchStart === marker.length) {
      if (!silent) {
        token         = state.push('code_inline', 'code', 0);
        token.markup  = marker;
        token.content = state.src.slice(pos, matchStart)
          .replace(/\n/g, ' ')
          .replace(/^ (.+) $/, '$1');
      }
      state.pos = matchEnd;
      return true;
    }
  }

  if (!silent) { state.pending += marker; }
  state.pos += marker.length;
  return true;
};


/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// For each opening emphasis-like marker find a matching closing one
//



function processDelimiters(state, delimiters) {
  var closerIdx, openerIdx, closer, opener, minOpenerIdx, newMinOpenerIdx,
      isOddMatch, lastJump,
      openersBottom = {},
      max = delimiters.length;

  for (closerIdx = 0; closerIdx < max; closerIdx++) {
    closer = delimiters[closerIdx];

    // Length is only used for emphasis-specific "rule of 3",
    // if it's not defined (in strikethrough or 3rd party plugins),
    // we can default it to 0 to disable those checks.
    //
    closer.length = closer.length || 0;

    if (!closer.close) continue;

    // Previously calculated lower bounds (previous fails)
    // for each marker and each delimiter length modulo 3.
    if (!openersBottom.hasOwnProperty(closer.marker)) {
      openersBottom[closer.marker] = [ -1, -1, -1 ];
    }

    minOpenerIdx = openersBottom[closer.marker][closer.length % 3];
    newMinOpenerIdx = -1;

    openerIdx = closerIdx - closer.jump - 1;

    for (; openerIdx > minOpenerIdx; openerIdx -= opener.jump + 1) {
      opener = delimiters[openerIdx];

      if (opener.marker !== closer.marker) continue;

      if (newMinOpenerIdx === -1) newMinOpenerIdx = openerIdx;

      if (opener.open &&
          opener.end < 0 &&
          opener.level === closer.level) {

        isOddMatch = false;

        // from spec:
        //
        // If one of the delimiters can both open and close emphasis, then the
        // sum of the lengths of the delimiter runs containing the opening and
        // closing delimiters must not be a multiple of 3 unless both lengths
        // are multiples of 3.
        //
        if (opener.close || closer.open) {
          if ((opener.length + closer.length) % 3 === 0) {
            if (opener.length % 3 !== 0 || closer.length % 3 !== 0) {
              isOddMatch = true;
            }
          }
        }

        if (!isOddMatch) {
          // If previous delimiter cannot be an opener, we can safely skip
          // the entire sequence in future checks. This is required to make
          // sure algorithm has linear complexity (see *_*_*_*_*_... case).
          //
          lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].open ?
            delimiters[openerIdx - 1].jump + 1 :
            0;

          closer.jump  = closerIdx - openerIdx + lastJump;
          closer.open  = false;
          opener.end   = closerIdx;
          opener.jump  = lastJump;
          opener.close = false;
          newMinOpenerIdx = -1;
          break;
        }
      }
    }

    if (newMinOpenerIdx !== -1) {
      // If match for this delimiter run failed, we want to set lower bound for
      // future lookups. This is required to make sure algorithm has linear
      // complexity.
      //
      // See details here:
      // https://github.com/commonmark/cmark/issues/178#issuecomment-270417442
      //
      openersBottom[closer.marker][(closer.length || 0) % 3] = newMinOpenerIdx;
    }
  }
}


module.exports = function link_pairs(state) {
  var curr,
      tokens_meta = state.tokens_meta,
      max = state.tokens_meta.length;

  processDelimiters(state, state.delimiters);

  for (curr = 0; curr < max; curr++) {
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      processDelimiters(state, tokens_meta[curr].delimiters);
    }
  }
};


/***/ }),
/* 183 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process html entity - &#123;, &#xAF;, &quot;, ...



var entities          = __webpack_require__(54);
var has               = __webpack_require__(0).has;
var isValidEntityCode = __webpack_require__(0).isValidEntityCode;
var fromCodePoint     = __webpack_require__(0).fromCodePoint;


var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
var NAMED_RE   = /^&([a-z][a-z0-9]{1,31});/i;


module.exports = function entity(state, silent) {
  var ch, code, match, pos = state.pos, max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x26/* & */) { return false; }

  if (pos + 1 < max) {
    ch = state.src.charCodeAt(pos + 1);

    if (ch === 0x23 /* # */) {
      match = state.src.slice(pos).match(DIGITAL_RE);
      if (match) {
        if (!silent) {
          code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
          state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
        }
        state.pos += match[0].length;
        return true;
      }
    } else {
      match = state.src.slice(pos).match(NAMED_RE);
      if (match) {
        if (has(entities, match[1])) {
          if (!silent) { state.pending += entities[match[1]]; }
          state.pos += match[0].length;
          return true;
        }
      }
    }
  }

  if (!silent) { state.pending += '&'; }
  state.pos++;
  return true;
};


/***/ }),
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process escaped chars and hardbreaks



var isSpace = __webpack_require__(0).isSpace;

var ESCAPED = [];

for (var i = 0; i < 256; i++) { ESCAPED.push(0); }

'\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'
  .split('').forEach(function (ch) { ESCAPED[ch.charCodeAt(0)] = 1; });


module.exports = function escape(state, silent) {
  var ch, pos = state.pos, max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x5C/* \ */) { return false; }

  pos++;

  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (ch < 256 && ESCAPED[ch] !== 0) {
      if (!silent) { state.pending += state.src[pos]; }
      state.pos += 2;
      return true;
    }

    if (ch === 0x0A) {
      if (!silent) {
        state.push('hardbreak', 'br', 0);
      }

      pos++;
      // skip leading whitespaces from next line
      while (pos < max) {
        ch = state.src.charCodeAt(pos);
        if (!isSpace(ch)) { break; }
        pos++;
      }

      state.pos = pos;
      return true;
    }
  }

  if (!silent) { state.pending += '\\'; }
  state.pos++;
  return true;
};


/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process html tags




var HTML_TAG_RE = __webpack_require__(55).HTML_TAG_RE;


function isLetter(ch) {
  /*eslint no-bitwise:0*/
  var lc = ch | 0x20; // to lower case
  return (lc >= 0x61/* a */) && (lc <= 0x7a/* z */);
}


module.exports = function html_inline(state, silent) {
  var ch, match, max, token,
      pos = state.pos;

  if (!state.md.options.html) { return false; }

  // Check start
  max = state.posMax;
  if (state.src.charCodeAt(pos) !== 0x3C/* < */ ||
      pos + 2 >= max) {
    return false;
  }

  // Quick fail on second char
  ch = state.src.charCodeAt(pos + 1);
  if (ch !== 0x21/* ! */ &&
      ch !== 0x3F/* ? */ &&
      ch !== 0x2F/* / */ &&
      !isLetter(ch)) {
    return false;
  }

  match = state.src.slice(pos).match(HTML_TAG_RE);
  if (!match) { return false; }

  if (!silent) {
    token         = state.push('html_inline', '', 0);
    token.content = state.src.slice(pos, pos + match[0].length);
  }
  state.pos += match[0].length;
  return true;
};


/***/ }),
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process ![image](<src> "title")



var normalizeReference   = __webpack_require__(0).normalizeReference;
var isSpace              = __webpack_require__(0).isSpace;


module.exports = function image(state, silent) {
  var attrs,
      code,
      content,
      label,
      labelEnd,
      labelStart,
      pos,
      ref,
      res,
      title,
      token,
      tokens,
      start,
      href = '',
      oldPos = state.pos,
      max = state.posMax;

  if (state.src.charCodeAt(state.pos) !== 0x21/* ! */) { return false; }
  if (state.src.charCodeAt(state.pos + 1) !== 0x5B/* [ */) { return false; }

  labelStart = state.pos + 2;
  labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) { return false; }

  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
    //
    // Inline link
    //

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }
    if (pos >= max) { return false; }

    // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) {
        pos = res.pos;
      } else {
        href = '';
      }
    }

    // [link](  <href>  "title"  )
    //                ^^ skipping these spaces
    start = pos;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }

    // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title
    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;

      // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace(code) && code !== 0x0A) { break; }
      }
    } else {
      title = '';
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    //
    // Link reference
    //
    if (typeof state.env.references === 'undefined') { return false; }

    if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!label) { label = state.src.slice(labelStart, labelEnd); }

    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }

  //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    content = state.src.slice(labelStart, labelEnd);

    state.md.inline.parse(
      content,
      state.md,
      state.env,
      tokens = []
    );

    token          = state.push('image', 'img', 0);
    token.attrs    = attrs = [ [ 'src', href ], [ 'alt', '' ] ];
    token.children = tokens;
    token.content  = content;

    if (title) {
      attrs.push([ 'title', title ]);
    }
  }

  state.pos = pos;
  state.posMax = max;
  return true;
};


/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process [link](<to> "stuff")



var normalizeReference   = __webpack_require__(0).normalizeReference;
var isSpace              = __webpack_require__(0).isSpace;


module.exports = function link(state, silent) {
  var attrs,
      code,
      label,
      labelEnd,
      labelStart,
      pos,
      res,
      ref,
      title,
      token,
      href = '',
      oldPos = state.pos,
      max = state.posMax,
      start = state.pos,
      parseReference = true;

  if (state.src.charCodeAt(state.pos) !== 0x5B/* [ */) { return false; }

  labelStart = state.pos + 1;
  labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) { return false; }

  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
    //
    // Inline link
    //

    // might have found a valid shortcut link, disable reference parsing
    parseReference = false;

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }
    if (pos >= max) { return false; }

    // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) {
        pos = res.pos;
      } else {
        href = '';
      }
    }

    // [link](  <href>  "title"  )
    //                ^^ skipping these spaces
    start = pos;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }

    // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title
    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;

      // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace(code) && code !== 0x0A) { break; }
      }
    } else {
      title = '';
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
      // parsing a valid shortcut link failed, fallback to reference
      parseReference = true;
    }
    pos++;
  }

  if (parseReference) {
    //
    // Link reference
    //
    if (typeof state.env.references === 'undefined') { return false; }

    if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!label) { label = state.src.slice(labelStart, labelEnd); }

    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }

  //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;

    token        = state.push('link_open', 'a', 1);
    token.attrs  = attrs = [ [ 'href', href ] ];
    if (title) {
      attrs.push([ 'title', title ]);
    }

    state.md.inline.tokenize(state);

    token        = state.push('link_close', 'a', -1);
  }

  state.pos = pos;
  state.posMax = max;
  return true;
};


/***/ }),
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Proceess '\n'



var isSpace = __webpack_require__(0).isSpace;


module.exports = function newline(state, silent) {
  var pmax, max, pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x0A/* \n */) { return false; }

  pmax = state.pending.length - 1;
  max = state.posMax;

  // '  \n' -> hardbreak
  // Lookup in pending chars is bad practice! Don't copy to other rules!
  // Pending string is stored in concat mode, indexed lookups will cause
  // convertion to flat mode.
  if (!silent) {
    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
        state.pending = state.pending.replace(/ +$/, '');
        state.push('hardbreak', 'br', 0);
      } else {
        state.pending = state.pending.slice(0, -1);
        state.push('softbreak', 'br', 0);
      }

    } else {
      state.push('softbreak', 'br', 0);
    }
  }

  pos++;

  // skip heading spaces for next line
  while (pos < max && isSpace(state.src.charCodeAt(pos))) { pos++; }

  state.pos = pos;
  return true;
};


/***/ }),
/* 189 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Inline parser state




var Token          = __webpack_require__(36);
var isWhiteSpace   = __webpack_require__(0).isWhiteSpace;
var isPunctChar    = __webpack_require__(0).isPunctChar;
var isMdAsciiPunct = __webpack_require__(0).isMdAsciiPunct;


function StateInline(src, md, env, outTokens) {
  this.src = src;
  this.env = env;
  this.md = md;
  this.tokens = outTokens;
  this.tokens_meta = Array(outTokens.length);

  this.pos = 0;
  this.posMax = this.src.length;
  this.level = 0;
  this.pending = '';
  this.pendingLevel = 0;

  // Stores { start: end } pairs. Useful for backtrack
  // optimization of pairs parse (emphasis, strikes).
  this.cache = {};

  // List of emphasis-like delimiters for current tag
  this.delimiters = [];

  // Stack of delimiter lists for upper level tags
  this._prev_delimiters = [];
}


// Flush pending text
//
StateInline.prototype.pushPending = function () {
  var token = new Token('text', '', 0);
  token.content = this.pending;
  token.level = this.pendingLevel;
  this.tokens.push(token);
  this.pending = '';
  return token;
};


// Push new token to "stream".
// If pending text exists - flush it as text token
//
StateInline.prototype.push = function (type, tag, nesting) {
  if (this.pending) {
    this.pushPending();
  }

  var token = new Token(type, tag, nesting);
  var token_meta = null;

  if (nesting < 0) {
    // closing tag
    this.level--;
    this.delimiters = this._prev_delimiters.pop();
  }

  token.level = this.level;

  if (nesting > 0) {
    // opening tag
    this.level++;
    this._prev_delimiters.push(this.delimiters);
    this.delimiters = [];
    token_meta = { delimiters: this.delimiters };
  }

  this.pendingLevel = this.level;
  this.tokens.push(token);
  this.tokens_meta.push(token_meta);
  return token;
};


// Scan a sequence of emphasis-like markers, and determine whether
// it can start an emphasis sequence or end an emphasis sequence.
//
//  - start - position to scan from (it should point at a valid marker);
//  - canSplitWord - determine if these markers can be found inside a word
//
StateInline.prototype.scanDelims = function (start, canSplitWord) {
  var pos = start, lastChar, nextChar, count, can_open, can_close,
      isLastWhiteSpace, isLastPunctChar,
      isNextWhiteSpace, isNextPunctChar,
      left_flanking = true,
      right_flanking = true,
      max = this.posMax,
      marker = this.src.charCodeAt(start);

  // treat beginning of the line as a whitespace
  lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20;

  while (pos < max && this.src.charCodeAt(pos) === marker) { pos++; }

  count = pos - start;

  // treat end of the line as a whitespace
  nextChar = pos < max ? this.src.charCodeAt(pos) : 0x20;

  isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
  isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

  isLastWhiteSpace = isWhiteSpace(lastChar);
  isNextWhiteSpace = isWhiteSpace(nextChar);

  if (isNextWhiteSpace) {
    left_flanking = false;
  } else if (isNextPunctChar) {
    if (!(isLastWhiteSpace || isLastPunctChar)) {
      left_flanking = false;
    }
  }

  if (isLastWhiteSpace) {
    right_flanking = false;
  } else if (isLastPunctChar) {
    if (!(isNextWhiteSpace || isNextPunctChar)) {
      right_flanking = false;
    }
  }

  if (!canSplitWord) {
    can_open  = left_flanking  && (!right_flanking || isLastPunctChar);
    can_close = right_flanking && (!left_flanking  || isNextPunctChar);
  } else {
    can_open  = left_flanking;
    can_close = right_flanking;
  }

  return {
    can_open:  can_open,
    can_close: can_close,
    length:    count
  };
};


// re-export Token class to use in block rules
StateInline.prototype.Token = Token;


module.exports = StateInline;


/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Skip text characters for text token, place those to pending buffer
// and increment current pos




// Rule to skip pure text
// '{}$%@~+=:' reserved for extentions

// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~

// !!!! Don't confuse with "Markdown ASCII Punctuation" chars
// http://spec.commonmark.org/0.15/#ascii-punctuation-character
function isTerminatorChar(ch) {
  switch (ch) {
    case 0x0A/* \n */:
    case 0x21/* ! */:
    case 0x23/* # */:
    case 0x24/* $ */:
    case 0x25/* % */:
    case 0x26/* & */:
    case 0x2A/* * */:
    case 0x2B/* + */:
    case 0x2D/* - */:
    case 0x3A/* : */:
    case 0x3C/* < */:
    case 0x3D/* = */:
    case 0x3E/* > */:
    case 0x40/* @ */:
    case 0x5B/* [ */:
    case 0x5C/* \ */:
    case 0x5D/* ] */:
    case 0x5E/* ^ */:
    case 0x5F/* _ */:
    case 0x60/* ` */:
    case 0x7B/* { */:
    case 0x7D/* } */:
    case 0x7E/* ~ */:
      return true;
    default:
      return false;
  }
}

module.exports = function text(state, silent) {
  var pos = state.pos;

  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
    pos++;
  }

  if (pos === state.pos) { return false; }

  if (!silent) { state.pending += state.src.slice(state.pos, pos); }

  state.pos = pos;

  return true;
};

// Alternative implementation, for memory.
//
// It costs 10% of performance, but allows extend terminators list, if place it
// to `ParcerInline` property. Probably, will switch to it sometime, such
// flexibility required.

/*
var TERMINATOR_RE = /[\n!#$%&*+\-:<=>@[\\\]^_`{}~]/;

module.exports = function text(state, silent) {
  var pos = state.pos,
      idx = state.src.slice(pos).search(TERMINATOR_RE);

  // first char is terminator -> empty text
  if (idx === 0) { return false; }

  // no terminator -> text till end of string
  if (idx < 0) {
    if (!silent) { state.pending += state.src.slice(pos); }
    state.pos = state.src.length;
    return true;
  }

  if (!silent) { state.pending += state.src.slice(pos, pos + idx); }

  state.pos += idx;

  return true;
};*/


/***/ }),
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Clean up tokens after emphasis and strikethrough postprocessing:
// merge adjacent text nodes into one and re-calculate all token levels
//
// This is necessary because initially emphasis delimiter markers (*, _, ~)
// are treated as their own separate text tokens. Then emphasis rule either
// leaves them as text (needed to merge with adjacent text) or turns them
// into opening/closing tags (which messes up levels inside).
//



module.exports = function text_collapse(state) {
  var curr, last,
      level = 0,
      tokens = state.tokens,
      max = state.tokens.length;

  for (curr = last = 0; curr < max; curr++) {
    // re-calculate levels after emphasis/strikethrough turns some text nodes
    // into opening/closing tags
    if (tokens[curr].nesting < 0) level--; // closing tag
    tokens[curr].level = level;
    if (tokens[curr].nesting > 0) level++; // opening tag

    if (tokens[curr].type === 'text' &&
        curr + 1 < max &&
        tokens[curr + 1].type === 'text') {

      // collapse two adjacent text nodes
      tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
    } else {
      if (curr !== last) { tokens[last] = tokens[curr]; }

      last++;
    }
  }

  if (curr !== last) {
    tokens.length = last;
  }
};


/***/ }),
/* 192 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";




/* eslint-disable no-bitwise */

var decodeCache = {};

function getDecodeCache(exclude) {
  var i, ch, cache = decodeCache[exclude];
  if (cache) { return cache; }

  cache = decodeCache[exclude] = [];

  for (i = 0; i < 128; i++) {
    ch = String.fromCharCode(i);
    cache.push(ch);
  }

  for (i = 0; i < exclude.length; i++) {
    ch = exclude.charCodeAt(i);
    cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
  }

  return cache;
}


// Decode percent-encoded string.
//
function decode(string, exclude) {
  var cache;

  if (typeof exclude !== 'string') {
    exclude = decode.defaultChars;
  }

  cache = getDecodeCache(exclude);

  return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
    var i, l, b1, b2, b3, b4, chr,
        result = '';

    for (i = 0, l = seq.length; i < l; i += 3) {
      b1 = parseInt(seq.slice(i + 1, i + 3), 16);

      if (b1 < 0x80) {
        result += cache[b1];
        continue;
      }

      if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
        // 110xxxxx 10xxxxxx
        b2 = parseInt(seq.slice(i + 4, i + 6), 16);

        if ((b2 & 0xC0) === 0x80) {
          chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

          if (chr < 0x80) {
            result += '\ufffd\ufffd';
          } else {
            result += String.fromCharCode(chr);
          }

          i += 3;
          continue;
        }
      }

      if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
        // 1110xxxx 10xxxxxx 10xxxxxx
        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        b3 = parseInt(seq.slice(i + 7, i + 9), 16);

        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
          chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

          if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
            result += '\ufffd\ufffd\ufffd';
          } else {
            result += String.fromCharCode(chr);
          }

          i += 6;
          continue;
        }
      }

      if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
        // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        b3 = parseInt(seq.slice(i + 7, i + 9), 16);
        b4 = parseInt(seq.slice(i + 10, i + 12), 16);

        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
          chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

          if (chr < 0x10000 || chr > 0x10FFFF) {
            result += '\ufffd\ufffd\ufffd\ufffd';
          } else {
            chr -= 0x10000;
            result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
          }

          i += 9;
          continue;
        }
      }

      result += '\ufffd';
    }

    return result;
  });
}


decode.defaultChars   = ';/?:@&=+$,#';
decode.componentChars = '';


module.exports = decode;


/***/ }),
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";




var encodeCache = {};


// Create a lookup array where anything but characters in `chars` string
// and alphanumeric chars is percent-encoded.
//
function getEncodeCache(exclude) {
  var i, ch, cache = encodeCache[exclude];
  if (cache) { return cache; }

  cache = encodeCache[exclude] = [];

  for (i = 0; i < 128; i++) {
    ch = String.fromCharCode(i);

    if (/^[0-9a-z]$/i.test(ch)) {
      // always allow unencoded alphanumeric characters
      cache.push(ch);
    } else {
      cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
    }
  }

  for (i = 0; i < exclude.length; i++) {
    cache[exclude.charCodeAt(i)] = exclude[i];
  }

  return cache;
}


// Encode unsafe characters with percent-encoding, skipping already
// encoded sequences.
//
//  - string       - string to encode
//  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
//  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
//
function encode(string, exclude, keepEscaped) {
  var i, l, code, nextCode, cache,
      result = '';

  if (typeof exclude !== 'string') {
    // encode(string, keepEscaped)
    keepEscaped  = exclude;
    exclude = encode.defaultChars;
  }

  if (typeof keepEscaped === 'undefined') {
    keepEscaped = true;
  }

  cache = getEncodeCache(exclude);

  for (i = 0, l = string.length; i < l; i++) {
    code = string.charCodeAt(i);

    if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
      if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
        result += string.slice(i, i + 3);
        i += 2;
        continue;
      }
    }

    if (code < 128) {
      result += cache[code];
      continue;
    }

    if (code >= 0xD800 && code <= 0xDFFF) {
      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
        nextCode = string.charCodeAt(i + 1);
        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
          result += encodeURIComponent(string[i] + string[i + 1]);
          i++;
          continue;
        }
      }
      result += '%EF%BF%BD';
      continue;
    }

    result += encodeURIComponent(string[i]);
  }

  return result;
}

encode.defaultChars   = ";/?:@&=+$,-_.!~*'()#";
encode.componentChars = "-_.!~*'()";


module.exports = encode;


/***/ }),
/* 194 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";




module.exports = function format(url) {
  var result = '';

  result += url.protocol || '';
  result += url.slashes ? '//' : '';
  result += url.auth ? url.auth + '@' : '';

  if (url.hostname && url.hostname.indexOf(':') !== -1) {
    // ipv6 address
    result += '[' + url.hostname + ']';
  } else {
    result += url.hostname || '';
  }

  result += url.port ? ':' + url.port : '';
  result += url.pathname || '';
  result += url.search || '';
  result += url.hash || '';

  return result;
};


/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



//
// Changes from joyent/node:
//
// 1. No leading slash in paths,
//    e.g. in `url.parse('http://foo?bar')` pathname is ``, not `/`
//
// 2. Backslashes are not replaced with slashes,
//    so `http:\\example.org\` is treated like a relative path
//
// 3. Trailing colon is treated like a part of the path,
//    i.e. in `http://example.org:foo` pathname is `:foo`
//
// 4. Nothing is URL-encoded in the resulting object,
//    (in joyent/node some chars in auth and paths are encoded)
//
// 5. `url.parse()` does not have `parseQueryString` argument
//
// 6. Removed extraneous result properties: `host`, `path`, `query`, etc.,
//    which can be constructed using other parts of the url.
//


function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.pathname = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = [ '<', '>', '"', '`', ' ', '\r', '\n', '\t' ],

    // RFC 2396: characters not allowed for various reasons.
    unwise = [ '{', '}', '|', '\\', '^', '`' ].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = [ '\'' ].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = [ '%', '/', '?', ';', '#' ].concat(autoEscape),
    hostEndingChars = [ '/', '?', '#' ],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    /* eslint-disable no-script-url */
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    };
    /* eslint-enable no-script-url */

function urlParse(url, slashesDenoteHost) {
  if (url && url instanceof Url) { return url; }

  var u = new Url();
  u.parse(url, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, slashesDenoteHost) {
  var i, l, lowerProto, hec, slashes,
      rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    lowerProto = proto.toLowerCase();
    this.protocol = proto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (i = 0; i < hostEndingChars.length; i++) {
      hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = auth;
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (i = 0; i < nonHostChars.length; i++) {
      hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1) {
      hostEnd = rest.length;
    }

    if (rest[hostEnd - 1] === ':') { hostEnd--; }
    var host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost(host);

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) { continue; }
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    }

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
    }
  }

  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    rest = rest.slice(0, qm);
  }
  if (rest) { this.pathname = rest; }
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '';
  }

  return this;
};

Url.prototype.parseHost = function(host) {
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) { this.hostname = host; }
};

module.exports = urlParse;


/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return punycode;
		}.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(228)(module), __webpack_require__(18)))

/***/ }),
/* 197 */
/***/ (function(module, exports) {

module.exports = "@[toc](Catalog)\n\nMarkdown Handbuch\n===\n> Details: [http://commonmark.org/help/](http://commonmark.org/help/)\n\n## **Fett**\n```\n**fett**\n__fett__\n```\n## *Kursiv*\n```\n*kursiv*\n_kursiv_\n```\n## Überschriften\n```\n# h1 #\nh1\n====\n## h2 ##\nh2\n----\n### h3 ###\n#### h4 ####\n##### h5 #####\n###### h6 ######\n```\n## Trennlinien\n```\n***\n---\n```\n****\n## ^Hoch^gestellt & ~Tief~gestellt\n```\nhochgestellt x^2^\ntiefgestellt H~2~0\n```\n## ++Unterstrichen++ & ~~Durchgestrichen~~\n```\n++unterstrichen++\n~~durchgestrichen~~\n```\n## ==Markiert==\n```\n==markiert==\n```\n## Zitat\n\n```\n> zitat 1\n>> zitat 2\n>>> zitat 3\n...\n```\n\n## Liste\n```\nol\n1.\n2.\n3.\n...\n\nul\n-\n-\n...\n```\n\n## Todo Liste\n\n- [x] aufgabe 1\n- [ ] aufgabe 2\n\n```\n- [x] aufgabe 1\n- [ ] aufgabe 2\n```\n\n## Link\n```\nText Link\n[Text](www.baidu.com)\n\nLink mit Bild\n![Text](http://www.image.com)\n```\n## Code\n\\``` Typ\n\nCodeblock\n\n\\```\n\n\\` code \\`\n\n```c++\nint main()\n{\n    printf(\"hello world!\");\n}\n```\n`code`\n\n## Tabelle\n```\n| th1 | th2 | th3 |\n| :--  | :--: | ----: |\n| links | mitte | rechts |\n```\n| th1 | th2 | th3 |\n| :--  | :--: | ----: |\n| links | mitte | rechts |\n| ---------------------- | ------------- | ----------------- |\n## Fußnote\n```\nhallo[^hallo]\n```\n\nSchau zum unteren Rand[^hallo]\n\n[^hallo]: fussnote\n\n## Emojis\nDetails: [https://www.webpagefx.com/tools/emoji-cheat-sheet/](https://www.webpagefx.com/tools/emoji-cheat-sheet/)\n```\n:laughing:\n:blush:\n:smiley:\n:)\n...\n```\n:laughing::blush::smiley::)\n\n## $\\KaTeX$ Mathematik\n\nFormeln lassen sich darstellen z.b. ：$x_i + y_i = z_i$ und $\\sum_{i=1}^n a_i=0$\nFormeln können auf einer eigenen Zeile gerendert werden\n$$\\sum_{i=1}^n a_i=0$$\nDetails: [katex](http://www.intmath.com/cg5/katex-mathjax-comparison.php)和[katex function](https://github.com/Khan/KaTeX/wiki/Function-Support-in-KaTeX)以及[latex](https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference)\n\n## Layout\n\n::: hljs-left\n`::: hljs-left`\n`links`\n`:::`\n:::\n\n::: hljs-center\n`::: hljs-center`\n`mitte`\n`:::`\n:::\n\n::: hljs-right\n`::: hljs-right`\n`rechts`\n`:::`\n:::\n\n## Liste von Definitionen\n\nTerm 1\n\n:   Definition 1\n\nTerm 2 mit *inline markup*\n\n:   Definition 2\n\n        { ein wenig code, teil von Definition 2 }\n\n    Dritter Absatz von Definition 2.\n\n```\nTerm 1\n\n:   Definition 1\n\nTerm 2 mit *inline markup*\n\n:   Definition 2\n\n        { ein wenig code, teil von Definition 2 }\n\n    Dritter Absatz von Definition 2.\n\n```\n\n## Abkürzungen\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nDie HTML Spezifikation\nwird gepflegt vom W3C.\n```\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nDie HTML Spezifikation\nwird gepflegt vom W3C.\n```\n"

/***/ }),
/* 198 */
/***/ (function(module, exports) {

module.exports = "@[toc](Catalog)\n\nMarkdown Guide\n===\n> Detailed: [http://commonmark.org/help/](http://commonmark.org/help/)\n\n## **Bold**\n```\n**bold**\n__bold__\n```\n## *Italic*\n```\n*italic*\n_italic_\n```\n## Header\n```\n# h1 #\nh1\n====\n## h2 ##\nh2\n----\n### h3 ###\n#### h4 ####\n##### h5 #####\n###### h6 ######\n```\n## Dividing line\n```\n***\n---\n```\n****\n## ^Super^script & ~Sub~script\n```\nsuper x^2^\nsub H~2~0\n```\n## ++Underline++ & ~~Strikethrough~~\n```\n++underline++\n~~strikethrough~~\n```\n## ==Mark==\n```\n==mark==\n```\n## Quote\n\n```\n> quote 1\n>> quote 2\n>>> quote 3\n...\n```\n\n## List\n```\nol\n1.\n2.\n3.\n...\n\nul\n-\n-\n...\n```\n\n## Todo List\n\n- [x] task 1\n- [ ] task 2\n\n```\n- [x] task 1\n- [ ] task 2\n```\n\n## Link\n```\nText Link\n[Text](www.baidu.com)\n\nImage Link\n![Text](http://www.image.com)\n```\n## Code\n\\``` type\n\ncode block\n\n\\```\n\n\\` code \\`\n\n```c++\nint main()\n{\n    printf(\"hello world!\");\n}\n```\n`code`\n\n## Table\n```\n| th1 | th2 | th3 |\n| :--  | :--: | ----: |\n| left | center | right |\n```\n| th1 | th2 | th3 |\n| :--  | :--: | ----: |\n| left | center | right |\n| ---------------------- | ------------- | ----------------- |\n## Footnote\n```\nhello[^hello]\n```\n\nLook at the bottom[^hello]\n\n[^hello]: footnote\n\n## Emojis\nDetailed: [https://www.webpagefx.com/tools/emoji-cheat-sheet/](https://www.webpagefx.com/tools/emoji-cheat-sheet/)\n```\n:laughing:\n:blush:\n:smiley:\n:)\n...\n```\n:laughing::blush::smiley::)\n\n## $\\KaTeX$ Mathematics\n\nWe can render formulas for example：$x_i + y_i = z_i$ and $\\sum_{i=1}^n a_i=0$\nWe can also single-line rendering\n$$\\sum_{i=1}^n a_i=0$$\nDetailed: [katex](http://www.intmath.com/cg5/katex-mathjax-comparison.php)和[katex function](https://github.com/Khan/KaTeX/wiki/Function-Support-in-KaTeX)以及[latex](https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference)\n\n## Layout\n\n::: hljs-left\n`::: hljs-left`\n`left`\n`:::`\n:::\n\n::: hljs-center\n`::: hljs-center`\n`center`\n`:::`\n:::\n\n::: hljs-right\n`::: hljs-right`\n`right`\n`:::`\n:::\n\n## deflist\n\nTerm 1\n\n:   Definition 1\n\nTerm 2 with *inline markup*\n\n:   Definition 2\n\n        { some code, part of Definition 2 }\n\n    Third paragraph of definition 2.\n\n```\nTerm 1\n\n:   Definition 1\n\nTerm 2 with *inline markup*\n\n:   Definition 2\n\n        { some code, part of Definition 2 }\n\n    Third paragraph of definition 2.\n\n```\n\n## abbr\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nThe HTML specification\nis maintained by the W3C.\n```\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nThe HTML specification\nis maintained by the W3C.\n```\n"

/***/ }),
/* 199 */
/***/ (function(module, exports) {

module.exports = "@[toc](Catalogue)\n\nGuide Markdown\n==============\n> Détail : [http://commonmark.org/help/](http://commonmark.org/help/)\n\n## **Bold**\n```\n**bold**\n__bold__\n```\n## *Italic*\n```\n*italic*\n_italic_\n```\n## Header\n```\n# h1 #\nh1\n====\n## h2 ##\nh2\n----\n### h3 ###\n#### h4 ####\n##### h5 #####\n###### h6 ######\n```\n## Dividing line\n```\n***\n---\n```\n****\n## ^Super^script & ~Sub~script\n```\nsuper x^2^\nsub H~2~0\n```\n## ++Underline++ & ~~Strikethrough~~\n```\n++underline++\n~~strikethrough~~\n```\n## ==Mark==\n```\n==mark==\n```\n## Quote\n\n```\n> quote 1\n>> quote 2\n>>> quote 3\n...\n```\n\n## List\n```\nol\n1.\n2.\n3.\n...\n\nul\n-\n-\n...\n```\n## Link\n\n## Todo List\n\n- [x] Équipe 1\n- [ ] Équipe 2\n\n```\n- [x] Équipe 1\n- [ ] Équipe 2\n```\n\n```\nText Link\n[Text](www.baidu.com)\n\nImage Link\n![Text](http://www.image.com)\n```\n## Code\n\\``` type\n\ncode block\n\n\\```\n\n\\` code \\`\n\n```c++\nint main()\n{\n    printf(\"hello world!\");\n}\n```\n`code`\n\n## Table\n```\n| th1 | th2 | th3 |\n| :--  | :--: | ----: |\n| left | center | right |\n```\n| th1 | th2 | th3 |\n| :--  | :--: | ----: |\n| left | center | right |\n| ---------------------- | ------------- | ----------------- |\n## Footnote\n```\nhello[^hello]\n```\n\nLook at the bottom[^hello]\n\n[^hello]: footnote\n\n## Emojis\nDetailed: [https://www.webpagefx.com/tools/emoji-cheat-sheet/](https://www.webpagefx.com/tools/emoji-cheat-sheet/)\n```\n:laughing:\n:blush:\n:smiley:\n:)\n...\n```\n:laughing::blush::smiley::)\n\n## $\\KaTeX$ Mathematics\n\nWe can render formulas for example：$x_i + y_i = z_i$ and $\\sum_{i=1}^n a_i=0$\nWe can also single-line rendering\n$$\\sum_{i=1}^n a_i=0$$\nDetailed: [katex](http://www.intmath.com/cg5/katex-mathjax-comparison.php)和[katex function](https://github.com/Khan/KaTeX/wiki/Function-Support-in-KaTeX)以及[latex](https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference)\n\n## Layout\n\n::: hljs-left\n`::: hljs-left`\n`left`\n`:::`\n:::\n\n::: hljs-center\n`::: hljs-center`\n`center`\n`:::`\n:::\n\n::: hljs-right\n`::: hljs-right`\n`right`\n`:::`\n:::\n\n## deflist\n\nTerm 1\n\n:   Definition 1\n\nTerm 2 with *inline markup*\n\n:   Definition 2\n\n        { some code, part of Definition 2 }\n\n    Third paragraph of definition 2.\n\n```\nTerm 1\n\n:   Definition 1\n\nTerm 2 with *inline markup*\n\n:   Definition 2\n\n        { some code, part of Definition 2 }\n\n    Third paragraph of definition 2.\n\n```\n\n## abbr\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nThe HTML specification\nis maintained by the W3C.\n```\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nThe HTML specification\nis maintained by the W3C.\n```\n"

/***/ }),
/* 200 */
/***/ (function(module, exports) {

module.exports = "@[toc](目次)\n\nMarkdown 文法ガイド\n===\n> Detailed: [http://commonmark.org/help/](http://commonmark.org/help/)\n\n## **太字**\n```\n**太字**\n__太字__\n```\n## *斜体*\n```\n*斜体*\n_斜体_\n```\n## 見出し\n```\n# h1 #\nh1\n====\n## h2 ##\nh2\n----\n### h3 ###\n#### h4 ####\n##### h5 #####\n###### h6 ######\n```\n## 横線\n```\n***\n---\n```\n****\n## ^上付き^文字 & ~下付き~文字\n```\nsuper x^2^\nsub H~2~0\n```\n## ++下線++ & ~~取り消し線~~\n```\n++underline++\n~~strikethrough~~\n```\n## ==蛍光ペン==\n```\n==mark==\n```\n## 引用\n\n```\n> quote 1\n>> quote 2\n>>> quote 3\n...\n```\n\n## リスト\n```\n番号付きリスト\n1.\n2.\n3.\n...\n\n箇条書きリスト\n-\n-\n...\n```\n\n## Todoリスト\n\n- [x] task 1\n- [ ] task 2\n\n```\n- [x] task 1\n- [ ] task 2\n```\n\n## リンク\n```\nText Link\n[Text](www.baidu.com)\n\nImage Link\n![Text](http://www.image.com)\n```\n## コード\n\\``` type\n\ncode block\n\n\\```\n\n\\` code \\`\n\n```c++\nint main()\n{\n    printf(\"hello world!\");\n}\n```\n`code`\n\n## 表\n```\n| th1 | th2 | th3 |\n| :--  | :--: | ----: |\n| left | center | right |\n```\n| th1 | th2 | th3 |\n| :--  | :--: | ----: |\n| left | center | right |\n| ---------------------- | ------------- | ----------------- |\n\n## 脚注\n```\nhello[^hello]\n```\n\nLook at the bottom[^hello]\n\n[^hello]: footnote\n\n## 絵文字\n> Detailed: [https://www.webpagefx.com/tools/emoji-cheat-sheet/](https://www.webpagefx.com/tools/emoji-cheat-sheet/)\n```\n:laughing:\n:blush:\n:smiley:\n:)\n...\n```\n:laughing::blush::smiley::)\n\n## $\\KaTeX$ 数式\n> Detailed: [KaTeXマニュアル](http://www.intmath.com/cg5/katex-mathjax-comparison.php)、[KaTeX function](https://github.com/Khan/KaTeX/wiki/Function-Support-in-KaTeX)、[LaTeXマニュアル](https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference)\n\nWe can render formulas for example：$x_i + y_i = z_i$ and $\\sum_{i=1}^n a_i=0$  \nWe can also single-line rendering\n$$\\sum_{i=1}^n a_i=0$$\n\n## レイアウト\n\n::: hljs-left\n`::: hljs-left`\n`left`\n`:::`\n:::\n\n::: hljs-center\n`::: hljs-center`\n`center`\n`:::`\n:::\n\n::: hljs-right\n`::: hljs-right`\n`right`\n`:::`\n:::\n\n## 定義リスト\n\nTerm 1\n\n:   Definition 1\n\nTerm 2 with *inline markup*\n\n:   Definition 2\n\n        { some code, part of Definition 2 }\n\n    Third paragraph of definition 2.\n\n```\nTerm 1\n\n:   Definition 1\n\nTerm 2 with *inline markup*\n\n:   Definition 2\n\n        { some code, part of Definition 2 }\n\n    Third paragraph of definition 2.\n\n```\n\n## abbr\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nThe HTML specification\nis maintained by the W3C.\n```\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nThe HTML specification\nis maintained by the W3C.\n```\n"

/***/ }),
/* 201 */
/***/ (function(module, exports) {

module.exports = "@[toc](Directory)\n\nGuia Markdown\n===\n> Detalhes: [http://commonmark.org/help/](http://commonmark.org/help/)\n\n## **Negrito**\n```\n**negrito**\n__negrito__\n```\n## *Itálico*\n```\n*itálico*\n_itálico_\n```\n## Cabeçalho\n```\n# h1 #\nh1\n====\n## h2 ##\nh2\n----\n### h3 ###\n#### h4 ####\n##### h5 #####\n###### h6 ######\n```\n## Linha Divisora\n```\n***\n---\n```\n****\n## ^Sobre^scrito & ~Sub~scrito\n```\nsobre x^2^\nsub H~2~0\n```\n## ++Sublinhar++ & ~~Tachar~~\n```\n++sublinhar++\n~~tachar~~\n```\n## ==Marcador==\n```\n==marcador==\n```\n## Citação\n\n```\n> citação 1\n>> citação 2\n>>> citação 3\n...\n```\n\n## Listas\n```\nlista Numerada\n1.\n2.\n3.\n...\n\nlista com marcadores\n-\n-\n...\n```\n\n## Todo Listas\n\n- [x] Tarefa 1\n- [ ] Tarefa 2\n\n```\n- [x] Tarefa 1\n- [ ] Tarefa 2\n```\n\n## Link\n```\nLink Texto\n[Text](www.baidu.com)\n\nLink Imagem\n![Text](http://www.image.com)\n```\n## Código\n\\``` tipo\n\nbloco de código\n\n\\```\n\n\\` código \\`\n\n```c++\nint main()\n{\n    printf(\"hello world!\");\n}\n```\n`code`\n\n## Tabela\n```\n| th1 | th2 | th3 |\n| :--  | :--: | ----: |\n| esquerda | centro | direita |\n```\n| th1 | th2 | th3 |\n| :--  | :--: | ----: |\n| esquerda | centro | direita |\n| ---------------------- | ------------- | ----------------- |\n## Rodapé\n```\nolá[^olá]\n```\n\nOlhe para baixo[^olá]\n\n[^olá]: rodapé\n\n## Emojis\nDetalhes: [https://www.webpagefx.com/tools/emoji-cheat-sheet/](https://www.webpagefx.com/tools/emoji-cheat-sheet/)\n```\n:laughing:\n:blush:\n:smiley:\n:)\n...\n```\n:laughing::blush::smiley::)\n\n## $\\KaTeX$ Mathematics\n\nPodemos mostrar fórmulas por exemplo：$x_i + y_i = z_i$ and $\\sum_{i=1}^n a_i=0$\nPodemos também mostrar em uma única linha:\n$$\\sum_{i=1}^n a_i=0$$\nDetalhes: [katex](http://www.intmath.com/cg5/katex-mathjax-comparison.php)和[katex function](https://github.com/Khan/KaTeX/wiki/Function-Support-in-KaTeX)以及[latex](https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference)\n\n## Layout\n\n::: hljs-left\n`::: hljs-left`\n`esquerda`\n`:::`\n:::\n\n::: hljs-center\n`::: hljs-center`\n`centro`\n`:::`\n:::\n\n::: hljs-right\n`::: hljs-right`\n`direita`\n`:::`\n:::\n\n## Definições\n\nTermo 1\n\n:   Definição 1\n\nTermo 2 com *markup inline*\n\n:   Definição 2\n\n        { um pouco de código, parte da Definição 2 }\n\n    Terceiro parágrafo da definição 2.\n\n```\nTermo 1\n\n:   Definição 1\n\nTermo 2 com *markup inline*\n\n:   Definição 2\n\n        { um pouco de código, parte da Definição 2 }\n\n    Terceiro parágrafo da definição 2.\n\n```\n\n## Abreviações\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nA especificação HTML\né mantida pela W3C.\n```\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nThe HTML specification\né mantida pela W3C.\n```\n"

/***/ }),
/* 202 */
/***/ (function(module, exports) {

module.exports = "@[toc](Catalog)  \n  \nMarkdown помощь  \n===  \n> Подробнее: [http://commonmark.org/help/](http://commonmark.org/help/)  \n  \n## **Полужирный**  \n```  \n**Полужирный**  \n__Полужирный__  \n```  \n## *Курсив*  \n```  \n*Курсив*  \n_Курсив_  \n```  \n## Заголовок  \n```  \n# h1 #  \nh1  \n====  \n## h2 ##  \nh2  \n----  \n### h3 ###  \n#### h4 ####  \n##### h5 #####  \n###### h6 ######  \n```  \n## Разделительная линия  \n```  \n***  \n---  \n```  \n****  \n## ^Верхний^индекс & ~Нижний~индекс  \n```  \nверхний x^2^  \nнижний H~2~0  \n```  \n## ++Подчеркнутый++ & ~~Зачеркнутый~~  \n```  \n++Подчеркнутый++  \n~~Зачеркнутый~~  \n```  \n## ==Отметка==  \n```  \n==Отметка==  \n```  \n## Цитата  \n  \n```  \n> Цитата  \n>> Цитата 2  \n>>> Цитата 3  \n...  \n```  \n  \n## Список  \n```  \nol  \n1.  \n2.  \n3.  \n...  \n  \nul  \n-  \n-  \n...  \n```  \n  \n## Список задач  \n  \n- [x] Задача 1  \n- [ ] Задача 2  \n  \n```  \n- [x] Задача 1  \n- [ ] Задача 2  \n```  \n  \n## Ссылка  \n```  \nСсылка  \n[Текст](www.baidu.com)  \n  \nСсылка изображения  \n![Текст](http://www.image.com)  \n```  \n## Код  \n\\``` type  \n  \ncode block  \n  \n\\```  \n  \n\\` code \\`  \n  \n```c++  \nint main()  \n{  \n printf(\"hello world!\");}  \n```  \n`code`  \n  \n## Таблица  \n```  \n| th1 | th2 | th3 |  \n| :--  | :--: | ----: |  \n| left | center | right |  \n```  \n| th1 | th2 | th3 |  \n| :--  | :--: | ----: |  \n| left | center | right |  \n| ---------------------- | ------------- | ----------------- |  \n## Сноска  \n```  \nПривет[^Привет]  \n```  \n  \nТут что-то непонятное[^Привет]  \n  \n[^Привет]: А тут объяснение  \n  \n## Emojis  \nПодробнее: [https://www.webpagefx.com/tools/emoji-cheat-sheet/](https://www.webpagefx.com/tools/emoji-cheat-sheet/)  \n```  \n:laughing:  \n:blush:  \n:smiley:  \n:)  \n...  \n```  \n:laughing::blush::smiley::)  \n  \n## $\\KaTeX$ Mathematics  \n  \nМожно выводить такие формулы：$x_i + y_i = z_i$ and $\\sum_{i=1}^n a_i=0$  \nА также в одну строку:\n$$\\sum_{i=1}^n a_i=0$$  \nПодробнее: \n- [katex](http://www.intmath.com/cg5/katex-mathjax-comparison.php)\n- [katex function](https://github.com/Khan/KaTeX/wiki/Function-Support-in-KaTeX)\n- [latex](https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference)  \n  \n## Разметка\n  \n::: hljs-left  \n`::: hljs-left`  \n`left`  \n`:::`  \n:::  \n  \n::: hljs-center  \n`::: hljs-center`  \n`center`  \n`:::`  \n:::  \n  \n::: hljs-right  \n`::: hljs-right`  \n`right`  \n`:::`  \n:::  \n  \n## Список определений\n  \nТермин 1  \n  \n:   Определение 1  \n  \nТермин  2 с использованием *разметки*\n  \n:   Определение 2  \n  \n { Какой-нибудь код, часть определения 2 }  \n Третий параграф определения 2.  \n```  \nТермин 1  \n  \n:   Определение 1  \n  \nТермин  2 с использованием *разметки*\n  \n:   Определение 2  \n  \n { Какой-нибудь код, часть определения 2 }  \n Третий параграф определения 2.  \n```  \n  \n## Сокращения\n*[HTML]: Hyper Text Markup Language  \n*[W3C]:  World Wide Web Consortium  \nThe HTML specification  \nis maintained by the W3C.  \n```  \n*[HTML]: Hyper Text Markup Language  \n*[W3C]:  World Wide Web Consortium  \nThe HTML specification  \nis maintained by the W3C.  \n```\n"

/***/ }),
/* 203 */
/***/ (function(module, exports) {

module.exports = "@[toc](目录)\n\nMarkdown 语法简介\n=============\n> [语法详解](http://commonmark.org/help/)\n\n## **目录**\n```\n@[toc](目录)\n```\n\n## **粗体**\n```\n**粗体**\n__粗体__\n```\n## *斜体*\n```\n*斜体*\n_斜体_\n```\n## 标题\n```\n# 一级标题 #\n一级标题\n====\n## 二级标题 ##\n二级标题\n----\n### 三级标题 ###\n#### 四级标题 ####\n##### 五级标题 #####\n###### 六级标题 ######\n```\n## 分割线\n```\n***\n---\n```\n****\n## ^上^角~下~标\n```\n上角标 x^2^\n下角标 H~2~0\n```\n## ++下划线++ ~~中划线~~\n```\n++下划线++\n~~中划线~~\n```\n## ==标记==\n```\n==标记==\n```\n## 段落引用\n```\n> 一级\n>> 二级\n>>> 三级\n...\n```\n\n## 列表\n```\n有序列表\n1.\n2.\n3.\n...\n无序列表\n-\n-\n...\n```\n\n## 任务列表\n\n- [x] 已完成任务\n- [ ] 未完成任务\n\n```\n- [x] 已完成任务\n- [ ] 未完成任务\n```\n\n## 链接\n```\n[链接](www.baidu.com)\n![图片描述](http://www.image.com)\n```\n## 代码段落\n\\``` type\n\n代码段落\n\n\\```\n\n\\` 代码块 \\`\n\n```c++\nint main()\n{\n    printf(\"hello world!\");\n}\n```\n`code`\n## 表格(table)\n```\n| 标题1 | 标题2 | 标题3 |\n| :--  | :--: | ----: |\n| 左对齐 | 居中 | 右对齐 |\n| ---------------------- | ------------- | ----------------- |\n```\n| 标题1 | 标题2 | 标题3 |\n| :--  | :--: | ----: |\n| 左对齐 | 居中 | 右对齐 |\n| ---------------------- | ------------- | ----------------- |\n## 脚注(footnote)\n```\nhello[^hello]\n```\n\n见底部脚注[^hello]\n\n[^hello]: 一个注脚\n\n## 表情(emoji)\n[参考网站: https://www.webpagefx.com/tools/emoji-cheat-sheet/](https://www.webpagefx.com/tools/emoji-cheat-sheet/)\n```\n:laughing:\n:blush:\n:smiley:\n:)\n...\n```\n:laughing::blush::smiley::)\n\n## $\\KaTeX$公式\n\n我们可以渲染公式例如：$x_i + y_i = z_i$和$\\sum_{i=1}^n a_i=0$\n我们也可以单行渲染\n$$\\sum_{i=1}^n a_i=0$$\n具体可参照[katex文档](http://www.intmath.com/cg5/katex-mathjax-comparison.php)和[katex支持的函数](https://github.com/Khan/KaTeX/wiki/Function-Support-in-KaTeX)以及[latex文档](https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference)\n\n## 布局\n\n::: hljs-left\n`::: hljs-left`\n`居左`\n`:::`\n:::\n\n::: hljs-center\n`::: hljs-center`\n`居中`\n`:::`\n:::\n\n::: hljs-right\n`::: hljs-right`\n`居右`\n`:::`\n:::\n\n## 定义\n\n术语一\n\n:   定义一\n\n包含有*行内标记*的术语二\n\n:   定义二\n\n        {一些定义二的文字或代码}\n\n    定义二的第三段\n\n```\n术语一\n\n:   定义一\n\n包含有*行内标记*的术语二\n\n:   定义二\n\n        {一些定义二的文字或代码}\n\n    定义二的第三段\n\n```\n\n## abbr\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nHTML 规范由 W3C 维护\n```\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nHTML 规范由 W3C 维护\n```\n\n"

/***/ }),
/* 204 */
/***/ (function(module, exports) {

module.exports = "@[toc](目錄)\n\nMarkdown 語法簡介\n=============\n> [語法詳解](http://commonmark.org/help/)\n\n## **粗體**\n```\n**粗體**\n__粗體__\n```\n## *斜體*\n```\n*斜體*\n_斜體_\n```\n## 標題\n```\n# 一級標題 #\n一級標題\n====\n## 二級標題 ##\n二級標題\n----\n### 三級標題 ###\n#### 四級標題 ####\n##### 五級標題 #####\n###### 六級標題 ######\n```\n## 分割線\n```\n***\n---\n```\n****\n## ^上^角~下~標\n```\n上角標 x^2^\n下角標 H~2~0\n```\n## ++下劃線++ ~~中劃線~~\n```\n++下劃線++\n~~中劃線~~\n```\n## ==標記==\n```\n==標記==\n```\n## 段落引用\n```\n> 一級\n>> 二級\n>>> 三級\n...\n```\n\n## 列表\n```\n有序列表\n1.\n2.\n3.\n...\n無序列表\n-\n-\n...\n```\n\n## 任務列表\n\n- [x] 已完成任務\n- [ ] 未完成任務\n\n```\n- [x] 已完成任務\n- [ ] 未完成任務\n```\n\n## 鏈接\n```\n[鏈接](www.baidu.com)\n![圖片描述](http://www.image.com)\n```\n## 代碼段落\n\\``` type\n\n代碼段落\n\n\\```\n\n\\` 代碼塊 \\`\n\n```c++\nint main()\n{\n    printf(\"hello world!\");\n}\n```\n`code`\n## 表格(table)\n```\n| 標題1 | 標題2 | 標題3 |\n| :--  | :--: | ----: |\n| 左對齊 | 居中 | 右對齊 |\n| ---------------------- | ------------- | ----------------- |\n```\n| 標題1 | 標題2 | 標題3 |\n| :--  | :--: | ----: |\n| 左對齊 | 居中 | 右對齊 |\n| ---------------------- | ------------- | ----------------- |\n## 腳註(footnote)\n```\nhello[^hello]\n```\n\n見底部腳註[^hello]\n\n[^hello]: 一個註腳\n\n## 表情(emoji)\n[參考網站: https://www.webpagefx.com/tools/emoji-cheat-sheet/](https://www.webpagefx.com/tools/emoji-cheat-sheet/)\n```\n:laughing:\n:blush:\n:smiley:\n:)\n...\n```\n:laughing::blush::smiley::)\n\n## $\\KaTeX$公式\n\n我們可以渲染公式例如：$x_i + y_i = z_i$和$\\sum_{i=1}^n a_i=0$\n我們也可以單行渲染\n$$\\sum_{i=1}^n a_i=0$$\n具體可參照[katex文檔](http://www.intmath.com/cg5/katex-mathjax-comparison.php)和[katex支持的函數](https://github.com/Khan/KaTeX/wiki/Function-Support-in-KaTeX)以及[latex文檔](https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference)\n\n## 布局\n\n::: hljs-left\n`::: hljs-left`\n`居左`\n`:::`\n:::\n\n::: hljs-center\n`::: hljs-center`\n`居中`\n`:::`\n:::\n\n::: hljs-right\n`::: hljs-right`\n`居右`\n`:::`\n:::\n\n## 定義\n\n術語一\n\n:   定義一\n\n包含有*行內標記*的術語二\n\n:   定義二\n\n        {一些定義二的文字或代碼}\n\n    定義二的第三段\n\n```\n術語一\n\n:   定義一\n\n包含有*行內標記*的術語二\n\n:   定義二\n\n        {一些定義二的文字或代碼}\n\n    定義二的第三段\n\n```\n\n## abbr\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nHTML 規範由 W3C 維護\n```\n*[HTML]: Hyper Text Markup Language\n*[W3C]:  World Wide Web Consortium\nHTML 規範由 W3C 維護\n```\n\n"

/***/ }),
/* 205 */,
/* 206 */,
/* 207 */
/***/ (function(module, exports) {

module.exports=/[\xAD\u0600-\u0605\u061C\u06DD\u070F\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/

/***/ }),
/* 208 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.Any = __webpack_require__(62);
exports.Cc  = __webpack_require__(60);
exports.Cf  = __webpack_require__(207);
exports.P   = __webpack_require__(37);
exports.Z   = __webpack_require__(61);


/***/ }),
/* 209 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(221)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(70),
  /* template */
  __webpack_require__(215),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)
Component.options.__file = "D:\\work\\songwang\\test\\mavonEditor\\node_modules\\auto-textarea\\auto-textarea.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key.substr(0, 2) !== "__"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] auto-textarea.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-235ebe8b", Component.options)
  } else {
    hotAPI.reload("data-v-235ebe8b", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 210 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(226)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(73),
  /* template */
  __webpack_require__(219),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)
Component.options.__file = "D:\\work\\songwang\\test\\mavonEditor\\src\\dev\\app.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key.substr(0, 2) !== "__"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] app.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-dbe3cb46", Component.options)
  } else {
    hotAPI.reload("data-v-dbe3cb46", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 211 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(220)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(75),
  /* template */
  __webpack_require__(213),
  /* styles */
  injectStyle,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)
Component.options.__file = "D:\\work\\songwang\\test\\mavonEditor\\src\\dev\\editor.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key.substr(0, 2) !== "__"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] editor.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-08b70ce1", Component.options)
  } else {
    hotAPI.reload("data-v-08b70ce1", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 212 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(223)
  __webpack_require__(224)
}
var Component = __webpack_require__(4)(
  /* script */
  __webpack_require__(76),
  /* template */
  __webpack_require__(217),
  /* styles */
  injectStyle,
  /* scopeId */
  "data-v-7a63e4b3",
  /* moduleIdentifier (server only) */
  null
)
Component.options.__file = "D:\\work\\songwang\\test\\mavonEditor\\src\\mavon-editor.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key.substr(0, 2) !== "__"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] mavon-editor.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-7a63e4b3", Component.options)
  } else {
    hotAPI.reload("data-v-7a63e4b3", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 213 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "container"
  }, [_c('div', {
    attrs: {
      "id": "editor"
    }
  }, [_c('mavon-editor', {
    staticStyle: {
      "height": "100%"
    },
    attrs: {
      "codeStyle": _vm.codeStyle,
      "xssOptions": _vm.xssOptions
    },
    model: {
      value: (_vm.code),
      callback: function($$v) {
        _vm.code = $$v
      },
      expression: "code"
    }
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "switch-code-style"
  }, [_c('span', [_vm._v("code style:")]), _vm._v(" "), _c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.codeStyle),
      expression: "codeStyle"
    }],
    on: {
      "change": function($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function(o) {
          return o.selected
        }).map(function(o) {
          var val = "_value" in o ? o._value : o.value;
          return val
        });
        _vm.codeStyle = $event.target.multiple ? $$selectedVal : $$selectedVal[0]
      }
    }
  }, _vm._l((_vm.styles), function(val, key) {
    return _c('option', {
      domProps: {
        "value": key
      }
    }, [_vm._v(_vm._s(key))])
  }), 0)])])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-08b70ce1", module.exports)
  }
}

/***/ }),
/* 214 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "v-right-item"
  }, [_vm._t("right-toolbar-before"), _vm._v(" "), (_vm.toolbars.navigation) ? _c('button', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (!_vm.s_navigation),
      expression: "!s_navigation"
    }],
    staticClass: "op-icon fa fa-mavon-bars",
    attrs: {
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_navigation_on) + " (F8)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('navigation')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.navigation) ? _c('button', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.s_navigation),
      expression: "s_navigation"
    }],
    staticClass: "op-icon fa fa-mavon-bars selected",
    attrs: {
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_navigation_off) + " (F8)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('navigation')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.preview) ? _c('button', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.s_preview_switch),
      expression: "s_preview_switch"
    }],
    staticClass: "op-icon fa fa-mavon-eye-slash selected",
    attrs: {
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_edit) + " (F9)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('preview')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.preview) ? _c('button', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (!_vm.s_preview_switch),
      expression: "!s_preview_switch"
    }],
    staticClass: "op-icon fa fa-mavon-eye",
    attrs: {
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_preview) + " (F9)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('preview')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.fullscreen) ? _c('button', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (!_vm.s_fullScreen),
      expression: "!s_fullScreen"
    }],
    staticClass: "op-icon fa fa-mavon-arrows-alt",
    attrs: {
      "type": "button",
      "title": ((_vm.d_words.tl_fullscreen_on) + " (F10)"),
      "aria-hidden": "true"
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('fullscreen')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.fullscreen) ? _c('button', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.s_fullScreen),
      expression: "s_fullScreen"
    }],
    staticClass: "op-icon fa fa-mavon-compress selected",
    attrs: {
      "type": "button",
      "title": ((_vm.d_words.tl_fullscreen_off) + " (F10)"),
      "aria-hidden": "true"
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('fullscreen')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.readmodel) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-window-maximize",
    attrs: {
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_read) + " (F11)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('read')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.subfield) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-columns",
    class: {
      'selected': _vm.s_subfield
    },
    attrs: {
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.s_subfield ? _vm.d_words.tl_single_column : _vm.d_words.tl_double_column) + " (F12)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('subfield')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.help && _vm.toolbars.htmlcode && _vm.toolbars.readmodel && _vm.toolbars.fullscreen && _vm.toolbars.subfield && _vm.toolbars.navigation) ? _c('span', {
    staticClass: "op-icon-divider"
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.htmlcode) ? _c('button', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (!_vm.s_html_code),
      expression: "!s_html_code"
    }],
    staticClass: "op-icon fa fa-mavon-code",
    attrs: {
      "type": "button",
      "title": _vm.d_words.tl_html_on,
      "aria-hidden": "true"
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('html')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.htmlcode) ? _c('button', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.s_html_code),
      expression: "s_html_code"
    }],
    staticClass: "op-icon fa fa-mavon-code selected",
    attrs: {
      "type": "button",
      "title": _vm.d_words.tl_html_off,
      "aria-hidden": "true"
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('html')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.help) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-question-circle",
    staticStyle: {
      "font-size": "17px",
      "padding": "5px 6px 5px 3px"
    },
    attrs: {
      "type": "button",
      "title": _vm.d_words.tl_help,
      "aria-hidden": "true"
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('help')
      }
    }
  }) : _vm._e(), _vm._v(" "), _vm._t("right-toolbar-after")], 2)
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-1eaa14a3", module.exports)
  }
}

/***/ }),
/* 215 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "auto-textarea-wrapper",
    style: ({
      fontSize: _vm.fontSize,
      lineHeight: _vm.lineHeight,
      height: _vm.fullHeight ? '100%' : 'auto'
    })
  }, [_c('pre', {
    staticClass: "auto-textarea-block",
    style: ({
      fontSize: _vm.fontSize,
      lineHeight: _vm.lineHeight,
      minHeight: _vm.fullHeight ? '100%' : 'auto'
    })
  }, [_c('br'), _vm._v(_vm._s(_vm.temp_value) + " ")]), _vm._v(" "), _c('textarea', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.temp_value),
      expression: "temp_value"
    }],
    ref: "vTextarea",
    staticClass: "auto-textarea-input",
    class: {
      'no-border': !_vm.border, 'no-resize': !_vm.resize
    },
    style: ({
      fontSize: _vm.fontSize,
      lineHeight: _vm.lineHeight
    }),
    attrs: {
      "autofocus": _vm.s_autofocus,
      "spellcheck": "false",
      "placeholder": _vm.placeholder
    },
    domProps: {
      "value": (_vm.temp_value)
    },
    on: {
      "keyup": _vm.change,
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.temp_value = $event.target.value
      }
    }
  })])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-235ebe8b", module.exports)
  }
}

/***/ }),
/* 216 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "v-left-item"
  }, [_vm._t("left-toolbar-before"), _vm._v(" "), (_vm.toolbars.bold) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-bold",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_bold) + " (ctrl+b)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('bold')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.italic) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-italic",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_italic) + " (ctrl+i)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('italic')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.header) ? _c('div', {
    staticClass: "op-icon fa fa-mavon-header dropdown dropdown-wrapper",
    class: {
      'selected': _vm.s_header_dropdown_open
    },
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_header) + " (ctrl+h)")
    },
    on: {
      "mouseleave": _vm.$mouseleave_header_dropdown,
      "mouseenter": _vm.$mouseenter_header_dropdown
    }
  }, [_c('transition', {
    attrs: {
      "name": "fade"
    }
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.s_header_dropdown_open),
      expression: "s_header_dropdown_open"
    }],
    staticClass: "op-header popup-dropdown",
    class: {
      'transition': _vm.transition
    },
    on: {
      "mouseenter": _vm.$mouseenter_header_dropdown,
      "mouseleave": _vm.$mouseleave_header_dropdown
    }
  }, [_c('div', {
    staticClass: "dropdown-item",
    attrs: {
      "title": "#"
    },
    on: {
      "click": function($event) {
        $event.stopPropagation();
        return _vm.$click_header('header1')
      }
    }
  }, [_c('span', [_vm._v(_vm._s(_vm.d_words.tl_header_one))])]), _vm._v(" "), _c('div', {
    staticClass: "dropdown-item",
    attrs: {
      "title": "## "
    },
    on: {
      "click": function($event) {
        $event.stopPropagation();
        return _vm.$click_header('header2')
      }
    }
  }, [_c('span', [_vm._v(_vm._s(_vm.d_words.tl_header_two))])]), _vm._v(" "), _c('div', {
    staticClass: "dropdown-item",
    attrs: {
      "title": "### "
    },
    on: {
      "click": function($event) {
        $event.stopPropagation();
        return _vm.$click_header('header3')
      }
    }
  }, [_c('span', [_vm._v(_vm._s(_vm.d_words.tl_header_three))])]), _vm._v(" "), _c('div', {
    staticClass: "dropdown-item",
    attrs: {
      "title": "#### "
    },
    on: {
      "click": function($event) {
        $event.stopPropagation();
        return _vm.$click_header('header4')
      }
    }
  }, [_c('span', [_vm._v(_vm._s(_vm.d_words.tl_header_four))])]), _vm._v(" "), _c('div', {
    staticClass: "dropdown-item",
    attrs: {
      "title": "##### "
    },
    on: {
      "click": function($event) {
        $event.stopPropagation();
        return _vm.$click_header('header5')
      }
    }
  }, [_c('span', [_vm._v(_vm._s(_vm.d_words.tl_header_five))])]), _vm._v(" "), _c('div', {
    staticClass: "dropdown-item",
    attrs: {
      "title": "###### "
    },
    on: {
      "click": function($event) {
        $event.stopPropagation();
        return _vm.$click_header('header6')
      }
    }
  }, [_c('span', [_vm._v(_vm._s(_vm.d_words.tl_header_six))])])])])], 1) : _vm._e(), _vm._v(" "), (_vm.toolbars.header || _vm.toolbars.italic || _vm.toolbars.bold) ? _c('span', {
    staticClass: "op-icon-divider"
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.underline) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-underline",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "title": ((_vm.d_words.tl_underline) + " (ctrl+u)"),
      "aria-hidden": "true"
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('underline')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.strikethrough) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-strikethrough",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "title": ((_vm.d_words.tl_strikethrough) + " (ctrl+shift+d)"),
      "aria-hidden": "true"
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('strikethrough')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.mark) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-thumb-tack",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "title": ((_vm.d_words.tl_mark) + " (ctrl+m)"),
      "aria-hidden": "true"
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('mark')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.superscript) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-superscript",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_superscript) + " (ctrl+alt+s)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('superscript')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.subscript) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-subscript",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_subscript) + " (ctrl+shift+s)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('subscript')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.alignleft) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-align-left",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_alignleft) + " (ctrl+l)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('alignleft')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.aligncenter) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-align-center",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_aligncenter) + " (ctrl+e)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('aligncenter')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.alignright) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-align-right",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_alignright) + " (ctrl+r)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('alignright')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.superscript || _vm.toolbars.subscript || _vm.toolbars.underline || _vm.toolbars.strikethrough || _vm.toolbars.mark) ? _c('span', {
    staticClass: "op-icon-divider"
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.quote) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-quote-left",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_quote) + " (ctrl+q)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('quote')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.ol) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-list-ol",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_ol) + " (ctrl+o)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('ol')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.ul) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-list-ul",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_ul) + " (ctrl+alt+u)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('ul')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.ul || _vm.toolbars.ol || _vm.toolbars.quote) ? _c('span', {
    staticClass: "op-icon-divider"
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.link) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-link",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_link) + " (ctrl+l)")
    },
    on: {
      "click": function($event) {
        $event.stopPropagation();
        return _vm.$toggle_imgLinkAdd('link')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.imagelink) ? _c('div', {
    staticClass: "op-icon fa fa-mavon-picture-o dropdown dropdown-wrapper",
    class: {
      'selected': _vm.s_img_dropdown_open
    },
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true"
    },
    on: {
      "mouseleave": _vm.$mouseleave_img_dropdown,
      "mouseenter": _vm.$mouseenter_img_dropdown
    }
  }, [_c('transition', {
    attrs: {
      "name": "fade"
    }
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.s_img_dropdown_open),
      expression: "s_img_dropdown_open"
    }],
    staticClass: "op-image popup-dropdown",
    class: {
      'transition': _vm.transition
    },
    on: {
      "mouseleave": _vm.$mouseleave_img_dropdown,
      "mouseenter": _vm.$mouseenter_img_dropdown
    }
  }, [_c('div', {
    staticClass: "dropdown-item",
    on: {
      "click": function($event) {
        $event.stopPropagation();
        return _vm.$toggle_imgLinkAdd('imagelink')
      }
    }
  }, [_c('span', [_vm._v(_vm._s(_vm.d_words.tl_image))])]), _vm._v(" "), _c('div', {
    staticClass: "dropdown-item",
    staticStyle: {
      "overflow": "hidden"
    }
  }, [_c('input', {
    attrs: {
      "type": "file",
      "accept": "image/gif,image/jpeg,image/jpg,image/png,image/svg",
      "multiple": "multiple"
    },
    on: {
      "change": function($event) {
        return _vm.$imgAdd($event)
      }
    }
  }), _vm._v(_vm._s(_vm.d_words.tl_upload) + "\n                ")]), _vm._v(" "), _vm._l((_vm.img_file), function(item, index) {
    return (item && item[1]) ? _c('div', {
      key: index,
      staticClass: "dropdown-item dropdown-images",
      attrs: {
        "title": item[1].name
      },
      on: {
        "click": function($event) {
          $event.stopPropagation();
          return _vm.$imgFileListClick(index)
        }
      }
    }, [_c('span', [_vm._v(_vm._s(item[1].name))]), _vm._v(" "), _c('button', {
      staticClass: "op-icon fa fa-mavon-times",
      attrs: {
        "slot": "right",
        "type": "button",
        "aria-hidden": "true",
        "title": _vm.d_words.tl_upload_remove
      },
      on: {
        "click": function($event) {
          $event.stopPropagation();
          return _vm.$imgDel(index)
        }
      },
      slot: "right"
    }), _vm._v(" "), _c('img', {
      staticClass: "image-show",
      class: {
        'transition': _vm.transition
      },
      attrs: {
        "src": item[1].miniurl,
        "alt": "none"
      }
    })]) : _vm._e()
  })], 2)])], 1) : _vm._e(), _vm._v(" "), (_vm.toolbars.code) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-code",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_code) + " (ctrl+alt+c)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('code')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.table) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-table",
    attrs: {
      "disabled": !_vm.editable,
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_table) + " (ctrl+alt+t)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('table')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.link || _vm.toolbars.imagelink || _vm.toolbars.code || _vm.toolbars.table) ? _c('span', {
    staticClass: "op-icon-divider"
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.undo) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-undo",
    attrs: {
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_undo) + " (ctrl+z)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('undo')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.redo) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-repeat",
    attrs: {
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_redo) + " (ctrl+y)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('redo')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.trash) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-trash-o",
    attrs: {
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_trash) + " (ctrl+breakspace)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('trash')
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.toolbars.save) ? _c('button', {
    staticClass: "op-icon fa fa-mavon-floppy-o",
    attrs: {
      "type": "button",
      "aria-hidden": "true",
      "title": ((_vm.d_words.tl_save) + " (ctrl+s)")
    },
    on: {
      "click": function($event) {
        return _vm.$clicks('save')
      }
    }
  }) : _vm._e(), _vm._v(" "), _vm._t("left-toolbar-after"), _vm._v(" "), _c('transition', {
    attrs: {
      "name": "fade"
    }
  }, [(_vm.s_img_link_open) ? _c('div', {
    staticClass: "add-image-link-wrapper"
  }, [_c('div', {
    staticClass: "add-image-link"
  }, [_c('i', {
    staticClass: "fa fa-mavon-times",
    attrs: {
      "aria-hidden": "true"
    },
    on: {
      "click": function($event) {
        $event.stopPropagation();
        $event.preventDefault();
        _vm.s_img_link_open = false
      }
    }
  }), _vm._v(" "), _c('h3', {
    staticClass: "title"
  }, [_vm._v(_vm._s(_vm.link_type == 'link' ? _vm.d_words.tl_popup_link_title : _vm.d_words.tl_popup_img_link_title))]), _vm._v(" "), _c('div', {
    staticClass: "link-text input-wrapper"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.link_text),
      expression: "link_text"
    }],
    ref: "linkTextInput",
    attrs: {
      "type": "text",
      "placeholder": _vm.link_type == 'link' ? _vm.d_words.tl_popup_link_text : _vm.d_words.tl_popup_img_link_text
    },
    domProps: {
      "value": (_vm.link_text)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.link_text = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "link-addr input-wrapper"
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.link_addr),
      expression: "link_addr"
    }],
    attrs: {
      "type": "text",
      "placeholder": _vm.link_type == 'link' ? _vm.d_words.tl_popup_link_addr : _vm.d_words.tl_popup_img_link_addr
    },
    domProps: {
      "value": (_vm.link_addr)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.link_addr = $event.target.value
      }
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "op-btn cancel",
    on: {
      "click": function($event) {
        $event.stopPropagation();
        _vm.s_img_link_open = false
      }
    }
  }, [_vm._v(_vm._s(_vm.d_words.tl_popup_link_cancel))]), _vm._v(" "), _c('div', {
    staticClass: "op-btn sure",
    on: {
      "click": function($event) {
        $event.stopPropagation();
        return _vm.$imgLinkAdd()
      }
    }
  }, [_vm._v(_vm._s(_vm.d_words.tl_popup_link_sure))])])]) : _vm._e()])], 2)
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-548e2160", module.exports)
  }
}

/***/ }),
/* 217 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "v-note-wrapper markdown-body",
    class: [{
      'fullscreen': _vm.s_fullScreen,
      'shadow': _vm.boxShadow
    }],
    style: ({
      'box-shadow': _vm.boxShadow ? _vm.boxShadowStyle : ''
    })
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.toolbarsFlag),
      expression: "toolbarsFlag"
    }],
    staticClass: "v-note-op",
    style: ({
      'background': _vm.toolbarsBackground
    })
  }, [_c('v-md-toolbar-left', {
    ref: "toolbar_left",
    class: {
      'transition': _vm.transition
    },
    attrs: {
      "editable": _vm.editable,
      "transition": _vm.transition,
      "d_words": _vm.d_words,
      "toolbars": _vm.toolbars,
      "image_filter": _vm.imageFilter
    },
    on: {
      "toolbar_left_click": _vm.toolbar_left_click,
      "toolbar_left_addlink": _vm.toolbar_left_addlink,
      "imgAdd": _vm.$imgAdd,
      "imgDel": _vm.$imgDel,
      "imgTouch": _vm.$imgTouch
    }
  }, [_vm._t("left-toolbar-before", null, {
    "slot": "left-toolbar-before"
  }), _vm._v(" "), _vm._t("left-toolbar-after", null, {
    "slot": "left-toolbar-after"
  })], 2), _vm._v(" "), _c('v-md-toolbar-right', {
    ref: "toolbar_right",
    class: {
      'transition': _vm.transition
    },
    attrs: {
      "d_words": _vm.d_words,
      "toolbars": _vm.toolbars,
      "s_subfield": _vm.s_subfield,
      "s_preview_switch": _vm.s_preview_switch,
      "s_fullScreen": _vm.s_fullScreen,
      "s_html_code": _vm.s_html_code,
      "s_navigation": _vm.s_navigation
    },
    on: {
      "toolbar_right_click": _vm.toolbar_right_click
    }
  }, [_vm._t("right-toolbar-before", null, {
    "slot": "right-toolbar-before"
  }), _vm._v(" "), _vm._t("right-toolbar-after", null, {
    "slot": "right-toolbar-after"
  })], 2)], 1), _vm._v(" "), _c('div', {
    staticClass: "v-note-panel"
  }, [_c('div', {
    ref: "vNoteEdit",
    staticClass: "v-note-edit divarea-wrapper",
    class: {
      'scroll-style': _vm.s_scrollStyle, 'scroll-style-border-radius': _vm.s_scrollStyle && !_vm.s_preview_switch && !_vm.s_html_code, 'single-edit': !_vm.s_preview_switch && !_vm.s_html_code, 'single-show': (!_vm.s_subfield && _vm.s_preview_switch) || (!_vm.s_subfield && _vm.s_html_code), 'transition': _vm.transition
    },
    on: {
      "scroll": _vm.$v_edit_scroll,
      "click": _vm.textAreaFocus
    }
  }, [_c('div', {
    staticClass: "content-input-wrapper",
    style: ({
      'background-color': _vm.editorBackground
    })
  }, [_c('v-autoTextarea', {
    ref: "vNoteTextarea",
    staticClass: "content-input",
    style: ({
      'background-color': _vm.editorBackground
    }),
    attrs: {
      "placeholder": _vm.placeholder ? _vm.placeholder : _vm.d_words.start_editor,
      "fontSize": _vm.fontSize,
      "lineHeight": "1.5",
      "fullHeight": ""
    },
    model: {
      value: (_vm.d_value),
      callback: function($$v) {
        _vm.d_value = $$v
      },
      expression: "d_value"
    }
  })], 1)]), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.s_preview_switch || _vm.s_html_code),
      expression: "s_preview_switch || s_html_code"
    }],
    staticClass: "v-note-show",
    class: {
      'single-show': (!_vm.s_subfield && _vm.s_preview_switch) || (!_vm.s_subfield && _vm.s_html_code)
    }
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (!_vm.s_html_code),
      expression: "!s_html_code"
    }],
    ref: "vShowContent",
    staticClass: "v-show-content",
    class: {
      'scroll-style': _vm.s_scrollStyle, 'scroll-style-border-radius': _vm.s_scrollStyle
    },
    style: ({
      'background-color': _vm.previewBackground
    }),
    domProps: {
      "innerHTML": _vm._s(_vm.d_render)
    }
  }), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.s_html_code),
      expression: "s_html_code"
    }],
    staticClass: "v-show-content-html",
    class: {
      'scroll-style': _vm.s_scrollStyle, 'scroll-style-border-radius': _vm.s_scrollStyle
    },
    style: ({
      'background-color': _vm.previewBackground
    })
  }, [_vm._v("\n                " + _vm._s(_vm.d_render) + "\n            ")])]), _vm._v(" "), _c('transition', {
    attrs: {
      "name": "slideTop"
    }
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.s_navigation),
      expression: "s_navigation"
    }],
    staticClass: "v-note-navigation-wrapper",
    class: {
      'transition': _vm.transition
    }
  }, [_c('div', {
    staticClass: "v-note-navigation-title"
  }, [_vm._v("\n                    " + _vm._s(_vm.d_words.navigation_title)), _c('i', {
    staticClass: "fa fa-mavon-times v-note-navigation-close",
    attrs: {
      "aria-hidden": "true"
    },
    on: {
      "click": function($event) {
        return _vm.toolbar_right_click('navigation')
      }
    }
  })]), _vm._v(" "), _c('div', {
    ref: "navigationContent",
    staticClass: "v-note-navigation-content",
    class: {
      'scroll-style': _vm.s_scrollStyle
    }
  })])])], 1), _vm._v(" "), _c('transition', {
    attrs: {
      "name": "fade"
    }
  }, [_c('div', {
    ref: "help"
  }, [(_vm.s_help) ? _c('div', {
    staticClass: "v-note-help-wrapper",
    on: {
      "click": function($event) {
        if ($event.target !== $event.currentTarget) { return null; }
        return _vm.toolbar_right_click('help')
      }
    }
  }, [_c('div', {
    staticClass: "v-note-help-content markdown-body",
    class: {
      'shadow': _vm.boxShadow
    }
  }, [_c('i', {
    staticClass: "fa fa-mavon-times",
    attrs: {
      "aria-hidden": "true"
    },
    on: {
      "click": function($event) {
        $event.stopPropagation();
        $event.preventDefault();
        return _vm.toolbar_right_click('help')
      }
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "scroll-style v-note-help-show",
    domProps: {
      "innerHTML": _vm._s(_vm.d_help)
    }
  })])]) : _vm._e()])]), _vm._v(" "), _c('transition', {
    attrs: {
      "name": "fade"
    }
  }, [(_vm.d_preview_imgsrc) ? _c('div', {
    staticClass: "v-note-img-wrapper",
    on: {
      "click": function($event) {
        _vm.d_preview_imgsrc = null
      }
    }
  }, [_c('img', {
    attrs: {
      "src": _vm.d_preview_imgsrc,
      "alt": "none"
    }
  })]) : _vm._e()]), _vm._v(" "), _c('div', {
    ref: "vReadModel",
    staticClass: "v-note-read-model scroll-style",
    class: {
      'show': _vm.s_readmodel
    }
  }, [_c('div', {
    ref: "vNoteReadContent",
    staticClass: "v-note-read-content",
    domProps: {
      "innerHTML": _vm._s(_vm.d_render)
    }
  })])], 1)
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-7a63e4b3", module.exports)
  }
}

/***/ }),
/* 218 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('div', {
    staticClass: "navigate"
  }, [_c('span', {
    on: {
      "click": function($event) {
        _vm.viewIndex = 1
      }
    }
  }, [_vm._v("Full demo")]), _vm._v(" "), _c('span', {
    on: {
      "click": function($event) {
        _vm.viewIndex = 2
      }
    }
  }, [_vm._v("Simple demo")])]), _vm._v(" "), _c('div', [(_vm.viewIndex == 1) ? _c('App') : (_vm.viewIndex == 2) ? _c('Editor') : _vm._e()], 1)])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-c06e3552", module.exports)
  }
}

/***/ }),
/* 219 */
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    attrs: {
      "id": "app"
    }
  }, [_c('select', {
    staticClass: "page-lang",
    on: {
      "change": _vm.opchange
    }
  }, [_c('option', {
    attrs: {
      "value": "zh-CN"
    }
  }, [_vm._v("简体中文")]), _vm._v(" "), _c('option', {
    attrs: {
      "value": "zh-TW"
    }
  }, [_vm._v("正體中文")]), _vm._v(" "), _c('option', {
    attrs: {
      "value": "en"
    }
  }, [_vm._v("English")]), _vm._v(" "), _c('option', {
    attrs: {
      "value": "fr"
    }
  }, [_vm._v("Français")]), _vm._v(" "), _c('option', {
    attrs: {
      "value": "de"
    }
  }, [_vm._v("Deutsch")]), _vm._v(" "), _c('option', {
    attrs: {
      "value": "ja"
    }
  }, [_vm._v("日本語 ")]), _vm._v(" "), _c('option', {
    attrs: {
      "value": "pt-BR"
    }
  }, [_vm._v("Português")]), _vm._v(" "), _c('option', {
    attrs: {
      "value": "ru"
    }
  }, [_vm._v("Русский")])]), _vm._v(" "), _c('section', {
    staticClass: "page-header"
  }, [_c('h1', {
    staticClass: "project-name"
  }, [_vm._v("mavonEditor")]), _vm._v(" "), _c('h3', {
    staticClass: "project-tagline"
  }, [_vm._v(_vm._s(_vm.d_words.sub_title))]), _vm._v(" "), _c('a', {
    staticClass: "btn",
    attrs: {
      "href": "https://github.com/hinesboy/mavonEditor"
    }
  }, [_vm._v("View on GitHub")]), _vm._v(" "), _c('a', {
    staticClass: "btn",
    attrs: {
      "href": "https://github.com/hinesboy/mavonEditor/archive/refs/heads/master.zip"
    }
  }, [_vm._v("Download .zip")]), _vm._v(" "), _c('a', {
    staticClass: "btn",
    attrs: {
      "href": "https://github.com/hinesboy/mavonEditor/archive/refs/heads/master.tar.gz"
    }
  }, [_vm._v("Download .tar.gz")])]), _vm._v(" "), (!_vm.screen_phone) ? _c('div', {
    staticClass: "item"
  }, [_c('h2', {
    staticClass: "item-header"
  }, [_vm._v("\n            " + _vm._s(_vm.d_words.default_setting) + "\n        ")]), _vm._v(" "), _c('div', {
    staticClass: "item-button"
  }, [_c('button', {
    on: {
      "click": _vm.clearCache
    }
  }, [_vm._v("clear cache")]), _vm._v(" "), _c('button', {
    on: {
      "click": _vm.uploadimg
    }
  }, [_vm._v("upload")]), _vm._v(" "), _c('button', {
    on: {
      "click": _vm.imgreplace
    }
  }, [_vm._v("imgreplace")]), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.imgName),
      expression: "imgName"
    }],
    attrs: {
      "type": "text"
    },
    domProps: {
      "value": (_vm.imgName)
    },
    on: {
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.imgName = $event.target.value
      }
    }
  }), _vm._v(" "), _c('button', {
    on: {
      "click": _vm.imgdelete
    }
  }, [_vm._v("delete")]), _vm._v(" "), _c('div', {
    staticClass: "switch-code-style"
  }, [_c('span', [_vm._v("code style:")]), _vm._v(" "), _c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.codeStyle),
      expression: "codeStyle"
    }],
    on: {
      "change": function($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function(o) {
          return o.selected
        }).map(function(o) {
          var val = "_value" in o ? o._value : o.value;
          return val
        });
        _vm.codeStyle = $event.target.multiple ? $$selectedVal : $$selectedVal[0]
      }
    }
  }, _vm._l((_vm.styles), function(val, key) {
    return _c('option', {
      domProps: {
        "value": key
      }
    }, [_vm._v(_vm._s(key))])
  }), 0)])]), _vm._v(" "), _c('mavon-editor', {
    ref: "md",
    staticClass: "item-editor",
    attrs: {
      "subfield": _vm.subfield,
      "toolbarsFlag": _vm.toolbarsFlag,
      "editable": _vm.editable,
      "language": _vm.d_language,
      "ishljs": true,
      "autofocus": _vm.autofocus,
      "shortCut": true,
      "externalLink": _vm.external_link,
      "imageFilter": _vm.image_filter,
      "boxShadow": true,
      "scrollStyle": true,
      "transition": true,
      "codeStyle": _vm.codeStyle,
      "box-shadow-style": "0 2px 12px 0 rgba(0, 0, 0, 0.1)",
      "toolbars-background": "#ffffff",
      "preview-background": "#fbfbfb"
    },
    on: {
      "change": _vm.change,
      "save": _vm.saveone,
      "imgAdd": _vm.$imgAdd,
      "imgDel": _vm.$imgDel,
      "subfieldtoggle": _vm.$subfieldtoggle,
      "previewtoggle": _vm.$previewtoggle
    },
    model: {
      value: (_vm.help1),
      callback: function($$v) {
        _vm.help1 = $$v
      },
      expression: "help1"
    }
  }), _vm._v(" "), _c('button', {
    ref: "diy",
    staticClass: "op-icon fa fa-mavon-align-left",
    attrs: {
      "type": "button",
      "aria-hidden": "true",
      "title": "自定义"
    },
    on: {
      "click": function($event) {
        return _vm.$click('selftest')
      }
    }
  })], 1) : _vm._e(), _vm._v(" "), (_vm.screen_phone) ? _c('div', {
    staticClass: "item"
  }, [_c('h2', {
    staticClass: "item-header"
  }, [_vm._v("\n            " + _vm._s(_vm.d_words.customize_setting) + "\n        ")]), _vm._v(" "), _c('mavon-editor', {
    staticClass: "item-editor",
    attrs: {
      "language": _vm.d_language,
      "toolbars": _vm.toolbars
    },
    on: {
      "save": _vm.savetwo
    },
    model: {
      value: (_vm.help2),
      callback: function($$v) {
        _vm.help2 = $$v
      },
      expression: "help2"
    }
  })], 1) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "item"
  }, [_c('span', {
    staticStyle: {
      "display": "block",
      "margin": "30px 0 15px 0",
      "color": "#1e6bb8"
    }
  }, [_vm._v("\n    " + _vm._s(_vm.d_words.mark) + "\n  ")])]), _vm._v(" "), _c('div', {
    staticClass: "item"
  }, [_c('h2', {
    staticClass: "item-header"
  }, [_vm._v("\n            " + _vm._s(_vm.d_words.detail)), _c('a', {
    attrs: {
      "href": "https://github.com/hinesboy/mavonEditor"
    }
  }, [_vm._v("GitHub")])])])])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-dbe3cb46", module.exports)
  }
}

/***/ }),
/* 220 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(114);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(5)("165b8ffd", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../node_modules/css-loader/index.js?sourceMap!../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-08b70ce1\",\"scoped\":false,\"hasInlineConfig\":true}!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./editor.vue", function() {
     var newContent = require("!!../../node_modules/css-loader/index.js?sourceMap!../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-08b70ce1\",\"scoped\":false,\"hasInlineConfig\":true}!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./editor.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 221 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(115);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(5)("363f06ac", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../css-loader/index.js?sourceMap!../vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-235ebe8b\",\"scoped\":false,\"hasInlineConfig\":true}!../stylus-loader/index.js!../vue-loader/lib/selector.js?type=styles&index=0!./auto-textarea.vue", function() {
     var newContent = require("!!../css-loader/index.js?sourceMap!../vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-235ebe8b\",\"scoped\":false,\"hasInlineConfig\":true}!../stylus-loader/index.js!../vue-loader/lib/selector.js?type=styles&index=0!./auto-textarea.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 222 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(116);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(5)("12148360", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../node_modules/css-loader/index.js?sourceMap!../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-548e2160\",\"scoped\":true,\"hasInlineConfig\":true}!../../node_modules/stylus-loader/index.js!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./md-toolbar-left.vue", function() {
     var newContent = require("!!../../node_modules/css-loader/index.js?sourceMap!../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-548e2160\",\"scoped\":true,\"hasInlineConfig\":true}!../../node_modules/stylus-loader/index.js!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./md-toolbar-left.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 223 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(117);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(5)("17242f3d", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../node_modules/css-loader/index.js?sourceMap!../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-7a63e4b3\",\"scoped\":false,\"hasInlineConfig\":true}!../node_modules/stylus-loader/index.js!../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./mavon-editor.vue", function() {
     var newContent = require("!!../node_modules/css-loader/index.js?sourceMap!../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-7a63e4b3\",\"scoped\":false,\"hasInlineConfig\":true}!../node_modules/stylus-loader/index.js!../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./mavon-editor.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 224 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(118);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(5)("20bbb8ce", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../node_modules/css-loader/index.js?sourceMap!../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-7a63e4b3\",\"scoped\":true,\"hasInlineConfig\":true}!../node_modules/vue-loader/lib/selector.js?type=styles&index=1!./mavon-editor.vue", function() {
     var newContent = require("!!../node_modules/css-loader/index.js?sourceMap!../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-7a63e4b3\",\"scoped\":true,\"hasInlineConfig\":true}!../node_modules/vue-loader/lib/selector.js?type=styles&index=1!./mavon-editor.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 225 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(119);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(5)("9738a984", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../node_modules/css-loader/index.js?sourceMap!../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-c06e3552\",\"scoped\":false,\"hasInlineConfig\":true}!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./demo.vue", function() {
     var newContent = require("!!../../node_modules/css-loader/index.js?sourceMap!../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-c06e3552\",\"scoped\":false,\"hasInlineConfig\":true}!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./demo.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 226 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(120);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(5)("f5da1834", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../node_modules/css-loader/index.js?sourceMap!../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-dbe3cb46\",\"scoped\":false,\"hasInlineConfig\":true}!../../node_modules/stylus-loader/index.js!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./app.vue", function() {
     var newContent = require("!!../../node_modules/css-loader/index.js?sourceMap!../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-dbe3cb46\",\"scoped\":false,\"hasInlineConfig\":true}!../../node_modules/stylus-loader/index.js!../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./app.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 227 */
/***/ (function(module, exports) {

/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
module.exports = function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}


/***/ }),
/* 228 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 229 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * xss
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var DEFAULT = __webpack_require__(65);
var parser = __webpack_require__(66);
var FilterXSS = __webpack_require__(230);

/**
 * filter xss function
 *
 * @param {String} html
 * @param {Object} options { whiteList, onTag, onTagAttr, onIgnoreTag, onIgnoreTagAttr, safeAttrValue, escapeHtml }
 * @return {String}
 */
function filterXSS(html, options) {
  var xss = new FilterXSS(options);
  return xss.process(html);
}

exports = module.exports = filterXSS;
exports.filterXSS = filterXSS;
exports.FilterXSS = FilterXSS;
for (var i in DEFAULT) exports[i] = DEFAULT[i];
for (var i in parser) exports[i] = parser[i];

// using `xss` on the browser, output `filterXSS` to the globals
if (typeof window !== "undefined") {
  window.filterXSS = module.exports;
}

// using `xss` on the WebWorker, output `filterXSS` to the globals
function isWorkerEnv() {
  return typeof self !== 'undefined' && typeof DedicatedWorkerGlobalScope !== 'undefined' && self instanceof DedicatedWorkerGlobalScope;
}
if (isWorkerEnv()) {
  self.filterXSS = module.exports;
}


/***/ }),
/* 230 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * filter xss
 *
 * @author Zongmin Lei<leizongmin@gmail.com>
 */

var FilterCSS = __webpack_require__(34).FilterCSS;
var DEFAULT = __webpack_require__(65);
var parser = __webpack_require__(66);
var parseTag = parser.parseTag;
var parseAttr = parser.parseAttr;
var _ = __webpack_require__(38);

/**
 * returns `true` if the input value is `undefined` or `null`
 *
 * @param {Object} obj
 * @return {Boolean}
 */
function isNull(obj) {
  return obj === undefined || obj === null;
}

/**
 * get attributes for a tag
 *
 * @param {String} html
 * @return {Object}
 *   - {String} html
 *   - {Boolean} closing
 */
function getAttrs(html) {
  var i = _.spaceIndex(html);
  if (i === -1) {
    return {
      html: "",
      closing: html[html.length - 2] === "/"
    };
  }
  html = _.trim(html.slice(i + 1, -1));
  var isClosing = html[html.length - 1] === "/";
  if (isClosing) html = _.trim(html.slice(0, -1));
  return {
    html: html,
    closing: isClosing
  };
}

/**
 * shallow copy
 *
 * @param {Object} obj
 * @return {Object}
 */
function shallowCopyObject(obj) {
  var ret = {};
  for (var i in obj) {
    ret[i] = obj[i];
  }
  return ret;
}

/**
 * FilterXSS class
 *
 * @param {Object} options
 *        whiteList, onTag, onTagAttr, onIgnoreTag,
 *        onIgnoreTagAttr, safeAttrValue, escapeHtml
 *        stripIgnoreTagBody, allowCommentTag, stripBlankChar
 *        css{whiteList, onAttr, onIgnoreAttr} `css=false` means don't use `cssfilter`
 */
function FilterXSS(options) {
  options = shallowCopyObject(options || {});

  if (options.stripIgnoreTag) {
    if (options.onIgnoreTag) {
      console.error(
        'Notes: cannot use these two options "stripIgnoreTag" and "onIgnoreTag" at the same time'
      );
    }
    options.onIgnoreTag = DEFAULT.onIgnoreTagStripAll;
  }

  options.whiteList = options.whiteList || DEFAULT.whiteList;
  options.onTag = options.onTag || DEFAULT.onTag;
  options.onTagAttr = options.onTagAttr || DEFAULT.onTagAttr;
  options.onIgnoreTag = options.onIgnoreTag || DEFAULT.onIgnoreTag;
  options.onIgnoreTagAttr = options.onIgnoreTagAttr || DEFAULT.onIgnoreTagAttr;
  options.safeAttrValue = options.safeAttrValue || DEFAULT.safeAttrValue;
  options.escapeHtml = options.escapeHtml || DEFAULT.escapeHtml;
  this.options = options;

  if (options.css === false) {
    this.cssFilter = false;
  } else {
    options.css = options.css || {};
    this.cssFilter = new FilterCSS(options.css);
  }
}

/**
 * start process and returns result
 *
 * @param {String} html
 * @return {String}
 */
FilterXSS.prototype.process = function(html) {
  // compatible with the input
  html = html || "";
  html = html.toString();
  if (!html) return "";

  var me = this;
  var options = me.options;
  var whiteList = options.whiteList;
  var onTag = options.onTag;
  var onIgnoreTag = options.onIgnoreTag;
  var onTagAttr = options.onTagAttr;
  var onIgnoreTagAttr = options.onIgnoreTagAttr;
  var safeAttrValue = options.safeAttrValue;
  var escapeHtml = options.escapeHtml;
  var cssFilter = me.cssFilter;

  // remove invisible characters
  if (options.stripBlankChar) {
    html = DEFAULT.stripBlankChar(html);
  }

  // remove html comments
  if (!options.allowCommentTag) {
    html = DEFAULT.stripCommentTag(html);
  }

  // if enable stripIgnoreTagBody
  var stripIgnoreTagBody = false;
  if (options.stripIgnoreTagBody) {
    var stripIgnoreTagBody = DEFAULT.StripTagBody(
      options.stripIgnoreTagBody,
      onIgnoreTag
    );
    onIgnoreTag = stripIgnoreTagBody.onIgnoreTag;
  }

  var retHtml = parseTag(
    html,
    function(sourcePosition, position, tag, html, isClosing) {
      var info = {
        sourcePosition: sourcePosition,
        position: position,
        isClosing: isClosing,
        isWhite: whiteList.hasOwnProperty(tag)
      };

      // call `onTag()`
      var ret = onTag(tag, html, info);
      if (!isNull(ret)) return ret;

      if (info.isWhite) {
        if (info.isClosing) {
          return "</" + tag + ">";
        }

        var attrs = getAttrs(html);
        var whiteAttrList = whiteList[tag];
        var attrsHtml = parseAttr(attrs.html, function(name, value) {
          // call `onTagAttr()`
          var isWhiteAttr = _.indexOf(whiteAttrList, name) !== -1;
          var ret = onTagAttr(tag, name, value, isWhiteAttr);
          if (!isNull(ret)) return ret;

          if (isWhiteAttr) {
            // call `safeAttrValue()`
            value = safeAttrValue(tag, name, value, cssFilter);
            if (value) {
              return name + '="' + value + '"';
            } else {
              return name;
            }
          } else {
            // call `onIgnoreTagAttr()`
            var ret = onIgnoreTagAttr(tag, name, value, isWhiteAttr);
            if (!isNull(ret)) return ret;
            return;
          }
        });

        // build new tag html
        var html = "<" + tag;
        if (attrsHtml) html += " " + attrsHtml;
        if (attrs.closing) html += " /";
        html += ">";
        return html;
      } else {
        // call `onIgnoreTag()`
        var ret = onIgnoreTag(tag, html, info);
        if (!isNull(ret)) return ret;
        return escapeHtml(html);
      }
    },
    escapeHtml
  );

  // if enable stripIgnoreTagBody
  if (stripIgnoreTagBody) {
    retHtml = stripIgnoreTagBody.remove(retHtml);
  }

  return retHtml;
};

module.exports = FilterXSS;


/***/ }),
/* 231 */
/***/ (function(module, exports) {

module.exports = {"start_editor":"Bearbeitung beginnen...","navigation_title":"Navigation","tl_bold":"Fett","tl_italic":"Kursiv","tl_header":"Überschrift","tl_header_one":"Überschrift 1","tl_header_two":"Überschrift 2","tl_header_three":"Überschrift 3","tl_header_four":"Überschrift 4","tl_header_five":"Überschrift 5","tl_header_six":"Überschrift 6","tl_underline":"Unterstrichen","tl_strikethrough":"Durchgestrichen","tl_mark":"Markiert","tl_superscript":"Hochgestellt","tl_subscript":"Tiefgestellt","tl_quote":"Zitat","tl_ol":"Ol","tl_ul":"Ul","tl_link":"Link","tl_image":"Link mit Bild","tl_code":"Code","tl_table":"Tabelle","tl_undo":"Rückgängig","tl_redo":"Wiederherstellen","tl_trash":"Mülleimer","tl_save":"Speichern","tl_navigation_on":"Navigation AN","tl_navigation_off":"Navigation AUS","tl_preview":"Vorschau","tl_aligncenter":"Text zentrieren","tl_alignleft":"Nach links ausrichten","tl_alignright":"Nach rechts ausrichten","tl_edit":"Bearbeiten","tl_single_column":"Einspaltig","tl_double_column":"Zweispaltig","tl_fullscreen_on":"Vollbild AN","tl_fullscreen_off":"Vollbild AUS","tl_read":"Lesemodus","tl_html_on":"HTML AN","tl_html_off":"HTML AUS","tl_help":"Markdown Handbuch","tl_upload":"Bilder-Upload","tl_upload_remove":"Entfernen","tl_popup_link_title":"Link hinzufügen","tl_popup_link_text":"Text des Links","tl_popup_link_addr":"Linkziel","tl_popup_img_link_title":"Bild hinzufügen","tl_popup_img_link_text":"Text des Bildes","tl_popup_img_link_addr":"Link auf Bild","tl_popup_link_sure":"Ja","tl_popup_link_cancel":"Abbruch"}

/***/ }),
/* 232 */
/***/ (function(module, exports) {

module.exports = {"start_editor":"Begin editing...","navigation_title":"Navigation","tl_bold":"Bold","tl_italic":"Italic","tl_header":"Header","tl_header_one":"Header 1","tl_header_two":"Header 2","tl_header_three":"Header 3","tl_header_four":"Header 4","tl_header_five":"Header 5","tl_header_six":"Header 6","tl_underline":"Underline","tl_strikethrough":"Strikethrough","tl_mark":"Mark","tl_superscript":"Superscript","tl_subscript":"Subscript","tl_quote":"Quote","tl_ol":"Ol","tl_ul":"Ul","tl_link":"Link","tl_image":"Image Link","tl_code":"Code","tl_table":"Table","tl_undo":"Undo","tl_redo":"Redo","tl_trash":"Trash","tl_save":"Save","tl_navigation_on":"Navigation ON","tl_navigation_off":"Navigation OFF","tl_preview":"Preview","tl_aligncenter":"Center text","tl_alignleft":"Clamp text to the left","tl_alignright":"Clamp text to the right","tl_edit":"Edit","tl_single_column":"Single Column","tl_double_column":"Double Columns","tl_fullscreen_on":"FullScreen ON","tl_fullscreen_off":"FullScreen OFF","tl_read":"Read Model","tl_html_on":"HTML ON","tl_html_off":"HTML OFF","tl_help":"Markdown Guide","tl_upload":"Upload Images","tl_upload_remove":"Remove","tl_popup_link_title":"Add Link","tl_popup_link_text":"Link text","tl_popup_link_addr":"Link address","tl_popup_img_link_title":"Add Image","tl_popup_img_link_text":"Image Text","tl_popup_img_link_addr":"Image Link","tl_popup_link_sure":"Sure","tl_popup_link_cancel":"Cancel"}

/***/ }),
/* 233 */
/***/ (function(module, exports) {

module.exports = {"start_editor":"Début d'édition...","navigation_title":"Navigation","tl_bold":"Gras","tl_italic":"Italique","tl_header":"Entête","tl_header_one":"Entête 1","tl_header_two":"Entête 2","tl_header_three":"Entête 3","tl_header_four":"Entête 4","tl_header_five":"Entête 5","tl_header_six":"Entête 6","tl_underline":"Souligné","tl_strikethrough":"Barré","tl_mark":"Mark","tl_superscript":"Exposant","tl_subscript":"Sous-exposant","tl_quote":"Quote","tl_ol":"Liste ","tl_ul":"Puce","tl_link":"Lien","tl_image":"Image Lien","tl_code":"Code","tl_table":"Table","tl_undo":"Annuler","tl_redo":"Refaire","tl_trash":"Supprimer","tl_save":"Sauver","tl_navigation_on":"Activer la navigation","tl_navigation_off":"Désactiver le navigation","tl_preview":"Previsualisé","tl_aligncenter":"Center le texte","tl_alignleft":"Férer le texte à gauche","tl_alignright":"Férer le texte à droite","tl_edit":"Editer","tl_single_column":"Seule Colonne","tl_double_column":"Colonnes Doubles","tl_fullscreen_on":"Activer le mode plein écran","tl_fullscreen_off":"Désactiver le mode plein écran","tl_read":"Lire le modèle","tl_html_on":"Activer le mode HTML","tl_html_off":"Désactiver le mode HTML","tl_help":"Guide Markdown","tl_upload":"Télécharger les images","tl_upload_remove":"Supprimer","tl_popup_link_title":"Ajouter un lien","tl_popup_link_text":"Description","tl_popup_link_addr":"Link","tl_popup_img_link_title":"Ajouter une image","tl_popup_img_link_text":"Description","tl_popup_img_link_addr":"Link","tl_popup_link_sure":"sûr","tl_popup_link_cancel":"Annuler"}

/***/ }),
/* 234 */
/***/ (function(module, exports) {

module.exports = {"start_editor":"編集を始めてね！","navigation_title":"ナビゲーション","tl_bold":"太字","tl_italic":"斜体","tl_header":"見出し","tl_header_one":"見出し1","tl_header_two":"見出し2","tl_header_three":"見出し3","tl_header_four":"見出し4","tl_header_five":"見出し5","tl_header_six":"見出し6","tl_underline":"下線","tl_strikethrough":"取り消し線","tl_mark":"蛍光ペン","tl_superscript":"上付き文字","tl_subscript":"下付き文字","tl_quote":"引用","tl_ol":"番号付きリスト","tl_ul":"箇条書きリスト","tl_link":"ハイパーリンク","tl_image":"画像のリンク","tl_code":"コードの挿入","tl_table":"表の挿入","tl_undo":"戻る","tl_redo":"進む","tl_trash":"削除","tl_save":"保存","tl_navigation_on":"ナビゲーションを表示","tl_navigation_off":"ナビゲーションを非表示","tl_preview":"プレビュー","tl_aligncenter":"中央揃え","tl_alignleft":"左揃え","tl_alignright":"右揃え","tl_edit":"編集","tl_single_column":"一列","tl_double_column":"二列","tl_fullscreen_on":"全画面表示","tl_fullscreen_off":"全画面表示の終了","tl_read":"モデルの読み込み","tl_html_on":"HTMLで表示","tl_html_off":"HTML表示の終了","tl_help":"ヘルプ","tl_upload":"画像をアップロード","tl_upload_remove":"画像の削除","tl_popup_link_title":"リンクの追加","tl_popup_link_text":"リンクテキスト","tl_popup_link_addr":"リンク先のURL","tl_popup_img_link_title":"画像の追加","tl_popup_img_link_text":"画像タイトル","tl_popup_img_link_addr":"画像URL","tl_popup_link_sure":"OK","tl_popup_link_cancel":"戻る"}

/***/ }),
/* 235 */
/***/ (function(module, exports) {

module.exports = {"start_editor":"Começar edição...","navigation_title":"Navegação","tl_bold":"Negrito","tl_italic":"Itálico","tl_header":"Cabeçalho","tl_header_one":"Cabeçalho 1","tl_header_two":"Cabeçalho 2","tl_header_three":"Cabeçalho 3","tl_header_four":"Cabeçalho 4","tl_header_five":"Cabeçalho 5","tl_header_six":"Cabeçalho 6","tl_underline":"Sublinhar","tl_strikethrough":"Tachar","tl_mark":"Marcação","tl_superscript":"Sobrescrito","tl_subscript":"Subscrito","tl_quote":"Citação","tl_ol":"Lista Numerada","tl_ul":"Lista com marcadores","tl_link":"Link","tl_image":"Link de imagem","tl_code":"Código","tl_table":"Tabela","tl_undo":"Desfazer","tl_redo":"Refazer","tl_trash":"Lixo","tl_save":"Salvar","tl_navigation_on":"Mostrar Navegação","tl_navigation_off":"Esconder Navegação","tl_preview":"Preview","tl_aligncenter":"Alinhar no centro","tl_alignleft":"Alinhar à esquerda","tl_alignright":"Alinhar à direita","tl_edit":"Editar","tl_single_column":"Coluna Única","tl_double_column":"Duas Colunas","tl_fullscreen_on":"Ligar Tela Cheia","tl_fullscreen_off":"Desligar Tela Cheia","tl_read":"Modo de Leitura","tl_html_on":"Ligar HTML","tl_html_off":"Desligar HTML","tl_help":"Guia Markdown","tl_upload":"Upload de Imagens","tl_upload_remove":"Remover","tl_popup_link_title":"Adicionar Link","tl_popup_link_text":"Descrição","tl_popup_link_addr":"Link","tl_popup_img_link_title":"Adicionar fotos","tl_popup_img_link_text":"Descrição","tl_popup_img_link_addr":"Link","tl_popup_link_sure":"Confirmar","tl_popup_link_cancel":"Cancelar"}

/***/ }),
/* 236 */
/***/ (function(module, exports) {

module.exports = {"start_editor":"Начните редактирование...","navigation_title":"Навигация","tl_bold":"Полужирный","tl_italic":"Курсив","tl_header":"Заголовки","tl_header_one":"Заголовок 1","tl_header_two":"Заголовок 2","tl_header_three":"Заголовок 3","tl_header_four":"Заголовок 4","tl_header_five":"Заголовок 5","tl_header_six":"Заголовок 6","tl_underline":"Подчеркнутый","tl_strikethrough":"Зачеркнутый","tl_mark":"Отметка","tl_superscript":"Верхний индекс","tl_subscript":"Нижний индекс","tl_quote":"Цитата","tl_ol":"Нумерованный список","tl_ul":"Список","tl_link":"Ссылка","tl_image":"Ссылка изображения","tl_code":"Код","tl_table":"Таблица","tl_undo":"Отменить","tl_redo":"Вернуть","tl_trash":"Удалить","tl_save":"Сохранить","tl_navigation_on":"Показать навигацию","tl_navigation_off":"Скрыть навигацию","tl_preview":"Предпросмотр","tl_aligncenter":"Выровнять по центру","tl_alignleft":"Выровнять по левому краю","tl_alignright":"Выровнять по правому краю","tl_edit":"Редактор","tl_single_column":"Одно поле","tl_double_column":"Два поля","tl_fullscreen_on":"Полноэкранный режим","tl_fullscreen_off":"Выключить полноэкранный режим","tl_read":"Режим чтения","tl_html_on":"Показать HTML","tl_html_off":"Убрать HTML","tl_help":"Markdown помощь","tl_upload":"Загрузить изображение","tl_upload_remove":"Удалить","tl_popup_link_title":"Добавить ссылку","tl_popup_link_text":"Текст ссылки","tl_popup_link_addr":"Адрес ссылки","tl_popup_img_link_title":"Локальное изображение","tl_popup_img_link_text":"Текст изображения","tl_popup_img_link_addr":"Ссылка изображения","tl_popup_link_sure":"Добавить","tl_popup_link_cancel":"Отменить"}

/***/ }),
/* 237 */
/***/ (function(module, exports) {

module.exports = {"start_editor":"开始编辑...","navigation_title":"导航目录","tl_bold":"粗体","tl_italic":"斜体","tl_header":"标题","tl_header_one":"一级标题","tl_header_two":"二级标题","tl_header_three":"三级标题","tl_header_four":"四级标题","tl_header_five":"五级标题","tl_header_six":"六级标题","tl_underline":"下划线","tl_strikethrough":"中划线","tl_mark":"标记","tl_superscript":"上角标","tl_subscript":"下角标","tl_quote":"段落引用","tl_ol":"有序列表","tl_ul":"无序列表","tl_link":"链接","tl_image":"添加图片链接","tl_code":"代码块","tl_table":"表格","tl_undo":"上一步","tl_redo":"下一步","tl_trash":"清空","tl_save":"保存","tl_navigation_on":"开启标题导航","tl_navigation_off":"关闭标题导航","tl_preview":"预览","tl_aligncenter":"居中","tl_alignleft":"居左","tl_alignright":"居右","tl_edit":"编辑","tl_single_column":"单栏","tl_double_column":"双栏","tl_fullscreen_on":"全屏编辑","tl_fullscreen_off":"退出全屏","tl_read":"沉浸式阅读","tl_html_on":"查看html文本","tl_html_off":"返回markdown文本","tl_help":"markdown语法帮助","tl_upload":"上传图片","tl_upload_remove":"删除","tl_popup_link_title":"添加链接","tl_popup_link_text":"链接描述","tl_popup_link_addr":"链接地址","tl_popup_img_link_title":"添加图片","tl_popup_img_link_text":"图片描述","tl_popup_img_link_addr":"图片链接","tl_popup_link_sure":"确定","tl_popup_link_cancel":"取消"}

/***/ }),
/* 238 */
/***/ (function(module, exports) {

module.exports = {"start_editor":"開始編輯...","navigation_title":"導航目錄","tl_bold":"粗體","tl_italic":"斜體","tl_header":"標題","tl_header_one":"一級標題","tl_header_two":"二級標題","tl_header_three":"三級標題","tl_header_four":"四級標題","tl_header_five":"五級標題","tl_header_six":"六級標題","tl_underline":"下劃線","tl_strikethrough":"中劃線","tl_mark":"標記","tl_superscript":"上角標","tl_subscript":"下角標","tl_quote":"段落引用","tl_ol":"有序列表","tl_ul":"無序列表","tl_link":"鏈接","tl_image":"添加圖片鏈接","tl_code":"代碼塊","tl_table":"表格","tl_undo":"上一步","tl_redo":"下一步","tl_trash":"清空","tl_save":"保存","tl_navigation_on":"開啟標題導航","tl_navigation_off":"關閉標題導航","tl_preview":"預覽","tl_aligncenter":"居中","tl_alignleft":"居左","tl_alignright":"居右","tl_edit":"編輯","tl_single_column":"單欄","tl_double_column":"雙欄","tl_fullscreen_on":"全屏編輯","tl_fullscreen_off":"退出全屏","tl_read":"沈浸式閱讀","tl_html_on":"查看html文本","tl_html_off":"返回markdown文本","tl_help":"markdown語法幫助","tl_upload":"上傳圖片","tl_upload_remove":"刪除","tl_popup_link_title":"添加鏈接","tl_popup_link_text":"鏈接描述","tl_popup_link_addr":"鏈接地址","tl_popup_img_link_title":"添加圖片","tl_popup_img_link_text":"圖片描述","tl_popup_img_link_addr":"圖片鏈接","tl_popup_link_sure":"確定","tl_popup_link_cancel":"取消"}

/***/ })
],[77]);
//# sourceMappingURL=index.53115d6c.js.map