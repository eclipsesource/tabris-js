import {contentView, TextView} from 'tabris';
import {colors, fonts, texts} from './resources';

contentView.set({padding: 16, background: colors.myBackground}).append(
  <TextView markupEnabled stretchX font={fonts.main}>
    <span textColor={colors.tint}>{texts.tintColor}</span><br/><br/>
    <span font={fonts.emphasis}>{texts.emphasisFont}</span>
  </TextView>
);
