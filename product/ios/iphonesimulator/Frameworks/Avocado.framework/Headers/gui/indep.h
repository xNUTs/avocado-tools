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

#ifndef __avocado__gui__indep__
#define __avocado__gui__indep__

#include "div.h"

av_gui_begin

/**
 * @class Indep
 */
class AV_EXPORT Indep: public Div {
public:
  av_def_gui_view(INDEP, Indep, indep);
  
  Indep();
  
  /**
   * @func align_x
   */
  inline Align align_x() const { return m_align_x; };
  
  /**
   * @func align_y
   */
  inline Align align_y() const { return m_align_y; };
  
  /**
   * @func set_align
   */
  void set_align(Align x, Align y);
  
  /**
   * @func set_align_x
   */
  void set_align_x(Align value);
  
  /**
   * @func set_align_y
   */
  void set_align_y(Align value);
  
  /**
   * @overwrite
   */
  virtual Vec2 layout_offset();
  
protected:
  
  /**
   * @overwrite
   */
  virtual void set_parent(View* parent) av_def_err;
  virtual void set_layout_explicit_size();
  virtual void set_layout_content_offset();
  virtual Box* set_offset_horizontal(Box* prev, Vec2& squeeze, float limit, Div* div);
  virtual Box* set_offset_vertical(Box* prev, Vec2& squeeze, float limit, Div* div);
  virtual void set_offset_in_hybrid(TextRows* rows, Vec2 limit, Hybrid* hybrid);
  virtual void set_layout_three_times(bool horizontal, bool hybrid);
  
private:
  
  Align m_align_x, m_align_y;
  
  av_def_inl_cls(_Inl);
};


av_gui_end
#endif
