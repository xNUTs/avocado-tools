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

#ifndef __avocado__gui__draw__
#define __avocado__gui__draw__

#include "Avocado/util/array.h"
#include "Avocado/util/util.h"
#include "Avocado/util/string.h"
#include "Avocado/util/event.h"
#include "image-codec.h"
#include "mathe.h"
#include "value.h"
#include "app.h"

/**
 * @ns gui
 */

av_gui_begin

class Texture;
class TextureYUV;
class Font;
class FontGlyph;
class FontPool;
class TexturePool;

// view

class View;
class Layout;
class Box;
class Div;
class Free;
class Gradient;
class Sprite;
class Shadow;
class Limit;
class Image;
class Scroll;
class Video;
class Root;
class Sprite;
class VectorGraph;
class Hibrid;
class Text;
class TextNode;
class TextFont;
class TextLayout;
class Label;
class Clip;
class Input;
class Textarea;

/**
 * @enum DrawLibrary
 */
enum DrawLibrary {
  DRAW_LIBRARY_INVALID,
  DRAW_LIBRARY_GLES2,
  DRAW_LIBRARY_GLES3,
  DRAW_LIBRARY_GL3,
  DRAW_LIBRARY_GL4,
};

/**
 * @class DrawData
 */
class AV_EXPORT DrawData {
public:
  typedef NonObjectTraits Traits;
  virtual ~DrawData() { }
};

/**
 * @class Draw
 */
class AV_EXPORT Draw: public Object {
  av_hidden_all_copy(Draw);
public:
  
  Draw(GUIApplication* host, const Map<String, int>& option);
  
  /**
   * @destructor
   */
  virtual ~Draw();
  
  /**
   * @event onsurface_size_change 绘图表面尺寸发生变化事件
   */
  av_event(onsurface_size_change);

  /**
   * @func host()
   */
  GUIApplication* host() const { return m_host; }
  
  /**
   * @func library
   */
  inline DrawLibrary library() { return m_library; }

  /**
   * @func surface_width()
   * */
  inline int surface_width() const { return m_surface_size[0]; }

  /**
   * @func surface_height()
   * */
  inline int surface_height() const { return m_surface_size[1]; }

  /**
   * @func surface_size
   */
  inline Vec2 surface_size() const { return m_surface_size; }

  /**
   * @func surface_size
   */
  inline CGRect selected_region() const { return m_selected_region; }

  /**
   * @func set_surface_size
   */
  bool set_surface_size(Vec2 surface_size, CGRect* select_region = nullptr);
  
  /**
   * @func best_display_scale
   */
  inline float best_display_scale() const { return m_best_display_scale; }
  
  /**
   * @get multisample 启用多重采样
   */
  inline uint multisample() const { return m_multisample; }
  
  /**
   * @func anisotropic 是否启用纹理各向异性
   */
  inline bool anisotropic() const { return m_anisotropic; }
  
  /**
   * @func mipmap 是否启用 mipmap 纹理,这个属性只对非压缩纹理生效
   */
  inline bool mipmap() const { return m_mipmap; }
  
  /**
   * @func empty_texture {Texture*}
   */
  inline Texture* empty_texture() { return m_empty_texture; }
    
  /**
   * @func cur_texture
   */
  Texture* current_texture(uint slot);
  
  /**
   * @func font_pool
   */
  inline FontPool* font_pool() const { return m_font_pool; }
  
  /**
   * @func tex_pool
   */
  inline TexturePool* tex_pool() const { return m_tex_pool; }
  
  /**
   * @func cur # 返回当前上下文
   */
  static av_inline Draw* current() { return m_draw_ctx; }
  
  /**
   * @func clear
   */
  virtual void clear(bool full = false);
  
  // --------------------------------------------------------------------------------

  /**
   * @func refresh_status_for_buffer
   */
  virtual void refresh_status_for_buffer() = 0;
  
  /**
   * @func refresh_status_for_root_matrix
   */
  virtual void refresh_status_for_root_matrix(Mat4& root, Mat4& query_root) = 0;

  /**
   * @func begin_render # 开始渲染缓冲区
   */
  virtual void begin_render() = 0;
  
  /**
   * @func end_render # 提交渲染缓冲区
   */
  virtual void commit_render() = 0;
  
  /**
   * @func begin_screen_occlusion_test # 开始屏幕遮挡查询
   */
  virtual void begin_screen_occlusion_query() = 0;
  
  /**
   * @func end_screen_occlusion_test  # 结束屏幕遮挡查询
   */
  virtual void end_screen_occlusion_query() = 0;
  
  /**
   * @func load_texture
   */
  virtual bool load_texture(Texture* tex, const Array<PixelData>& data) = 0;
  
  /**
   * @func load_yuv_texture
   */
  virtual bool load_yuv_texture(TextureYUV* yuv_tex, cPixelData& data) = 0;
  
  /**
   * @func delete_texture
   */
  virtual void delete_texture(uint id) = 0;
  
  /**
   * @func use_texture
   */
  virtual void use_texture(uint id, Repeat repeat, uint slot = 0) = 0;
  
  /**
   * @func use_texture
   */
  virtual void use_texture(uint id, uint slot = 0) = 0;
  
  /**
   * @func delete_buffer
   */
  virtual void delete_buffer(uint id) = 0;
  
  /**
   * @func refresh_status_for_font_pool
   */
  virtual void refresh_status_for_font_pool(FontPool* pool) = 0;
  
  /**
   * @func set_font_glyph_texture_value
   */
  virtual bool set_font_glyph_vertex_data(Font* font, FontGlyph* glyph) = 0;
  
  /**
   * @func set_font_glyph_texture_data
   */
  virtual bool set_font_glyph_texture_data(Font* font, FontGlyph* glyph, int level) = 0;
  
  /**
   * @func support_max_texture_font_size
   */
  virtual uint support_max_texture_font_size();
  
  /**
   * @func clear_screen
   */
  virtual void clear_screen(Color color) = 0;
  
  /**
   * @func draw
   */
  virtual void draw(Root* v) = 0;
  virtual void draw(Video* v) = 0;
  virtual void draw(Image* v) = 0;
  virtual void draw(Shadow* v) = 0;
  virtual void draw(Box* v) = 0;
  virtual void draw(TextNode* v) = 0;
  virtual void draw(Label* v) = 0;
  virtual void draw(Text* v) = 0;
  virtual void draw(Sprite* v) = 0;
  virtual void draw(Scroll* v) = 0;
  virtual void draw(Clip* v) = 0;
  virtual void draw(Input* v) = 0;
  virtual void draw(Textarea* v) = 0;
  
  /**
   * @func set_best_display_scale
   */
  inline void set_best_display_scale(float value) {
    m_best_display_scale = value;
  }
  
protected:

  GUIApplication*     m_host;
  bool                m_anisotropic;            /* 是否启用各向异性 default false */
  bool                m_mipmap;                 /* 是否启用 mip 纹理 default false */
  uint                m_multisample;            /* 是否启用多重采样 default false */
  Vec2                m_surface_size;           /* 当前绘图表面支持的大小 */
  CGRect              m_selected_region;        /* 选择绘图表面有区域 */
  Texture*            m_cur_bind_textures[32];  /* 当前上下文绑定的纹理对像 */
  Texture*            m_empty_texture;
  FontPool*           m_font_pool;              /* 字体纹理池 */
  TexturePool*        m_tex_pool;               /* 文件纹理池 */
  float               m_best_display_scale;
  DrawLibrary         m_library;
  static Draw*        m_draw_ctx;
  
  friend Draw*        draw_ctx();
  friend FontPool*    font_pool();
  friend TexturePool* tex_pool();
  friend class Texture;
  friend class TextureYUV;
};

/**
 * @func grap_ctx
 */
av_inline Draw* draw_ctx() {
  return Draw::m_draw_ctx;
}

/**
 * @func font_pool
 */
av_inline FontPool* font_pool() {
  return Draw::m_draw_ctx->m_font_pool;
}

/**
 * @func tex_pool
 */
av_inline TexturePool* tex_pool() {
  return Draw::m_draw_ctx->m_tex_pool;
}

av_gui_end
#endif
