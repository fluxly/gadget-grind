const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
  entry: './index.ts',
  output: {
    // Compile the source files into a bundle.
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  // Enable webpack-dev-server to get hot refresh of the app.
  devServer: {
    static: './dist',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
   new CopyPlugin(
      {
        patterns: [
          {
            from: path.resolve(__dirname, 'index.html'),
            to: path.resolve(__dirname, 'dist'),
          },
          {
            from: path.resolve(__dirname, 'images'),
            to: path.resolve(__dirname, 'dist/images'),
          },
          {
            from: path.resolve(__dirname, 'styles'),
            to: path.resolve(__dirname, 'dist/styles'),
          },
          {
            from: path.resolve(__dirname, 'sandbox'),
            to: path.resolve(__dirname, 'dist/sandbox'),
          }
        ]
      }
    )
  ]
};

module.exports = (env, argv) => {
  config.devtool = false;  // No .map
  return config;
};
