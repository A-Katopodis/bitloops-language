export const tsConfigJSONTemplate = {
  compilerOptions: {
    allowJs: true,
    target: 'es2017',
    module: 'commonjs',
    moduleResolution: 'node',
    pretty: true,
    sourceMap: true,
    outDir: './dist',
    lib: ['es6'],
    skipLibCheck: true,
    resolveJsonModule: true,
    types: ['node', 'jest'],
    typeRoots: ['./node_modules/@types', './src/@types'],
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    strict: true,
    esModuleInterop: true,
    plugins: [
      {
        transform: 'ts-auto-mock/transformer',
        cacheBetweenTests: false,
      },
    ],
  },
  include: ['src/*.ts', 'src/**/*.ts', 'src/**/*.js', 'global.d.ts'],
  exclude: ['node_modules', 'src/**/*.spec.ts', 'src/**/*.spec.js'],
  files: ['global.d.ts'],
};
