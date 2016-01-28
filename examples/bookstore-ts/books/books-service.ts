declare var require: any;
const books = require("./books.json");

import { loremIpsum  } from './../texts';


export function getBooks(filter? : Function = () => true) {
  return books.filter(filter)
};

export function getRelatedBooks(bookId: string) {
  return books.filter( book => {
    return (book.id !== bookId && Math.random() > 0.5);
  })
};


export function getBookComments(bookId: string) {
  if(Math.random() > 0.5){
    return [
      {
        user:{
          name: "Shai Alon",
          avatar: "http://www.gravatar.com/avatar/4dadde84006bb046b49769eed66c7f44?s=200",
        },
        text: `Eric Arthur Blair was an important English writer that you probably already know by the pseudonym of George Orwell. He wrote quite a few books, but many believe that his more influential ones were "Animal farm" (1944) and "1984" (1948).In those two books he conveyed, metaphorically and not always obviously, what Soviet Russia meant to him.
                I would like to make some comments about the second book, "1984". That book was written near his death, when he was suffering from tuberculosis, what might have had a lot to do with the gloominess that is one of the essential characteristics of "1984". The story is set in London, in a nightmarish 1984 that for Orwell might well have been a possibility, writting as he was many years before that date. Or maybe, he was just trying to warn his contemporaries of the dangers of not opposing the Soviet threat, a threat that involved a new way of life that was in conflict with all that the English held dear.
                Orwell tried to depict a totalitarian state, where the truth didn't exist as such, but was merely what the "Big Brother" said it was. Freedom was only total obedience to the Party, and love an alien concept, unless it was love for the Party. The story is told from the point of view of Winston Smith, a functionary of the Ministry of Truth whose work involved the "correction" of all records each time the "Big Brother" decided that the truth had changed. The Party slogan said that "Who controls the past controls the future: who controls the present controls the past", and they applied it constantly by "bringing up to date" the past so as to make it coincide with whatever the Party wanted.`
      },
      {
        user:{
          name: "Ilya",
          avatar: "http://www.gravatar.com/avatar/b8e2ef5495f109ad48c74f5e732f558c?s=200",
        },
        text: `I think its bad..`
      }
    ];
  }
  else {
    return [];
  }
};


export function getBookPreview(bookId: string) {
  return loremIpsum;
};
