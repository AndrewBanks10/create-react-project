const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const configCommon = require('./webpack.config.common')

const buildScriptDir = configCommon.buildScriptDir === '' ? '' : `${configCommon.buildScriptDir}/`
const buildCSSDir = configCommon.buildCSSDir === '' ? '' : `${configCommon.buildCSSDir}/`

const exportObject = {
  cache: true,
  watch: configCommon.useWatch,
  watchOptions: {
    aggregateTimeout: 1000
  },
  entry: path.join(configCommon.absoluteSourcePath, configCommon.entryJs),
  output: {
    path: configCommon.absoluteBuildPath,
    filename: `${buildScriptDir}${configCommon.bundleName}.js`
  },
  devServer: {
    contentBase: configCommon.absoluteBuildPath,
    historyApiFallback: true,
    stats: {
      colors: true,
      chunks: false,
      'errors-only': true
    }
  },
  plugins: [
    new ExtractTextPlugin(`${buildCSSDir}${configCommon.bundleName}.css`),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: true
    }),
    new webpack.DefinePlugin({
      '__DEV__': false,
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      },
      output: {
        comments: false
      }
    })
  ],
  module: {
    rules: configCommon.allLoaders(ExtractTextPlugin)
  },
  resolve: configCommon.resolveEntry,
  resolveLoader: configCommon.resolveLoaderEntry
}

if (configCommon.useDllLibraryForProduction) {
  exportObject.plugins.push(
    new webpack.DllReferencePlugin({
      context: configCommon.absoluteBuildScriptsPath,
      manifest: require(path.join(configCommon.absoluteBuildScriptsPath, `${configCommon.dllBundleName}.json`))
    })
  )
  exportObject.plugins.push(
    new HtmlWebpackPlugin({
      filename: path.join(configCommon.absoluteBuildPath, configCommon.htmlOutputFileName),
      template: path.join(configCommon.absoluteBuildPath, configCommon.htmlTemplate),
      inject: 'body',
      hash: !configCommon.isProgressiveWebApp
    })
  )
} else {
  exportObject.plugins.push(
    new HtmlWebpackPlugin({
      filename: path.join(configCommon.absoluteBuildPath, configCommon.htmlOutputFileName),
      template: path.join(configCommon.absoluteDevToolsPath, configCommon.htmlTemplate),
      inject: 'body',
      hash: !configCommon.isProgressiveWebApp
    })
  )
}

if (configCommon.isProgressiveWebApp) {
  exportObject.plugins.push(
    new SWPrecacheWebpackPlugin({
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      logger (message) {
        if (message.indexOf('Total precache size is') === 0) {
          // This message occurs for every build and is a bit too noisy.
          return
        }
        console.log(message)
      },
      //
      // Progressive Apps
      // Add any files required by your web app for offline use such as images not contained
      // in the bundle. By default, index.html, css/bundle.css, scripts/bundle.js, scripts/dllbundle.js
      // are cached if applicable. You must add any others that you may need.
      //
      staticFileGlobs: [
        `${configCommon.buildDir}/${configCommon.buildScriptDir}/${configCommon.dllBundleName}.js`
      ],
      stripPrefix: `${configCommon.buildDir}/`,
      mergeStaticsConfig: true,
      minify: true, // minify and uglify the script
      navigateFallback: `/${configCommon.htmlOutputFileName}`,
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/]
    })
  )
}

module.exports = exportObject
