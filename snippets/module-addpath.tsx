import {contentView, TextView, Module} from 'tabris';

// Note: Reading the paths from tsconfig.json works only if it is not in ".tabrisignore"
const paths = (Module.readJSON('./tsconfig.json') as any).compilerOptions.paths;

Module.addPath({baseUrl: '/dist', paths});
// Alternative with hard-coded path: Module.addPath('@res', ['./dist/resources/index']);

(async () => {
  const {colors} = await import('@res');
  contentView.append(
    <TextView stretchX markupEnabled padding={8} textColor={colors.myRed}>
      Import "@res" is now referring to "/resources/index.ts" in any module.<br/><br/>
      Paths: {JSON.stringify(paths)}
    </TextView>
  );
})();
