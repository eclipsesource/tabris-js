import {Page} from 'tabris';

const children = $(Page).first().children();
for (const child of children) {
  console.log(child.id);
}
