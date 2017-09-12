import { Div, Button, Input } from ':gui';
import ':util/storage';
import alert from ':gui/dialog';
import Mynavpage from 'public.jsx';

const key = 'test';

function keyenter(evt) {
	evt.sender.blur();
}

function Get(evt) {
  var val = storage.get(key);
  if ( val ) {
    alert(storage.get(key));
  } else {
    alert('No local storage data！');
  }
}

function Set(evt) {
	storage.set(key, evt.sender.top_ctr.find('input').value);
  alert('Save local data OK.');
}

function Del(evt) {
	storage.del(key);
  alert('Delete local data OK.');
}

function Clear(evt) {
	storage.clear(key);
  alert('Delete All local data OK.');
}

export const vx = (
  <Mynavpage title="Local Storage" source=$(__filename)>
    <Div width="full">
    	<Input class="input" id="input" 
    		placeholder="Please enter value .." 
    		value="Hello."
    		return_type="done" onkeyenter=keyenter />
      <Button class="long_btn" onclick=Get>Get</Button>
      <Button class="long_btn" onclick=Set>Set</Button>
      <Button class="long_btn" onclick=Del>Del</Button>
      <Button class="long_btn" onclick=Clear>Clear</Button>
    </Div>
  </Mynavpage>
)