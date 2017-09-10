
import ':gui';
import ':util';
import ':util/sys';
import ':util/buffer';
import {
  GUIApplication, Root, Scroll, CSS, atom_px,
  Div, Hybrid, Clip, Text, Button, Image
} from ':gui';
import { NavpageCollection, Toolbar } from ':gui/nav';
import { Navbutton, Mynavpage } from 'public.jsx';

import 'components.jsx';
import 'input.jsx';
import 'icons.jsx';
import 'media.jsx';
import 'action.jsx';
import 'fs.jsx';
import 'http.jsx';
import 'zlib.jsx';
import 'storage.jsx';
import 'about.jsx';
import 'review.jsx';

CSS({
  
  '.category_title': {
    width: 'full',
    text_line_height: 30,
    text_color: '#aaa',
    text_size: 14,
    margin: 15,
    margin_top: 10,
    margin_bottom: 10,
  },
  
  '.category': {
    width: 'full',
    margin_left: 15,
    margin_right: 15,
    border: `${atom_px} #ccc`,
    border_radius: 10,
  },
  
  '.toolbar_btn': {
    margin: 8,
    text_family: 'icon',
    text_size: 24,
  }
  
})

function review_code(evt) {
  evt.sender.top_ctr.collection.push(review.vx, 1);
}

var default_toolbar_vx = (
  <Toolbar>
    <Hybrid text_align="center" width="full" height="full">
      <Button onclick=review_code>
        <Text class="toolbar_btn">\ue9ab</Text>
      </Button>
    </Hybrid>
  </Toolbar>
)

var app = new GUIApplication({ multisample: 2, mipmap: 1 }).start(
  <Root>

    <NavpageCollection id="npc" default_toolbar=default_toolbar_vx>
      <Mynavpage title="Avocado Examples" source=$(__filename)>

        <Scroll width="full" height="full" bounce_lock=0>

          <Text class="category_title">GUI.</Text>
          <Clip class="category">
            <Navbutton next=components.vx id="btn0">Components</Navbutton>
            <Navbutton next=media.vx>Multi-Media</Navbutton>
            <Navbutton next=input.vx>Input</Navbutton>
            <Navbutton next=icons.vx>Icons</Navbutton>
            <Navbutton next=action.vx view.border_width=0>Action</Navbutton>
          </Clip>
          
          <Text class="category_title">Basic util.</Text>
          <Clip class="category">
            <Navbutton next=fs.vx>File System</Navbutton>
            <Navbutton next=http.vx>Http</Navbutton>
            <!--Navbutton next=zlib.vx>Zlib</Navbutton-->
            <Navbutton next=storage.vx view.border_width=0>Local Storage</Navbutton>
          </Clip>
          
          <Text class="category_title">About.</Text>
          <Clip class="category">
            <Navbutton next=about.vx view.border_width=0>About Avocado</Navbutton>
          </Clip>
          
          <Div height=15 width="full" />
        </Scroll>

      </Mynavpage>
    </NavpageCollection>
  </Root>
)

