/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright © 2015-2016, xuewen.chu
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

import ':util';
import { 
  EventNoticer, NativeNotification,
} from ':util/event';

var gui = binding('_gui');
var View = gui.View;

function remove_data_bind(self, id, obj) {
  delete obj.__bind_id;
  self.onvdata_change.off(id);
}

function add_view_data_bind(self, view) {
  if ( view.__bind_id ) return;
  
  var id = util.iid();
  view.__bind_id = id;

  if ( !view.__bind ) {
    view.__bind = { 
      attrs: [ /* { names, vx } */ ], 
      full_type: 0,  // full_type: 0 inner text | 1 view | 2 ctr.view
      full_vx: null, // full data bind
    };
  }
  
  view.onremove_view.once(function() {
    remove_data_bind(self, id, view);
  });
  
  self.onvdata_change.on2(function(view) {
    var bind = view.__bind;
    var full_vx = bind.full_vx;
    
    if (full_vx) { // full bind
      if (bind.full_type == 1) { // replace view
        var next = view.next;
        var parent = view.parent;
        view.remove(); // Delete first Avoid ID repeats
        exec_full_data_bind(self, parent, next, full_vx);
        
      } else if (full.full_type == 2) { // replace ctr.view
        var value = full_vx.exec(self.m_vdata, self); // 数据绑定返回的数据必须都为元数据
        let view = new value.__tag__();
        self.view = view;
        load_view(self, view, value);
        add_view_full_data_bind(self, view, 2, full_vx); // 
        
      } else { // replace inner text string
        view.inner_text = full_vx.exec(self.m_vdata, self);
      }
    } else { // attributes bind
      bind.attrs.forEach(function(item) {
        var target = view;
        for (var i = 0, l = item.names.length - 1; i < l; i++) {
          target = target[names[i]];
        }
        target[item.names[item.names.length - 1]] = 
          item.vx.exec(self.m_vdata, self);
      });
    }
  }, view, id);
}

function add_subctr_data_bind(self, subctr) {
  if ( subctr._bind_id ) return;

  var id = util.iid();
  subctr.__bind_id = id;

  if ( !subctr.__bind ) {
    subctr.__bind = { 
      attrs: [ /* { names, vx } */ ], 
      full_vx: null, // full data bind
    };
  }

  // listener view data change event
  self.onvdata_change.on2(function(subctr) {
    var view = subctr.view; // 没有视图的控制器无效
    if ( view && subctr.parent !== self ) {
      var bind = subctr.__bind;
      var full_vx = bind.full_vx;

      if (full_vx) {
        var next = view.next;
        var parent = view.parent;
        view.remove(); // 删除这个视图,原控制器也会失效
        exec_full_data_bind(self, parent, next, full_vx);
      } else {
        // set view controller attributes
        bind.attrs.forEach(function(item) {
          var target = subctr;
          for (var i = 0, l = item.names.length - 1; i < l; i++) {
            target = target[names[i]];
          }
          target[item.names[item.names.length - 1]] = 
            item.value.exec(self.m_vdata, self);
        });
      }
    } else { // delete data bind
      remove_data_bind(self, id, subctr);
    }
  }, subctr, id);
}

function add_view_full_data_bind(self, view, type, vx) {
  add_view_data_bind(self, view);
  view.__bind.full_type = type;
  view.__bind.full_vx = vx;
}

function add_subctr_full_data_bind(self, subctr, vx) {
  add_subctr_data_bind(self, subctr);
  subctr.__bind.full_vx = vx;
}

function set_attrbute(self, obj, name, value, add_data_bind) {
  var i = name.indexOf('.');
  if ( i == -1 ) {
    if (value instanceof __bind) {
      obj[name] = value.exec(self.m_vdata, self);
      if ( ! value.once ) { // Multiple bind
        add_data_bind(self, obj);
        obj._attrs_bind.push({ names: [name], vx: value });
      }
    } else {
      obj[name] = value;
    }
  } else {
    var names = [];
    var prev = 0;
    var target = obj;
    do {
      var n = name.substr(prev, i);
      names.push( n );
      target = target[n];
      prev = i + 1;
      i = name.indexOf('.', prev);
    } while( i != -1 );
    
    name = name.substr(prev); 
    names.push(name);
    
    if (value instanceof __bind) {
      target[name] = value.exec(self.m_vdata, self);
      if ( ! value.once ) { // Multiple bind
        add_data_bind(self, obj);
        obj._attrs_bind.push({ names: names, vx: value });
      }
    } else {
      target[name] = value;
    }
  }
}

function exec_full_data_bind(self, parent, next, vx) {
  // The data returned from the data binding must all be metadata
  var vx2 = vx.exec(self.m_vdata, self); // 数据绑定返回的数据必须都为元数据

  if (vx2 && vx2.__tag__) { // tag
    var obj = new vx2.__tag__();
    if (obj instanceof ViewController) { // ctr
      load_subctr(self, obj, vx2, parent, next);
      add_subctr_full_data_bind(self, obj, vx);
    } else { // view
      if (next) {
        next.before(obj);
      } else {
        obj.append_to(parent);
      }
      load_view(self, obj, vx2);
      add_view_full_data_bind(self, obj, 1, vx); 
    }
  } else { // string append text
    var view = parent.append_text(vx2);
    if (view) {
      if ( next ) {
        next.before(view); // Right position
      }
      add_view_full_data_bind(self, view, 1, vx);
    } else {
      add_view_full_data_bind(self, parent, 0, vx); // replace inner text
    }
  }
}

// empty view xml
export const empty_view_xml = { __tag__:View,__child__:[] };

// Is empty view xml
export function is_empty_view_xml(vx) {
  return vx === empty_view_xml;
}

export const empty = empty_view_xml;
export const is_empty = is_empty_view_xml;

function load_subctr(self, subctr, vx, parent, next) {

  // Priority setting
  if ( 'message' in vx ) {
    set_attrbute(self, subctr, 'message', vx.message, add_subctr_data_bind);
  }
  if ( 'vdata' in vx ) {
    set_attrbute(self, subctr, 'vdata', vx.vdata, add_subctr_data_bind);
  }
  
  if ( vx.__child__.length ) {
    subctr.load_view(...(vx.__child__));
  } else {
    subctr.load_view(empty_view_xml);
  }
  
  var view = subctr.view;

  if ( !view ) {
    subctr.view = view = new View();
  }

  //console.log('next.before(subctr.view);', !!next, !!parent);

  if ( next ) {
    next.before(view);
  } else {
    view.append_to(parent);
  }

  var ignore = { vdata: 1, message: 1 };
  
  for (var name in vx) {
    if ( !(name in ignore) ) {
      set_attrbute(self, subctr, name, vx[name], add_subctr_data_bind);
    }
  }
}

function load_view(self, view, vx) {
  
  for ( var name in vx ) {
    set_attrbute(self, view, name, vx[name], add_view_data_bind);
  }
  
  for (var ch of vx.__child__) {
    if (ch instanceof __bind) {
      exec_full_data_bind(self, view, null, ch);
    } 
    else if (ch && ch.__tag__) { // tag
      let obj = new ch.__tag__();
      if (obj instanceof ViewController) {
        load_subctr(self, obj, ch, view, null);
      } else { // view
        obj.append_to(view);
        load_view(self, obj, ch);
      }
    } else { // string
      view.append_text(ch);
    }
  }
}

// -------------------- no ctr ----------------------

function set_attrbute_no_ctr(obj, name, value) {
  var i = name.indexOf('.');
  if ( i == -1 ) {
    util.assert( !(value instanceof __bind), 'Bad argument. Cannot bind data' );
    obj[name] = value;
  } else {
    var names = [];
    var prev = 0;
    var target = obj;
    do {
      var n = name.substr(prev, i);
      names.push( n );
      target = target[n];
      prev = i + 1;
      i = name.indexOf('.', prev);
    } while( i != -1 );
      
    name = name.substr(prev);
    names.push(name);
    
    util.assert( !(value instanceof __bind), 'Bad argument. Cannot bind data' );
    
    target[name] = value;
  }
}

function load_subctr_no_ctr(subctr, vx, parent) {
  if ( 'vdata' in vx ) {
    set_attrbute_no_ctr(subctr, 'vdata', vx.vdata);
  }
  
  if ( vx.__child__.length ) {
    subctr.load_view(...(vx.__child__));
  } else {
    subctr.load_view(empty_view_xml);
  }

  var view = subctr.view;
  
  if ( !view ) {
    subctr.view = view = new View();
  }

  if ( parent ) {
    view.append_to(parent);
  }
  
  for (var name in vx) {
    if ( name != 'vdata' ) {
      set_attrbute_no_ctr(subctr, name, vx[name]);
    }
  }
}

function load_view_no_ctr(view, vx) {
  
  for ( var name in vx ) {
    set_attrbute_no_ctr(view, name, vx[name]);
  }
  
  for (var ch of vx.__child__) {
    util.assert( !(ch instanceof __bind), 'Bad argument. Cannot bind data' );
    
    if (ch && ch.__tag__) { // tag
      let obj = new ch.__tag__();
      if (obj instanceof ViewController) {
        load_subctr_no_ctr(obj, ch, view);
      } else { // view
        obj.append_to(view);
        load_view_no_ctr(obj, ch);
      }
    } else { // string
      view.append_text(ch);
    }
  }
}

/**
 * @func New(vx[,parent[,...args]]) view or view controller with vx data
 * @func New(vx[,...args])
 * @arg vx {Object}
 * @arg [parent] {View}
 * @arg [...args]
 * @ret {View|ViewController}
 */
export function New(vx, parent, ...args) {
  util.assert(vx instanceof Object, 'Bad argument.');
  
  if ( vx.__tag__ ) {
    
    if ( parent ) {
      if ( !(parent instanceof View) ) {
        args.unshift(parent);
        parent = null;
      }
    }
  
    var rv = new vx.__tag__(...args);
    var ctr = null;
    
    if ( parent ) {
      ctr = parent.ctr;
      if ( !ctr ) {
        if ( parent.top ) {
          ctr = parent.top.ctr;
        }
      }
    }
    
    if ( rv instanceof View ) {
      if ( parent ) {
        rv.append_to(parent);
      }
      if ( ctr ) {
        load_view(ctr, rv, vx);
      } else {
        load_view_no_ctr(rv, vx);
      }
      return rv;
      
    } else if ( rv instanceof ViewController ) {
      if ( ctr ) {
        load_subctr(ctr, rv, vx, parent, null);
      } else {
        load_subctr_no_ctr(rv, vx, parent);
      }
      
      return rv;
    }
  }
  
  throw new Error('Bad argument.');
}

 /**
  * @class NativeViewController
  * 
  * @get parent {ViewController}
  * 
  * @get,set view {View}
  *
  * @get,set id {uint}
  * 
  * @func find(id)
  * @arg id {String}
  * @ret {View|ViewController)
  *
  * @func remove()
  * 
  * @end
  */

/**
 * @class ViewController
 * @bases NativeViewController
 */
export class ViewController extends gui.NativeViewController {

  m_message: null;
  m_vdata: null; // 视图数据
  m_proxys: null;
  set __tag__(v) { /*noop*/ }
  set __child__(v) { /*noop*/ }

  /**
   * @event onvdata_change
   */
  event onvdata_change;
  
  /**
   * @event onload_view
   */
  event onload_view;
  
  /**
   * @event onremove_view
   */
  event onremove_view;
  
  /* proxy events */
  event onback;
  event onclick;
  event ontouchstart;
  event ontouchmove;
  event ontouchend;
  event ontouchcancel;
  event onkeydown;
  event onkeypress;
  event onkeyup;
  event onkeyenter;
  event onfocus;
  event onblur;
  event onhighlighted;
  event onsfocus_move;
  event onscroll;  
  event onaction_keyframe;
  event onaction_loop;
  event onwait_buffer; // player
  event onready;
  event onstart_play;
  event onerror;
  event onsource_eof;
  event onpause;
  event onresume;
  event onstop;
  event onseek;

  /**
   * @get message {Object}
   */
  get message() { 
    var message = this.m_message;
    if ( !message ) {
      this.m_message = message = { };
    }
    return message;
  }

  /**
   * @get vdata {Object}
   */
  get vdata() { return this.m_vdata }

  /**
   * @set message {Object}
   */
  set message(value) {
    util.extend(this.message, value);
  }
  
  /**
   * @set set vdata {Object}
   */
  set vdata(value) {
    if (typeof value == 'object') {
      util.extend(this.m_vdata, value);
      this.trigger_vdata_change();
    }
  }

  /**
   * @get view {View}
   */
  get view() { return super.view }

  /**
   * @set view {View}
   */
  set view(value) { 
    super.view = value;

    if ( this.__bind ) {
      if ( !this.__bind_id ) { // reset bind
        var parent = this.parent;
        if ( parent ) {
          add_subctr_data_bind(parent, this);
        }
      }
    }
  }

  /**
   * @constructor([msg])
   * @arg [msg] {Object}
   */
  constructor(msg) { 
    super();
    if ( msg ) {
      this.m_message = util.wrap(msg);
    }
    this.m_vdata = { };
  }
  
  /**
   * @func load_view(vx)
   * @arg vx {Object}
   */
  load_view(vx) {
    var view;

    if ( vx instanceof __bind ) {
      var vx2 = vx.exec(this.m_vdata, this); // 数据绑定返回的数据必须都为元数据
      view = new vx2.__tag__(); // 第一层必须为View
      this.view = view;
      load_view(this, view, vx2);
      if ( ! vx.once ) { // Multiple bind
        add_view_full_data_bind(this, view, 2, vx); // 
      }
    } else {
      view = new vx.__tag__(); // 第一层必须为View
      this.view = view;
      load_view(this, view, vx);
    }

    // Reset proxy
    var proxys = this.m_proxys;
    if (proxys) { // unbind proxys
      for ( var name in proxys ) {
        add_proxy_event(this, name, self['__on' + name]);
      }
    }

    this.trigger_load_view();
  }

  /**
   * @get action {Action}
   */
  get action() { // get action object
    return this.view.action; 
  }
  
  /**
   * @set action {Action}
   */
  set action(value) { // set action
    this.view.action = value;
  }

  /**
   * @func transition(style[,delay[,cb]][,cb])
   * @arg style {Object}
   * @arg [delay] {uint} ms
   * @arg [cb] {Funcion}
   */
  transition(style, delay, cb) { // transition animate
    this.view.transition(style, delay, cb);
  }
  
  /**
   * @func show()
   */
  show() {
    this.view.show();
  }
  
  /**
   * @func show()
   */
  hide() {
    this.view.hide();
  }
  
  /**
   * @get class {Object}
   */
  get 'class'() { return this.view.class; }
  
  /**
   * @set class {String}
   */
  set 'class'(value) { this.view.class = value; }
  
  /**
   * @func add_class(name)
   * @arg name {String}
   */
  add_class(name) { this.view.add_class(name); }
  
  /**
   * @func remove_class(name)
   * @arg name {String}
   */
  remove_class(name) { this.view.remove_class(name); }
  
  /**
   * @func toggle_class(name)
   * @arg name {String}
   */
  toggle_class(name) { this.view.toggle_class(name); }
  
  /**
   * @get style {Object}
   */
  get style() { return this.view.style; }

  /**
   * @get style {Object}
   */
  set style(value) { this.view.style = value; }
  
  /**
   * @get visible {bool}
   */
  get visible() { return this.view.visible; }
  
  /**
   * @get visible {bool}
   */
  set visible(value) { this.view.visible = value; }
  
  /**
   * @get receive {bool}
   */
  get receive() { return this.view.receive; }
  
  /**
   * @get receive {bool}
   */
  set receive(value) { this.view.receive = value; }
  
  /**
   * @overwrite native call
   */
  trigger_remove_view(view) {
    util.assert(this.view === view);

    // remove bind
    var id = this.__bind_id;
    if ( id ) {
      remove_data_bind(this.parent, id, this);
    }
    
    // unbind proxys
    var proxys = this.m_proxys;
    if (proxys) { 
      for ( var name in proxys ) {
        var id = proxys[name];
        if (id > 0) {
          view.off(name, id);
        }
        proxys[name] = 0;
      }
    }
    
    this.trigger('remove_view', view);
  }

}

const proxy_events_table = {
  keydown: 1, keypress: 1, keyup: 1, keyenter: 1, back: 1, click: 1,
  touchstart: 1, touchmove: 1, touchend: 1, touchcancel: 1,
  focus: 1, blur: 1, highlighted: 1, focus_move: 1, scroll: 1,
  action_keyframe: 1, action_loop: 1,
  wait_buffer: 1, ready: 1, start_play: 1, error: 1,
  source_eof: 1, pause: 1, resume: 1, stop: 1, seek: 1,
};

function add_proxy_event(self, noticer, name) {

  if ( name in proxy_events_table ) { // proxy event
    var proxys = self.m_proxys;
    if (!proxys) {
      self.m_proxys = proxys = { };
    }

    var view = self.view;
    util.assert(view, 'View not found');

    if ( 'on' + name in view ) { // 
      if ( !noticer ) {
        self['__on' + name] = noticer = new EventNoticer(name, this);
      }

      var trigger = self['trigger_' + name];
      
      proxys[name] = view.on(name, (evt) => {
        var origin_noticer = evt.m_noticer;
        trigger.call(self, evt, 1);
        evt.m_noticer = origin_noticer;
      });

      return noticer;
    } else {
      proxys[name] = -1;
    }
  }
}

/**
 * @class ViewControllerNotification
 */
class ViewControllerNotification extends NativeNotification {
  
  // protected:
  /**
   * @overwrite
   */
  $get_noticer(name) {
    
    var noticer = this['__on' + name];
    if ( ! noticer ) {
      // bind native event

      noticer = add_proxy_event(this, noticer, name);
      if ( noticer ) {
        return noticer;
      }

      var trigger = this['trigger_' + name];
      
      // bind native event
      if ( trigger ) {
        // bind native
        util.add_native_event_listener(this, name, (evt, is_event) => {
          // native event
          return trigger.call(this, evt, is_event);
        }, -1);
      } else {
        // bind native
        util.add_native_event_listener(this, name, (evt, is_event) => {
          // native event
          return is_event ? noticer.trigger_with_event(evt) : noticer.trigger(evt);
        }, -1);
      }
      this['__on' + name] = noticer = new EventNoticer(name, this);
    } else {
      var proxys = this.m_proxys;
      if ( proxys && proxys[name] ) {
        return noticer;
      }
      add_proxy_event(this, noticer, name);
    }
    return noticer;
  }

  /**
   * @overwrite
   */
  $add_default_listener(name, func) {
    
    if ( typeof func == 'string' ) {
      var ctr = this, func2;
      
      while (ctr) {
        func2 = ctr[func];  // find func
        if ( typeof func2 == 'function' ) {
          return this.$get_noticer(name).on(func2, ctr, 0); // default id 0
        }
        ctr = ctr.parent;
      }
      throw util.err(`Cannot find a function named "${func}"`);
    } else {
      return this.$get_noticer(name).on(func, 0); // default id 0
    }
  }
  
}

util.ext_class(ViewController, ViewControllerNotification);
