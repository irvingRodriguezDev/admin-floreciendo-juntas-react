const path = require('path');

module.exports = function override(config) {

  config.resolve.modules = [
    ...(config.resolve.modules || []),
    path.resolve(__dirname, 'src')
  ];

  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });

  return config;
};
