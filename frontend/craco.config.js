// const path = require('path');

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  webpack: {
    // alias: {
    //   '@': path.resolve(__dirname, 'src'),
    // },

    // resolve: {

    //   plugins: [new TsconfigPathsPlugin({/* options: see below */

    //   //configFile: "./tsconfig.json",
    //   logLevel: "info",
    //   extensions: [".js", ".ts", ".tsx", ".jsx" /*, ".mjs"*/],
    //   mainFields: ["browser", "main"],
    //   // baseUrl: "/foo"

    // })],

    // },


    plugin: {
      overrideWebpackConfig: ({ webpackConfig }) => {
        webpackConfig.resolve.plugins.push(new TsconfigPathsPlugin({/* options: see below */

        //configFile: "./tsconfig.json",
        logLevel: "info",
        extensions: [".js", ".ts", ".tsx", ".jsx" /*, ".mjs"*/],
        mainFields: ["browser", "main"],
        // baseUrl: "/foo"
  
      }));
        return webpackConfig;
      }
    },

  },
   typescript: {
    enableTypeChecking: true /* (default value) */,
  },
}