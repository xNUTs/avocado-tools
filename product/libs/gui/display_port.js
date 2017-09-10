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
import 'app';
import NativeNotification from ':util/event';
export binding('_gui');

/**
 * @class DisplayPort
 */
class DisplayPort extends NativeNotification {
  event onchange;
  event onorientation;
  event onrender;
}

/**
 * @enum Orientation
 * ORIENTATION_INVALID
 * ORIENTATION_PORTRAIT
 * ORIENTATION_LANDSCAPE
 * ORIENTATION_REVERSE_PORTRAIT
 * ORIENTATION_REVERSE_LANDSCAPE
 * ORIENTATION_USER
 * ORIENTATION_USER_PORTRAIT
 * ORIENTATION_USER_LANDSCAPE
 * ORIENTATION_USER_LOCKED
 */

/**
 * @enum StatusBarStyle
 * STATUS_BAR_STYLE_WHITE
 * STATUS_BAR_STYLE_BLACK
 */

 /**
  * @class DisplayPort
  *
  * @func lock_size([width[,height]])
  * @arg [width=0] {float}
  * @arg [height=0] {float}
  *
  * width与height都设置为0时自动设置一个最舒适的默认显示尺寸
  *
  * 设置锁定视口为一个固定的逻辑尺寸,这个值改变时会触发change事件
  *
  * 如果width设置为零表示不锁定宽度,系统会自动根据height值设置一个同等比例的宽度
  * 如果设置为非零表示锁定宽度,不管display_port_size怎么变化对于编程者来说,这个值永远保持不变
  *
  * 如果height设置为零表示不锁定,系统会自动根据width值设置一个同等比例的高度
  * 如果设置为非零表示锁定高度,不管display_port_size怎么变化对于编程者来说,这个值永远保持不变
  *
  * @func next_frame(cb)
  * @arg cb {Function}
  *
  * @get width {float} 
  * @get height {float} 
  * @get phy_width {float} 
  * @get phy_height {float} 
  * @get best_scale {float} 
  * @get scale {float} 
  * @get scale_value {Vec2}
  * @get root_matrix {Mat4} 
  * @get atom_px {float} 
  *
  * @func keep_screen(keep)
  * @arg keep {bool}
  *
  * @func status_bar_height()
  * @ret {float}
  *
  * @func set_visible_status_bar(visible)
  * @arg visible {bool}
  *
  * @func set_status_bar_style(style)
  * @arg style {StatusBarStyle}
  *
  * @func request_fullscreen(fullscreen)
  * @arg fullscreen {bool}
  *
  * @func orientation()
  * returns:
  *  ORIENTATION_PORTRAIT
  *  ORIENTATION_LANDSCAPE
  *  ORIENTATION_REVERSE_PORTRAIT
  *  ORIENTATION_REVERSE_LANDSCAPE
  * @ret {Orientation}
  *
  * @func set_orientation(orientation)
  * @arg orientation {Orientation}
  * 
  * @end
  */


  /**
   * @get default_atom_px {float} 
   */

util.ext_class(exports.DisplayPort, DisplayPort);

export {

  /**
   * @get current {DisplayPort}
   */
  get current() { return app.current.display_port; },

  /**
   * @get atom_px {float}
   */
  get atom_px() {
    return app.current ? app.current.display_port.atom_px : exports.default_atom_px;
  },

  /**
   * @func next_frame(cb)
   * @arg cb {Function}
   */
  next_frame: function(cb) {
    if ( app.current ) {
      app.current.display_port.next_frame(cb);
    } else {
      throw new Error("GUIApplication has not been created");
    }
  },
}
