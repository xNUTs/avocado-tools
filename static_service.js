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
var fs = require('./fs');
var event = require('./event');
var service = require('./service');
var Service = require('./service').Service;
var http = require('http');
var zlib = require('zlib');
var crypto = require('crypto');

var g_static_cache = { };

//set util
function setHeader(self, expires) {
	var res = self.response;
	res.setHeader('Server', 'Avocado Tools');
	res.setHeader('Date', new Date().toUTCString());
	expires = expires === undefined ? self.server.expires : expires;
	if (expires) {
		res.setHeader('Expires', new Date().addms(6e4 * expires).toUTCString());
		res.setHeader('Cache-Control', 'public, max-age=' + (expires * 60));
	}
}

function getContentType (self, baseType){
  if(/javascript|text|json|xml/i.test(baseType)){
    return baseType + '; charset=' + self.server.text_encoding;
  }
  return baseType;
}

// 文件是否可支持gzip压缩
function isGzip(self, filename) {
  if(!self.server.gzip){
    return false;
  }
	var ae = self.request.headers['accept-encoding'];
	var type = self.server.get_mime(filename);

	return !!(ae && ae.match(/gzip/i) && type.match(self.server.gzip));
}

//返回目录
function _returnDirectory(self, filename) {
	if(self.server.auto_index) {
		self.ret_dir(filename);
	} else {
		self.ret_status(403);
	}
}

//返回目录
function returnDirectory(self, filename) {

	//读取目录
	if (!filename.match(/\/$/))  // 目录不正确,重定向
		return self.redirect(self.pathname + '/');

	var def = self.server.defaults;
	if (!def.length) { //默认页
		return _returnDirectory(self, filename);
	}

	fs.readdir(filename, function (err, files) {
        
		if (err) {
      console.log(err);
			return self.ret_status(404);
		}

		for (var i = 0, name; (name = def[i]); i++) {
			if (files.indexOf(name) != -1)
				return self.ret_file(filename.replace(/\/?$/, '/') + name);
		}
		_returnDirectory(self, filename);
	});
}

//返回缓存
function return_cache(self, filename) {

	var cache = g_static_cache[filename];

	if ( cache && cache.data ) {
		var req = self.request;
		var res = self.response;
		var type = self.server.get_mime(filename);
		var ims = req.headers['if-modified-since'];
		var mtime = cache.time;

		setHeader(self);

		res.setHeader('Last-Modified', mtime.toUTCString());
		res.setHeader('Content-Type', getContentType(self, type));
		if (cache.gzip) {
			res.setHeader('Content-Encoding', 'gzip');
		}
		res.setHeader('Content-Length', cache.size);

		if (ims && new Date(ims) - mtime === 0) { //使用 304 缓存
			res.writeHead(304);
			res.end();
		}
		else {
			res.writeHead(200);
			res.end(cache.data);
		}
		return true;
	}
	return false;
}

//返回数据
function result_data(self, filename, type, time, gzip, err, data) {
  
	if (err) {
		delete g_static_cache[filename];
		return self.ret_status(404);
	}

	var res = self.response;
	var cache = { 
		data: data, 
		time: time, 
		gzip: gzip, 
		size: data.length 
	};
	if ( self.server.file_cache_time ) { // 创建内存缓存
		g_static_cache[filename] = cache;
		setTimeout(function () { delete cache.data; }, self.server.file_cache_time * 1e3);
	}
	if (gzip) {
		res.setHeader('Content-Encoding', 'gzip');
	}
	res.setHeader('Content-Length', data.length);
	res.setHeader('Content-Type', getContentType(self, type));
	res.writeHead(200);
  res.end(data);
}

// 返回大文件数据
function resultMaxFileData (self, filename, type, size) {
  
	var res = self.response;
	res.setHeader('Content-Length', size);
	res.setHeader('Content-Type', getContentType(self, type));
	res.writeHead(200);

	var end = false;
	var read = fs.createReadStream(filename);

	read.on('data', function (buff) {
		res.write(buff);
	});
	read.on('end', function () {
		end = true;
		res.end();
	});
	read.on('error', function (e) {
		read.destroy();
		console.error(e);
		end = true;
		res.end();
	});
	res.on('error', function () {
    if(!end){ // 意外断开
    	end = true;
    	read.destroy();
    }
	});
  res.on('close', function () { // 监控连接是否关闭
    if(!end){ // 意外断开
    	end = true;
    	read.destroy();
    }
  });
}

//返回异常状态
function resultError (self, statusCode, text) {
	var res = self.response;
	var type = self.server.get_mime('html');
  
	setHeader(self);
  res.setHeader('Content-Type', getContentType(self, type));
	res.writeHead(statusCode);
	res.end('<!DOCTYPE html><html><body><h3>' +
		statusCode + ': ' + (http.STATUS_CODES[statusCode] || '') +
		'</h3><br/></h5>' + (text || '') + '</h5></body></html>');
}

function response_notice (self, status) {
  var data = { res: self.response, status: status };
  self.onresponse.trigger(data);
  return data.status;
}

/**
 * @class StaticService
 */
var StaticService = util.class('StaticService', Service, {
  // @private:
  m_root: '',

	// @public:
	/**
	 * response of server
	 * @type {http.ServerRequest}
	 */
	response: null,
	
	/**
	  * @event onresponse
	  */
	onresponse: null,
	
	/**
	 * @constructor
	 * @arg req {http.ServerRequest}
	 * @arg res {http.ServerResponse}
	 */
	constructor: function (req, res) {
    Service.call(this, req);
    this.onresponse = new event.EventNoticer('response', this);
		this.response = res;
		this.m_root = this.server.root; //.substr(0, this.server.root.length - 1);
		var write_head = res.writeHead;
		var self = this;
		res.writeHead = function (status) {
		  status = response_notice(self, status);
		  write_head.apply(res, arguments);
		};
	},
	
  /** 
   * @overwrite
   */
	action: function () {
		var method = this.request.method;
		if (method == 'GET' || method == 'HEAD') {
      
      var filename = this.pathname;
      var virtual = this.server.virtual;
      
      if (virtual) { //是否有虚拟目录
        var index = filename.indexOf(virtual + '/');
        if (index === 0) {
          filename = filename.substr(virtual.length);
        } else {
          return this.ret_status(404);
        }
      }
      if (this.server.disable.test(filename)) {  //禁止访问的路径
        return this.ret_status(403);
      }
  		this.ret_file(this.m_root + filename);
		} else {
			this.ret_status(405);
		}
	},

	/**
	 * redirect
	 * @param {String} path
	 */
	redirect: function (path) {
		var res = this.response;
		res.setHeader('Location', path);
		res.writeHead(302);
		res.end();
	},
  
	/**
	 * return the state to the browser
	 * @param {Number} statusCode
	 * @param {String} text (Optional)  not default status ,return text
	 */
	ret_status: function (statusCode, text) {
		var self = this;
		var filename = this.server.error_status[statusCode];
		
		if (filename) {
			filename = self.m_root + filename;
			fs.stat(filename, function (err) {
				if (err) {
					resultError(self, statusCode, text);
				} else {
					self.ret_file(filename);
				}
			});
		} else {
			resultError(self, statusCode, text);
		}
	},
	
	/**
	 * 返回站点文件
	 */
	ret_site_file: function (name) {
	  this.ret_file(this.server.root + '/' + name);
	},

	is_accept_gzip: function(filename) {
	  if (!this.server.gzip) {
	    return false;
	  }
		var ae = this.request.headers['accept-encoding'];

		return !!(ae && ae.match(/gzip/i));
	},

	is_gzip(filename) {
		return isGzip(this, filename);
	},
	
	set_default_header: function(expires) {
		setHeader(this, expires);
	},
  
	/**
	 * return file to browser
	 * @param {String}       filename
	 */	
	ret_file: function (filename) {
    
		var self = this;
		var req = this.request;
		var res = this.response;
		
		if (!util.debug && return_cache(this, filename)) {  //high speed Cache
			return;
		}
    
		fs.stat(filename, function (err, stat) {
      
			if (err) {
				return self.ret_status(404);
			}
      
			if (stat.isDirectory()) {  //dir
				return returnDirectory(self, filename);
			}
      
			if (!stat.isFile()) {
				return self.ret_status(404);
			}
      
			//for file
			if (stat.size > self.server.max_file_size) { //File size exceeds the limit
				return self.ret_status(403);
			}
      
			var mtime = stat.mtime;
			var ims = req.headers['if-modified-since'];
			var type = self.server.get_mime(filename);
			var gzip = isGzip(self, filename);
      
			setHeader(self);
			res.setHeader('Last-Modified', mtime.toUTCString());

			if (ims && new Date(ims) - mtime === 0) { //use 304 cache
        res.setHeader('Content-Type', getContentType(self, type));
				res.writeHead(304);
				res.end();
				return;
			}
      
			if (stat.size > 5 * 1024 * 1024) { // 数据大于5MB使用这个函数处理
				return resultMaxFileData(self, filename, type, stat.size);
			}
			else if ( ! gzip ) { //no use gzip format
				return fs.readFile(filename, function(err, data) {
					result_data(self, filename, type, mtime, false, err, data);
				});
			}
      
			fs.readFile(filename, function(err, data) {
				if (err) {
          console.err(err);
					return self.ret_status(404);
				}
				zlib.gzip(data, function (err, data) {        		//gzip
					result_data(self, filename, type, mtime, true, err, data);
				});
			});
		});
	},
	
	/**
	 * return dir
	 * @param {String}       filename
	 */
	ret_dir: function (filename) {
		var self = this;
		var res = this.response;
		var req = this.request;

		//读取目录
		if (!filename.match(/\/$/)){  //目录不正确,重定向
			return self.redirect(self.pathname + '/');
		}

		fs.ls(filename, function (err, files) {
			if (err) {
				return self.ret_status(404);
			}
			var	dir = filename.replace(self.m_root, '');
			var html =
				'<!DOCTYPE html><html><head><title>Index of {0}</title>'.format(dir) +
				'<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
				'<style type="text/css">*{font-family:Courier New}div,span{line-height:20px;height:20px;}\
				span{display:block;float:right;width:220px}</style>' +
				'</head><body bgcolor="white">' +
				'<h1>Index of {0}</h1><hr/><pre><div><a href="{1}">../</a></div>'.format(dir, dir ? '../' : 'javascript:')

			var ls1 = [];
			var ls2 = [];

			for (var i = 0, stat; (stat = files[i]); i++) {
				var name = stat.name;
				if (name.slice(0, 1) == '.'){
					continue;
				}

				var link = name;
				var size = (stat.size / 1024).toFixed(2) + ' KB';
				var isdir = stat.dir;

				if (isdir) {
					link += '/';
					size = '-';
				}

				var s =
					'<div><a href="{0}">{0}</a><span>{2}</span><span>{1}</span></div>'
							.format(link, util.date_to_string(stat.ctime, 'yyyy-MM-dd hh:mm:ss'), size);
				isdir ? ls1.push(s) : ls2.push(s);
			}

			html += ls1.join('') + ls2.join('') + '</pre><hr/></body></html>';
			setHeader(self);

			// var type = self.server.get_mime('html');
			
			res.writeHead(200);
			res.end(html);
		});
	},
  // @end
});

service.set('StaticService', StaticService);

exports.StaticService = StaticService;
