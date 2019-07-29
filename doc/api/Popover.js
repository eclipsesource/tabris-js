import {Popover, TextView} from 'tabris';

const popover = new Popover();
popover.contentView.append(new TextView({text: 'Hello Popover'}));
popover.open();
