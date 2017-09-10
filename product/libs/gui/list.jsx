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

import { 
  ViewController, Div, Hybrid, New, 
  Text, TextNode, Label, is_view_xml,
} from ':gui';
import empty_view_xml from ':gui/ctr';

function get_child_text_type(vx) {
  if ( is_view_xml(vx, Div) ) {
    return Text;
  } else if ( is_view_xml(vx, Hybrid) ) {
    return TextNode;
  } else {
    return Label;
  }
}

/**
 * @class List
 */
export class List extends ViewController {
  
  m_item_vx: '';
  m_data: null;
  m_items: null;
  
  /**
   * @func item
   */
  item(index) { return this.m_items[index] || null }
  
  /**
   * @get length 
   */
  get length() { return this.m_data.length }
  
  /**
   * @get data
   */
  get data() { return this.m_data }
  
  /**
   * @set data
   */
  set data(value) {
    if ( !Array.isArray(value) ) {
      throw new Error('Bad argument.');
    }
    
    this.view.remove_all_child();
    this.m_data = value;
    this.m_items = [];
    
    var view = this.view;

    value.forEach((item, i)=>{
      item._index = i;
      this.m_items.push(New(<vx:this.m_item_vx vdata=item />, view));
    })
  }
  
  /**
   * @constructor
   */
  constructor(msg) {
    super(msg);
    this.m_data = [];
    this.m_items = [];
  }
  
  /**
   * @overwrite
   */
  load_view(vx) {

    if ( vx instanceof __bind ) { // data bind
      throw new Error('Bad argument. list controller view cannot use full data bind');
    } else { // view xml

      var item_vx = vx.__child__[0] || empty_view_xml;
      var test_vx = item_vx;

      if ( item_vx instanceof __bind ) {
        // test data bind
        test_vx = item_vx.exec({ }, this);
      }

      // data template need is the view controller
      if ( is_view_xml(test_vx) ) {
        if ( !is_view_xml(test_vx, ViewController) ) {
          item_vx = <ViewController>${item_vx}</ViewController>
        }
      } else {
        var TextType = get_child_text_type(vx);
        item_vx = <ViewController><TextType>${item_vx}</TextType></ViewController>
      }

      this.m_item_vx = item_vx;

      super.load_view({ __proto__:vx, __child__:[] }); // ignore child views
    }
  }

  push(item) {
    item._index = this.m_data.length;
    this.m_data.push(item);
    this.m_items.push(New(<vx:this.m_item_vx vdata=item />, this.view));
  }
  
  pop() {
    if ( this.m_data.length ) {
      this.m_data.pop();
      this.m_items.pop().remove();
    }
  }
  
  shift() {
    if ( this.m_data.length ) {
      this.m_data.shift();
      this.m_items.shift().remove();
    }
  }
  
  unshift(item) {
    item._index = 0;
    this.m_data.unshift(item);
    this.m_items.unshift(New(<vx:this.m_item_vx vdata=item />));
    this.view.prepend(this.m_items[0]);
  }
  
  splice(index, length, ...data) {
    var begin = Math.min(Math.max(0, index), this.m_items.length);
    var end = Math.min(Math.max(0, begin + length), this.m_items.length);

    for ( index = begin; index < end; index++ ) {
      data[index]._index = index;
      this.m_items[index].remove();
    }
    
    var views = [];
    var prev = this.m_items[begin - 1] || null;

    for ( var i of data ) {
      var view = New(<vx:this.m_item_vx vdata=i />);

      if ( prev ) {
        prev.after(view);
      } else {
        this.view.prepend(view);
      }
      views.push(view);
      prev = view;
    }

    this.m_data.splice(begin, end - begin, ...data);
    this.m_items.splice(begin, end - begin, ...views);
  }
  
}
