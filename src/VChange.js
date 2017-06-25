// Compare object tree-table
const _VDiff = {
	_props: null,
	_children: null,
	_layoutData: null
}

// Compare string, object, number, boolean
function VStringCompare(old, _new) {
	return JSON.stringify(old) !== JSON.stringify(_new);
}

// Get objet property as array
function keys(tree) {
	return typeof tree === "object" && Object.keys(tree);
}

// Compares tree and gets result
function VCompare(old, tree, own) {
	let diff = {},
	diffAct = {},
	objP = keys(old).length > keys(tree).length ? old : tree,
	iter = own ? objP : _VDiff;
	for (let p in iter) {
		if (old[p] === undefined && tree[p] !== undefined) {
			diff[p] = tree[p];
			diffAct[p] = VAction.ACTION_ADD;
			continue;
		} else if (old[p] !== undefined && tree[p] === undefined) {
			diff[p] = old[p];
			diffAct[p] = VAction.ACTION_REMOVE;
		} else if (p === '_children' && (old[p] || tree[p])) {
			diffAct[p] = [];
			if (old[p] === undefined)
				old[p] = [];
			if (tree[p] === undefined) {
				tree[p] = [];
			}
			let largetree = old[p].length > tree[p].length ? old[p] : tree[p];
			diff[p] = largetree.map((comp, i) => {
				if (tree[p][i] === undefined && old[p][i] !== undefined) {
					if (typeof old[p][i].dispose === "function") {
						old[p][i].dispose();
					} else {
						old[p].splice(i, 1);
					}
					return false;
				} else if (tree[p][i] !== undefined && old[p][i] === undefined) {
					diffAct[p][i] = VAction.ACTION_ADD;
					return tree[p][i];
				}
					diffAct[p][i] = VAction(old[p][i], tree[p][i]);
					return VCompare(old[p][i], tree[p][i]);
				}).filter(p => p);
		} else if (VStringCompare(old[p], tree[p])) {
			diff[p] = tree[p];
			diffAct[p] = VAction(old[p], tree[p]);
		}
	}
	return {
		diff,
		diffAct
	};
}

// Compare two object
function VObjCompare(old, tree) {
	return VCompare(old, tree, true);
}

// Action types
['STAY', 'ADD', 'REMOVE', 'CHANGE', 'NOTHING', 'UNDEF'].map(type => {
	VAction['ACTION_' + type] = type;
});

// Checks and gives action based on change
function VAction(hasInOld, hasInTree) {
	return (hasInOld !== undefined && hasInTree !== undefined && hasInOld === hasInTree) ? VAction.ACTION_STAY : (
		hasInOld !== undefined && hasInTree === undefined) ? VAction.ACTION_REMOVE : (hasInOld === undefined &&
		hasInTree !== undefined) ? VAction.ACTION_ADD : (hasInOld !== undefined && hasInTree !== undefined && hasInOld !==
		hasInTree) ? VAction.ACTION_CHANGE : VAction.ACTION_NOTHING;
}

// Normalizes the comparision (best for Redux, Vuex)
function VNorm(old, tree, man) {
	let VComp = man !== undefined ? man : VCompare(old, tree);
	let {
		diff,
		diffAct
	} = VComp;
	let normalizedVTree = {};
	for (let p in diff) {
		if (diffAct[p]) {
			normalizedVTree[p] = {
				property: p,
				action: diffAct[p],
				value: diff[p]
			};
		} else {
			normalizedVTree[p] = {
				property: p,
				action: VAction.ACTION_UNDEF,
				value: diff[p]
			}
		}
	}
	return normalizedVTree;
}

// Simple VDiff function
function VDiff(old, tree, man) {
	let diff = VNorm(old, tree, man);
	let key = keys(diff);
	return key.length ? {
		diff,
		key
	}
	 :
	null;
}

function VError(err) {
	throw err;
}

function VPatch(set, old, tree, action, property, value) {
	if (action === VAction.ACTION_CHANGE || action === VAction.ACTION_ADD) {
		set[property] = value;
	} else if (action === VAction.ACTION_REMOVE) {
		delete set[property];
	}
	return old;
}

function VChange(set, old, tree, man, diff) {
	let checkDiff = diff !== undefined ? diff : VDiff(old, tree, man);
	if (checkDiff === null) {
		return old;
	}

	checkDiff.key.map(prop => {
		let {
			action,
			property,
			value
		} = checkDiff.diff[prop];
		let ntree = tree[property];
		let otree = old[property];
		if (property === "_children" && Array.isArray(value)) {
			let longMap = keys(otree).length > keys(ntree).length ? old[property] : ntree;
			longMap.map((vChild, i) => {
				if (otree[i] === undefined && ntree[i] !== undefined) {
					set.append(ntree[i]);
					return false;
				}
				VChange(otree[i], otree[i], ntree[i], value[i]);
			});
		} else if (typeof value === "object") {
			VChange(set, otree, ntree, VObjCompare(otree, value));
		} else {
			VPatch(set, old, tree, action, property, value);
		}
	});
	return old;
}

export default VChange;
