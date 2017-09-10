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

var fs = require('./fs');
var path = require('./path');
var util = require('./util');

function cut(filename, count) {
	count = Math.max(2, Math.min(count, 100));
	var stat = fs.statSync(filename);
	var size = stat.size / count;
  var rfd = fs.openSync(filename, 'r');
  var wfd = fs.openSync(filename + '.0', 'w');
  var index = 0;

  var buff = new Buffer(1024 * 100); // 100kb
  var len = 0;
  var total = 0;
  
  do {
    if ( total >= size ) { // reset
			index++;
			total = 0;
			fs.closeSync(wfd);
			wfd = fs.openSync(filename + '.' + index, 'w');
    }
    len = fs.readSync(rfd, buff, 0, buff.length, null);
    fs.writeSync(wfd, buff, 0, len, null);
    total += len;
  } while (len == buff.length);
  
  fs.closeSync(rfd);
  fs.closeSync(wfd);
}

function merge(filename, options) {
	options = util.extend({
		target: filename,
		remove_source: false,
	}, options);
	var wfd = fs.openSync(options.target, 'w');
	var buff = new Buffer(1024 * 100); // 100kb
	var len = 0;
	var i = 0;

	for ( ; fs.existsSync(filename + '.' + i); i++ ) {
		var rfd = fs.openSync(filename + '.' + i, 'r');
		do {
	    len = fs.readSync(rfd, buff, 0, buff.length, null);
	    fs.writeSync(wfd, buff, 0, len, null);
	  } while (len == buff.length);
	  fs.closeSync(rfd);

		if ( options.remove_source ) { // delete
			fs.rm_r(filename + '.' + i);
		}
	}
	fs.closeSync(wfd);

	return i;
}

exports.cut = cut;
exports.merge = merge;
