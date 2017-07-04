const _VDiff = {
  _props: null,
  _children: null,
  _layoutData: null
}

let children = "_children",
  props = "_props",
  layout = "_layoutData",
  _ts = "string",
  _tn = "number",
  _tb = "boolean",
  _to = "object",
  _u = undefined;
export default function VChange(old, tree, childs) {
  if (old === _u && tree !== _u) return tree;
  if (old !== _u && tree === _u) return old;
  if (childs && tree) {
    for (let i = 0, len = childs.length; i < len; i++) {
      childs[i].appendTo(tree);
    }
    childs = null;
  }
  for (let p in _VDiff) {
    let a = old[p],
      b = tree[p];
    if (a === _u && b === _u) {
      continue;
    } else if (p === children) {
      for (let i = 0, len = Math.max(a.length, b.length); i < len; i++) {
        let _a = a[i],
          _b = b[i];
        if (_a === _u && _b !== _u) {
          if (old.append !== _u) {
            old.append(_b);
          }
        } else if (_a !== _u && _b === _u) {
          if (_a.dispose !== _u) {
            _a.dispose();
          }
        } else if (_a !== _u && _b !== _u) {
          a[i] = VChange(_a, _b)
        }
      }
      tree[p] = b = null;
    } else if (p === props || p === layout) {
      if (a === _u && b === _u) continue;
      if (b === _u) {
        continue;
      }
      if (a === _u) {
        for (let p in b) {
          old[p] = b[p];
        }
        tree[p] = b = null;
        continue;
      }
      for (let p2 in b) {
        let av = a[p2],
          bv = b[p2];
        let _type = typeof bv;
        if (_type === _ts || _type === _tn || _type === _tb) {
          if (av !== bv) {
            old[p2] = bv;
          }
        } else if (_type === _to && JSON.stringify(av) !== JSON.stringify(bv)) {
          old[p2] = bv;
        }
      }
      tree[p] = b = null;
    }
  }
  return old;
}