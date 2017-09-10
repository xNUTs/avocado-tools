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
var service = require('../service');
var HttpService = require('../http_service').HttpService;
var StaticService = require('../static_service').StaticService;
var path = require('../path');
var fs = require('../fs');
var keys = require('../keys');
var Buffer = require('buffer').Buffer;
var marked = require('marked');
var remote_log = require('./remote_log');
var marked_template = null;

function format_marked_text(data) {
	if ( !marked_template ) {
		marked_template = fs.readFileSync(__dirname + '/../marked/template.html');
		marked_template = marked_template.toString('utf-8');
	}
	var marked_data = marked(data.toString('utf-8'));
	return marked_template.replace('__placeholder__', marked_data);
}

var File = util.class('File', HttpService, {

  action: function(info) {
  	var log = 'Request: ' + this.url;
    console.log(log);
    remote_log.remote_log_print(log);
    if ( /.+\.(mdown|md)/i.test(this.pathname) ) {
    	return this.marked(this.pathname);
    } else if ( /\/libs.keys$/.test(this.pathname) ) {
    	return this.libs_keys(this.pathname);
    }
    HttpService.members.action.call(this, info);
  },

  marked_assets: function(pathname) {
    this.ret_file(path.format(__dirname, '../marked/assets', pathname));
  },

	marked: function(pathname) {
		var self = this;
		var filename = this.server.root + '/' + pathname;

		fs.stat(filename, function (err, stat) {
      
			if (err) {
				return self.ret_status(404);
			}
      
			if (!stat.isFile()) {
				return self.ret_status(404);
			}
      
			//for file
			if (stat.size > Math.min(self.server.max_file_size, 5 * 1024 * 1024)) { 
				//File size exceeds the limit
				return self.ret_status(403);
			}
      
			var mtime = stat.mtime;
			var ims = self.request.headers['if-modified-since'];
			var res = self.response;

			self.set_default_header();
			res.setHeader('Last-Modified', mtime.toUTCString());
  		res.setHeader('Content-Type', 'text/html; charset=utf-8');

			if (ims && new Date(ims) - mtime === 0) { //use 304 cache
				res.writeHead(304);
				res.end(); 
				return;
			}

			fs.readFile(filename, function(err, data) {
				if (err) {
					return self.ret_status(404);
				}
				var res = self.response;
				var marked_data = format_marked_text(data);
				res.writeHead(200);
			  res.end(marked_data);
			});

		});
	},

	libs_keys: function(pathname) {
		var self = this;
		var libs = path.format(this.server.root, path.dirname(pathname));
		var res = self.response;

		if (fs.existsSync(libs + '/libs.keys')) {
			self.ret_file(libs + '/libs.keys');
		} 
		else {
			if ( fs.existsSync(libs) ) {
				var rv = { };
				var ls = fs.ls_sync(libs);
				fs.ls_sync(libs).forEach(function(stat) {
					if ( stat.isDirectory() ) {
						var lib = libs + '/' + stat.name + '/lib.keys';
						if (fs.existsSync(lib)) {
							var config = keys.parse_file(lib);
							rv[config.name] = config;
						}
					}
				});
				var data = keys.stringify(rv);
				self.set_default_header();
				res.setHeader('Content-Type', 'text/plain; charset=utf-8');
				res.writeHead(200);
				res.end(data);
			} else {
				this.ret_status(404);
			}
		}
	},
	
});

service.set('File', File);
