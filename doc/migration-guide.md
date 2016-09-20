# 1.x -> 2.x

* `tabris.create()` has been removed. Create widgets using `new` instead.
* Calling `Events.off()` without arguments is not supported anymore.
* Calling `Events.off(event)` is not supported anymore.
* ScrollView
  * Property `scrollX` is now `offsetX`. It is now read-only, use scrollToX method to scroll.
  * Property `scrollY` is now `offsetY`. It is now read-only, use scrollToY method to scroll.
  * Event `scroll` has been replaced by `scrollX` and `scrollY`