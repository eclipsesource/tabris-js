import Composite from "./widgets/Composite";

export default function() {
  var contentComposite = new Composite();
  contentComposite._nativeSet("root", true);
  Object.defineProperty(this, "content", {value: contentComposite});
}
