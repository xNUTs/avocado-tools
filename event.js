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

/**
  * @class Event
  */
var Event = util.class('Event', {
  
  m_data: null,
  m_noticer: null,
  
  return_value: 0,
  
  /**
   * name
   */
  get name () {
    return this.m_noticer.name;
  },
  
  /**
   * 事件数据
   */
  get data () {
    return this.m_data;
  },
  
  /**
   * 发送者
   */
  get sender () {
    return this.m_noticer.sender;
  },

  get noticer () {
    return this.m_noticer;
  },
  
  /**
   * @constructor
   */
  constructor: function(data) {
    this.m_data = data;
  },
  // @end
});

/* @fun add # Add event listen */
function add(self, origin, listen, scope, id) {

  if (origin) {
    if ( !self.m_event ) {
      self.m_event = new Event(null);
      self.m_event.m_noticer = self;
    }

    var listens = self.m_listens;
    if ( !listens ) {
      self.m_listens = listens = [];
    }

    if (typeof scope == 'string') {
      id = scope;
      scope = self.m_sender;
    } else {
      scope = scope || self.m_sender;
    }
    
    var len = listens.length;
    if (len) {
      for (var i = 0; i < len; i++) {
        var item = listens[i];
        if (item.origin === origin && item.scope === scope)
          return;
        if (id && item.id == id) { // 通过名称重新设定侦听多
            item.origin = origin;
            item.listen = listen;
            item.scope = scope;
          return;
        }
      }
    }

    listens.splice(0, 0, {
      origin: origin,
      listen: listen,
      scope: scope,
      id: id
    });

    self.m_length = listens.length;
  } else {
    throw new Error('Listener function can not be empty');
  }
}

function notice_proxy_noticer(self, evt) {
  var noticer = evt.m_noticer;
  self.notice_with_event(evt);
  evt.m_noticer = noticer;
}

function add_on_noticer(self, noticer) {
  add(self, noticer, { call : notice_proxy_noticer }, noticer);
}

function add_once_noticer(self, noticer) {
  add(self, noticer, function (evt) {
    self.off(noticer, noticer);
    notice_proxy_noticer(noticer, evt);
  }, noticer);
}

/**
 * @class EventNoticer
 */
var EventNoticer = util.class('EventNoticer', {

  m_name: '',
  m_sender: null,
  m_event: null,
  m_listens: null,
  m_length: 0,
  m_enable: true,
  
  /**
   * @get enable {bool} # 获取是否已经启用
   */
  get enable () {
    return this.m_enable;
  },
  
  /**
   * @set enable {bool} # 设置启用禁用
   */
  set enable (value) {
    this.m_enable = true;
  },
  
  /**
   * @get name {String} # 事件名称
   */
  get name () {
    return this.m_name;
  },
  
  /**
   * @get {Object} # 事件发送者
   */
  get sender () {
    return this.m_sender;
  },
  
  /**
   * 
   * @get {int} # 添加的事件侦听数量
   */
  get length () {
    return this.m_length;
  },

  /**
   * @get {Array} # 事件侦听列表
   */
  get listens () {
    return this.m_listens || [];
  },
  
  /**
   * @constructor
   * @arg name   {String} # 事件名称
   * @arg sender {Object} # 事件发起者
   */
  constructor: function(name, sender) {
    this.m_name = name;
    this.m_sender = sender;
  },
  
  /**
   * @fun on # 绑定一个事件侦听器(函数)
   * @arg  listen {Function} #  侦听函数
   * @arg [scope] {Object}   # 重新指定侦听函数this
   * @arg [name]  {String}     # 侦听器别名,删除时必须传入名称或传入侦听方可删除
   */
  on: function(listen, scope, name) {
    if (listen instanceof EventNoticer) {
      return add_on_noticer(this, listen);
    }
    add(this, listen, listen, scope, name);
  },
  
  /**
   * @fun once # 绑定一个侦听器(函数),且只侦听一次就立即删除
   * @arg listen {Function} #         侦听函数
   * @arg [scope] {Object}  #         重新指定侦听函数this
   * @arg [name] {String}     #         侦听器别名,删除时必须传入名称或传入侦听方可删除
   */
  once: function(listen, scope, name) {
    if(listen instanceof EventNoticer){
      return add_once_noticer(this, listen);
    }
    var self = this;
    add(this, listen, {
      call: function (scope, evt) {
        self.off(listen, scope);
        listen.call(scope, evt);
      }
    },
    scope, name);
  },
  
  /**
   * Bind an event listener (function),
   * and "on" the same processor of the method to add the event trigger to receive two parameters
   * @fun $on
   * @arg listen {Function}  #              侦听函数
   * @arg [scope] {Object}   #      重新指定侦听函数this
   * @arg [name] {String}    #     侦听器别名,删除时必须传入名称或传入侦听方可删除
   */
  $on: function (listen, scope, name) {
    if(listen instanceof EventNoticer){
      return on_noticer(this, listen);
    }
    add(this, listen, { call: listen }, scope, name);
  },

  /**
   * Bind an event listener (function), And to listen only once and immediately remove
   * and "on" the same processor of the method to add the event trigger to receive two parameters
   * @fun $once
   * @arg listen {Function}     #           侦听函数
   * @arg [scope] {Object}      # 重新指定侦听函数this
   * @arg [name] {String}       # 侦听器别名,删除时必须传入名称或传入侦听方可删除
   */
  $once: function (listen, scope, name) {
    if (listen instanceof EventNoticer) {
      return once_noticer(this, listen);
    }
    var self = this;
    add(this, listen, {
      call: function (scope, evt) {
        self.off(listen, scope);
        listen(scope, evt);
      }
    },
    scope, name);
  },
  
  /**
   * @fun trigger # 通知所有观察者
   * @arg data {Object} # 要发送的数据
   * @ret {Object}
   */
  trigger: function(data) {
    if ( this.m_enable && this.m_length ) {
      var listens = this.m_listens;
      var evt = this.m_event;
      evt.m_data = data; // 设置数据
      evt.return_value = 0; // 重置返回值
      for (var i = this.m_length - 1; i > -1; i--) {
        var item = listens[i];
        item.listen.call(item.scope, evt);
      }
      return evt.return_value;
    }
    return 0;
  },
  
  /**
   * @fun trigger_with_event # 通知所有观察者
   * @arg data {Object} 要发送的event
   * @ret {Object}
   */
  trigger_with_event: function(evt) {
    if ( this.m_enable && this.m_length ) {
      evt.m_noticer = this;
      var listens = this.m_listens;
      for (var i = this.m_length - 1; i > -1; i--) {
        var item = listens[i];
        item.listen.call(item.scope, evt);
      }
    }
    return evt.return_value;
  },
  
  /**
   * @fun off # 卸载侦听器(函数)
   * @arg [func] {Object} # 可以是侦听函数,也可是观察者别名,如果不传入参数卸载所有侦听器
   * @arg [scope] {Object}  # scope
   */
  off: function (func, scope) {
    var ls = this.m_listens;
    if (!ls) { return }
    if (func) {

      if (func instanceof Function) { // 要卸载是一个函数
        if (scope) { // 需比较范围
          for(var i = ls.length - 1; i > -1; i--){
            var item = ls[i];
            if(item.origin === func && item.scope === scope){
              ls.splice(i, 1); break;
            }
          }
        } else { // 与这个函数有关系的,全部删除
          for(var i = ls.length - 1; i > -1; i--){
            if (ls[i].origin === func) {
              ls.splice(i, 1);
            }
          }
        }
      } else if (func instanceof Object) { //
        if (func instanceof EventNoticer) { // 卸载委托代理
          for(var i = ls.length - 1; i > -1; i--){
            if (ls[i].origin === func) {
              ls.splice(i, 1); break;
            }
          }
        } else { // 要卸载这个范围上所有侦听器,不包括有名称的侦听器
          for(var i = ls.length - 1; i > -1; i--){
            if (!ls[i].name && ls[i].scope === func) {
              ls.splice(i, 1);
            }
          }
        }
      } else if (typeof func == 'string') { // 卸载指定名称的侦听器
        for (var i = ls.length - 1; i > -1; i--) {
          if (ls[i].name == func) {
            ls.splice(i, 1); break;
          }
        }
      } else { //
        throw new Error('Param err');
      }
    } else { // 全部删除,不包括有名称的侦听器
      this.m_listens = ls.filter(function (i){ return i.name });
    }
    this.m_length = this.m_listens.length;
  },

  // @end
});


/**
 * @class Notification
 */
var Notification = util.class('Notification', {
  
  /**
   * @func get_noticer
   */
  get_noticer: function(name) {
    var noticer = this['on' + name];
    if ( ! noticer ) {
      noticer = new EventNoticer(name, this);
      this['on' + name] = noticer;
    }
    return noticer;
  },
  
  /**
   * @func add_default_listener
   */
  add_default_listener: function(name, func) {
    
    if ( typeof func == 'string' ) {
      var func2 = this[func]; // find func 
      
      if ( typeof func2 == 'function' ) {
        this.get_noticer(name).on(func2, 'default');
      } else {
        throw util.err('Cannot find a function named `${func}`');
      }
    } else {
      this.get_noticer(name).on(func, 'default');
    }
  },
  
  /**
   * @fun on # 添加事件监听器(函数)
   * @arg name {Object}        # 事件名称或者事件名称列表
   * @arg func {Function}     # 侦听器函数
   * @arg [scope] {Object}      # 重新指定侦听器函数this
   * @arg [id]  {String}      # 侦听器别名,在删除时,可直接传入该名称
   */
  on: function(name, func, scope, id) {
    this.get_noticer(name).on(func, scope, id);
  },
  
  /**
   * @func on # 添加事件监听器(函数),消息触发一次立即移除
   * @arg name {Object}      #            事件名称或者事件名称列表
   * @arg func {Function}   #             侦听器函数
   * @arg [scope] {Object} #   重新指定侦听器函数this
   * @arg [id] {String}  #  侦听器别名,在删除时,可直接传入该名称
   */
  once: function(name, func, scope, id) {
    this.get_noticer(name).once(func, scope, id);
  },
  
  /**
   * Bind an event listener (function),
   * and "on" the same processor of the method to add the event trigger to receive two parameters
   * @func $on
   * @arg name {Object}    #               事件名称或者事件名称列表
   * @arg func {Function} #               侦听函数
   * @arg [scope] {Object}  #  重新指定侦听函数this
   * @arg [id] {String}   #  侦听器别名,在删除时,可直接传入该名称
   */
  $on: function(name, func, scope, id) {
    this.get_noticer(name).$on(func, scope, id);
  },
  
  /**
   * Bind an event listener (function), And to listen only once and immediately remove
   * and "on" the same processor of the method to add the event trigger to receive two parameters
   * @func $once
   * @arg name    {Object}      #              事件名称或者事件名称列表
   * @arg listen {Function}  #             侦听函数
   * @arg [scope] {Object}   #     重新指定侦听函数this
   * @arg [id] {String}    #    侦听器别名,在删除时,可直接传入该名称
   */
  $once: function(name, func, scope, id) {
    this.get_noticer(name).$once(func, scope, id);
  },
  
  /**
   * @func off # 卸载事件监听器(函数)
   * @arg arg0    {String}    事件名称
   * @arg [func]   {Object}  可以是侦听器函数值,也可是侦听器别名,如果不传入参数卸载所有侦听器
   * @arg [scope]  {Object}  scope
   */
  off: function(name, func, scope) {
    
    if ( name instanceof Object ) { // 卸载这个范围上的所有侦听器
      var all = exports.all_noticer(this);
      for ( var i = 0, l = all.length; i < l; i++ ) {
        all[i].off(name);
      }
    } else {
      var noticer = this['on' + name];
      if (noticer) {
        noticer.off(func, scope);
      }
    }
  },
  
  /**
  * @func trigger 通知事监听器
  * @arg name {String}       事件名称
  * @arg data {Object}       要发送的消数据
  */
  trigger: function(name, data) {
    var noticer = this['on' + name];
    if (noticer) {
      return noticer.trigger(data);
    }
    return 0;
  },
  
  /**
  * @func trigger_with_event 通知事监听器
  * @arg name {String}       事件名称
  * @arg event {Event}       Event 
  */
  trigger_with_event: function(name, event) {
    var noticer = this['on' + name];
    if (noticer) {
      return noticer.trigger_with_event(event);
    }
    return 0;
  },
  
});

/**
 * @fun init_events # init event delegate
 * @arg self     {Object} 
 * @arg argus... {String}  event name
 */
function init_events(self) {
  var args = Array.toArray(arguments);
  for (var i = 1, name; (name = args[i]); i++) {
    self['on' + name] = new EventNoticer(name, self);
  }
};

/**
 * @func all_noticer # Get all event noticer
 * @arg Notification {Notification}
 * @ret {Array}
 */
function all_noticer(notification) {
  var result = [];
  var reg = /^on/;
  
  for ( var i in notification ) {
    if ( reg.test(i) ) {
      var noticer = notification[i];
      if ( noticer instanceof EventNoticer ) {
        result.push(noticer);
      }
    }
  }
  return result;
}

exports.Event = Event;
exports.EventNoticer = EventNoticer;
exports.Notification = Notification;
exports.init_events = init_events;
exports.all_noticer = all_noticer;
