import MapMgr from './MapMgr';
import ObjectMod from './ObjectMod';

var Data = function Data(d) {
				ObjectMod.assign(this, MapMgr.Map2Obj(d || {}), true);
				ObjectMod.freeze(this, true);
				return this;
			}
			Data.prototype = {
				set: function (d, v) {
					ObjectMod.unfreeze(this, true);
					if (typeof d === "object" && !Array.isArray(d)) {
						ObjectMod.assign(this, MapMgr.Map2Obj(d || {}), true);
					} else {
						if (typeof d === "string") {
							this[d] = typeof(v) === "function" ? v(this[d]) : v;
						} else if (Array.isArray(d)) {
							ObjectMod.findObjByProp(this, d, v);
						}
					}
					ObjectMod.freeze(this, true);
					return this;
				},
				get: function (prop) {
					if (typeof prop === "object") {
						return ObjectMod.findObjByProp(this, prop);
					} else {
						return this[prop];
					}
					return null;
				},
				map: function (fn, scope) {
					for (let p in this) {
						fn.call(scope || this, this[p], p);
					}
					return this;
				}
			};
			Data.prototype.constructor = Data;
			export default Data;
