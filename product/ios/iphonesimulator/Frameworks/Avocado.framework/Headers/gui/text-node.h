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

#ifndef __avocado__gui__text_node__
#define __avocado__gui__text_node__

#include "span.h"

/**
 * @ns avocado::gui
 */

av_gui_begin

/**
 * @class TextNode
 */
class AV_EXPORT TextNode: public Span {
public:
  av_def_gui_view(TEXT_NODE, TextNode, text_node);
  
  TextNode();
  
  /**
   * @overwrite
   */
  virtual void prepend(View* child) av_def_err;
  virtual void append(View* child) av_def_err;
  virtual View* append_text(cUcs2String& str) av_def_err;
  virtual void remove_all_child();
  virtual Vec2 layout_offset();
  virtual bool overlap_test(Vec2 point);
  virtual CGRect screen_rect();
  
  /**
   * @get value
   */
  inline Ucs2String value() const { return m_data.string; }
  
  /**
   * @set value
   */
  void set_value(cUcs2String& str);
  
  /**
   * @get length {uint}
   */
  inline uint length() const { return m_data.string.length(); }
  
  /**
   * @get cells
   */
  inline const Array<Cell>& cells() const { return m_data.cells; }
  
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
  virtual void accept_text(Ucs2StringBuilder& output) const;
  virtual void set_offset_in_hybrid(TextRows* rows, Vec2 limit, Hybrid* hybrid);
  virtual void set_layout_three_times(bool horizontal, bool hybrid);
  
  /**
   * @func set_visible_draw
   */
  virtual void set_visible_draw();
  
private:
  
  Data  m_data;
  bool  m_valid_layout_offset;
  Vec2  m_final_vertex[4];      // 最终在屏幕上显示的真实顶点位置
  av_def_inl_cls(Inl);
};

av_gui_end
#endif
