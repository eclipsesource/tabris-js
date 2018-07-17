import {TextInput} from 'tabris';

let widget = new TextInput();

const type = widget.type;
widget.set({type});
widget.type = type;
widget.on({typeChanged: function() {}});

/*Expected
(8,12): error TS2345
'typeChanged' does not exist
*/
