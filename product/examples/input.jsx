import ':gui';
import { Div, Button, Text, Input, Textarea } from ':gui';
import Mynavpage from 'public.jsx';

function start_input(evt) {
  evt.sender.top_ctr.find('input1').focus();
}

function end_input(evt) {
  gui.app.focus_view.blur();
}

export const vx = (
  <Mynavpage title="Input" source=$(__filename)>
    <Div width="full">
      <Text margin=10 text_background_color="#000" text_color="#fff">Examples Input</Text>
      
      <Input id="input0" margin=10 
        width="full" 
        height=30  
        background_color="#eee"
        type="phone"
        return_type="next"
        border_radius=8 placeholder="Please enter.." />

      <Input id="input1" margin=10 
        width="full" 
        text_color="#fff"
        background_color="#000"
        height=30  
        border="0 #f00" 
        border_radius=0
        type="decimal"
        text_align="center" 
        placeholder="Please enter.." value="Hello" />
      
      <Textarea margin=10 
        width="full" 
        height=120 
        text_color="#000"
        border="0 #aaa" 
        background_color="#eee"
        border_radius=8
        return_type="next"
        placeholder="Please enter.."
        text_size=14
        text_align="center" />
        
      <Button class="long_btn" onclick=end_input>Done</Button>
      <Button class="long_btn" onclick=start_input>Input</Button>
        
    </Div>
  </Mynavpage>
)