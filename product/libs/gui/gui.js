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

export binding('_gui');

import ':util';
import ':gui/event';
import 'app';
import 'action';
import 'ctr';
import 'display_port';
import 'css';

 /**
  * @class View
  * @class Sprite
  * @class Label
  * @class Span
  * @class TextNode
  * @class Hybrid
  * @class Button
  * @class Text
  * @class Input
  * @class Textarea
  * @class Div
  * @class Image
  * @class Limit
  * @class Indep
  * @class IndepLimit
  * @class Panel
  * @class Scroll
  * @class Root
  * @class Clip
  */

 /**
  * @class TextFont abstract class
  * @get,set text_background_color {ColorValue}
  * @get,set text_color {ColorValue}
  * @get,set text_size {TextSizeValue}
  * @get,set text_style {TextStyleValue}
  * @get,set text_family {TextFamilyValue}
  * @get,set text_shadow {TextShadowValue}
  * @get,set text_line_height {TextLineHeightValue}
  * @get,set text_decoration {TextDecorationValue}
  * @end
  */

 /**
  * @class TextLayout abstract class
  * @bases TextFont
  * @get,set text_overflow {TextOverflowValue}
  * @get,set text_white_space {TextWhiteSpaceValue}
  * @end
  */

 /**
  * @class View
  */
class View extends event.NativeNotification {
  
  set __tag__(v) { /*noop*/ }
  set __child__(v) { /*noop*/ }
  
  // @events
  event onkeydown;
  event onkeypress;
  event onkeyup;
  event onkeyenter;
  event onback;
  event onclick;
  event ontouchstart;
  event ontouchmove;
  event ontouchend;
  event ontouchcancel;
  event onfocus;
  event onblur;
  event onhighlighted;
  event onaction_keyframe;
  event onaction_loop;
  event onremove_view;
  
  /**
   * @overwrite
   */
  $add_default_listener(name, func) {
    if ( typeof func == 'string' ) {
      // find func 
      var func2 = this[func];
      if ( typeof func2 == 'function' ) {
        return this.$get_noticer(name).on(func2, 0); // default id 0
      } else {
        var ctr = this.controller;
        if ( !ctr ) {
          ctr = this.top_ctr; // top view ctr
        }
        while (ctr) {
          func2 = ctr[func];
          if ( typeof func2 == 'function' ) {
            return this.$get_noticer(name).on(func2, ctr, 0); // default id 0
          }
          ctr = ctr.parent;
        }
        throw util.err(`Cannot find a function named "${func}"`);
      }
    } else {
      return this.$get_noticer(name).on(func, 0); // default id 0
    }
  }
  
  /**
   * @get action {Action}
   */
  get action() { // get action object
    return this.get_action(); 
  }

  /**
   * @set action {Action}
   */
  set action(value) { // set action
    this.set_action(action.create(value));
  }
  
  /**
   * @func transition(style[,delay[,cb]][,cb])
   * @arg style {Object}
   * @arg [delay] {uint} ms
   * @arg [cb] {Funcion}
   * @ret {KeyframeAction}
   */
  transition(style, delay, cb) { // transition animate
    return action.transition(this, style, delay, cb);
  }
  
  /**
   * @func show()
   */
  show() {
    this.visible = true;
  }

  /**
   * @func hide()
   */
  hide() {
    this.visible = false; 
  }
}

 /**
  * @class View
  *
  * @constructor() 
  *
  * @func prepend(child) 
  * @arg child {View}
  *
  * @func append(child)
  * @arg child {View}
  *
  * @func append_text(text)
  * @arg text {String}
  * @ret {View}
  *
  * @func append_to(parent)
  * @arg parent {View}
  *
  * @func before(prev)
  * @arg prev {View}
  *
  * @func after(next)
  * @arg next {View}
  *  
  * @func move_to_before();
  *  
  * @func move_to_after();
  *
  * @func move_to_first();
  *
  * @func move_to_last();
  *
  * @func remove()
  *
  * @func remove_all_child()
  *
  * @func focus()
  * @ret {bool}
  *
  * @func blur()
  * @ret {bool}
  *
  * @func layout_offset()
  * @ret {Vec2}
  *
  * @func layout_offset_from([upper])
  * @arg [upper=parent] {View}
  * @ret {Vec2}
  *
  * @func children(index)
  * @arg index {uint}
  * @ret {View}
  *
  * @func get_action()
  * @ret {Action}
  *
  * @func set_action(action)
  * @arg action {Action}
  *
  * @func screen_rect()
  * @ret {Rect}
  *
  * @func final_matrix()
  * @ret {Mat}
  *
  * @func final_opacity()
  * @ret {float}
  *
  * @func position()
  * @ret {Vec2}
  *
  * @func overlap_test(point)
  * @arg point {Vec2}
  * @ret {bool}
  *
  * @func add_class(name)
  * @arg name {String}
  *
  * @func remove_class(name)
  * @arg name {String}
  *
  * @func toggle_class(name)
  * @arg name {String}
  *
  * @func first_button()
  * @ret {Button}
  *
  * @func has_child(view)
  * @ret {bool}
  *
  * @get children_count {uint}
  * @get,set inner_text {String}
  * @get,set id {String}
  * @get controller {ViewController}
  * @get ctr {ViewController}
  * @get top {View}
  * @get top_ctr {ViewController}
  * @get parent {View}
  * @get prev {View}
  * @get next {View}
  * @get first {View}
  * @get last {View}
  * @get,set x {float}
  * @get,set y {float}
  * @get,set scale_x {float}
  * @get,set scale_y {float}
  * @get,set rotate_z {float}
  * @get,set skew_x {float}
  * @get,set skew_y {float}
  * @get,set opacity {float}
  * @get,set visible {bool}
  * @get final_visible {bool}
  * @get,set translate {Vec2}
  * @get,set scale {Vec2}
  * @get,set skew {Vec2}
  * @get,set origin_x {float}
  * @get,set origin_y {float}
  * @get,set origin {Vec2}
  * @get matrix {Mat}
  * @get level {uint}
  * @get,set need_draw {bool}
  * @get,set receive {bool}
  * @get,set is_focus {bool}
  * @get view_type {uint}
  * @get,set style {Object}
  * @get class {Object}
  * @set class {String}
  * @end
  */

 /**
  * @class Sprite
  * @bases View
  * @get,set src {String}
  * @get,set width {float}
  * @get,set height {float}
  * @get,set start {Vec2}
  * @get,set start_x {float}
  * @get,set start_y {float}
  * @get,set ratio {Vec2}
  * @get,set ratio_x {float}
  * @get,set ratio_y {float}
  * @get,set repeat {Repeat}
  * @end
  */

 /**
  * @class Label
  * @bases View, TextFont
  *  @get length {uint}
  *  @get,set value {String}
  *  @get text_baseline {String}
  *  @get text_height {float}
  *  @get,set text_align {TextAlign}
  * @end
  */

 /**
  * @class Layout abstract class
  * @bases View
  * @get client_width {float}
  * @get client_height {float}
  * @end 
  */
 
 /**
  * @class Span
  * @bases Layout, TextLayout
  * @end
  */

 /**
  * @class TextNode
  * @bases Span
  * @get length {uint}
  * @get,set value {String}
  * @get text_baseline {float}
  * @get text_height {float}
  * @end
  */

 /**
  * @class Box abstract class
  * @bases Layout
  * @get,set width {Value}
  * @get,set height {Value}
  * @get,set margin_left {Value}
  * @get,set margin_top {Value}
  * @get,set margin_right {Value}
  * @get,set margin_bottom {Value}
  * @get,set border_left {Border}
  * @get,set border_top {Border}
  * @get,set border_right {Border}
  * @get,set border_bottom {Border}
  * @get,set border_left_width {float}
  * @get,set border_top_width {float}
  * @get,set border_right_width {float}
  * @get,set border_bottom_width {float}
  * @get,set border_left_color {Color}
  * @get,set border_top_color {Color}
  * @get,set border_right_color {Color}
  * @get,set border_bottom_color {Color}
  * @get,set border_radius_left_top {float}
  * @get,set border_radius_right_top {float}
  * @get,set border_radius_right_bottom {float}
  * @get,set border_radius_left_bottom {float}
  * @get,set background_color {Color}
  * @get,set newline {bool}
  * @get final_width {float}
  * @get final_height {float}
  * @get final_margin_left {float}
  * @get final_margin_top {float}
  * @get final_margin_right {float}
  * @get final_margin_bottom {float}
  * @set margin {Value}
  * @set border {Border}
  * @set border_width {float}
  * @set border_color {Color}
  * @set border_radius {float}
  * @end
  */

/**
 * @class Div
 * @bases Box
 *  @get,set content_align {ContentAlign}
 * @end
 */

/**
 * @class Hybrid
 * @bases Box, TextLayout
 *  @get,set text_align {TextAlign}
 * @end
 */

/**
 * @class Limit
 * @bases Div
 *  @get,set min_width {Value}
 *  @get,set min_height {Value}
 *  @get,set max_width {Value}
 *  @get,set max_height {Value}
 */

/**
 * @class Indep
 * @bases Div
 *  @get,set align_x {Align}
 *  @get,set align_y {Align}
 * @end
 */
 
/**
 * @class LimitIndep
 * @bases Indep
 *  @get,set min_width {Value}
 *  @get,set min_height {Value}
 *  @get,set max_width {Value}
 *  @get,set max_height {Value}
 */

/**
 * @class Image
 * @bases Div
 *  @get,set src {String}
 *  @get,set background_image {String}
 *  @get source_width {uint}
 *  @get source_height {uint}
 * @end
 */

 /**
  * @class SelectPanel
  */
class SelectPanel {
  event onfocus_move;
}

 /**
  * @class SelectPanel
  * @bases Div
  *
  * @get,set allow_leave {bool}
  * @get,set allow_entry {bool}
  * @get,set interval_time {uint} ms
  * @get,set enable_switch {bool}
  * @get is_activity {bool}
  * @get parent_panel {Pabel}
  * @end
  */

/**
 * @class Root
 * @bases SelectPanel
 */

 /**
  * @class BasicScroll
  *
  * @func scroll_to(scroll[,duration[,curve]])
  * @arg scroll {Vec2}
  * @arg [duration] {uint} ms
  * @arg [curve] {Curve}
  *
  * @func terminate()
  *
  * @get,set scroll {Vec2}
  * @get,set scroll_x {float}
  * @get,set scroll_y {float}
  * @get,set scroll_width {float}
  * @get,set scroll_height {float}
  * @get,set scrollbar {bool}
  * @get,set resistance {float} 0.5-...
  * @get,set bounce {bool}
  * @get,set bounce_lock {bool}
  * @get,set momentum {bool}
  * @get,set lock_direction {bool}
  * @get,set catch_position_x {float}
  * @get,set catch_position_y {float}
  * @get,set scrollbar_color {Color}
  * @get h_scrollbar {bool}
  * @get v_scrollbar {bool}
  * @get,set scrollbar_width {float}
  * @get,set scrollbar_margin {float}
  * @get,set default_scroll_duration {uint} ms
  * @get,set default_scroll_curve {Curve}
  * 
  * @end
  */

 /**
  * @class Scroll
  */
class Scroll {
  event onscroll;
}

 /** 
  * @class Scroll
  * @bases Panel,BasicScroll
  *
  * @get,set focus_margin_left {float}
  * @get,set focus_margin_right {float}
  * @get,set focus_margin_top {float}
  * @get,set focus_margin_bottom {float}
  * @get,set focus_align_x {Align}
  * @get,set focus_align_y {Align}
  * @get,set enable_focus_align {bool}
  * @get,set enable_fixed_scroll_size {Vec2}
  * @end
  */

 /**
  * @class Button 
  * @bases Hybrid
  */
export class Button extends exports.Button {
  
  m_default_highlighted: true;
  
  /**
   * @overwrite
   */
  $get_noticer(name) { 
    var noticer = this['__on' + name];
    if ( ! noticer ) {
      if ( name == 'click' ) {
        super.$get_noticer('highlighted'); // bind highlighted
      }
      return super.$get_noticer(name);
    }
    return noticer;
  }
  
  /**
   * @get default_highlighted {bool}
   */
  get default_highlighted() {
    return this.m_default_highlighted; 
  }
  
  /**
   * @set default_highlighted {bool}
   */
  set default_highlighted(value) {
    this.m_default_highlighted = !!value; 
  }
  
  /**
   * @func set_highlighted(status)
   * @arg status {HighlightedStatus}
   */
  set_highlighted(status) {
    if ( this.m_default_highlighted ) {
      if ( status == event.HIGHLIGHTED_HOVER ) {
        this.transition({ opacity: 0.7, time: 80 });
      } else if ( status == event.HIGHLIGHTED_DOWN ) {
        this.transition({ opacity: 0.35, time: 50 });
      } else {
        this.transition({ opacity: 1, time: 180 });
      }
    }
  }
  
  /**
   * @overwrite
   */
  trigger_highlighted(evt) {
    this.set_highlighted(evt.status);
    return this.trigger_with_event('highlighted', evt);
  }
}

 /**
  * @class Button
  * @bases Hybrid
  *
  * @func find_next_button(direction)
  * @arg direction {Direction}
  * @ret {Button}
  * 
  * @get panel {Panel}
  * @end
  */

 /**
  * @class Text
  * @bases Hybrid
  * @get length {uint}
  * @get value {uint}
  * @get text_hori_bearing {float}
  * @get text_height {float}
  * @end
  */

 /**
  * @class Input
  * @bases Text
  * @get,set type {KeyboardType}
  * @get,set return_type {KeyboardReturnType}
  * @get,set placeholder {String}
  * @get,set placeholder_color {Color}
  * @get,set security {bool}
  * @get,set text_margin {float}
  * @end
  */

 /**
  * @class Textarea
  * @bases Input, BasicScroll
  * @end
  */

 /**
  * @class Clip
  * @bases Div
  * @end
  */

util.ext_class(exports.View, View);
util.ext_class(exports.SelectPanel, SelectPanel);
util.ext_class(exports.Scroll, Scroll);

 /**
  * @func is_view_xml(vx[,type])
  * @arg vx {Object}
  * @arg [type] {class}
  * @ret {[`bool`]}
  */
function is_view_xml(vx, type) {
  if ( vx ) {
    if ( vx.__tag__ ) {
      if ( type ) {
        return util.equals_class(type, vx.__tag__);
      } else {
        return true;
      }
    }
  }
  return false;
}

export {

  /**
   * @class GUIApplication
   */
  GUIApplication: app.GUIApplication,

  /**
   * @class ViewController
   */
  ViewController: ctr.ViewController,

  /**
   * @func next_frame(cb)
   * @arg cb {Function}
   */
  next_frame: display_port.next_frame,

  /**
   * @func New(vx[,parent[,...args]][,...args])
   * @arg vx {Object}
   * @arg [parent] {View}
   * @arg [...args]
   * @ret {View|ViewController}
   */
  New: ctr.New,

  /**
   * @func CSS(sheets)
   * @arg sheets {Object}
   */
  CSS: css.CSS,

  /**
   * @get app {GUIApplication} get current application object
   */
  get app() { return app.current },

  /**
   * @get root {Root} get current root view
   */
  get root() { return app.root },

  /**
   * @get root_ctr {ViewController} get current root view controller
   */
  get root_ctr() { return app.root_ctr },

  /**
   * @get display_port {DisplayPort} get current display port
   */
  get display_port() { return app.current.display_port },

  /**
   * @get atom_px {float}
   */
  get atom_px() { return display_port.atom_px },

  is_view_xml: is_view_xml,
};

