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

#ifndef __trurh__gui__app__
#define __trurh__gui__app__

#include "Avocado/util/util.h"
#include "Avocado/util/event.h"
#include "Avocado/util/thread.h"
#include "value.h"

#define av_gui_main() \
int __av_gui_main__(int, char**); \
av_init_block(__av_gui_main__) { __av_gui_main = __av_gui_main__; } \
int __av_gui_main__(int argc, char** argv)

/**
 * gui入口程序,替代main入口函数gui启动时候会调用这个函数
 */
AV_EXPORT extern int (*__av_gui_main)(int, char**);

/**
 * @ns trurh::gui
 */

av_gui_begin

class DrawOption;
class Draw;
class GLDraw;
class DisplayPort;
class View;
class Root;
class GUIEventDispatch;
class ActionCenter;
class PropertysAccessor;
class CSSManager;

/**
 * @class GUIApplication
 */
class AV_EXPORT GUIApplication: public Object {
  av_hidden_all_copy(GUIApplication);
public:
  
  av_event(onload);
  av_event(onunload);
  av_event(onbackground);
  av_event(onforeground);
  av_event(onpause);
  av_event(onresume);
  av_event(onmemorywarning);

  /**
   * @constructor
   */
  GUIApplication(const Map<String, int>& option = Map<String, int>()) av_def_err;
  
  /**
   * @destructor
   */
  virtual ~GUIApplication();
  
  /**
   * @func run  # 运行循环,
   *            # 如果当前已处在一个消息队列中,调用这个函数不会柱塞线程
   *            # 如果当前没有运行任何消息循环,会创建一个新的消息队列并运行消息循环柱塞线程
   */
  void run() av_def_err;
  
  /**
   * @func clear 清理垃圾回收内存资源, full=true 清理全部资源
   */
  void clear(bool full = false);
  
  /**
   * @func pending() 挂起应用进程
   */
  void pending();
  
  /**
   * @func is_load
   */
  inline bool is_load() const { return m_is_load; }
  
  /**
   * @func draw_ctx 绘图上下文
   */
  inline Draw* draw_ctx() { return m_draw_ctx; }
  
  /**
   * @func display_port GUI程序显示端口
   */
  inline DisplayPort* display_port() { return m_display_port; }
  
  /**
   * @func root GUI程序的根视图
   */
  inline Root* root() { return m_root; }
  
  /**
   * @func focus_view
   */
  inline View* focus_view() { return m_focus_view; }
  
  /**
   * @func loop GUI运行loop
   */
  RunLoop* loop() const;
  
  /**
   * @func action_center
   */
  inline ActionCenter* action_center() { return m_action_center; }
  
  /**
   * @func app Get current gui application entity
   */
  static inline GUIApplication* shared() { return m_shared; }

  // get default text attrs
  inline TextColor default_text_background_color() { return m_default_text_background_color; }
  inline TextColor default_text_color() { return m_default_text_color; }
  inline TextSize default_text_size() { return m_default_text_size; }
  inline TextStyle default_text_style() { return m_default_text_style; }
  inline TextFamily default_text_family() { return m_default_text_family; }
  inline TextShadow default_text_shadow() { return m_default_text_shadow; }
  inline TextLineHeight default_text_line_height() { return m_default_text_line_height; }
  inline TextDecoration default_text_decoration() { return m_default_text_decoration; }
  inline TextOverflow default_text_overflow() { return m_default_text_overflow; }
  inline TextWhiteSpace default_text_white_space() { return m_default_text_white_space; }
  // set default text attrs
  void set_default_text_background_color(TextColor value);
  void set_default_text_color(TextColor value);
  void set_default_text_size(TextSize value);
  void set_default_text_style(TextStyle value);
  void set_default_text_family(TextFamily value);
  void set_default_text_shadow(TextShadow value);
  void set_default_text_line_height(TextLineHeight value);
  void set_default_text_decoration(TextDecoration value);
  void set_default_text_overflow(TextOverflow value);
  void set_default_text_white_space(TextWhiteSpace value);
  
  /**
   * @func open_url()
   */
  void open_url(cString& url);
  
  /**
   * @func send_email
   */
  void send_email(cString& recipient,
                  cString& subject,
                  cString& cc = String(),
                  cString& bcc = String(),
                  cString& body = String());
  
protected:
  
  /**
   * @func initialize(argc, argv) create sub gui thread, call by system
   */
  static void initialize(int argc, char* argv[]);

private:
  
  static GUIApplication*    m_shared;   // 当前应用程序
  bool                 m_is_run;
  bool                 m_is_load;
  KeepLoop*            m_proxy;
  Draw*                m_draw_ctx;         // 绘图上下文
  DisplayPort*         m_display_port;     // 显示端口
  Root*                m_root;             // 根视图
  View*                m_focus_view;       // 焦点视图
  TextColor            m_default_text_background_color; // default text attrs
  TextColor            m_default_text_color;
  TextSize             m_default_text_size;
  TextStyle            m_default_text_style;
  TextFamily           m_default_text_family;
  TextShadow           m_default_text_shadow;
  TextLineHeight       m_default_text_line_height;
  TextDecoration       m_default_text_decoration;
  TextOverflow         m_default_text_overflow;
  TextWhiteSpace       m_default_text_white_space; // text
  GUIEventDispatch*    m_dispatch;
  ActionCenter*        m_action_center;
  
  av_def_inl_cls(Inl);
  
  friend GUIApplication*  app();
  friend Root*            root();
  friend RunLoop*         gui_loop();
  friend DisplayPort*     display_port();
};

/**
 * @func app
 */
av_inline GUIApplication* app() {
  return GUIApplication::m_shared;
}

/**
 * @func root
 */
av_inline Root* root() {
  return GUIApplication::m_shared->m_root;
}

/**
 * @func display_port
 */
av_inline DisplayPort* display_port() {
  return GUIApplication::m_shared->m_display_port;
}

/**
 * @func gui_loop
 */
av_inline RunLoop* gui_loop() {
  return GUIApplication::m_shared->m_proxy->host();
}

av_gui_end
#endif
