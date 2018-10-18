import {ActionSheet} from 'tabris';

ActionSheet.open(<ActionSheet />).fooBar(); // ensure it's not "any"

/*Expected
(3,
Property 'fooBar' does not exist
*/