const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    vm: require.resolve('vm-browserify'),
  });
  config.resolve.fallback = fallback;

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);

  const modules = config.resolve.modules;
  config.resolve.modules = [...modules, path.resolve(__dirname, 'src')];

  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  });

  // Forzar nombres específicos de archivos
  if (env === 'production') {
    // Forzar nombres específicos para JS
    config.output.filename = 'static/js/main.340b729a.js';
    config.output.chunkFilename = 'static/js/[name].340b729a.chunk.js';

    // Forzar nombres específicos para CSS
    const miniCssExtractPlugin = config.plugins.find(
      plugin => plugin.constructor.name === 'MiniCssExtractPlugin'
    );
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.filename = 'static/css/main.b87a0c83.css';
      miniCssExtractPlugin.options.chunkFilename = 'static/css/[name].b87a0c83.chunk.css';
    }

    // Opcional: Deshabilitar source maps para evitar archivos adicionales
    config.devtool = false;
  }

  return config;
};