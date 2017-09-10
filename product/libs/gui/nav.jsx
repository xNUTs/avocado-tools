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

import ':util';
import ':util/sys';
import 'gui';
import { List, KEYCODE_MENU } from 'event';
import { 
  ViewController, View, Div, Indep, 
  Limit, Button, Text, TextNode, Clip, 
  New, is_view_xml, SelectPanel,
} from 'gui';
import is_empty_view_xml from ':gui/ctr';

export const FOREGROUND_ACTION_INIT = 0;
export const FOREGROUND_ACTION_RESUME = 1;

const navigation_stack = new List();
var navigation_init_ok = false;

function get_valid_focus(nav, focus_move) {
  var view = nav.view;
  return view.has_child(focus_move) ? view.first_button() : focus_move;
}

function navigation_init(root) {
  // initialize
  navigation_init_ok = true;

  root.onback.on(function(ev) {
    var last = navigation_stack.last;
    while(last) {
      if ( last.value.navigation_back() ) {
        ev.cancel_default(); // 取消默认动作
        break;
      }
      last = last.prev;
    }
  });

  root.onclick.on(function(ev) {
    // console.log('onclick--', ev.keyboard );
    if ( ev.keyboard ) { // 需要键盘产生的事件
      var last = navigation_stack.last;
      if ( last ) {
        last.value.navigation_enter(ev.sender);
      }
    }
  });

  root.onkeydown.on(function(ev) {
    var last = navigation_stack.last;
    if ( last ) {
      var focus_move = ev.focus_move;
      var nav = last.value;

      switch(ev.keycode) {
        case 37: // left
          focus_move = nav.navigation_left(focus_move);
          break;
        case 38: // up
          focus_move = nav.navigation_top(focus_move);
          break;
        case 39: // right
          focus_move = nav.navigation_right(focus_move);
          break;
        case 40: // down
          focus_move = nav.navigation_down(focus_move);
          break;
        case KEYCODE_MENU:
          nav.navigation_menu();
        default: return;
      }
      ev.focus_move = focus_move;
    }
  });
}

/**
 * @class Basic
 */
class Basic extends ViewController {
  m_status: -1; // 1=background,0=foreground,-1=init or exit
  // @public
  get status() { return this.m_status }
  into_background(time) { this.m_status = 1 }
  into_foreground(time, action, data) { this.m_status = 0 }
  into_leave(time) { this.m_status = -1 }
}

/**
 * @class Navigation
 */
export class Navigation extends Basic {
  m_iterator: null;
  m_focus_resume: null;

  /**
   * @event onbackground
   */
  event onbackground;
  
  /**
   * @event onforeground
   */
  event onforeground;

  into_background(time) { 
    super.into_background(time);
    this.trigger_background();
  }

  into_foreground(time, action, data) {
    super.into_foreground(time, action, data);
    this.trigger_foreground({ action: action, data: data });
  }

  /**
   * @func default_focus()
   */
  default_focus() {
    // var view = this.view;
    // if ( view ) {
    //   return view.first_button();
    // }
    return null;
  }

  trigger_remove_view(ev) {
    if ( this.m_iterator ) {
      navigation_stack.del(this.m_iterator);
      this.m_iterator = null;
    }
    super.trigger_remove_view(ev);
  }

  /**
   * @func register_navigation()
   */
  register_navigation(time) {
    if ( !this.m_iterator ) { // No need to repeat it
      if ( !navigation_init_ok ) { // init
        var r = gui.root;
        if ( r ) {
          navigation_init(r);
        }
      }
      this.m_iterator = navigation_stack.push(this);
      // console.log('push_navigation()-----', navigation_stack.length);

      var prev = this.m_iterator.prev;
      if ( prev ) {
        var focus = gui.app.focus_view;
        prev.m_focus_resume = prev.value.view.has_child(focus) ? focus : null;
        prev.value.into_background(time);
      }
      var view = this.default_focus();
      if ( view ) {
        view.focus();
      }
      this.into_foreground(time, FOREGROUND_ACTION_INIT, null);
    }
  }

  /**
   * @func unregister_navigation(time, data)
   */
  unregister_navigation(time, data) {
    if ( this.m_iterator ) {
      // util.assert(this.m_iterator, 'Bad iterator!');
      navigation_stack.del(this.m_iterator);
      this.m_iterator = null;
      this.into_leave(time);
      var last = navigation_stack.last;
      if ( last ) {
        if (last.value.m_focus_resume) {
          last.value.m_focus_resume.focus();
        }
        last.value.into_foreground(time, FOREGROUND_ACTION_RESUME, data);
      }
    }
  }
  
  /* 导航事件产生时系统会首先将事件发送给焦点视图，事件如果能成功传递到root,
   * 那么事件最终将发送到达当前导航列表栈最顶端
   */

  navigation_back() {
    /* 这里如果返回true会继续往导航列表栈底端传递，直到返回true或到达栈底退出应用程序 */
    return true;
  }

  navigation_enter(focus) {
    // Rewrite this function to implement your logic
  }

  /**
   * navigation_top()
   * navigation_down()
   * navigation_left()
   * navigation_right()
   * 返回null时焦点不会发生任何改变
   */
  navigation_top(focus_move) {
    return get_valid_focus(this, focus_move);
  }

  navigation_down(focus_move) {
    return get_valid_focus(this, focus_move);
  }

  navigation_left(focus_move) {
    return get_valid_focus(this, focus_move);
  }

  navigation_right(focus_move) {
    return get_valid_focus(this, focus_move);
  }

  /* 按下menu按键时会调用 */
  navigation_menu() {
    // Rewrite this function to implement your logic
  }

}

/**
 * @func refresh_bar_style
 */
function refresh_bar_style(self, time) {
  if ( self.m_navbar_panel && self.current ) {
    time = self.enable_animate && time;
    var navbar = self.navbar || { 
      height: 0, border: 0, background_color: '#0000', border_color: '#0000' 
    };
    var toolbar = self.toolbar || { 
      height: 0, border: 0, background_color: '#0000', border_color: '#0000' 
    };
    var navbar_hidden = self.$navbar_hidden || self.navbar.$hidden;
    var toolbar_hidden = self.$toolbar_hidden || self.toolbar.$hidden
    var navbar_height = navbar_hidden ? 0 : navbar.height + self.m_padding + navbar.border;
    var toolbar_height = toolbar_hidden ? 0 : toolbar.height + toolbar.border;
    
    if ( time ) {
      if ( !navbar_hidden ) self.m_navbar_panel.show();
      if ( !toolbar_hidden ) self.m_toolbar_panel.show();
      self.m_navbar_panel.transition({ 
        height: Math.max(0, navbar_height - navbar.border), 
        border_bottom: `${navbar.border} ${navbar.border_color}`, 
        background_color: navbar.background_color,
        time: time,
      });
      //console.log(navbar.background_color, 'OKOK1', time);
      self.m_toolbar_panel.transition({ 
        height: Math.max(0, toolbar_height - toolbar.border),
        border_top: `${toolbar.border} ${toolbar.border_color}`, 
        background_color: toolbar.background_color,
        time: time,
      });
      self.m_page_panel.transition({ height: navbar_height + toolbar_height + '!', time: time }, ()=>{
        if ( navbar_hidden ) self.m_navbar_panel.hide();
        if ( toolbar_hidden ) self.m_toolbar_panel.hide();
      });
    } else {
      var style = { 
        height: Math.max(0, navbar_height - navbar.border), 
        border_bottom: `${navbar.border} ${navbar.border_color}`,
        background_color: navbar.background_color, 
        visible: !navbar_hidden, 
      };
      self.m_navbar_panel.style = style;
      //console.log(navbar.background_color, 'OKOK2', time);
      self.m_toolbar_panel.style = { 
        height: Math.max(0, toolbar_height - toolbar.border), 
        border_top: `${toolbar.border} ${toolbar.border_color}`, 
        background_color: toolbar.background_color, 
        visible: !toolbar_hidden,
      };
      self.m_page_panel.style = { height: navbar_height + toolbar_height + '!' };
    }
  }
}

/**
 * @class NavpageCollection
 */
export class NavpageCollection extends ViewController {
  m_padding: 20;
  m_pages: null;
  m_default_toolbar: null;
  m_navbar_panel: null;
  m_page_panel: null;
  m_toolbar_panel: null;
  m_animating: false;
  $navbar_hidden: false;
  $toolbar_hidden: false;
  
  /**
   * @field enable_animate
   */
  enable_animate: true;
  
  event onpush;
  event onpop;
  
  get padding() { return this.m_padding }
  get navbar_hidden() { return this.$navbar_hidden }
  get toolbar_hidden() { return this.$toolbar_hidden }
  set navbar_hidden(value) { this.set_navbar_hidden(value, false) }
  set toolbar_hidden(value) { this.set_toolbar_hidden(value, false) }
    
  get length() { return this.m_pages.length }
  get pages() { return this.m_pages.slice() }
  get current() { return this.m_pages.last(0) || null }
  get navbar() { return this.length ? this.current.navbar : null }
  get toolbar() { return this.length ? this.current.toolbar : null }
  get default_toolbar() { return this.m_default_toolbar }
  
  set padding(value) {
    util.assert(typeof value == 'number');
    this.m_padding = Math.max(value, 0);
    refresh_bar_style(this, 0);
  }
  
  /**
   * @func set_navbar_hidden
   */
  set_navbar_hidden(value, time) {
    this.$navbar_hidden = !!value;
    refresh_bar_style(this, time ? 400 : 0);
  }
  
  /**
   * @func set_toolbar_hidden
   */
  set_toolbar_hidden(value, time) {
    this.$toolbar_hidden = !!value;
    refresh_bar_style(this, time ? 400 : 0);
  }
  
  /**
   * @set default_toolbar {Toolbar} # Set default toolbar
   */
  set default_toolbar(value) {
    if (value) {
      if (is_view_xml(value)) // view xml
        value = New(value);
      util.assert(value instanceof Toolbar, 'Type not correct');
      util.assert(!value.m_collection || value.m_collection !== this);
      if ( value !== this.m_default_toolbar ) {
        if ( this.m_default_toolbar ) {
          this.m_default_toolbar.remove();
        }
        this.m_default_toolbar = value;
        this.m_default_toolbar.m_collection = this;
      }
    } else { // cancel
      if ( this.m_default_toolbar ) {
        this.m_default_toolbar.remove();
        this.m_default_toolbar = null;
      }
    }
  }
  
  constructor(msg) {
    super(msg);
    this.m_pages = [];
  }
  
  load_view(vx) {
    super.load_view(
      <Clip width="100%" height="100%">
        <Div id="navbar" width="100%" />
        <Div id="page" width="100%" />
        <Div id="toolbar" width="100%" />
      </Clip>
    );
    this.m_navbar_panel = this.find('navbar');
    this.m_page_panel = this.find('page');
    this.m_toolbar_panel = this.find('toolbar');
    
    if ( !is_empty_view_xml(vx) ) {
      /* delay 因为是第一次加载,布局系统还未初始化
       * 无法正确的获取数值来进行title bar的排版计算
       * 所以这里延时一帧画面
       */
      gui.next_frame(()=>{
        this.push(vx);
      });
    }
  }
  
  push(page, animate, ...args) {

    //console.log(this.m_animating);
    
    if ( this.m_animating ) {
      return;
    }
    
    var time = this.enable_animate && animate && this.length ? 400 : 0;
    
    var prev = this.current;
    
    if ( page ) {
      if ( page instanceof Navpage ) {
        util.assert(!page.view.parent && !page.collection, 'Navpage can only be a new entity');
        page.view.append_to(this.m_page_panel);
      } else {
        if ( is_view_xml(page, Navpage) ) {
          page = New(page, this.m_page_panel, ...args);
        } else if ( is_view_xml(page, View) ) {
          page = New(<Navpage>${page}</Navpage>, this.m_page_panel, ...args);
        }
      }
    }

    util.assert(page instanceof Navpage, 
      'The argument navpage is not of the correct type, Only for Navpage entities or Navpage VX data.');
    
    // set page
    page.m_collection = this;
    page.m_prev_page = prev;
    
    if (prev) { // set next page
      prev.m_next_page = page;
    }
    
    if (!page.m_navbar) { // Create default navbar
      page.navbar = <Navbar />;
    }
    
    if (!page.m_toolbar) { // use default toolbar
      if (this.default_toolbar) {
        page.toolbar = this.default_toolbar;
      } else {
        page.toolbar = <Toolbar />;
      }
    }
    
    this.m_pages.push(page);
    
    page.navbar.m_collection = this;
    page.toolbar.m_collection = this;
    page.navbar.view.append_to(this.m_navbar_panel);
    page.toolbar.view.append_to(this.m_toolbar_panel);
    
    this.m_animating = time;
    if ( time ) {
      setTimeout(()=>{ this.m_animating = false }, time);
    }

    page.navbar.$set_back_text(prev ? prev.title : '');
    
    refresh_bar_style(this, time);
    
    // switch and animate
    this.trigger_push(page);

    page.register_navigation(time);
  }
  
  pop(animate) {
    this.pops(1, animate);
  }
  
  pops(count, animate) {
    
    count = Math.min(this.length - 1, count);
    
    if ( count <= 0 ) {
      return;
    }
    if ( this.m_animating ) {
      return;
    }
    var time = this.enable_animate && animate ? 400 : 0;
    var page = this.m_pages[this.length - 1 - count];
    var arr = this.m_pages.splice(this.length - count);
    var next = arr.pop();
    
    arr.forEach(function (page) {
      page.into_leave(false);
    });
    
    this.m_animating = time;
    if ( time ) {
      setTimeout(()=>{ this.m_animating = false }, time);
    }

    refresh_bar_style(this, time);
    
    // switch and animate
    
    this.trigger_pop(next);

    next.unregister_navigation(time, null);
  }
}

/**
 * @class Bar
 */
class Bar extends Basic {
  $height: 44;
  $hidden: false;
  $border: gui.atom_px;
  $border_color: '#b3b3b3';
  $background_color: '#f9f9f9';
  m_page: null;
  m_collection: null;
  
  get height() { return this.$height }
  get hidden() { return this.$hidden }
  get border() { return this.$border }
  get border_color() { return this.$border_color }
  get background_color() { return this.$background_color }
  
  get collection() { return this.m_collection }
  get page() { return this.m_page }
  get is_current() { return this.m_page && this.m_page.is_current }
  
  set height(value) {
    util.assert(typeof value == 'number');
    this.$height = value;
    this.refresh_style(0);
  }
  set hidden(value) {
    this.$hidden = !!value;
    this.refresh_style(0);
  }
  set border(value) {
    util.assert(typeof value == 'number');
    this.$border = value; 
    this.refresh_style(0); 
  }
  set border_color(value) {
    this.$border = value; 
    this.refresh_style(0); 
  }
  set background_color(value) {
    this.$background_color = value; 
    this.refresh_style(0); 
  }
  
  set_hidden(value, time) {
    this.$hidden = !!value;
    this.refresh_style(time ? 400 : 0);
  }
  
  /**
   * @fun refresh_style
   */
  refresh_style(time) {
    if (this.is_current) {
      refresh_bar_style(this.m_page.collection, time);
    }
  }
  
  get visible() {
    return super.visible;
  }
  
  set visible(value) {
    if ( value ) {
      if (this.is_current) {
        super.visible = 1;
      }
    } else {
      if (!this.is_current) {
        super.visible = 0;
      }
    }
  }
}

/**
 * @func navbar_compute_title_layout
 */
function navbar_compute_title_layout(self) {
  if ( self.$default_style ) {
    
    var back_text_btn = self.find('m_back_text_btn');
    var back_text = self.find('m_back_text1').value;
    var title_text = self.m_title_text_panel.value;
    var back_icon_visible = self.$back_icon_visible;

    if ( self.page && self.page.m_prev_page ) {
      back_text_btn.visible = true;
    } else {
      back_text_btn.visible = false;
      back_text = '';
      back_icon_visible = false;
    }
    
    var nav_width = self.collection ? self.collection.view.final_width : 0;

    // console.log('----------------------nav_width', nav_width);

    var back_width = self.find('m_back_text1').simple_layout_width(back_text) + 3; // 3间隔
    var title_width = self.m_title_text_panel.simple_layout_width(title_text);
    var menu_width = Math.min(nav_width / 3, Math.max(self.$title_menu_width, 0));
    var margin_left = 0;
    var min_back_width = 6;
    
    if ( back_icon_visible ) {
      min_back_width += self.find('m_back_text0').simple_layout_width('\uedc5');
      back_width += min_back_width;
    }
    
    self.m_title_panel.margin_left = margin_left;
    self.m_title_panel.margin_right = menu_width;
    self.m_title_panel.show();
    self.find('m_back_text0').visible = back_icon_visible;
    
    if ( nav_width ) {
      var title_x = nav_width / 2 - title_width / 2 - margin_left;
      if ( back_width <= title_x ) {
        back_width = title_x;
      } else { // back 的宽度超过title-x位置
        //console.log(back_width, (nav_width - menu_width - margin_left) - title_width);
        back_width = Math.min(back_width, (nav_width - menu_width - margin_left) - title_width);
        back_width = Math.max(min_back_width, back_width);
      }
      title_width = nav_width - back_width - menu_width - margin_left;
      self.m_back_panel_width = back_width;// - min_back_width;
      self.m_title_panel_width = title_width;
    } else {
      self.m_back_panel_width = 0;
      self.m_title_panel_width = 0;
      back_width = 30;
      title_width = 70;
    }

    var back_text_num = back_width / (back_width + title_width);
    var titl_text_num = title_width / (back_width + title_width);

    // 为保证浮点数在转换后之和不超过100,向下保留三位小数
    self.m_back_text_panel.width = Math.floor(back_text_num * 100000) / 1000 + '%';
    self.m_title_text_panel.width = Math.floor(titl_text_num * 100000) / 1000 + '%';

  } else {
    self.m_title_panel.hide(); // hide title text and back text
  }
}

/**
 * @class Navbar
 */
export class Navbar extends Bar {
  m_back_text: '';
  m_title_text: '';
  m_title_panel: null;
  m_back_text_panel: null;
  m_title_text_panel: null;
  m_back_panel_width: 0;
  m_title_panel_width: 0;
  $default_style: true;
  $back_icon_visible: true;
  $title_menu_width: 40; // display right menu button width
  $background_color: '#2c86e5'; // 3c89fb
  
  // @public
  get back_icon_visible() { return this.$back_icon_visible }
  get default_style() { return this.$default_style }
  get title_menu_width() { return this.$title_menu_width }
  get back_text_color() { return this.m_back_text_btn.text_color }
  get title_text_color() { return this.m_title_text_panel.text_color }
  
  set back_icon_visible(value) {
    this.$back_icon_visible = !!value;
    navbar_compute_title_layout(this);
  }
  
  set default_style(value) {
    this.$default_style = !!value;
    navbar_compute_title_layout(this);
  }
  
  set title_menu_width(value) {
    util.assert(typeof value == 'number');
    this.$title_menu_width = value;
    navbar_compute_title_layout(this);
  }
  
  set back_text_color(value) { this.find('m_back_text_btn').text_color = value }
  set title_text_color(value) { this.m_title_text_panel.text_color = value }
  
  refresh_style(time) {
    if (this.is_current) {
      this.view.align_y = 'bottom';
      this.view.height = this.height;
      this.m_title_text_panel.text_line_height = this.height;
      this.find('m_back_text_btn').text_line_height = this.height;
      super.refresh_style(time);
    }
  }
  
  /**
   * @overwrite
   */
  load_view(vx) {
    super.load_view( 
      <Indep width="100%" height=44 visible=0 align_y="bottom">
        ${vx}
        <Indep id="m_title_panel" width="full" height="100%" visible=0>
          <Div id="m_back_text_panel" height="full">
            <Limit max_width="100%">
              <!--text_color="#0079ff"-->
              <Button id="m_back_text_btn" 
                text_color="#fff"
                width="full" 
                text_line_height=44 
                text_size=16
                text_white_space="no_wrap" text_overflow="ellipsis">
                <Div width=6 />
                <TextNode id="m_back_text0" 
                  text_line_height="auto" 
                  text_size=20
                  height=26 y=2
                  text_color="inherit" 
                  text_family="icon" value='\uedc5' />
                <TextNode id="m_back_text1" />
              </Button>
            </Limit>
          </Div>
          
          <Text id="m_title_text_panel" 
            height="full"
            text_color="#fff"
            text_line_height=44 
            text_size=16
            text_white_space="no_wrap" 
            text_style="bold" text_overflow="ellipsis" />
            
        </Indep>
      </Indep>
    );
    
    this.m_title_panel = this.find('m_title_panel');
    this.m_back_text_panel = this.find('m_back_text_panel');
    this.m_title_text_panel = this.find('m_title_text_panel');
    var back_text_btn = this.find('m_back_text_btn');
    
    back_text_btn.onclick.on(()=>{ this.collection.pop(true) });
  }
  
  /**
   * @fun set_back_text # set navbar back text
   */
  $set_back_text(value) {
    this.find('m_back_text1').value = value;
    navbar_compute_title_layout(this);
  }
  
  /**
   * @fun $set_title_text # set navbar title text
   */
  $set_title_text(value) {
    this.m_title_text_panel.value = value;
    navbar_compute_title_layout(this);
  }
  
  into_background(time) {
    if ( time ) { 
      if ( this.$default_style ) {
        var m_back_text0 = this.find('m_back_text0');
        var m_back_text1 = this.find('m_back_text1');
        var m_title_text_panel = this.m_title_text_panel;
        var back_icon_width = m_back_text0.visible ? m_back_text0.client_width : 0;
        m_back_text1.transition({ 
          x: -m_back_text1.client_width, time: time,
        });
        m_title_text_panel.transition({ 
          x: -this.m_back_panel_width + back_icon_width, time: time,
        });
      }
      this.transition({ opacity: 0, time: time }, ()=>{ this.hide() });
    } else {
      this.view.opacity = 0;
      this.hide();
    }
    super.into_background(time);
  }
  
  into_foreground(time, action, data) { 
    
    var m_back_text0 = this.find('m_back_text0');
    var m_back_text1 = this.find('m_back_text1');
    var m_title_text_panel = this.m_title_text_panel;
    this.show();
    
    if ( time ) { // TODO
      if ( this.$default_style ) {
        var back_icon_width = 0;//m_back_text0.visible ? 20 : 0;
        if ( this.status == -1 ) {
          m_back_text1.x = this.m_back_panel_width - back_icon_width;
          m_title_text_panel.x = this.m_title_panel_width + this.$title_menu_width;
        }
        m_back_text1.transition({ x: 0, time: time });
        m_title_text_panel.transition({ x: 0, time: time });
      } else {
        m_back_text1.x = 0;
        m_title_text_panel.x = 0;
      }
      this.view.opacity = 0;
      this.transition({ opacity: 1, time: time });
    } else {
      this.view.opacity = 1;
      m_back_text1.x = 0;
      m_title_text_panel.x = 0;
    }
    super.into_foreground(time, action, data);
  }
  
  into_leave(time) { 
    if ( this.status == 0 && time ) { // TODO
      if ( this.$default_style ) {
        var m_back_text0 = this.find('m_back_text0');
        var m_back_text1 = this.find('m_back_text1');
        var m_title_text_panel = this.m_title_text_panel;
        var back_icon_width = m_back_text0.visible ? m_back_text0.client_width : 0;
        m_back_text1.transition({ x: this.m_back_panel_width - back_icon_width, time: time });
        m_title_text_panel.transition({ 
          x: this.m_title_panel_width + this.$title_menu_width, time: time,
        });
      }
      this.transition({ opacity: 0, time: time }, ()=>{ this.remove() });
    } else {
      this.remove();
    }
    super.into_leave(time);
  }
}

/**
 * @class Toolbar
 */
export class Toolbar extends Bar {
  $height: 49;

  /**
   * @overwrite
   */
  load_view(vx) {
    super.load_view(
      <Indep width="100%" height="full" visible=0>${vx}</Indep>
    );
  }
    
  into_foreground(time, action, data) {
    if ( this.is_default ) {
      this.m_page = this.collection.current;
    }
    if ( time ) {
      var page = (this.page.next_page || this.page.prev_page);
      if (!page || page.toolbar !== this) {
        this.show();
        this.view.opacity = 0;
        this.transition({ opacity: 1, time: time });
      }
    } else {
      this.show();
      this.view.opacity = 1;
    }
    super.into_foreground(time, action, data);
  }
  
  into_background(time) {
    if ( this.collection.current.toolbar !== this ) {
      if ( time ) {
        this.transition({ opacity: 0, time: time }, ()=>{ this.hide() });
      } else {
        this.view.opacity = 0;
        this.hide();
      }
    }
    super.into_background(time);
  }

  into_leave(time) {
    if ( this.collection.current.toolbar !== this ) {
      if ( this.status == 0 && time ) {
        this.transition({ opacity: 0, time: time }, ()=>{
          if ( this.collection.default_toolbar !== this ) {
            this.remove();
          } else {
            this.hide();
          }
        });
      
      } else {
        if ( this.collection.default_toolbar !== this ) {
          this.remove();
        } else {
          this.hide();
        }
      }
    }
    super.into_leave(time);
  }
  
  get is_default() {
    return this.collection && this.collection.default_toolbar === this;
  }
}

/**
 * @func background_color_reverse
 */
function background_color_reverse(self) {
  var color = self.background_color.reverse();
  color.a = 255 * 0.6;
  return color;
}

// Basic
/**
 * @class Navpage
 */
export class Navpage extends Navigation {
  m_title: '';
  m_navbar: null;
  m_toolbar: null;
  m_collection: null;
  m_prev_page: null;
  m_next_page: null;

  // @public
  get title() { return this.m_title }
  get collection() { return this.m_collection }
  get navbar() { 
    if ( this.m_navbar ) {
      return this.m_navbar;
    } else {
      this.navbar = <Navbar />;
      return this.m_navbar;
    }
  }
  get toolbar() { 
    if ( this.m_toolbar ) {
      return this.m_toolbar;
    } else {
      this.toolbar = <Toolbar />;
      return this.m_toolbar;
    }
  }
  get prev_page() { return this.m_prev_page }
  get next_page() { return this.m_next_page }
  get is_current() { return this.m_collection && this.m_collection.current === this }
  get background_color() { return this.view.background_color }
  
  set background_color(value) {
    this.view.background_color = value;
  }
  
  set title(value) {
    this.m_title = String(value);
    if (this.m_navbar) {
      this.m_navbar.$set_title_text(this.m_title);
    }
    if (this.m_next_page && this.m_next_page.navbar) {
      this.m_next_page.navbar.$set_back_text(value);
    }
  }
  
  set navbar(value) {
    if (value) {
      if ( is_view_xml(value) ) {
        value = New(value);
      }
      util.assert(value instanceof Navbar, 'Type not correct');
      if (value !== this.m_navbar) {
        util.assert(!value.m_page);
        if (this.m_navbar) {
          this.navbar.remove();
        }
        this.m_navbar = value;
        this.m_navbar.m_page = this;
        this.m_navbar.$set_title_text(this.m_title);
        this.m_navbar.$set_back_text(this.m_prev_page ? this.m_prev_page.m_title : '');
        this.m_navbar.refresh_style(false);
      }
    }
  }
  
  set toolbar(value) {
    if (value) {
      if ( is_view_xml(value) ) {
        value = New(value);
      }
      util.assert(value instanceof Toolbar, 'Type not correct');
      if (value !== this.m_toolbar) {
        util.assert(!value.m_page || value.is_default);
        if (this.m_toolbar) {
          if ( !this.m_toolbar.is_default ) {
            this.m_toolbar.remove();
          }
        }
        this.m_toolbar = value;
        this.m_toolbar.m_page = this;
        this.m_toolbar.refresh_style(false);
      } else {
        this.m_toolbar.m_page = this;
      }
    }
  }
  
  // @overwrite
  load_view(vx) {
    super.load_view(
      <Indep width="100%" height="full" background_color="#fff" visible=0>${vx}</Indep>
    );
  }
  
  // @overwrite
  into_background(time) {
    if ( this.next_page == null ) return;
    this.navbar.into_background(time);
    this.toolbar.into_background(time);
    if ( this.status != 1 ) {
      if ( time && this.view.parent.final_visible ) {
        this.transition({ x: this.view.parent.final_width / -3, visible: false, time: time });
      } else {
        this.style = { x: (this.view.parent.final_width || 100) / -3, visible: false };
      }
    }
    super.into_background(time);
  }
  
  // @overwrite
  into_foreground(time, action, data) {
    if ( this.status == 0 ) return;
    this.navbar.into_foreground(time, action, data);
    this.toolbar.into_foreground(time, action, data);
    if ( this.status == -1 ) {
      if ( time && this.view.parent.final_visible ) {
        this.style = { 
          border_left_color: background_color_reverse(this), 
          border_left_width: gui.atom_px, 
          x: this.view.parent.final_width, 
          visible: 1,
        };
        this.transition({ x: 0, time: time }, ()=>{ 
          this.view.border_left_width = 0;
        });
      } else {
        this.style = { x: 0, border_left_width: 0, visible: 1 };
      }
      this.m_toolbar.m_page = this;
    } 
    else if ( this.status == 1 ) {
      if ( time && this.view.parent.final_visible ) {
        this.visible = 1;
        this.transition({ x: 0, time: time });
      } else {
        this.style = { x: 0, visible: 1 };
      }
      this.m_toolbar.m_page = this;
    }
    super.into_foreground(time, action, data);
  }
  
  // @overwrite
  into_leave(time) { 
    this.navbar.into_leave(time);
    this.toolbar.into_leave(time);
    if ( this.status == 0 ) {
      if ( time && this.view.parent.final_visible ) {
        this.style = { 
          border_left_color: background_color_reverse(this), 
          border_left_width: gui.atom_px, 
        };
        this.transition({ x: this.view.parent.final_width, visible: 0, time: time }, ()=>{
          this.remove();
        });
        super.into_leave(time);
        return;
      }
    }
    super.into_leave(time);
    this.remove();
  }

  // @overwrite  
  trigger_remove_view(ev) {
    if (this.m_navbar) {
      this.m_navbar.remove();
    }
    if (this.m_toolbar && !this.m_toolbar.is_default) {
      this.m_toolbar.remove();
    }
    super.trigger_remove_view(ev);
  }

  // @overwrite
  navigation_back() {
    if ( this.m_prev_page ) {
      this.m_collection.pop(true);
      return true;
    } else {
      return false;
    }
  }
}
