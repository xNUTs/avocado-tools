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

var util = require('./util');
var xml = require('./xml');
var Mysql = require('./mysql').Mysql;
var db = require('./db');
var memcached = require('./memcached');
var fs = require('./fs');

var cache = { };
var MAPS = { };
var REG = /\{(.+?)\}/g;

/**
 * @createTime 2012-01-18
 * @author xuewen.chu <louis.tru@gmail.com>
 */
var private$transaction = util.class('private$transaction', {

	/**
	 * sql map
	 * @type {SqlMap}
	 */
	map: null,
  
	/**
	 * database
	 * @type {Database}
	 */
	db: null,

	/**
	 * constructor function
	 * @param {SqlMap} sql_map
	 * @constructor
	 */
	constructor: function (sql_map) {
		this.map = sql_map;
		this.db = get_db(sql_map);
		//start transaction
		this.db.transaction();
	},
  
	/**
	 * get data list
	 * @param {String}   name              map name
	 * @param {Object}   param (Optional)  map name
	 * @param {Function} cb    (Optional)
	 */
	gets: function (name, param, cb) {
		query(this.map, 'get', name, param, cb, this.db);
	},
  
	/**
	 * get data
	 * @param {String}   name              map name
	 * @param {Object}   param (Optional)  map name
	 * @param {Function} cb    (Optional)
	 */
	get: function (name, param, cb) {
		query(this.map, 'get', name, param, function (err, data) {
			cb(err, data && data[0]);
		}, this.db);
	},
  
	/**
	 * post data
	 * @param {String}   name              map name
	 * @param {Object}   param (Optional)  map name
	 * @param {Function} cb    (Optional)
	 */
	post: function (name, param, cb) {
		query(this.map, 'post', name, param, cb, this.db);
	},
  
	/**
	 * commit transaction
	 */
	commit: function () {
		this.db.commit();
		this.db.close();
	},
  
	/**
	 * rollback transaction
	 */
	rollback: function () {
		this.db.rollback();
		this.db.close();
	}
  
});

/**
 * @createTime 2012-01-18
 * @author xuewen.chu <louis.tru@gmail.com>
 */
function parseMapEl(self, el) {

	var ls = [];
	var obj = { __t__: el.tagName, __ls__: ls };
	var ns = el.attributes;

	for (var i = 0, l = ns.length; i < l; i++) {
		var n = ns.item(i);
		obj[n.name] = n.value;
	}

	ns = el.childNodes;
	for ( i = 0; i < ns.length; i++ ) {
		var node = ns.item(i);
    
		switch (node.nodeType) {
			case xml.ELEMENT_NODE:
				ls.push(parseMapEl(self, node));
				break;
			case xml.TEXT_NODE:
			case xml.CDATA_SECTION_NODE:
				ls.push(node.nodeValue);
				break;
		}
	}
	return obj;
}

function getOriginalMap(self, name) {
	var map = MAPS[name];
	if (map) 
	  return map;

	var ls = name.split('.');
	var id = ls.pop();
	var prefix = ls.join('.') + '.';
	var filename = util.libs.get_path(ls.join('/') + '.xml');
	var xml = new xml.Document();
	xml.load(util.read_file(filename));
  
	var ns = xml.getElementsByTagName('map');
	var l = ns.length;
  
	if (!l)
		throw new Error(name + ' : not map the root element');
	var root = ns.item(0);

	ns = root.childNodes;

	for (var i = 0; i < ns.length; i++) {
		var node = ns.item(i);
		if (node.nodeType === xml.ELEMENT_NODE)
			MAPS[prefix + node.tagName] = parseMapEl(self, node);
	}
	map = MAPS[name];
	if (!map)
		throw new Error(name + ' : can not find the map');
		
	return map;
}

//compilation sql
function compilation(self, exp, param) {

	var variable = {};

	exp = exp.replace(REG, function (all, name) {
		variable[name] = param[name];
		return name;
	});

	var code = ['(function (){'];

	for (var i in variable) {
		var item = variable[i];
		var value =
			item instanceof Date ? 'new Date({0})'.format(item.valueOf()) :
			JSON.stringify(item);
		code.push('var {0} = {1};'.format(i, value));
	}

	code.push('return !!(' + exp + ')');
	code.push('}())');
	return util.Eval(code.join(''));
}

//format sql
function format(self, sql, param) {
	return sql.replace(REG, function (all, name) {
		return db.escape(param[name]);
	});
}

//join map
function joinMap(self, item, param) {

	var name = item.name;
	var value = param[name];

	if (!value)
		return '';
	var ls = Array.toArray(value);

	for (var i = 0, l = ls.length; i < l; i++)
		ls[i] = db.escape(ls[i]);
	return ls.join(item.value || '');
}

//if map
function ifMap(self, item, param) {

	var exp = item.exp;
	var name = item.name;
	var prepend = item.prepend;

	if (exp) {
		if (!compilation(self, exp, param))
			return null;
	}
	else if (name && !(name in param))
		return null;

	var sql = lsMap(self, item.__ls__, param);
	return { prepend: prepend, sql: sql };
}

//ls map
function lsMap(self, ls, param) {

	var result = [];
	for (var i = 0, l = ls.length; i < l; i++) {
		var item = ls[i];
		var type = item.__t__;

		if (typeof item == 'string') {
			item = format(self, item, param).trim();
			item &&
				result.push(' ' + item);
			continue;
		}

		if (type == 'if') {
			item = ifMap(self, item, param);
			if (item && item.sql) {
				var prepend = result.length ?
					(item.prepend || '') + ' ' : '';

				result.push(' ' + prepend + item.sql);
			}
		}
		else if (type == 'join')
			result.push(joinMap(self, item, param));
	}
	return result.join(' ');
}

//get map object
function getMap(self, name, param) {

	var map = getOriginalMap(self, name);
	var i = ifMap(self, map, param);

	map.sql = i ? '{0} {1}'.format(i.prepend || '', i.sql) : '';
	return map;
}

//get db
function get_db(self) {

	var db = self.db;
	var db_class = null;
	
	switch (self.type) {
	  case 'mysql' : db_class = Mysql; break;
	  case 'mssql' :
	  case 'oracle': 
	    break;
	  default:
	    break;
	}
	
	util.assert(db_class, 'Not supporting database, {0}', self.type);
	
// 	if (util.equals_class(db.Database, self.db_class)) // select server
	return new db_class(db[0]);
	//throw new Error(self.type + ': not the correct type or not in');
}

// del cache
//
// Special attention,
// taking into account the automatic javascript resource management,
// where there is no "This", more conducive to the release of resources
//
function delCache(key) {
	delete cache[key];
}

//query
function query(self, type, name, param, cb, _db) {

	cb = typeof param == 'function' ? param :
			typeof cb == 'function' ? cb : null;
	param = util.default(param, { });
	var db;
	
	try {
		db = _db || get_db(self);
		var map = getMap(self, name, param);
		var cacheTime = parseInt(map.cache) || 0;
		var sql = map.sql;
		
		function handle(err, data) {
			_db || db.close();
			if (err) {
				console.error(err);
				return util.throw_err(err, cb);
			}
			
			if (type == 'get' && cacheTime) {
				if (self.memcached)
					memcached.shared().set(key, data, cacheTime);
				else {
					cache[key] = data;
					delCache.delay(cacheTime * 1e3, key);
				}
			}
			cb && cb(null, data);
		}
		
		if (type == 'post' || !cacheTime) {
			db.query(sql, handle);
			return;
		}
		
		//use cache
    var key = util.hash(sql);
		if (self.memcached){
			return memcached.shared().get(key, function (err, data) {
				if (err)
					console.err(err);
				if (data)
					return cb && cb(err, data);
				db.query(sql, handle);
			});
		}

		var data = cache[key];
		if (data)
			return cb && cb(null, data);
		db.query(sql, handle);
		
	} catch (err) {
		db && db.close();
		util.throw_err(err, cb);
	}
}

var SqlMap = util.class('SqlMap', {

	//public:
	/**
	 * database type
	 * @type {class}
	 */
	type: 'mysql',
  
	/**
	 * is use memcached
	 * @type {Boolean}
	 */
	memcached: false,
  
	/**
	 * db config info
	 * @type {Array}
	 */
	db: null,
  
	/**
	  * constructor function
	  * @param {Object} (Optional) conf    Do not pass use center server config
	  * @constructor
	  */
	constructor: function (conf) {
		if (conf) {
			util.update(this, conf);
			var db = this.db;
			if (!db || !db.length)
				throw new Error('No servers where supplied in the arguments');
		} else {
			// use center server config
			// on event
			throw new Error('use center server config');
		}
	},
  
	/**
		* get data list
		* @param {String}   name              map name
		* @param {Object}   param (Optional)  map name
		* @param {Function} cb    (Optional)
		*/
	gets: function (name, param, cb) {
		query(this, 'get', name, param, cb);
	},
  
	/**
		* get data
		* @param {String}   name              map name
		* @param {Object}   param (Optional)  map name
		* @param {Function} cb    (Optional)
		*/
	get: function (name, param, cb) {
		query(this, 'get', name, param, function (err, data) {
			cb(err, data && data[0]);
		});
	},
  
	/**
		* post data
		* @param {String}   name              map name
		* @param {Object}   param (Optional)  map name
		* @param {Function} cb    (Optional)
		*/
	post: function (name, param, cb) {
		query(this, 'post', name, param, cb);
	},
  
	/**
		* start transaction
		* @return {private$transaction}
		*/
	transaction: function () {
		return new private$transaction(this);
	},
  
});

var shared = null;

exports = {

	SqlMap: SqlMap,

	/**
	 * @func set_shared
	 */
	set_shared: function(sqlmap) {
		shared = sqlmap;
	},
  
	/**
		* get default dao
		* @return {SqlMap}
		* @static
		*/
	shared: function () {
		return shared;
	},
};
