import {Composite} from './tabris-components';

export function Spacer(config? : {height?:number, color?:string} = {}) {
  return (
      Composite({
        layoutData: {height: config.height || 1, right: 0, left: 0, top: "prev()"},
        background: config.color || "rgba(0, 0, 0, 0.1)"
      })
  )
}
