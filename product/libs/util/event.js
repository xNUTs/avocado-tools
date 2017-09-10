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
export binding('_event');

const EventNoticer = exports.EventNoticer;

/**
 * @class Notification
 */
export class Notification {
  
  /**
   * @func $get_noticer
   */
  $get_noticer(name) {
    var noticer = this['__on' + name];
    if ( ! noticer ) {
      noticer = new EventNoticer(name, this);
      this['__on' + name] = noticer;
    }
    return noticer;
  }
  
  /**
   * @func $add_default_listener
   */
  $add_default_listener(name, func) {
    
    if ( typeof func == 'string' ) {
      var func2 = this[func]; // find func 
      
      if ( typeof func2 == 'function' ) {
        return this.$get_noticer(name).on(func2, 0); // default id 0
      } else {
        throw util.err(`Cannot find a function named "${func}"`);
      }
    } else {
      return this.$get_noticer(name).on(func, 0); // default id 0
    }
  }
  
	/**
  * @func trigger 通知事监听器
  * @arg name {String}       事件名称
  * @arg data {Object}       要发送的消数据
  */
  trigger(name, data) {
    var noticer = this['__on' + name];
    if (noticer) {
      return noticer.trigger(data);
    }
    return 0;
  }
  
	/**
  * @func trigger_with_event 通知事监听器
  * @arg name {String}       事件名称
  * @arg event {Event}       Event 
  */
  trigger_with_event(name, event) {
    var noticer = this['__on' + name];
    if (noticer) {
      return noticer.trigger_with_event(event);
    }
    return 0;
  }

  /**
   * @func $trigger(name, unknown_event, is_event)
   */
  $trigger(name, unknown_event, is_event) {
    var noticer = this['__on' + name];
    if (noticer) {
      return noticer.$trigger(unknown_event, is_event);
    }
    return 0;
  }
}

/**
 * @class NativeNotification
 */
export class NativeNotification extends Notification {
  
  /**
   * @overwrite
   */
  $get_noticer(name) {
    var noticer = this['__on' + name];
    if ( ! noticer ) {
      // bind native event
      var trigger = this['trigger_' + name];
      if ( trigger ) {
        // bind native
        util.add_native_event_listener(this, name, (evt, is_event) => {
          // native event
          //console.log('util.add_native_event_listener', name);
          var ok = trigger.call(this, evt, is_event);
          //console.log('util.add_native_event_listener', name, ok, String(trigger));
          return ok;
        }, -1);
      } else {
        // bind native
        util.add_native_event_listener(this, name, (evt, is_event) => {
          // native event
          return is_event ? noticer.trigger_with_event(evt) : noticer.trigger(evt);
        }, -1);
      }
      this['__on' + name] = noticer = new EventNoticer(name, this);
    }
    return noticer;
  }
  
}

/**
 * @func all_noticer # Get all event noticer
 * @arg notification {Notification}
 * @ret {Array}
 */
export function all_noticer(notification) {
  var result = [];
  var reg = /^__on/;

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

/**
 * @func off_noticer 卸载notification上所有与scope相关的侦听器
 * @arg notification {Notification}
 * @arg scope {Object}
 */
export function off_noticer(notification, scope) {
  for ( let noticer of exports.all_noticer(notification) ) {
    noticer.off(scope);
  }
}

