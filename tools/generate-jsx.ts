import * as fs from 'fs-extra';
import * as schema from './api-schema';
import {
  TextBuilder, capitalizeFirstChar, filter, ApiDefinitions, ExtendedApi, Methods,
  readJsonDefs, lowercaseFirstChar, createDoc, createEventTypeName
} from './common';

const BASIC_TYPES = ['boolean', 'number', 'string', 'symbol', 'any', 'object', 'Date'];

const header = `
type Image = tabris.Image;
type Selector = tabris.Selector;

declare namespace JSX {

  function createElement(type: string|Function, properties: object, ...children: Array<ElementClass>): ElementClass;

  interface ElementClass extends tabris.Widget { }

  type Element = any;

  interface ElementAttributesProperty {
    jsxProperties: any;
  }
`.trim();

const footer = `
}

`.trim();

exports.generateJsx = function generateJsx({files}) {
  let apiDefinitions = readJsonDefs(files);
  let text = new TextBuilder();
  renderDts(text, filter(apiDefinitions, def => !def.namespace || def.namespace === 'tabris'));
  fs.writeFileSync('build/tabris/Jsx.d.ts', text.toString());
};

function renderDts(text: TextBuilder, apiDefinitions: ApiDefinitions) {
  text.append(header);
  Object.keys(apiDefinitions).forEach(name => {
    appendEventsInterface(text, apiDefinitions[name]);
    text.append('');
  });
  Object.keys(apiDefinitions).forEach(name => {
    appendJsxPropertiesInterface(text, apiDefinitions[name]);
    text.append('');
  });
  text.append('');
  text.indent++;
  appendIntrinsicElementsInterface(text, apiDefinitions);
  text.indent--;
  text.append(footer);
}

function appendEventsInterface(text: TextBuilder, def: ExtendedApi) {
  text.append(createEventsInterfaceBodyOpen(def));
  text.indent++;
  appendEvents(text, def);
  text.indent--;
  text.append('}');
}

function createEventsInterfaceBodyOpen(def) {
  let str = 'interface ' + def.type + 'Events';
  if (def.extends) {
    str += ' extends ' + def.extends + 'Events';
  }
  return str + ' {';
}

function appendEvents(text: TextBuilder, def: ExtendedApi) {
  if (def.isNativeObject) {
    if (def.events) {
      Object.keys(def.events).sort().forEach(name => {
        text.append('');
        text.append(createEvent(def.type, name, def.events[name]));
      });
    }
    if (def.properties) {
      Object.keys(def.properties).filter(name => !def.properties[name].static).sort().forEach(name => {
        text.append('');
        text.append(createPropertyChangedEvent(def.type, name, def.properties[name]));
      });
    }
  }
}

function createEvent(widgetName: string, eventName: string, event: schema.Event) {
  let result = [];
  result.push(createDoc(Object.assign({}, event, {parameters: []})));
  result.push(`on${capitalizeFirstChar(eventName)}?: `
    + `(event: tabris.${createEventTypeName(widgetName, eventName, event)}) => void;`);
  return result.join('\n');
}

function createPropertyChangedEvent(widgetName: string, propName: string, property: schema.Property) {
  let result = [];
  let standardDescription = `Fired when the [*${propName}*](#${propName}) property has changed.`;
  let defType = property.ts_type || property.type;
  let changeEvent = {
    description: property.changeEventDescription || standardDescription,
    parameters: [{
      name: 'value',
      type: defType,
      description: `The new value of [*${propName}*](#${propName}).`
    }]
  };
  result.push(createDoc(changeEvent));
  let fullType = (isBasicType(defType) ? '' : 'tabris.') + defType;
  result.push(`on${capitalizeFirstChar(propName)}Changed?: `
    + `(event: tabris.PropertyChangedEvent<tabris.${widgetName}, ${fullType}>) => void;`);
  return result.join('\n');
}

function appendJsxPropertiesInterface(text: TextBuilder, def: ExtendedApi) {
  if (def.isNativeObject) {
    text.append(createJsxPropertiesInterface(def));
  }
}

function appendIntrinsicElementsInterface(text: TextBuilder, apiDefinitions: ApiDefinitions) {
  text.append('interface IntrinsicElements {');
  text.indent++;
  Object.keys(apiDefinitions).filter(name => apiDefinitions[name].isNativeObject).forEach(name => {
    let propertiesInterface = `${apiDefinitions[name].type}Properties`;
    text.append(`${lowercaseFirstChar(apiDefinitions[name].type)}: ${propertiesInterface};\n`);
  });
  text.append('widgetCollection: {}');
  text.indent--;
  text.append('}');
}

function createJsxPropertiesInterface(def: ExtendedApi) {
  let propertiesInterface = `${def.type}Properties`;
  let eventsInterface = `${def.type}Events`;
  return `export type ${propertiesInterface} = tabris.${propertiesInterface} & ${eventsInterface};`;
}

function isBasicType(type: string) {
  let isBasicType = type[0] === '{' || type[0] === '(';
  for (let basicType of BASIC_TYPES) {
    isBasicType = isBasicType || type.startsWith(basicType);
  }
  return isBasicType;
}
