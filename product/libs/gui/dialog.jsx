/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2015-2017, xuewen.chu
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
import 'gui';
import { 
  CSS, New, Indep, Hybrid, Clip, Input, Span,
  LimitIndep, Div, Limit, Text, Button, Panel, atom_px
} from 'gui';
import Navigation from 'nav';

CSS({
  
  '.av_dialog': {
    min_width: 380,
    max_width: '40!',
    max_height: '40!',
    align_x: 'center',
    align_y: 'center',
    background_color: '#fff',
    border_radius: 12,
  },
  
  '.av_dialog .title': {
    width: 'full',
    margin: 10,
    margin_top: 18,
    margin_bottom: 0,
    text_align: 'center',
    text_style: 'bold',
    text_size: 18,
    text_overflow: 'ellipsis',
    text_white_space: 'no_wrap',
  },
  
  '.av_dialog .content': {
    width: 'full',
    margin: 10,
    margin_top: 2,
    margin_bottom: 20,
    text_align: 'center',
    text_size: 14,
  },
  
  '.av_dialog .buttons': {
    width: 'full',
    border_radius_left_bottom: 12,
    border_radius_right_bottom: 12,
  },
  
  '.av_dialog .button': {
    height: 43,
    border_top: `${atom_px*0.7} #9da1a0`,
    text_size: 18,
    text_line_height: 43,
    text_color:"#0079ff",
  },
  
  '.av_dialog .button:normal': {
    background_color: '#fff0', time: 180
  },
  
  '.av_dialog .button:hover': {
    background_color: '#E1E4E455', time: 50
  },
  
  '.av_dialog .button:down': {
    background_color: '#E1E4E4', time: 50
  },
  
  '.av_dialog .prompt': {
    margin_top: 10,
    width: "full",
    height: 30,
    background_color: "#eee",
    border_radius: 8,
  },
  
})

function compute_buttons_width(self) {
  
  var btns = self.buttons;
  
  if ( btns.length == 1 ) {
    btns[0].width = 'full';
  } else {
    var main_width = self.find('m_main').final_width;
    if ( main_width ) {
      for ( var btn of btns ) {
        btn.width = (main_width / btns.length) - ((btns.length - 1) * atom_px);
        btn.border_left = `${atom_px} #9da1a0`;
      }
      btns[0].border_left_width = 0;
    }
  }
}

function close(self) {
  if ( self.default_close ) 
    self.close();
}

/**
 * @class Dialog
 */
export class Dialog extends Navigation {

  m_btns_count: 0;
  
  /**
   * @event onclick_button
   */
  event onclick_button;
  
  /**
   * @default_close
   */
  default_close: true;

  /**
   * @get length btns
   */
  get length() {
    return this.m_btns_count;
  }
  
  /**
   * @overwrite
   */
  load_view(vx) {
    
    super.load_view(
      <Indep 
        width="full" 
        height="full" background_color="#0005" receive=1 visible=0 opacity=0>
        <LimitIndep id="m_main" class="av_dialog" align_x="center" align_y="center">
          <Hybrid id="m_title" class="title" />
          <Hybrid id="m_con" class="content">${vx}</Hybrid>
          <Clip id="m_btns" class="buttons" />
        </LimitIndep>
      </Indep>
    );
    
    this.view.append_to(gui.root);
  }
  
  get title() { return this.find('m_title').inner_text }
  get content() { return this.find('m_con').inner_text }
  set title(value) {
    this.find('m_title').remove_all_child();
    this.find('m_title').append_text(value || '');
  }
  set content(value) { 
    this.find('m_con').remove_all_child();
    this.find('m_con').append_text(value || '');
  }
  
  get buttons() {
    var btns = this.find('m_btns');
    var count = btns.children_count;
    var rv = [];
    for ( var i = 0; i < count; i++ ) {
      rv.push( btns.children(i) );
    }
    return rv;
  }
  
  set buttons(btns) {
    if ( Array.isArray(btns) ) {
      this.find('m_btns').remove_all_child();
      this.m_btns_count = btns.length;

      for ( var i = 0; i < btns.length; i++ ) {
        var btn = New(
          <Button 
            index=i
            class="button" 
            width="full"
            onclick="trigger_click_button"
            default_highlighted=0>${btns[i]}</Button>,
          this.find('m_btns')
        );
      }
      if ( this.visible ) {
        compute_buttons_width(this);
      }
    }
  }
  
  show() {
    if ( !this.visible ) {
      this.view.append_to(gui.root);
      this.visible = 1;
      
      gui.next_frame(()=>{
        compute_buttons_width(this);
        var main = this.find('m_main');
        main.origin_x = main.final_width / 2;
        main.origin_y = main.final_height / 2;
        main.scale = '0.3 0.3';
        main.transition({ scale : '1 1', time: 200 });
        this.view.opacity = 0.3;
        this.transition({ opacity : 1, time: 200 });
      });
      this.register_navigation(0);
    }
  }
  
  close() {
    if ( this.visible ) {
      var main = this.find('m_main');
      main.origin_x = main.final_width / 2;
      main.origin_y = main.final_height / 2;
      main.transition({ scale : '0.5 0.5', time: 200 });
      this.transition({ opacity : 0.15, time: 200 }, ()=>{ this.remove() });
      this.unregister_navigation(0, null);
    } else {
      this.unregister_navigation(0, null);
      this.remove();
    }
  }

  trigger_click_button(evt) {
    this.trigger('click_button', evt.sender.index);
    close(this);
  }

  /**
   * @overwrite 
   */
  navigation_back() {
    if ( this.length ) {
      this.trigger('click_button', 0);
    }
    close(this);
    return true;
  }

  /**
   * @overwrite 
   */
  navigation_enter(focus) {
    if ( !this.view.has_child(focus) ) {
      if ( this.length ) {
        this.trigger('click_button', this.length - 1);
      }
      close(this);
    }
  }
}

export const CONSTS = {
  OK: 'OK',
  Cancel: 'Cancel',
  placeholder: 'Please enter..',
};

export function alert(msg, cb = util.noop) {
  var dag = New(
    <Dialog buttons=[CONSTS.OK] onclick_button=(e=>cb(e.data))>${msg}</Dialog>
  );
  dag.show();
  return dag;
}

export function confirm(msg, cb = util.noop) {
  var dag = New(
    <Dialog buttons=[CONSTS.Cancel, CONSTS.OK] onclick_button=(e=>cb(e.data))>${msg}</Dialog>
  );
  dag.show();
  return dag;
}

function handle_prompt_enter(ev) {
  var dag = ev.sender.top_ctr;
  dag.trigger('click_button', 1);
  close(dag);
}

export function prompt(msg, text = '', cb = util.noop) {
  if ( typeof text == 'function' ) {
    cb = text;
    text = '';
  }
  var dag = New(
    <Dialog buttons=[CONSTS.Cancel, CONSTS.OK] 
      onclick_button=(e=>cb(e.data, e.data ? dag.find('m_input').value: ''))>
      <Span>
        ${msg}
        <Input id="m_input" class="prompt"
          return_type="done" onkeyenter=handle_prompt_enter
          value=text placeholder=CONSTS.placeholder />
      </Span>
    </Dialog>
  );
  dag.show();
  dag.find('m_input').focus();
  return dag;
}

export function show(title, msg, buttons, cb = ()=>{ }) {
  var dag = New(
    <Dialog title=title buttons=buttons onclick_button=(e=>cb(e.data))>${msg}</Dialog>
  );
  dag.show();
  return dag;
}
