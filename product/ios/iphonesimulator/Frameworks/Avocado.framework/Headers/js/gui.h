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

#ifndef __avocado__ajs__gui__
#define __avocado__ajs__gui__

#include "js.h"
#include "Avocado/gui/app.h"
#include "Avocado/gui/value.h"
#include "Avocado/gui/view.h"
#include "Avocado/gui/bezier.h"

/**
 * @ns avocado::ajs::gui
 */

ajs_ns(gui)

using namespace avocado::gui;
using namespace avocado::gui::value;

#define ajs_check_gui_app() if ( ! app() ) { \
  ajs_worker(args); ajs_throw_err("Need to create a `new GUIApplication()`"); }

#define ajs_gui_parse_value(cls, name, value, desc) \
  cls out; \
  if ( ! worker->gui_value_program()->parse_##name(value, out, desc)) \
  { return;/*ajs_throw_err("Bad argument.");*/ }

#define ajs_throw_value_err(value, msg, ...)\
  worker->gui_value_program()->throw_error(t, msg, ##__VA_ARGS__)
  

// ------------- values -------------

#define ajs_gui_values(F) \
F(text_align, TextAlign)    F(align, Align)             F(content_align, ContentAlign)  \
F(border, Border)           F(shadow, ShadowValue)      F(color, Color) \
F(vec2, Vec2)               F(vec3, Vec3)               F(vec4, Vec4) \
F(rect, CGRect)             F(mat, Mat)                 F(mat4, Mat4) \
F(value, Value)             F(text_color, TextColor)    F(text_size, TextSize)  \
F(text_family, TextFamily)  F(text_style, TextStyle)    F(text_shadow, TextShadow)  \
F(text_line_height, TextLineHeight)                     F(text_decoration, TextDecoration) \
F(repeat, Repeat)           F(curve, Curve) F(direction, Direction) \
F(string, String)           F(bool, bool)               F(text_overflow, TextOverflow) \
F(text_white_space, TextWhiteSpace)                     F(keyboard_type, KeyboardType)  \
F(keyboard_return_type, KeyboardReturnType)

/**
 * @class ValueProgram
 */
class AV_EXPORT ValueProgram: public Object {
public:
#define def_attr_fn(name, Class)              \
  Local<JSValue> New(const Class & value);  \
  bool parse_##name(Local<JSValue> in, Class& out, cchar* err_msg); \
  bool is_##name(Local<JSValue> value);
  
#define def_attr(name, Class) \
  Persistent<JSFunction> _constructor_##name; \
  Persistent<JSFunction> _parse_##name; \
  Persistent<JSFunction> _parse_##name##_description; \
  Persistent<JSFunction> _##name;

  ValueProgram(Worker* worker, Local<JSObject> exports, Local<JSObject> _native);
  
  virtual ~ValueProgram();
  
  ajs_gui_values(def_attr_fn);
  bool parse_values(Local<JSValue> in, Array<Value>& out, cchar* desc);
  bool parse_float_values(Local<JSValue> in, Array<float>& out, cchar* desc);
  bool is_base(Local<JSValue> value);
  
  void throw_error(Local<JSValue> value, cchar* msg,
                   Local<JSFunction> more_msg = Local<JSFunction>());
  
private:
  ajs_gui_values(def_attr)
  Worker* worker;
  Persistent<JSFunction> _border_rgba;
  Persistent<JSFunction> _shadow_rgba;
  Persistent<JSFunction> _text_color_rgba;
  Persistent<JSFunction> _text_shadow_rgba;
  Persistent<JSFunction> _parse_values;
  Persistent<JSFunction> _parse_float_values;
  Persistent<JSFunction> _is_base;
  #undef def_attr_fn
  #undef def_attr
};

/**
 * @class ViewUtil
 */
class AV_EXPORT ViewUtil {
public:
  
  /**
   * @func inherit_text_font
   */
  static void inherit_text_font(Local<JSClass> cls, Worker* worker);
  
  /**
   * @func inherit_text_layout
   */
  static void inherit_text_layout(Local<JSClass> cls, Worker* worker);
  
  /**
   * @func inherit_scroll
   */
  static void inherit_scroll(Local<JSClass> cls, Worker* worker);
  
  /**
   * @func add_event_listener
   */
  static bool add_event_listener(Wrap<View>* wrap, cString& name, cString& func, int id);
  
  /**
   * @func remove_event_listener
   */
  static bool remove_event_listener(Wrap<View>* wrap, cString& name, int id);
  
  /**
   * @func add_event_listener
   */
  static bool add_event_listener(Wrap<View>* wrap, const GUIEventName& name, cString& func, int id);

  /**
   * @func remove_event_listener
   */
  static bool remove_event_listener(Wrap<View>* wrap, const GUIEventName& name, int id);
  
  /**
   * @func panel_add_event_listener
   */
  static bool panel_add_event_listener(Wrap<View>* wrap, cString& name, cString& func, int id);
  
  /**
   * @func panel_remove_event_listener
   */
  static bool panel_remove_event_listener(Wrap<View>* wrap, cString& name, int id);
  
};

/**
 * @class BasicWrapView
 */
class AV_EXPORT BasicWrapView: public WrapObject {
public:
  
  /**
   * @func overwrite
   */
  virtual bool add_event_listener(cString& name, cString& func, int id) {
    return ViewUtil::add_event_listener(reinterpret_cast<Wrap<View>*>(this), name, func, id);
  }
  
  /**
   * @func overwrite
   */
  virtual bool remove_event_listener(cString& name, int id) {
    return ViewUtil::remove_event_listener(reinterpret_cast<Wrap<View>*>(this), name, id);
  }
  
};

ajs_nsd
#endif
