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
var child_process = require('child_process');
var keys = require('./keys');
var path = require('./path');
var Buffer = require('buffer').Buffer;
var export_paths = require('./export_paths');
var uglify = require('./uglify');

var base64_chars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');
  
function exec_cmd(cmd) {
  var r = child_process.spawnSync('sh', ['-c', cmd]);
  if (r.status != 0) {
    if (r.stdout.length) {
      console.log(r.stdout.toString('utf8'));
    }
    if (r.stderr.length) {
      console.error(r.stderr.toString('utf8'));
    }
    process.exit(0);
  } else {
    var rv = [];
    if (r.stdout.length) {
      rv.push(r.stdout.toString('utf8'));
    }
    if (r.stderr.length) {
      rv.push(r.stderr.toString('utf8'));
    }
    return rv.join('\n');
  }
}

function new_zip(self, cwd, source, target) {
  console.log('Out ', path.basename(target));
  exec_cmd('cd ' + cwd + '; rm -r ' + target + '; zip ' + target + ' ' + source.join(' '));
}

function unzip(self, source, target) {
  exec_cmd('cd ' + target + '; unzip ' + source);
}

function jsa_shell(source, target) {
  if ( process.platform == 'darwin' ) {
    exec_cmd(__dirname + '/bin/mac/jsa-shell ' + source + ' ' + target);
  } else if ( process.platform == 'linux' ) {
    exec_cmd(__dirname + '/bin/linux/jsa-shell ' + source + ' ' + target);
  } else {
    throw new Error('No support system');
  }
}

var Hash = util.class('Hash', {
  
  m_hash: 5381,
  
  update_str: function (input) {
    var hash = this.m_hash;
    for (var i = input.length - 1; i > -1; i--) {
      hash += (hash << 5) + input.charCodeAt(i);
    }
    this.m_hash = hash;
  },
  
  update_buff: function (input) {
    var hash = this.m_hash;
    for (var i = input.length - 1; i > -1; i--) {
      hash += (hash << 5) + input[i];
    }
    this.m_hash = hash;
  },
  
  update_buff_with_len: function (input, len) {
    var hash = this.m_hash;
    for (var i = len - 1; i > -1; i--) {
      hash += (hash << 5) + input[i];
    }
    this.m_hash = hash;
  },
  
  digest: function () {
    var value = this.m_hash & 0x7FFFFFFF;
    var retValue = '';
    do {
      retValue += base64_chars[value & 0x3F];
    }
    while ( value >>= 6 );
    return retValue;
  },
});

function console_log(self, tag, pathname) {
  console.log(tag, self.m_cur_lib_name + '/' + pathname);
}

// 获取跳过文件列表
// "name" lib 名称
function get_skip_files(self, lib_keys, name) {
  var rev = [ ];
  
  if (lib_keys.skip) {
    if (util.is_array(lib_keys.skip)) {
      rev = lib_keys.skip;
    } else {
      rev = [ String(lib_keys.skip) ];
    }
    delete lib_keys.skip;
  }
  
  if ( !lib_keys.src ) {
    rev.push('native');
  }
  rev.push('libs');
  rev.push('lib.keys');
  rev.push('versions.json');
  
  var reg = new RegExp('^:?' + name + '$');
  self.skip.forEach(function (src) {
    var ls = src.split('/');
    if (reg.test(ls.shift()) && ls.length) {
      rev.push(ls.join('/'));
    }
  });
  
  return rev;
}

// 获取分离文件列表
function get_detach_files(self, lib_keys, name) {
  var rev = [];
  
  if (lib_keys.detach) {
    if (util.is_array(lib_keys.detach)) {
      rev = lib_keys.detach;
    } else {
      rev = [ String(lib_keys.detach) ];
    }
    delete lib_keys.detach;
  }
  
  var reg = new RegExp('^:?' + name + '$');
  self.detach.forEach(function (src) {
    var ls = src.split('/');
    if (reg.test(ls.shift()) && ls.length) {
      rev.push(ls.join('/'));
    }
  });
  return rev;
}

function action_lib(self, pathname, ignore_depe) {
  return action_lib1(self, pathname, 
    self.m_target_local, 
    self.m_target_public, 0, ignore_depe);
}

// build lib item
function action_lib1(self, pathname, target_local, target_public, ignore_public, ignore_depe) {
  var source_path = util.format(pathname);
  var name = path.basename(source_path);
  var target_local_path = target_local + '/' + name;
  var target_public_path = target_public + '/' + name;
  
  // ignore network pkg 
  if ( /^https?:\/\//i.test(source_path) ) { 
    return { absolute_path: source_path, relative_path: absolute_path };
  }

  var out = self.m_output_libs[name];
  if ( out ) { // Already complete
    return out;
  }
  
  var lib_keys = keys.parse_file(source_path + '/lib.keys');
  
  util.assert(lib_keys.name && lib_keys.name == name, 
              'Lib name must be consistent with the folder name, ' + 
              name  + ' != ' + lib_keys.name);

  self.m_output_libs[name] = out = { lib_keys: lib_keys };

  var skip_install = lib_keys.skip_install && lib_keys.origin;

  if ( skip_install ) {
    out.absolute_path = lib_keys.origin;
  } else {
    out.absolute_path = '../' + name;
  }
  out.relative_path = '../' + name;
  
  var source_src = source_path;
  var target_local_src = target_local_path;
  var target_public_src = target_public_path;
  
  if ( lib_keys.src ) {
    source_src = util.format(source_src, lib_keys.src);
    target_local_src = util.format(target_local_src, lib_keys.src);
    target_public_src = util.format(target_public_src, lib_keys.src);
  }
  
  self.m_cur_lib_name             = name;
  self.m_cur_lib_source_src       = source_src;
  self.m_cur_lib_target_local_src = target_local_src;
  self.m_cur_lib_target_public_src= target_public_src;
  self.m_cur_lib_keys             = lib_keys;
  self.m_cur_lib_files            = { };
  self.m_cur_lib_avlib_files      = { };
  self.m_cur_lib_skip_file        = get_skip_files(self, lib_keys, name);
  self.m_cur_lib_detach_file      = get_detach_files(self, lib_keys, name);
  
  if ( lib_keys._build ) { // 已经build过,直接拷贝到目标
    copy_lib(self, lib_keys, source_path);
    return lib.local_depe;
  }
  
  if ( self.minify == -1 ) { // 使用lib.keys定义
    // lib.keys 默认启用 `minify`
    self.m_cur_lib_enable_minify = 'minify' in lib_keys ? !!lib_keys.minify : false;
  } else {
    self.m_cur_lib_enable_minify = !!self.minify;
  }

  fs.rm_r_sync(target_local_path);
  fs.rm_r_sync(target_public_path);
  fs.mkdir_p_sync(target_local_path);
  if ( !ignore_public ) {
    fs.mkdir_p_sync(target_public_path);
  }
  
  // each dir
  action_each_lib_dir(self, '');
  
  var hash = new Hash();
  for (var i in self.m_cur_lib_files) {  // 计算 version code
    hash.update_str(self.m_cur_lib_files[i]);
  }
  
  lib_keys.version_code = hash.digest();
  lib_keys.build_time   = new Date();
  lib_keys._build       = true;
  delete lib_keys.versions;

  var cur_lib_files = self.m_cur_lib_files;
  var cur_lib_avlib_files = self.m_cur_lib_avlib_files;
  
  var local_depe = { };
  var public_depe = { };
  
  if ( !ignore_depe ) {
    // depe
    if ( lib_keys.depe ) {
      for ( var i in lib_keys.depe ) {
        var paths = action_lib(self, util.is_absolute(i) ? i : source_path + '/' + i);
        local_depe[paths.absolute_path] = '';
        public_depe[paths.relative_path] = '';
      }
    }
    //
    // TODO depe native ..
    //
  }

  lib_keys.depe = local_depe;

  if ( ignore_public ) {
    var versions = { versions: cur_lib_files };
    fs.writeFileSync(target_local_path + '/versions.json', JSON.stringify(versions, null, 2));
    fs.writeFileSync(target_local_path + '/lib.keys', keys.stringify(lib_keys));
  } else {
    
    var versions = { versions: cur_lib_files, lib_files: cur_lib_avlib_files };

    lib_keys.depe = public_depe;
    
    fs.writeFileSync(target_local_src + '/versions.json', JSON.stringify(versions));
    fs.writeFileSync(target_local_src + '/lib.keys', keys.stringify(lib_keys));
    
    var lib_files = ['lib.keys', 'versions.json'];
    for ( var i in cur_lib_avlib_files ) {
      lib_files.push('"' + i + '"');
    }
    new_zip(self, target_local_src, lib_files, target_public_path + '/' + name + '.avlib');

    delete versions.lib_files;

    lib_keys.depe = local_depe;
    
    fs.rm_sync(target_local_src + '/versions.json');
    fs.rm_sync(target_local_src + '/lib.keys');
    fs.writeFileSync(target_local_path + '/versions.json', JSON.stringify(versions, null, 2));
    fs.writeFileSync(target_local_path + '/lib.keys', keys.stringify(lib_keys));

    lib_keys.depe = public_depe;

    fs.writeFileSync(target_public_path + '/lib.keys', keys.stringify(lib_keys));

    if ( skip_install ) {
      var skip_install = util.format(target_local_path, '../../skip_install');
      fs.mkdir_p_sync(skip_install);
      fs.rm_r_sync(skip_install + '/' + name);
      fs.renameSync(target_local_path, skip_install + '/' + name);
    }
  }
  
  return out;
}

function copy_file(self, source, target) {
  
  fs.mkdir_p_sync( path.dirname(target) ); // 先创建目录
  
  var rfd  = fs.openSync(source, 'r');
  var wfd  = fs.openSync(target, 'w');
  var size = 1024 * 100; // 100 kb
  var buff = new Buffer(size);
  var len  = 0;
  var hash = new Hash();
  
  do {
    len = fs.readSync(rfd, buff, 0, size, null);
    fs.writeSync(wfd, buff, 0, len, null);
    hash.update_buff_with_len(buff, len); // 更新hash
  } while (len == size);
  
  fs.closeSync(rfd);
  fs.closeSync(wfd);
  
  return { hash : hash.digest() };
}

function read_file_text(self, pathname) {
  var buff = fs.readFileSync(pathname);
  var hash = new Hash();
  hash.update_buff(buff);
  return {
    value: buff.toString('utf-8'),
    hash: hash.digest(),
  };
}

function action_build_file(self, pathname) {
  // 跳过文件
  for (var i = 0; i < self.m_cur_lib_skip_file.length; i++) {
    var name = self.m_cur_lib_skip_file[i];
    if ( pathname.indexOf(name) == 0 ) { // 跳过这个文件
      return;
    }
  }
  var source        = util.format(self.m_cur_lib_source_src, pathname);
  var target_local  = util.format(self.m_cur_lib_target_local_src, pathname);
  var target_public = util.format(self.m_cur_lib_target_public_src, pathname);
  var extname       = path.extname(pathname).toLowerCase();
  var data          = null;
  var is_detach     = false;
  
  for (var i = 0; i < self.m_cur_lib_detach_file.length; i++) {
    var name = self.m_cur_lib_detach_file[i];
    if (pathname.indexOf(name) == 0) {
      is_detach = true; // 分离这个文件
      break;
    }
  }
  
  switch (extname) {
    case '.js':
    case '.jsx':
      console_log(self, 'Out ', pathname);
      jsa_shell(source, source + 'c');
      data = read_file_text(self, source + 'c');
      fs.rm_sync(source + 'c');
      
      if ( self.m_cur_lib_enable_minify ) {
        var minify = uglify.minify(data.value, {
          toplevel: true, 
          keep_fnames: false,
          mangle: { 
            toplevel: true, 
            reserved: [ '$' ], 
            keep_classnames: true,
          },
          output: { ascii_only: true } 
        });
        if ( minify.error ) {
          var err = minify.error;
          err = new SyntaxError(
            `${err.message}\n` +
            `line: ${err.line}, col: ${err.col}\n` +
            `filename: ${source}`
          );
          throw err;
        }
        data.value = minify.code;
      }
      
      fs.mkdir_p_sync( path.dirname(target_local) ); // 先创建目录
      
      fs.writeFileSync(target_local, data.value, 'utf8');
      break;
    case '.keys':
      console_log(self, 'Out ', pathname);
      data = read_file_text(self, source);
      var keys_data = null;
      
      try {
        keys_data = keys.parse(data.value);
      } catch(err) {
        console.error('Parse keys file error: ' + source);
        throw err;
      }
      
      fs.mkdir_p_sync( path.dirname(target_local) ); // 先创建目录
      
      fs.writeFileSync(target_local, keys.stringify(keys_data), 'utf8');
      break;
    default:
      console_log(self, 'Copy', pathname);
      data = copy_file(self, source, target_local);
      break;
  }
  
  self.m_cur_lib_files[pathname] = data.hash; // 记录文件 hash
  
  if ( is_detach ) { 
    fs.cp_sync(target_local, target_public);
  } else {  // add to .lib public 
    self.m_cur_lib_avlib_files[pathname] = data.hash;
  }
}

function action_each_lib_dir(self, pathname) {
  
  var path2 = util.format(self.m_cur_lib_source_src, pathname);
  var ls = fs.ls_sync(path2);
  
  for (var i = 0; i < ls.length; i++) {
    var stat = ls[i];
    if (stat.name[0] != '.' || !self.ignore_hide) {
      var path3 = pathname ? pathname + '/' + stat.name : stat.name; 
      
      if ( stat.isFile() ) {
        action_build_file(self, path3);
      } else if ( stat.isDirectory() ) {
        action_each_lib_dir(self, path3);
      }
    }
  }
}

function copy(self, source, target) {
  fs.cp_sync(source, target, { ignore_hide: self.ignore_hide });
}

function copy_lib(self, lib_keys, source) {
  util.assert(lib_keys._build, 'Error');
  
  var name = lib_keys.name;
  var target_local_path = self.m_target_local + '/' + name;
  var target_public_path = self.m_target_public + '/' + name;
  var lib_path = source + '/' + name + '.lib';

  // copy to ramote
  copy(source, target_public_path);
  // copy to local
  copy(source, target_local_path);
  
  if ( fs.existsSync(lib_path) ) { // 有 .lib
    // unzip .lib
    fs.mkdir_p_sync(self.m_cur_lib_target_local_src);
    unzip(self, lib_path, self.m_cur_lib_target_local_src);
    
    if ( self.m_cur_lib_target_local_src != target_local_path ) { // src
      fs.fs.renameSync(self.m_cur_lib_target_local_src + 
                       '/versions.json', target_local_path + '/versions.json');
      fs.rm_sync(self.m_cur_lib_target_local_src + '/lib.keys');
    }
    fs.rm_sync(lib_path);
  } else { // 没有.lib文件
    new_zip(self, target_public_path, 'lib.keys versions.json', name + '.avlib');
    fs.rm_sync(target_public_path + '/versions.json');
  }
}

// 拷贝外部文件
function copy_outer_file(self, items) {
  for (var source in items) {
    var target = items[source] || source;
    console.log('Copy', source);
    fs.cp_sync(self.m_source + '/' + source, 
               self.m_target_local + '/' + target, { ignore_hide: self.ignore_hide });
  }
}

function action_result(self) {
  var result = { };
  var ok = 0;
  for ( var name in self.m_output_libs ) {
    result[name] = self.m_output_libs[name].lib_keys;
    ok = 1;
  }
  if ( ok ) {
    fs.writeFileSync(self.m_target_public + '/libs.keys', keys.stringify(result));
  } else {
    console.log('No lib build');
  }
}

/**
 * @class AvocadoBuild
 */
var AvocadoBuild = util.class('AvocadoBuild', {
  
  m_source                    : '',
  m_target_local              : '',
  m_target_public             : '',
  m_cur_lib_name              : '',
  m_cur_lib_source_src        : '',
  m_cur_lib_target_local_src  : '',
  m_cur_lib_target_public_src : '',
  m_cur_lib_keys              : null,
  m_cur_lib_files             : null,
  m_cur_lib_avlib_files       : null,
  m_cur_lib_detach_file       : null,
  m_cur_lib_skip_file         : null,
  m_cur_lib_enable_minify     : false,
  m_output_libs               : null,
  
  // public:
  
  ignore_hide: true, // 忽略隐藏文件
  minify: -1, // 缩小与混淆js代码，-1表示使用lib.keys定义
  skip: null,// 跳过文件列表
  detach: null, // 分离文件列表
  
  /**
    * @constructor
    */
  constructor: function (source, target) {
    var self = this;
    this.skip               = [ ];
    this.detach             = [ ];
    this.m_output_libs      = { };
    this.m_source           = util.format(source);
    this.m_target_local     = util.format(target, 'install');
    this.m_target_public    = util.format(target, 'public');
    
    util.assert(fs.existsSync(this.m_source), 'Build source does not exist ,{0}', this.m_source);
  },
  
  /**
   * action
   */
  build: function() { 
    var self = this;
    var keys_path = self.m_source + '/app.keys';

    fs.mkdir_p_sync(this.m_target_local);
    fs.mkdir_p_sync(this.m_target_public);
    
    if ( !fs.existsSync(keys_path) ) { // No exists app.keys file
      // build libs
      // scan each current target directory
      fs.ls_sync(self.m_source).forEach(function(stat) {
        if ( stat.name[0] != '.' && 
             stat.isDirectory() && 
             fs.existsSync( self.m_source + '/' + stat.name + '/lib.keys' )
        ) {
          action_lib(self, self.m_source + '/' + stat.name);
        }
      });

      action_result(self);

      return;
    }

    // build application libs
    
    var libs_path = self.m_source + '/libs';
    if ( fs.existsSync(libs_path) && fs.statSync(libs_path).isDirectory() ) {

      var target_local = this.m_target_local; // + '/libs';
      fs.mkdir_p_sync(target_local);

      fs.ls_sync(libs_path).forEach(function(stat) {
        var source = libs_path + '/' + stat.name;
        if ( stat.isDirectory() && fs.existsSync(source + '/lib.keys') ) {
          action_lib1(self, source, target_local, self.m_target_public, false, true);
        }
      });
    }
    
    // build apps

    var keys_object = keys.parse_file( keys_path );
    
    for (var name in keys_object) {
      var info = keys_object[name];
      
      if (name[0] != '@') { // 忽略 @
        action_lib(self, self.m_source + '/' + name);
      } 
      else if (name == '@copy') {
        copy_outer_file(self, info);
      }
    }
    
    action_result(self);
  },

  /**
   * @func initialize() init project directory and add examples
   */
  initialize: function() {
    var app_keys = this.m_source + '/app.keys';
    var app = { '@project': 'examples', 'examples': '' };
    var default_libs = export_paths.default_libs;

    if ( default_libs && default_libs.length ) {
      var libs_dirname = this.m_source + '/libs';
      fs.mkdir_p_sync(libs_dirname); // create libs dir
      // copy default libs
      default_libs.forEach(function(lib) { 
        var pathname = libs_dirname + '/' + path.basename(lib);
        if ( !fs.existsSync(pathname) ) { // if no exists then copy
          fs.cp_sync(lib, pathname); // copy libs
        }
      });
    }

    // copy examples lib
    fs.cp_sync(export_paths.examples, this.m_source + '/examples');

    if ( fs.existsSync(app_keys) ) { // 如果当前目录存在app.keys文件附加到当前
      app = util.ext(app, keys.parse_file(app_keys));
    }
    
    // write new app.keys
    fs.writeFileSync(app_keys, keys.stringify(app));
  },
  
});

exports.AvocadoBuild = AvocadoBuild;
