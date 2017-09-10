import { Scroll, Text } from ':gui';
import Mynavpage from 'public.jsx';
import Toolbar from ':gui/nav';
import ':util/reader';

function foreground(evt) {
  var navpage = evt.sender;
  navpage.title = 'Source';
  navpage.find('text').value = reader.read_sync(navpage.prev_page.source).to_string();
}

export const vx = (
  <Mynavpage 
    navbar.background_color="#333"
    navbar.back_text_color="#fff" 
    navbar.title_text_color="#fff"
    toolbar.background_color="#333"
    toolbar.hidden=true 
    background_color="#333" onforeground=foreground>
    <Scroll width="full" height="full" bounce_lock=0>
      <Text width="full" id="text" text_color="#fff" text_size=14 margin=5 />
    </Scroll>
  </Mynavpage>
)
