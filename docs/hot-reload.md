# Hot-Reloading implementation

## Steps:

### Using `Rollup, Babel, etc.`

Paste the this script after all dependecies in `configuration js file`.
```javascript
import ...
import ...
// all dependecies
import './server';
```

### Without bundler

Just call the from bash/command prompt
```bash
node server.js
```