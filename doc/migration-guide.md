# 1.x -> 2.x

* `tabris.create()` has been removed. Create widgets using `new` instead.
* Calling `Events.off()` without arguments is not supported anymore.
* Calling `Events.off(event)` is not supported anymore.
* ScrollView
  * Property `scrollX` is now `offsetX`.
  * Property `scrollY` is now `offsetY`.
  * Event `scroll` has been replaced by `scrollX` and `scrollY`