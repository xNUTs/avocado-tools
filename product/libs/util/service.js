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

import 'util';
import 'http';
import URI from 'path';
import Notification from 'event';

/**
 * @class CallRequest
 */
class CallRequest {
  m_id: '';
  m_host: null;
  m_calls: null;
  get id () { return this.m_id }
  get calls() { return this.m_calls }

  constructor(host) {
    util.assert(host.m_wait_calls.calls.length, 'No calls to be processed');
    this.m_id = util.iid();
    this.m_host = host;
    this.m_calls = host.m_wait_calls;
    host.delete_call();
  }

  has_api(api) {
    return api in this.m_calls.names;
  }
  
  /**
   * @func done_post
   */
  done_post(err, data) {
    var host = this.m_host;
    var reqs = host.m_reqs;
    var calls = this.m_calls.calls;
    
    if ( this.m_id in reqs ) { // 有可能被经取消
      delete reqs[this.m_id];
      
      if ( err ) {
        console.error(err.message);
      } else {
        data = this.m_host.parse_data(data);
        if ( data.code || data.error ) {
          if ( !data.message ) data.message = data.error || 'Unknown exception';
          if ( !data.code ) data.code = -1;
          err = data;
        }
      }
      
      if ( err ) { // network error or all call error
        err = util.err(err);
        err.error = err.message;
        err.calls = calls;
        host.trigger_complete_post(err);
        host.trigger_error(err);
        
        for ( let call of calls ) {
          if ( !util.is_default_throw(call.cb) ) {
            err.call = call;
            call.cb.throw(err);
          }
        }

      } else { 
        data.calls = calls;
        host.trigger_complete_post(data);
        data = data.data;
        
        for ( var i = 0, len = calls.length; i < len; i++ ) {
          let call = calls[i];
          let data2 = data[i] || { message: util.err({ code: -1 }) };
          
          if ( data2.code || data2.error ) { // application error
            if ( !data2.message ) data2.message = data.error || 'Unknown exception';
            if ( !data2.code ) data2.code = -1;
            err = util.err(data2);
            err.error = err.message;
            err.call = call;
            host.trigger_error(err);
            if ( !util.is_default_throw(call.cb) ) {
              call.cb.throw(err);
            }
          } else {
            if ( !call.multiple ) {
              for ( var i in data2.data ) {
                call.cb(data2.data[i]); return;
              }
            }
            call.cb(data2.data);
          }
        }
      }
    }
  }
  
  /**
   * @func abort
   */
  abort() { throw 'Unimplemented' }
}

/**
 * @class HttpCallRequest
 */
class HttpCallRequest extends CallRequest {
  m_request_data: null;
  m_request_id: 0;
  
  constructor(host) {
    super(host);
    this.m_request_data = host.parse_http_request_data(this.m_calls.calls);
  }
  
  _request_option() {
    var request_data = this.m_request_data;
    var option = { 
      url: request_data.url,
      method: request_data.method,
      disable_cookie: this.m_host.disable_cookie,
      disable_cache: this.m_host.disable_cache,
      disable_ssl_verify: this.m_host.disable_ssl_verify,
    };
    
    if ( request_data.method == http.POST ) {
      option.post_data = request_data.data;
      option.headers = { 'Content-Type': 'application/json;charset=utf-8' };
    } else {
      option.url += '&data=' + encodeURIComponent(request_data.data);
      option.headers = { };
    }
    util.extend(option.headers, request_data.headers);
    return option;
  }
  
  post() {
    var self = this;
    this.m_host.m_reqs[this.m_id] = this;
    var id = http.request(this._request_option(), function(buffer) {
      self.done_post(null, buffer);
    }.catch(function(err) {
      self.done_post(err);
    }));
    this.m_request_id = id;
    return this.m_id;
  }
  
  sync_post() {
    return this.parse_data( http.request_sync(this._request_option()) );
  }
  
  /**
   * @overwrite
   */
  abort() {
    delete this.m_host.m_reqs[this.m_id];
    http.abort(this.m_request_id);
    this.m_host.trigger_abort(this);
  }
  
}

/**
 * @class Service 客户端数据服务
 */
export class Service extends Notification {

  m_name: ''; // 服务名
  m_reqs: null;
  m_wait_calls: null;
  
  /**
   * @event oncomplete_post
   */
  event oncomplete_post;
  
  /**
   * @event onerror
   */
  event onerror;
  
  /**
   * @event onabort
   */
  event onabort;

  /**
   * @field allow_repeat_call # allow repeat call service api
   */
  allow_repeat_call: false;
  
  /**
   * @constructor
   * @arg {String}
   */
  constructor(name) {
    util.assert(name, 'Service name is incorrect');
    super();
    this.m_name = name;
    this.m_reqs = { };
    this.m_wait_calls = { names: { }, calls: [ ] };
  }
  
  /**
    * @get name # 获取服务名称
    */
  get name() {
    return this.m_name;
  }
  
  /**
    * @func parse_args # parse args
    */
  parse_args(args) {
    return args;
  }
  
  /**
   * @func parse_data # parse data result
   */
  parse_data(data) {
    return JSON.parse(data.to_string());
  }
  
  /**
   * @func call # call service api
   * @arg name {String}   #  api name
   * @arg [args] {Object}  # send paeam
   * @arg [cb] {Function} # call success callback and return data
   */
  call(name, args, cb) {
    var calls = { };
    var multiple = -1;
    
    if ( typeof name == 'object' ) {
      for ( var api in name ) {
        multiple++;
        calls[api] = this.parse_args(name[api]);
      }
      cb = util.cb(args);
    } else {
      multiple++;
      if ( typeof args == 'function' ) {
        cb = args;
        args = null;
      } else {
        cb = util.cb(cb);
      }
      calls[name] = this.parse_args(args);
    }
    
    var wait_calls = this.m_wait_calls;
    
    if ( ! this.allow_repeat_call ) { // no allow repeat call
      for ( var api in calls ) {
        if ( api in wait_calls.names ) {
          throw util.err('Repeat request call is not allowed `${api}`');
        }
        var reqs = this.m_reqs;
        for ( var id in reqs ) {
          if ( reqs[id].has_api() ) {
            throw util.err('Repeat request call is not allowed `${api}`');
          }
        }
      }
    }
    
    wait_calls.calls.push({ args: calls, cb: cb, multiple: multiple });
    
    for ( var api in calls ) { // mark call name
      wait_calls.names[api] = 1;
    }
    return this;
  }
  
  /**
   * @func post call req and return req id
   */
  post() { throw 'Unimplemented' }
  
  /**
   * @func abort 取消当前Service上的的请求
   * @arg [id] {String} # 不传入参数取消全部请求
   */
  abort(id) {
    var reqs = this.reqs;
    if (id) {
      var req = reqs[id];
      if (req) 
        req.abort();
    } else {
      for (var i in reqs) {
        reqs[i].abort();
      }
    }
  }
  
  /**
   * @func delete wait calls 
   */
  delete_call() {
    this.m_wait_calls = { names: { }, calls: [ ] };
  }
  
}

/**
 * @class HttpService
 */
export class HttpService extends Service {
  
  m_path: null; // service path config
  
  /**
   * @get path service path uri
   */
  get path() { return this.m_path }
  
  /**
   * @field disable_cache data service should disable cache
   */
  disable_cache: true;

  /**
   * @field disable_cookie
   */
  disable_cookie: false;

  /**
   * @field disable_ssl_verify
   */
  disable_ssl_verify: false;
  
  /**
   * @constructor
   * @arg name    {String} service name
   * @arg [path]  {String} service path config
   */
  constructor(name, path) {
    super(name);
    if (path) {
      path = util.format(path);
    } else if (util.config.web_service) {
      path = util.format(util.config.web_service);
    }
    
    util.assert(path, 'Http service path is not correct');
    this.m_path = new URI(path.replace(/^ws/, 'http'));
    
    var params = this.m_path.params;
    this.m_path.del_all();
    this.m_path.set('service', name);
    this.m_path.set('multiple', 1);
    delete params.service;
    
    for (var i in params) {
      this.m_path.set(i, params[i]);
    }
  }
  
  /**
   * @func parse_http_request_data 
   */
  parse_http_request_data(calls) {
    
    var data = [];
    for ( var call of calls ) {
      data.push(call.args);
    }
    
    return {
      url: this.m_path.href,
      data: JSON.stringify(data),
      method: http.POST,
    };
  }
  
  /**
   * @overwrite
   */
  post() {
    return new HttpCallRequest(this).post();
  }
  
  /**
   * @func sync_post
   */
  sync_post() {
    return new HttpCallRequest(this).sync_post();
  }
  
}
