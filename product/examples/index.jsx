import ':util';
import ':util/sys';
import ':util/buffer';
import {
  GUIApplication, Root, Scroll, CSS, atom_px: px,
  Div, Hybrid, Clip, Text, Button, TextNode: T, gui
} from ':gui';
import { NavpageCollection, Toolbar } from ':gui/nav';
import { Navbutton, Mynavpage } from 'public.jsx';
import 'examples.jsx';
import 'about.jsx';
import 'review.jsx';

CSS({
  
  '.category_title': {
    width: 'full',
    text_line_height: 30,
    text_color: '#6d6d72',
    text_size: 14,
    margin: 16,
  },

  '.rm_margin_top': {
    margin_top: 0,
  },

  '.text_mark': {

  },
  
  '.hello': {
  	width: 'full',
  	text_size:46, 
  	text_align:"center",
  	text_color:"#000",
  	margin: 16,
		margin_top: 18,
    margin_bottom: 18,
  },
  
  '.category': {
    width: 'full',
    border_top: `${px} #c8c7cc`,
    border_bottom: `${px} #c8c7cc`,
    background_color: '#fff',
  },

  '.toolbar_btn': {
    margin: 8,
    text_family: 'icon',
    text_size: 24,
  },

  '.codepre': {
		width:'full',
		margin:10,
		text_color:"#000",
  },

  '.codepre .tag_name': { text_color: '#005cc5' },
  '.codepre .keywork': { text_color: '#d73a49' },
  '.codepre .identifier': { text_color: '#6f42c1' },
  '.codepre .str': { text_color: '#007526' },
  
})

function review_code(evt) {
  evt.sender.top_ctr.collection.push(review.vx, 1);
}

const avocado_tools = 'https://github.com/louis-tru/avocado-tools.git';
const examples_source = 'https://github.com/louis-tru/avocado-demo.git';
const documents = 'http://avocadojs.org/';

function handle_go_to(evt) {
  var url = evt.sender.url;
  if ( url ) {
    gui.app.open_url(url);
  }
}

function handle_bug_feedback() {
  gui.app.send_email('louistru@hotmail.com', 'bug feedback');
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

var avocado_tools_vx = (
  <Mynavpage title="Avocado tools" source=$(__filename)>
    <Div width="full">
      <Hybrid class="category_title">
@@1. You can use nodejs <T text_background_color="#ddd">npm install -g avocado-tools</T>
2. Or get the node modules from Github@@
      </Hybrid>
      <Button class="long_btn rm_margin_top" onclick=handle_go_to url=avocado_tools>Go Github</Button>
    </Div>
  </Mynavpage>
)

const examples_source_vx = (
  <Mynavpage title="Examples source" source=$(__filename)>
    <Div width="full">
      <Text class="category_title">You can get the full examples source code from Github</Text>
      <Button class="long_btn rm_margin_top" onclick=handle_go_to url=examples_source>Go Github</Button>
    </Div>
  </Mynavpage>
)

var documents_vx = (
  <Mynavpage title="Documents" source=$(__filename)>
    <Div width="full">
      <Hybrid class="category_title">Now go to <T text_color="#0079ff">avocadojs.org</T> to view the document?</Hybrid>
      <Button class="long_btn" onclick=handle_go_to url=documents>Go Documents</Button>
    </Div>
  </Mynavpage>
)

var app = new GUIApplication({ multisample: 2, mipmap: 1 }).start(
  <Root>

    <NavpageCollection id="npc" default_toolbar=default_toolbar_vx>
      <Mynavpage title="Avocado" source=$(__filename)>

        <Scroll width="full" height="full" bounce_lock=0>
        	
		      <Text class="hello">Hello.</Text>
		      <Div class="category">
						<Hybrid class="codepre">
@@<T class="keywork">import</T> { <T class="identifier">GUIApplication</T>, <T class="identifier">Text</T> } <T class="keywork">from</T> <T class="str">':gui'</T>
<T class="keywork">new</T> <T class="identifier">GUIApplication</T>()<T class="keywork">.</T><T class="identifier">start</T>(
  \<<T class="tag_name">Text</T>\>hello word!\</<T class="tag_name">Text</T>\>
)@@
						</Hybrid>
					</Div>

					<Text class="category_title" />
					<Clip class="category">
						<Navbutton next=examples.vx>Examples</Navbutton>
						<Navbutton next=examples_source_vx>Examples source</Navbutton>
						<Navbutton next=avocado_tools_vx view.border_width=0>Avocado tools</Navbutton>
		      </Clip>
		     	
          <Text class="category_title" />
          <Clip class="category">
          	<Navbutton next=about.vx>About</Navbutton>
            <Navbutton next=documents_vx>Documents</Navbutton>
            <Navbutton onclick=handle_bug_feedback view.border_width=0>Bug Feedback</Navbutton>
		      </Clip>

          <Div height=32 width="full" />
        </Scroll>

      </Mynavpage>
    </NavpageCollection>
  </Root>
)

