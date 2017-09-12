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

#ifndef __avocado__gui__css__
#define __avocado__gui__css__

#include "Avocado/util/util.h"
#include "Avocado/util/map.h"
#include "Avocado/util/string.h"
#include "Avocado/util/list.h"
#include "property.h"
#include "value.h"
#include "action.h"

av_gui_begin

class StyleSheets;
class CSSViewClasss;
class StyleSheetsScope;
class CSSManager;

enum CSSPseudoClass { // pseudo class
  CSS_PSEUDO_CLASS_NONE = 0,
  CSS_PSEUDO_CLASS_NORMAL,
  CSS_PSEUDO_CLASS_HOVER,
  CSS_PSEUDO_CLASS_DOWN,
};

class AV_EXPORT CSSName {
public:
  CSSName(const Array<String>& classs);
  CSSName(cString& name);
  inline String value() const { return m_name; }
  inline uint hash() const { return m_hash; }
private:
  String m_name;
  uint   m_hash;
};

/**
 * @class StyleSheets
 */
class AV_EXPORT StyleSheets: public Object {
  av_hidden_all_copy(StyleSheets);
protected:
  
  StyleSheets(const CSSName& name,
              StyleSheets* parent, CSSPseudoClass pseudo);
  
  /**
   * @destructor
   */
  virtual ~StyleSheets();
  
public:
  
  typedef KeyframeAction::Frame Frame;
  
  class AV_EXPORT Property {
  public:
    virtual ~Property() { }
    virtual void assignment(View* view) = 0;
    virtual void assignment(Frame* frame) = 0;
  };
  
  // -------------------- set property --------------------
  
#define av_def_property(ENUM, TYPE, NAME) void set_##NAME(TYPE value);
  av_each_property_table(av_def_property)
#undef av_def_property
  
  void set_translate(Vec2 value) { set_x(value.x()); set_y(value.y()); }
  void set_scale(Vec2 value) { set_scale_x(value.x()); set_scale_y(value.y()); }
  void set_skew(Vec2 value) { set_skew_x(value.x()); set_skew_y(value.y()); }
  void set_origin(Vec2 value) { set_origin_x(value.x()); set_origin_y(value.y()); }
  void set_start(Vec2 value) { set_start_x(value.x()); set_start_y(value.y()); }
  void set_ratio(Vec2 value) { set_ratio_x(value.x()); set_ratio_y(value.y()); }
  // void set_align(Align value) { set_align_x(value); set_align_y(value); }
  void set_margin(Value value);
  void set_border(Border value);
  void set_border_width(float value);
  void set_border_color(Color value);
  void set_border_radius(float value);
  void set_min_width(Value value) { set_width(value); }
  void set_min_height(Value value) { set_height(value); }
  
  /**
   * @func time
   */
  inline uint64 time() const { return m_time; }
  
  /**
   * @func set_time
   */
  inline void set_time(uint64 value) { m_time = value; }
  
  /**
   * @func name
   */
  inline String name() const { return m_css_name.value(); }
  
  /**
   * @func hash
   */
  inline uint hash() const { return m_css_name.hash(); }
  
  /**
   * @func parent
   */
  inline StyleSheets* parent() { return m_parent; }
  
  /**
   * @func normal
   */
  inline StyleSheets* normal() { return m_child_NORMAL; }
  
  /**
   * @func normal
   */
  inline StyleSheets* hover() { return m_child_HOVER; }
  
  /**
   * @func normal
   */
  inline StyleSheets* down() { return m_child_DOWN; }
  
  /**
   * @func find children
   */
  StyleSheets* find(const CSSName& name);
  
  /**
   * @func has_child
   */
  inline bool has_child() const { return m_children.length(); }
  
  /**
   * @func assignment
   */
  void assignment(View* view);
  
  /**
   * @func assignment
   */
  void assignment(Frame* frame);
  
  /**
   * @func is_support_pseudo support multiple pseudo status
   */
  inline bool is_support_pseudo() const { return m_is_support_pseudo; }
  
  /**
   * @func pseudo
   */
  inline CSSPseudoClass pseudo() const { return m_pseudo; }
  
private:
  
  CSSName                       m_css_name;
  StyleSheets*                  m_parent;
  Map<uint, StyleSheets*>       m_children;
  Map<PropertyName, Property*>  m_property;
  uint64         m_time;
  StyleSheets*   m_child_NORMAL;
  StyleSheets*   m_child_HOVER;
  StyleSheets*   m_child_DOWN;
  bool           m_is_support_pseudo; // m_NORMAL | m_HOVER | m_DOWN
  CSSPseudoClass m_pseudo;
  
  av_def_inl_cls(Inl);
  friend class CSSManager;
};

/**
 * @class CSSViewClasss
 */
class AV_EXPORT CSSViewClasss: public Object {
  av_hidden_all_copy(CSSViewClasss);
public:
  
  CSSViewClasss(View* host);
  
  /**
   * @destructor
   */
  virtual ~CSSViewClasss();
  
  /**
   * @func name
   */
  inline const Array<String>& name() const { return m_classs; }
  
  /**
   * @func name
   */
  void name(const Array<String>& value);
  
  /**
   * @func add
   */
  void add(cString& name);
  
  /**
   * @func remove
   */
  void remove(cString& name);
  
  /**
   * @func toggle
   */
  void toggle(cString& name);
  
  /**
   * @func has_child
   */
  inline bool has_child() const { return m_child_style_sheets.length(); }
  
  /**
   * @func set_style_pseudo_status
   */
  void set_style_pseudo_status(CSSPseudoClass status);
  
  /**
   * @func apply
   */
  void apply(StyleSheetsScope* scope);
  
  /**
   * @func apply
   */
  void apply(StyleSheetsScope* scope, bool* effect_child);
  
  /**
   * @func child_style_sheets current child style sheets
   */
  inline const Array<StyleSheets*>& child_style_sheets() {
    return m_child_style_sheets;
  }
  
private:
  
  View*           m_host;
  Array<String>   m_classs;
  Array<uint>     m_query_group;
  Array<StyleSheets*> m_child_style_sheets; // 当前应用的样式表中拥有子样式表的表供后代视图查询
  bool            m_is_support_pseudo;      // 当前样式表选择器能够找到支持伪类的样式表
  bool            m_once_apply;             // 是否为第一次应用样式表,在处理动作时如果为第一次忽略动作
  CSSPseudoClass  m_multiple_status;
  
  av_def_inl_cls(Inl);
};

/**
 * @class StyleSheetsScope
 */
class AV_EXPORT StyleSheetsScope: public Object {
  av_hidden_all_copy(StyleSheetsScope);
public:
  struct AV_EXPORT Scope {
    struct Wrap {
      StyleSheets* sheets; int ref;
    };
    Wrap* wrap;
    int   ref;
  };
  StyleSheetsScope(View* scope);
  void push_scope(View* scope);
  void pop_scope();
  inline View* bottom_scope() {
    return m_scopes.length() ? m_scopes.last() : nullptr;
  }
  inline const List<Scope>& style_sheets() { return m_style_sheets; }
private:
  typedef Map<PrtKey<StyleSheets>, Scope::Wrap> StyleSheetsMap;
  List<View*>   m_scopes;
  List<Scope>   m_style_sheets;
  StyleSheetsMap  m_style_sheets_map;
};

/**
 * @class RootStyleSheets
 */
class AV_EXPORT RootStyleSheets: public StyleSheets {
public:
  
  RootStyleSheets();
  
  /**
   *  ".div_cls.div_cls2 .aa.bb.cc, .div_cls.div_cls2:down .aa.bb.cc"
   *
   * @func instances
   */
  Array<StyleSheets*> instances(cString& expression);
  
  /**
   * @func shared
   */
  static RootStyleSheets* shared();
  
private:
  
  Map<uint, int>  m_all_css_names;
  Map<uint, Array<uint>>  m_css_query_group_cache;

  av_def_inl_cls(Inl);
};

av_inline RootStyleSheets* root_styles() { 
  return RootStyleSheets::shared(); 
}

av_gui_end

#endif
