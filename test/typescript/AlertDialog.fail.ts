import {AlertDialog, Button, TextInput, Composite} from 'tabris';
import { ContentView } from 'tabris';

const textInputs: ContentView<TextInput> = [new TextInput(), new TextInput()] as any;
const notTextInputs = new Button();
let alertDialog:AlertDialog = new AlertDialog({textInputs});
alertDialog.textInputs = textInputs;
alertDialog.textInputs = new Composite();
alertDialog.textInputs.append(notTextInputs);

/*Expected
(6,
(7,
read-only
(8,
read-only
(9,
not assignable
*/
