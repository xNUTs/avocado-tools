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

#ifndef __avocado__gui__label__
#define __avocado__gui__label__

#include "view.h"
#include "value.h"
#include "text-font.h"
#include "font.h"

/**
 * @ns avocado::gui
 */

av_gui_begin

/**
 * @class Label
 */
class AV_EXPORT Label: public View, public TextFont {
public:
  av_def_gui_view(LABEL, Label, label);
  
  typedef ReferenceTraits Traits;
  
  Label();
  
  /**
   * @overwrite
   */
  virtual void prepend(View* child) av_def_err;
  virtual void append(View* child) av_def_err;
  virtual View* append_text(cUcs2String& str) av_def_err;
  virtual TextFont* as_text_font() { return this; }
  virtual void remove_all_child();
  virtual View* view() { return this; }
  virtual CGRect screen_rect();
  virtual bool overlap_test(Vec2 point);
  
  /**
   * @func value
   */
  Ucs2String value() const { return m_data.string; }
  
  /**
   * @func set_value
   */
  void set_value(cUcs2String& str);
  
  /**
   * @func length
   */
  inline uint length() const { return m_data.string.length(); }
  
  /**
   * @func cells
   */
  inline const Array<Cell>& cells() const { return m_data.cells; }
  
  /**
   * @func text_align
   */
  inline TextAlign text_align() const { return m_text_align; }
  
  /**
   * @func set_text_align
   */
  void set_text_align(TextAlign value);
  
  /**
   * @func text_hori_bearing
   */
  inline float text_hori_bearing() const { return m_data.text_hori_bearing; }
  
  /**
   * @func text_height
   */
  inline float text_height() const { return m_data.text_height; }
  
protected:
  
  /**
   * @overwrite
   */
  virtual void draw(Draw* draw);
  virtual void mark_text(uint value);
  virtual void accept_text(Ucs2StringBuilder& out) const;
  virtual void set_visible_draw();
  virtual void set_parent(View* parent) av_def_err;
  
private:
  
  Data        m_data;
  TextAlign   m_text_align;
  Vec2        m_box_size;
  float       m_box_offset_start;
  Vec2        m_final_vertex[4];  // 最终在屏幕上显示的真实顶点位置
  
  av_def_inl_cls(Inl);
};

av_gui_end
#endif
