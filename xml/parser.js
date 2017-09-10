/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2015, xuewen.chu
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of xuewen.chu nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL xuewen.chu BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * ***** END LICENSE BLOCK ***** */

var util = require('../util');
var document = require('./document');
var DocumentType = require('./node').DocumentType;

var Attributes = util.class('Attributes', {
	length: 0,
	getLocalName: function (i) { return this[i].localName },
	getOffset: function (i) { return this[i].offset },
	getQName: function (i) { return this[i].qName },
	getURI: function (i) { return this[i].uri },
	getValue: function (i) { return this[i].value }
});

var ENTITY_MAP = { 'lt': '<', 'gt': '>', 'amp': '&', 'quot': '"', 'apos': "'", 'nbsp': '\u00a0' };

function entityReplacer(self, a) {
	var k = a.slice(1, -1);

	if (k.charAt(0) == '#')
		return String.fromCharCode(parseInt(k.substr(1).replace('x', '0x')));
	else if (k in ENTITY_MAP)
		return ENTITY_MAP[k];
	else {
		self.errorHandler && self.errorHandler.error('entity not found:' + a);
		return a;
	}
}

function parse(self, source) {
	while (true) {
		var i = source.indexOf('<');
		var next = source.charAt(i + 1);
		if (i < 0) {
			appendText(self, source, source.length);
			return;
		}
		if (i > 0) {
			appendText(self, source, i);
			source = source.substring(i);
		}

		switch (next) {
			case '/':
				var end = source.indexOf('>', 3);
				var qName = source.substring(2, end);
				var config = self._stack.pop();
				source = source.substring(end + 1);
				self.contentHandler.endElement(config.uri, config.localName, qName);
				for (qName in config.nsMap) {
					self.contentHandler.endPrefixMapping(qName); //reuse qName as prefix
				}
				// end elment
				break;
			case '?': // <?...?>
				source = parseInstruction(self, source);
				break;
			case '!': // <!doctype,<![CDATA,<!--
				source = parseDCC(self, source);
				break;
			default:
				source = parseElementStart(self, source);
				break;
		}
	}
}

function parseElementStart(self, source) {
	var tokens = split(source);
	var qName = tokens[0][0];
	var localName = qName.substr(qName.indexOf(':') + 1);
	var end = tokens.pop();
	var nsMap;
	var uri = null;
	var attrs = new Attributes();
	var unsetURIs = [];
	var len = tokens.length;
	var i = 1;

	function replace(all) {
		return entityReplacer(self, all);
	}

	while (i < len) {
		var m = tokens[i++];
		var key = m[0]; //remove = on next expression
		var value = key.charAt(key.length - 1) == '=' ? key.slice(0, -1) : key;
		var nsp = value.indexOf(':');
		var prefix = nsp > 0 ? key.substr(0, nsp) : null;
		var attr = attrs[attrs.length++] = { prefix: prefix, qName: value, localName: nsp > 0 ? value.substr(nsp + 1) : value }

		if (value == key) {//default value
			//TODO:check
		} else {
			//add key value
			m = tokens[i++];
			key = value;
			value = m[0];
			nsp = value.charAt(0);
			if ((nsp == '"' || nsp == "'") && nsp == value.charAt(value.length - 1)) {
				value = value.slice(1, -1);
			}

			value = value.replace(/&#?\w+;/g, replace);
			//TODO:encode value
		}
		if (prefix == 'xmlns' || key == 'xmlns') {
			attr.uri = 'http://www.w3.org/2000/xmlns/';
			(nsMap || (nsMap = {}))[prefix == 'xmlns' ? attr.localName : ''] = value;
		}
		else if (prefix) {
			if (prefix == 'xml')
				attr.uri = 'http://www.w3.org/XML/1998/namespace';
			else
				unsetURIs.push(attr);
		}

		attr.value = value;
		attr.offset = m.index;
	}

	var stack = self._stack;
	var top = stack[stack.length - 1];
	var config = { qName: qName };
	var nsStack = top.nsStack;

	//print(stack+'#'+nsStack)
	nsStack = config.nsStack = 
	  (nsMap ? util.ext(util.ext({}, nsStack), nsMap) : nsStack);
	config.uri = nsStack[qName.slice(0, -localName.length)];

	while (attr = unsetURIs.pop())
		attr.uri = nsStack[attr.prefix];

	if (nsMap) {
		for (prefix in nsMap)
			self.contentHandler.startPrefixMapping(prefix, nsMap[prefix]);
	}

	self.contentHandler.startElement(uri, localName, qName, attrs);
	if (end[0].charAt() == '/') {
		self.contentHandler.endElement(uri, localName, qName);
		if (nsMap) {
			for (prefix in nsMap)
				self.contentHandler.endPrefixMapping(prefix);
		}
	}
	else
		stack.push(config);

	return source.substr(end.index + end[0].length);
}

function split(source) {
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+(?:\s*=\s*)?|(\/?\s*>|<)/g;
	reg.lastIndex = 0;
	reg.exec(source); //skip <
	while (match = reg.exec(source)) {
		buf.push(match);
		if (match[1]) return buf;
	}
}

function appendText(self, source, len) {
	source = source.substr(0, len);

	var contentHandler = self.contentHandler;
	var reg = /&(#?)(\w+);/g;
	var prevIndex = 0;
	var mat;

	while (mat = reg.exec(source)) {
		var index = mat.index;
		var text = mat[0];

		if (prevIndex != index)
			contentHandler.characters(source, prevIndex, index - prevIndex);
		if (mat[1]) {
			var value = entityReplacer(self, text);
			contentHandler.characters(value, 0, value.length);
		}
		else
			contentHandler.startEntityReference(mat[2]);
		prevIndex = index + text.length;
	}
	if (prevIndex != len)
		contentHandler.characters(source, prevIndex, len - prevIndex);
}

function parseInstruction(self, source) {
	var match = source.match(/^<\?(\S*)\s*(.*)\?>/);
	if (match) {
		var len = match[0].length;
		self.contentHandler.processingInstruction(match[1], match[2]);
	}
	else //error
		appendText(self, source, len = 2);
	return source.substring(len);
}

function parseDCC(self, source) {//sure start with '<!'
	var next = source.charAt(2)
	if (next == '-') {
		if (source.charAt(3) == '-') {
			var end = source.indexOf('-->');
			//append comment source.substring(4,end)//<!--
			var lex = self.lexicalHandler
			lex && lex.comment(source, 4, end - 4);
			return source.substring(end + 3)
		} else {
			//error
			appendText(self, source, 3)
			return source.substr(3);
		}
	} else {
		if (/^<!\[CDATA\[/.test(source)) {
			var end = source.indexOf(']]>');
			var lex = self.lexicalHandler;
			lex && lex.startCDATA();
			appendText(self, source.substring(9, end), 0, end - 9);
			lex && lex.endCDATA()
			return source.substring(end + 3);
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId)
		var matchs = split(source);
		var len = matchs.length;
		if (len > 1 && /!doctype/i.test(matchs[0][0])) {

			var name = matchs[1][0];
			var pubid = len > 3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len > 4 && matchs[4][0];
			var lex = self.lexicalHandler;
			var reg = /^"?([^"]*)"?$/;

			lex && lex.startDTD(name, pubid && pubid.match(reg)[1], sysid && sysid.match(reg)[1]);
			lex && lex.endDTD();
			matchs = matchs[len - 1]
			return source.substr(matchs.index + matchs[0].length);
		} else {
			appendText(self, source, 2)
			return source.substr(2);
		}
	}
}

var XMLReader = util.class('XMLReader', {
	//private:
	_stack: null,
	//public:
	/**
	* constructor function
	* @constructor
	*/
	constructor: function () {
		this._stack = [{ nsMap: {}, nsStack: {}}];
	},
	parse: function (source) {
		this.contentHandler.startDocument();
		parse(this, source);
		this.contentHandler.endDocument();
	},
	fragment: function (source) {
		parse(this, source);
	}
});

function toString(chars, start, length) {
	return typeof chars == 'string' ?
		chars.substr(start, length) :
		Array.toArray(chars).slice(start, start + length).join('');
}

function noop() {
	return null;
}

/* Private static helpers treated below as private instance methods, 
so don't need to add these to the public API; we might use a Relator 
to also get rid of non-standard public properties */
function appendElement(self, node) {
	if (!self.currentElement)
		self.document.appendChild(node);
	else
		self.currentElement.appendChild(node);
}

var DOMHandler = util.class('DOMHandler', {

	/**
		* constructor function
		* @param {Document} doc (Optional)
		* @param {Element} el   (Optional)
		* @constructor
		*/
	constructor: function (doc, el) {
		this.saxExceptions = [];
		this.cdata = false;
		this.document = doc;
		this.currentElement = el;
	},
	
	startDocument: function () {
		this.document = new document.Document();
		if (this.locator)
			this.document.documentURI = this.locator.getSystemId();
	},
	
	startElement: function (namespaceURI, localName, qName, attrs) {
		var doc = this.document;
		var el = doc.createElementNS(namespaceURI, qName || localName);
		var len = attrs.length;
		appendElement(this, el);
		this.currentElement = el;
		for (var i = 0; i < len; i++) {
			var namespaceURI = attrs.getURI(i);
			var value = attrs.getValue(i);
			var qName = attrs.getQName(i);
			this.currentElement.setAttributeNS(namespaceURI, qName, value);
		}
	},
	
	endElement: function (namespaceURI, localName, qName) {
		var parent = this.currentElement.parentNode;
		//if(parent.tagName != qName){
		//    var err = 'Xml format error "</' + qName + '>" no start tag';
		//    throw err;
		//}
		this.currentElement = parent;
	},

	startPrefixMapping: function (prefix, uri) { },
	endPrefixMapping: function (prefix) { },
	processingInstruction: function (target, data) {
		var ins = this.document.createProcessingInstruction(target, data);
		appendElement(this, ins);
	},

	ignorableWhitespace: function (ch, start, length) { },
	characters: function (chars, start, length) {
		chars = toString.apply(this, arguments);
		if (this.currentElement && chars) {
			if (this.cdata) {
				var cdataNode = this.document.createCDATASection(chars);
				this.currentElement.appendChild(cdataNode);
			} else {
				var textNode = this.document.createTextNode(chars);
				this.currentElement.appendChild(textNode);
			}
		}
	},
	skippedEntity: function (name) { },
	endDocument: function () {
		this.document.normalize();
	},
	setDocumentLocator: function (locator) {
		this.locator = locator;
	},
	//LexicalHandler
	comment: function (chars, start, length) {
		chars = toString.apply(this, arguments)
		var comment = this.document.createComment(chars);
		appendElement(this, comment);
	},
	startCDATA: function () {
		//used in characters() methods
		this.cdata = true;
	},
	endCDATA: function () {
		this.cdata = false;
	},
	startDTD: function (name, publicId, systemId) {
		var doc = this.document;
		var doctype = new DocumentType(name, publicId, systemId);
		doc.doctype = doctype;
		doc.appendChild(doctype);
	},
	startEntityReference: function (name) {
		var doc = this.document;
		var el = this.currentElement;
		var node = doc.createEntityReference(name);
		node.text = node.nodeValue = ENTITY_MAP[name]
		el.appendChild(node);
	},
	warning: function (error) {
		this.saxExceptions.push(error);
	},
	error: function (error) {
		this.saxExceptions.push(error);
	},
	fatalError: function (error) {
		console.error(error);
		throw error;
	},
	endEntityReference: noop,
	endDTD: noop,
	startEntity: noop,
	endEntity: noop,
	attributeDecl: noop,
	elementDecl: noop,
	externalEntityDecl: noop,
	internalEntityDecl: noop,
	resolveEntity: noop,
	getExternalSubset: noop,
	notationDecl: noop,
	unparsedEntityDecl: noop
});

var Parser = util.class('Parser', {

	/**
		* constructor function
		* @param  {String}          source
		* @return {Document}
		* @constructor
		*/
	parser: function (source) {
		var sax = new XMLReader();
		var handler = new DOMHandler();

		sax.contentHandler = handler;
		sax.lexicalHandler = handler;
		sax.errorHandler = handler;
		sax.parse(source);

		return handler.document;
	},

	/**
		* constructor function
		* @param  {Document} doc
		* @param  {Element}  el
		* @param  {String}          source
		* @return {Document}
		* @constructor
		*/
	fragment: function (doc, el, source) {
		var sax = new XMLReader();
		var handler = new DOMHandler(doc, el);

		sax.contentHandler = handler;
		sax.lexicalHandler = handler;
		sax.errorHandler = handler;
		sax.fragment(source);

		return handler.document;
	}

});

