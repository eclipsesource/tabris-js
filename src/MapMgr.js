
		const MapHas = typeof(window) !== "undefined" && window.Map ? window.Map : typeof(exports) !== "undefined" && exports.Map ? exports.Map : typeof(global) !== "undefined" && global.Map ? global.Map : undefined;

		const MapMgr = {
			Map2Obj: function Map2Obj(map) {
				let obj = {};
				if (MapHas && map instanceof MapHas) {
					map.forEach((val, prop) => {
						if (MapHas && typeof val === "object" && val instanceof MapHas) {
							obj[prop] = MapMgr.Map2Obj(val);
						} else {
							obj[prop] = val;
						}
					});
				} else {
					obj = JSON.parse(JSON.stringify(map));
				}
				return obj;
			},
			Obj2Map: function Obj2Map(obj) {
				let map = new Map();
				for (let prop in obj) {
					if (typeof obj[prop] === "object" && !(obj[prop]instanceof MapHas)) {
						map.set(prop, MapMgr.Obj2Map(obj[prop]));
					} else {
						map.set(prop, obj[prop]);
					}
				}
				return map;
			}
		}
		
		export default MapMgr;