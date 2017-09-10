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

var path = require('./path');
var fs = require('./fs');

if ( fs.existsSync(__dirname + '/product/avocado.gypi') ) {
	module.exports = {
		avocado_gyp: '',
		includes_gypi: [ __dirname + '/product/avocado.gypi' ],
		default_libs: [ 
			__dirname + '/product/libs/util',
			__dirname + '/product/libs/gui',
		],
		examples: __dirname + '/product/examples',
		bundle_resources: [ __dirname + '/product/cacert.pem' ],
		includes: [ __dirname + '/product/include' ],
		librarys: {
			ios: [ __dirname + '/product/ios' ],
			android: [ __dirname + '/product/android' ],
		},
	};
} else { // debug
	module.exports = {
		avocado_gyp: __dirname + '/../../../avocado.gyp',
		includes_gypi: [
			__dirname + '/../../../out/config.gypi',
			__dirname + '/../../common.gypi',		
		],
		default_libs: [],
		examples: __dirname + '/../../../demo/examples',
		bundle_resources: [ __dirname + '/../../../Avocado/util/cacert.pem' ],
		includes: [],
		librarys: {},
	};
}
