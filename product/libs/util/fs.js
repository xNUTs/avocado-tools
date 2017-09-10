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

export binding('_fs');

 /**
	* @enum FileOpenMode
	* FOPEN_READ
	* FOPEN_WRITE
	* FOPEN_APPEND
	* FOPEN_READ_PLUS
	* FOPEN_WRITE_PLUS
	* FOPEN_APPEND_PLUS
	* FOPEN_R
	* FOPEN_W
	* FOPEN_A
	* FOPEN_RP
	* FOPEN_WP
	* FOPEN_AP
	* @end
  */

 /**
 	* @enum FileType
 	* FILE_UNKNOWN,
  * FILE_FILE,
  * FILE_DIR,
  * FILE_LINK,
  * FILE_FIFO,
  * FILE_SOCKET,
  * FILE_CHAR,
  * FILE_BLOCK
 	* @end
  */

 /**
  * DEFAULT_MODE
  */

 /**
 	* @object Dirent
 	* name     {String}
 	*	pathname {String}
 	*	type     {FileType}
 	* @end
  */

 /**
  * @class FileStat
	*
	* @constructor([path])
	* @arg [path] {String}
	*
	* @func is_valid()
	* @ret {bool}
	*
	* @func is_file()
	* @ret {bool}
	*
	* @func is_dir()
	* @ret {bool}
	*
	* @func is_link()
	* @ret {bool}
	*
	* @func is_sock()
	* @ret {bool}
	*
	* @func mode()
	* @ret {uint64}
	*
	* @func type()
	* @ret {FileType}
	*
	* @func group()
	* @ret {uint64}
	*
	* @func owner()
	* @ret {uint64}
	*
	* @func size()
	* @ret {uint64}
	*
	* @func nlink()
	* @ret {uint64}
	*
	* @func ino()
	* @ret {uint64}
	*
	* @func blksize()
	* @ret {uint64}
	*
	* @func blocks()
	* @ret {uint64}
	*
	* @func flags()
	* @ret {uint64}
	*
	* @func gen()
	* @ret {uint64}
	*
	* @func dev()
	* @ret {uint64}
	*
	* @func rdev()
	* @ret {uint64}
	*
	* @func atime()
	* @ret {uint64}
	*
	* @func mtime()
	* @ret {uint64}
	*
	* @func ctime()
	* @ret {uint64}
	*
	* @func birthtime()
	* @ret {uint64}
	*
  * @end
  */

 /**
 	*
	* @func abort(id) abort async io
	* @arg id {uint}
  *
	* @func chmod(path[,mode[,cb]])
	* @func chmod(path[,cb])
	* @arg path {String}
	* @arg [mode=DEFAULT_MODE] {uint}
	* @arg [cb] {Function}
	*
	* @func chmod_sync(path[,mode])
	* @arg path {String}
	* @arg [mode=DEFAULT_MODE] {uint}
	* @ret {bool}
	*
	* @func chmod_r(path[,mode[,cb]])
	* @func chmod_r(path[,cb])
	* @arg path {String}
	* @arg [mode=DEFAULT_MODE] {uint}
	* @arg [cb] {Function}
	* @ret {uint} return id
	*
	* @func chmod_r_sync(path[,mode])
	* @arg path {String}
	* @arg [mode=DEFAULT_MODE] {uint}
	* @ret {bool}
	*
	* @func chown(path, owner, group[,cb])
	* @arg path {String}
	* @arg owner {uint}
	* @arg group {uint}
	* @arg [cb] {Function}
	*
	* @func chown_sync(path, owner, group)
	* @arg path {String}
	* @arg owner {uint}
	* @arg group {uint}
	* @ret {bool}
	*
	* @func chown_r(path, owner, group[,cb])
	* @arg path {String}
	* @arg owner {uint}
	* @arg group {uint}
	* @arg [cb] {Function}
	* @ret {uint} return id
	*
	* @func chown_r_sync(path, owner, group)
	* @arg path {String}
	* @arg owner {uint}
	* @arg group {uint}
	* @ret {bool}
	*
	* @func mkdir(path[,mode[,cb]])
	* @func mkdir(path[,cb])
	* @arg path {String}
	* @arg [mode=default_mode] {uint}
	* @arg [cb] {Function}
	*
	* @func mkdir_sync(path[,mode])
	* @arg path {String}
	* @arg [mode=default_mode] {uint}
	* @ret {bool}
	*
	* @func mkdir_p(path[,mode[,cb]])
	* @func mkdir_p(path[,cb])
	* @arg path {String}
	* @arg [mode=default_mode] {uint}
	* @arg [cb] {Function}
	*
	* @func mkdir_p_sync(path[,mode])
	* @arg path {String}
	* @arg [mode=default_mode] {uint}
	* @ret {bool}
	*
	* @func rename(name,new_name[,cb])
	* @func mv(name,new_name[,cb])
	* @arg name {String}
	* @arg new_name {String}
	* @arg [cb] {Function}
	*
	* @func rename_sync(name,new_name)
	* @func mv_sync(name,new_name)
	* @arg name {String}
	* @arg new_name {String}
	* @ret {bool}
	*
	* @func unlink(path[,cb])
	* @arg path {String}
	* @arg [cb] {Function}
	*
	* @func unlink_sync(path)
	* @arg path {String}
	* @ret {bool}
	*
	* @func rmdir(path[,cb])
	* @arg path {String}
	* @arg [cb] {Function}
	*
	* @func rmdir_sync(path)
	* @arg path {String}
	* @ret {bool}
	*
	* @func rm_r(path[,cb])
	* @arg path {String}
	* @arg [cb] {Function}
	* @ret {uint} return id
	*
	* @func rm_r_sync(path)
	* @arg path {String}
	* @ret {bool}
	*
	* @func cp(path,target[,cb])
	* @arg path {String}
	* @arg target {String}
	* @arg [cb] {Function}
	* @ret {uint} return id
	*
	* @func cp_sync(path, target)
	* @arg path {String}
	* @arg target {String}
	* @ret {bool}
	*
	* @func cp_r(path, target[,cb])
	* @arg path {String}
	* @arg target {String}
	* @arg [cb] {Function}
	* @ret {uint} return id
	*
	* @func cp_r_sync(path, target)
	* @arg path {String}
	* @arg target {String}
	* @ret {bool}
	*
	* @func readdir(path[,cb])
	* @func ls(path[,cb])
	* @arg path {String}
	* @arg [cb] {Function}
	*
	* @func readdir_sync(path)
	* @func ls_sync(path)
	* @arg path {String}
	* @ret {Array} return Array<Dirent>	
	*
	* @func exists_file(path[,cb])
	* @arg path {String}
	* @arg [cb] {Function}
	*
	* @func exists_file_sync(path)
	* @arg path {String}
	* @ret {bool}
	*
	* @func exists_dir(path[,cb])
	* @arg path {String}
	* @arg [cb] {Function}
	*
	* @func exists_dir_sync(path)
	* @arg path {String}
	* @ret {bool}
	*
	* @func stat(path[,cb])
	* @arg path {String}
	* @arg [cb] {Function}
	*
	* @func stat_sync(path)
	* @arg path {String}
	* @ret {FileStat}
	*
	* @func exists(path[,cb])
	* @arg path {String}
	* @arg [cb] {Function}

	* @func exists_sync(path)
	* @arg path {String}
	* @ret {bool}
	*
	* @func readable(path[,cb])
	* @arg path {String}
	* @arg [cb] {Function}
	*
	* @func readable_sync(path)
	* @arg path {String}
	* @ret {bool}
	*
	* @func writable(path[,cb])
	* @arg path {String}
	* @arg [cb] {Function}
	*
	* @func writable_sync(path)
	* @arg path {String}
	* @ret {bool}
	*
	* @func executable(path[,cb])
	* @arg path {String}
	* @arg [cb] {Function}
	*
	* @func executable_sync(path)
	* @arg path {String}
	* @ret {bool}
	*
	* @func read_stream(path[,cb])
	* @arg path {String}
	* @arg [cb] {Function}
	*
	* ************* read/write *************
	*
	* @func write_file_sync(path,buffer[,size])
	* @func write_file_sync(path,string[,encoding])
	* @arg path {String}
	* @arg string {String}
	* @arg buffer {Buffer|ArrayBuffer}
	* @arg [size] {int}
	* @arg [encoding=utf8] {Encoding}
	* @ret {int} return write size
	*
	* @func write_file(path,buffer[,cb])
	* @func write_file(path,buffer[,size[,cb]])
	* @func write_file(path,string[,encoding[,cb]])
	* @arg path {String}
	* @arg string {String}
	* @arg buffer {Buffer|ArrayBuffer}
	* @arg [size] {int}
	* @arg [encoding=utf8] {Encoding}
	* @arg [cb] {Function}
	*
	* @func read_file_sync(path)
	* @arg path {String}
	* @ret {Buffer} return file buffer
	*
	* @func read_file(path,cb)
	* @arg path {String}
	* @arg [cb] {Function}
  *
	* @func open_sync(path[,mode])
	* @arg path {String}
	* @arg [mode=FOPEN_R] {FileOpenMode}
	* @ret {int} return file handle `success >= 0`
	*
	* @func open(path[,mode[,cb]])
	* @func open(path[,cb])
	* @arg path {String}
	* @arg [mode=FOPEN_R] {FileOpenMode}
	* @arg [cb] {Function}
	*
	* @func close_sync(fd)
	* @arg path {int} file handle
	* @ret {int} return err code `success == 0`
	*
	* @func close(fd[,cb])
	* @arg fd {int} file handle
	* @arg [cb] {Function}
	*
	* @func read_sync(fd,buffer[,size[,offset]])
	* @arg fd {int} file handle
	* @arg buffer {Buffer} output buffer
	* @arg [size=-1] {int}
	* @arg [offset=-1] {int}
	* @ret {int} return err code `success >= 0`
	*
	* @func read(fd,buffer[,size[,offset[,cb]]])
	* @func read(fd,buffer[,size[,cb]])
	* @func read(fd,buffer[,cb])
	* @arg fd {int} file handle
	* @arg buffer {Buffer} output buffer
	* @arg [size=-1] {int}
	* @arg [offset=-1] {int}
	* @arg [cb] {Function}
	*
	* @func write_sync(fd,buffer[,size[,offset]])
	* @func write_sync(fd,string[,encoding[,offset]])
	* @arg fd {int} file handle
	* @arg buffer {Buffer|ArrayBuffer} write buffer
	* @arg string {String} write string
	* @arg [size=-1] {int} read size, `-1` use buffer.length
	* @arg [offset=-1] {int}
	* @arg [encoding='utf8'] {String}
	* @ret {int} return err code `success >= 0`
	*
	* @func write(fd,buffer[,size[,offset[,cb]]])
	* @func write(fd,buffer[,size[,cb]])
	* @func write(fd,buffer[,cb])
	* @func write(fd,string[,encoding[,offset[,cb]]])
	* @func write(fd,string[,encoding[,cb]])
	* @func write(fd,string[,cb])
	* @arg fd {int} file handle
	* @arg buffer {Buffer|ArrayBuffer} write buffer
	* @arg string {String} write string
	* @arg [size=-1] {int} read size, `-1` use buffer.length
	* @arg [offset=-1] {int}
	* @arg [encoding='utf8'] {String}
	* @arg [cb] {Function}
	*
  */
