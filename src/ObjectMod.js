

		var isFrozen = {}, ObjectMod = {
			freeze: function freeze(obj, deep, writable) {
				if (writable === undefined) {
					writable = false;
				}
				if (isFrozen[obj] && !writable) return obj;
				if (deep) {
					Object.getOwnPropertyNames(obj).map(function(name) {
						var prop = obj[name];

						// Freeze prop if it is an object
						if (typeof prop == 'object') {
							ObjectMod.freeze(prop, deep, writable);
						}
					});
				}
				for (var prop in obj) {
					Object.defineProperty(obj, prop, {
						value: obj[prop],
						writable: writable
					});
				}
				isFrozen[obj] = !writable;
				return obj;
			},
			unfreeze: function unfreeze(obj, deep) {
				if (!isFrozen[obj])
					return obj;
				return ObjectMod.freeze(obj, deep, true);
			},
			findObjByProp: function findObjByProp(obj, prop, val) {
				let find = val;
				let prop2 = Array.isArray(prop) ? prop.shift() : prop;
				for (let p in obj) {
					if (obj[prop2] !== undefined) {
						find = obj[prop2];
						if (val !== undefined) {
							obj[prop2] = val;
						}
						if (prop.length > 0) {
							find = findObjByProp(find, prop, val);
							if (prop.length === 0) return find;
						}
					} else {
						find = findObjByProp(obj[p], prop2, val); 
					}
				}
				return find;
			},
			isFrozen: function isFrozen(obj) {
				return isFrozen[obj];
			},
			assign: function assign() {
				var args = [].slice.call(arguments);
				var orig = args.shift();
				var force = typeof args[args.length - 1] === "boolean" ? args.pop() : false;
				args.map(function(arg) {
					for (var p in arg) {
						if (force && orig) {
							orig[p] = ObjectMod.assign(arg[p], orig[p]);
						} else {
							if (orig && orig[p] === undefined) {
								orig[p] = arg[p];
							}
						}

					}
				});
				return orig;
			}
		}
		
		export default ObjectMod;