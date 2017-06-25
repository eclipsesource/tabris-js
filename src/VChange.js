// Compare object tree-table
const _VDiff = {
  _props: null,
  _children: null,
  _layoutData: null
}

// Compare string, object, number, boolean
function VStringCompare( old, _new ) {
  return JSON.stringify( old ) !== JSON.stringify( _new );
}

// Get objet property as array
function keys( tree ) {
  return Object.keys( tree );
}

// Compares tree and gets result
function VCompare( old, tree ) {
  let diff = {},
    diffAct = {},
	objP = keys(old).length > keys(tree) ? old : tree;
  for ( let p in _VDiff ) {
    if ( p === '_children' && ( old[ p ] || tree[ p ] ) ) {
      diffAct[ p ] = [];
      if ( old[ p ] === undefined )
        old[ p ] = [];
      if ( tree[ p ] === undefined )
        tree[ p ] = [];
      diff[ p ] = tree[ p ].map( ( comp, i ) => {
        diffAct[ p ] = VAction( old[ p ][ i ], comp );
        return VCompare( old[ p ][ i ], comp );
      } );
    } else if ( VStringCompare( old[ p ], tree[ p ] ) ) {
      diff[ p ] = tree[ p ];
      diffAct[ p ] = VAction( old[ p ], tree[ p ] );
    }
  }
  return {
    diff,
    diffAct
  };
}

// Compare two object
function VObjCompare( old, tree ) {
  let diff = {},
    diffAct = {},
	objP = keys(old).length > keys(tree) ? old : tree;
  for ( let p in objP ) {
    if ( p === '_children' && ( old[ p ] || tree[ p ] ) ) {
      diffAct[ p ] = [];
      if ( old[ p ] === undefined )
        old[ p ] = [];
      if ( tree[ p ] === undefined )
        tree[ p ] = [];
      diff[ p ] = tree[ p ].map( ( comp, i ) => {
        diffAct[ p ] = VAction( old[ p ][ i ], comp );
        return VCompare( old[ p ][ i ], comp );
      } );
    } else if ( VStringCompare( old[ p ], tree[ p ] ) ) {
      diff[ p ] = tree[ p ];
      diffAct[ p ] = VAction( old[ p ], tree[ p ] );
    }
  }
  return {
    diff,
    diffAct
  };
}

// Action types
[ 'STAY', 'ADD', 'REMOVE', 'CHANGE', 'NOTHING', 'UNDEF' ].map( type => {
  VAction[ 'ACTION_' + type ] = type;
} );

// Checks and gives action based on change
function VAction( hasInOld, hasInTree ) {
  return ( hasInOld !== undefined && hasInTree !== undefined && hasInOld === hasInTree ) ? VAction.ACTION_STAY : (
    hasInOld !== undefined && hasInTree === undefined ) ? VAction.ACTION_REMOVE : ( hasInOld === undefined &&
    hasInTree !== undefined ) ? VAction.ACTION_ADD : ( hasInOld !== undefined && hasInTree !== undefined && hasInOld !==
    hasInTree ) ? VAction.ACTION_CHANGE : VAction.ACTION_NOTHING;
}

// Normalizes the comparision (best for Redux, Vuex)
function VNorm( old, tree, man ) {
  let VComp = man !== undefined ? man : VCompare( old, tree );
  let {
    diff,
    diffAct
  } = VComp;
  let normalizedVTree = {};
  for ( let p in diff ) {
    if ( diffAct[ p ] ) {
      normalizedVTree[ p ] = {
        property: p,
        action: diffAct[ p ],
        value: diff[ p ]
      };
    } else {
      normalizedVTree[ p ] = {
        property: p,
        action: VAction.ACTION_UNDEF,
        value: diff[ p ]
      }
    }
  }
  return normalizedVTree;
}

// Simple VDiff function
function VDiff( old, tree, man ) {
  let diff = VNorm( old, tree, man );
  let key = keys( diff );
  return key.length ? {
      diff,
      key
    } :
    null;
}

function VError( err ) {
  throw err;
}

function VPatch( set, old, tree, action, property, value ) {
  if ( action === VAction.ACTION_CHANGE || action === VAction.ACTION_ADD ) {
    set[ property ] = value;
  } else if ( action === VAction.ACTION_REMOVE ) {
    delete set[ property ];
  }
  return old;
}

function VChange( set, old, tree, man, diff ) {
  let checkDiff = diff !== undefined ? diff : VDiff( old, tree, man );
  if ( checkDiff === null ) {
    return old;
  }

  checkDiff.key.map( prop => {
    let {
      action,
      property,
      value
    } = checkDiff.diff[ prop ];
	let ntree = tree[property];
	let otree = old[property];
    if ( property === "_children" && Array.isArray( value ) ) {
	  let longMap = keys(otree).length > keys(ntree).length ? old[property] : ntree;
      longMap.map( ( vChild, i ) => {
		if (otree[ i ] && ntree[ i ] === undefined) {
			otree[ i ].dispose(); // remove from old, because it removed
			return false;
		} else if (old[ property ][ i ] === undefined && ntree[ i ]) {
			otree.push(ntree[ i ]);
		}
        VChange( otree[ i ], otree[ i ], ntree[ i ], value[i] );
      } );
    } else if ( typeof value === "object" ) {
      VChange( set, old[ property ], ntree, VObjCompare( otree, value ) );
    } else {
      VPatch( set, old, tree, action, property, value );
    }
  } );
  return old;
}

export default VChange;