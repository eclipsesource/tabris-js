const {compile} = require('json-schema-to-typescript');
const fs = require('fs');

// Run this script to regenerate api-schema.d.ts after changing api-schema.json:
// `node tools/json-schema-to-typescript.js`

const schema = JSON.parse(fs.readFileSync(__dirname + '/api-schema.json'));
// Workaround preventing nearly empty output, possibly related to:
// https://github.com/bcherny/json-schema-to-typescript/issues/167
delete schema.definitions.api.allOf;
compile(schema, 'TabrisAPI')
  .then(ts => fs.writeFileSync(__dirname + '/api-schema.d.ts', ts));
