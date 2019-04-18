import {AlertDialog, Button, TextInput, Composite} from 'tabris';

const textInputs: Array<TextInput> = [new TextInput(), new TextInput()];
const notTextInputs: Array<Button> = [new Button(), new Button()];
let alertDialog = new AlertDialog({textInputs});
let alertDialog2 = new AlertDialog({});
alertDialog2.textInputs = textInputs;
alertDialog2.textInputs = new Composite();
alertDialog2.textInputs.append(notTextInputs);

/*Expected
(5,
does not exist
(7,
read-only
(8,
read-only
(9,
not assignable
*/
