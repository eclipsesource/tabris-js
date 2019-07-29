// Group widgets in a WidgetCollection:

contentView.append(
  <$>
    <TextView/>
    <Button/>
    <CheckBox/>
  </$>
);

// Create a markup string:

const str = (
  <$>
    This is <b>some text</b>
    with multiple lines
  </$>
);
contentView.append(<TextView>{str}</TextView>);

// Same as:

contentView.append(
  <TextView>
    This is <b>some text</b>
    with multiple lines
  </TextView>
);

// Obtaining a widget reference:

contentView.append(
  <Composite>
    <TextView>Hello World</TextView>
  </Composite>
);

const textView = $(TextView).first();
console.log(textView === contentView.find(TextView).first()); // true
