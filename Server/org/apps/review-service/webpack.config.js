const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  // Set mode to development
  config.mode = 'development';
  
  // Enable source maps for debugging
  config.devtool = 'eval-source-map';
  
  // Update the webpack config as needed here.
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve?.alias,
      '@packages': path.resolve(__dirname, '../../packages'),
    },
  };
  return config;
});