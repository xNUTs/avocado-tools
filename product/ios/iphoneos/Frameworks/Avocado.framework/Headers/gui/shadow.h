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

#ifndef __avocado__gui__shadow__
#define __avocado__gui__shadow__

#include "div.h"

/**
 * @ns avocado::gui
 */

av_gui_begin

/**
 * @class Shadow
 */
class AV_EXPORT Shadow: public Div {
public:
  av_def_gui_view(SHADOW, Shadow, shadow);
  
  Shadow();
  
  /**
   * @func shadow_offset_x
   */
  inline float shadow_offset_x() const { return m_shadow.offset_x; }
  
  /**
   * @func set_shadow_offset_x
   */
  void set_shadow_offset_x(float value);
  
  /**
   * @func shadow_offset_y
   */
  inline float shadow_offset_y() const { return m_shadow.offset_y; }
  
  /**
   * @func set_shadow_offset_y
   */
  void set_shadow_offset_y(float value);
  
  /**
   * @func shadow_size
   */
  inline float shadow_size() const { return m_shadow.size; }
  
  /**
   * @func shadow_size
   */
  void set_shadow_size(float value);
  
  /**
   * @func shadow_color
   */
  inline Color shadow_color() const { return m_shadow.color; }
  
  /**
   * @func shadow_color
   */
  void set_shadow_color(Color value);
  
  /**
   * @func shadow
   */
  inline ShadowValue shadow() const { return m_shadow; }
  
  /**
   * @func set_shadow_value
   */
  void set_shadow(ShadowValue value);
  
protected:
  
  /**
   * @overwrite
   */
  virtual void draw(Draw* draw);
  
private:
  
  bool        m_is_draw_shadow_box;
  ShadowValue m_shadow;
};

av_gui_end
#endif
