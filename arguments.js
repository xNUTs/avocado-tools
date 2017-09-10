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

var opts = { };
var help_info = [];

function def_opts(name, defaults, info) {
  var relation = [];
  if ( Array.isArray(name) ) {
    relation = name.splice(1);
    name = name[0];
  }
  name = name.replace(/\-/mg, '_');

  relation.forEach(function(i) {
    i = i.replace(/\-/mg, '_');
    if ( i in opts ) {
      opts[name] = opts[i];
    }
  });

  if ( ! (name in opts) ) {
    opts[name] = defaults;
  }
  
  var default_val = opts[name] === 0 ? 'no' : opts[name] === 1 ? 'yes' : opts[name];
  help_info.push(format_string(info, default_val));
}

function read_argv() {
  var argv = process.argv.slice(2);

  for (var i = 0; i < argv.length; i++) {
    var item = argv[i];
    var key = null, value = 1;

    if (item.substr(0, 2) == '--') {
      var ls = item.substr(2).split('=');
      key = ls[0].replace(/\-/mg, '_');
      value = ls[1] || 1;
    } 
    else if (item.substr(0, 1) == '-') {
      key = item.substr(1).replace(/\-/mg, '_');
      if ( i + 1 < argv.length ) {
        value = argv[i+1];
        if ( value[0] != '-' ) {
          i++;
        } else {
          value = 1;
        }
      }
    }

    if ( key ) {
      if (value == 'true' || value == 'yes') {
        opts[key] = 1;
      } else if (value == 'false' || value == 'no') {
        opts[key] = 0;
      } else if (/^[0-9]+$/.test(value)) {
        opts[key] = parseInt(value);
      } else {
        opts[key] = value;
      }
    }
    //
  }
}

function format_string(val) {
  for (var i = 1, len = arguments.length; i < len; i++)
    val = val.replace(new RegExp('\\{' + (i - 1) + '\\}', 'g'), arguments[i]);
  return val;
}

read_argv();

exports.options = opts;
exports.help_info = help_info;
exports.def_opts = def_opts;
