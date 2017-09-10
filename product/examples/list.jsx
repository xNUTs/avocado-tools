import { Div, Button, CSS, Input, Text, atom_px } from ':gui';
import List from ':gui/list';
import Mynavpage from 'public.jsx';

function add(evt) {
	var text = evt.sender.top_ctr.find('input').value;
	evt.sender.top_ctr.find('list').push({ text:text });
}

function remove(evt) {
	evt.sender.top_ctr.find('list').pop();
}

function keyenter(evt) {
	evt.sender.blur();
}

export const vx = (
  <Mynavpage title="List" source=$(__filename)>
    <Div width="full">
    	<Input id="input" class="input" 
    		value="Hello." return_type="done" onkeyenter=keyenter />
      <Button class="long_btn" onclick=add>Add</Button>
      <Button class="long_btn" onclick=remove>Remove</Button>

      <List id="list">
      	<Div margin=10 width="full">
      		<Text margin=4 width="full" 
            border_bottom=`${atom_px} #aaa`>%{vd._index + 1 + ': ' + vd.text}</Text>
      	</Div>
      </List>

    </Div>
  </Mynavpage>
)