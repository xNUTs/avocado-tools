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

export binding('_buffer');

 /**
	* @class Buffer
	*  
	* @constructor([length[,fill]])
	* @constructor(string[,encoding])
	* @constructor(buffer)
	* @arg [length=0] {uint}
	* @arg [fill=0] {uint}
	* @arg string {String}
	* @arg [encoding=utf8] {binary|ascii|base64|hex|utf8|ucs2|utf32}
	* @aeg buffer {ArrayBuffer|Array}
	*
	* @get length {uint}
	*	
	* @indexed_getter,indexed_setter {uint}
	*
	* @func copy()
	* @ret {Buffer} return new Buffer
	*
	* @func is_null()
	* @{bool}
	*
	*	@func write(buffer[,to[,size[,form]]])
	*	@func write(string[,to[,encoding]])
	*	@func write(string[,encoding])
	*	@arg buffer {Buffer|ArrayBuffer|Array}
	* @arg string {String}
	*	@arg [to=-1]   {int}  当前Buffer开始写入的位置
	*	@arg [size=-1] {int}  需要写入项目数量,超过要写入数据的长度自动取写入数据长度
	* @arg [form=0]  {uint} 从要写入数据的form位置开始取数据
	* @arg [encoding=utf8] {binary|ascii|base64|hex|utf8|ucs2|utf32}
	* @ret {uint} 返回写入的长度
	*
	* @func to_string([encoding[,start[,end]]])
	* @func to_string([start[,end]])
	* @func toString([encoding[,start[,end]]])
	* @func toString([start[,end]])
	* @arg [encoding=utf8] {binary|ascii|base64|hex|utf8|ucs2|utf32}
	* @arg [start] {int}
	* @arg [end] {uint}
	*
	* @func collapse()
	* @ret {ArrayBuffer}
	*
	* @func slice([start,[end]])
	* @arg [start = 0] {uint}
	* @arg [end = -1] {uint}
	* @ret {Buffer} return new buffer
	*
	* @func clear()
	* @ret {Buffer} return self
	*
	* @func toJSON()
	* @ret {Object}
	*
	* @func fill(value)
	* @arg value {uint}
	* @ret {Buffer} return self
	*
	* @func for_each(Function)
	* @ret {Buffer} return self
	*
	* @func filter(Function)
	* @ret {Buffer} return new Buffer
	*
	* @func some(Function)
	* @ret {bool} 
	*
	* @func every(Function)
	* @ret {bool}
	*
	* @func map(Function)
	* @ret {Buffer} return new Buffer
	*  
	* @end class
  */