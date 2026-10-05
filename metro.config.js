// Learn more https://docs.expo.dev/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// zustand's ESM build uses `import.meta`, which crashes the web bundle
// ("Cannot use 'import.meta' outside a module"). Use its CommonJS build on web.
const zustandDir = path.dirname(require.resolve('zustand/package.json'));
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && (moduleName === 'zustand' || moduleName.startsWith('zustand/'))) {
    const subpath = moduleName === 'zustand' ? 'index' : moduleName.slice('zustand/'.length);
    return { type: 'sourceFile', filePath: path.join(zustandDir, `${subpath}.js`) };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
