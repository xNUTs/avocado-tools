import { Scroll, Div, Clip, Text } from ':gui';
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

export const vx = (

  <Mynavpage title="Examples" source=$(__filename)>

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

      <Div height=15 width="full" />
    </Scroll>

  </Mynavpage>

)

