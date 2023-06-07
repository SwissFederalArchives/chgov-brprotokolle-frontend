const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = (env) => {
  const plugins = [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new CopyWebpackPlugin({ 
        patterns: [{ 
            from: 'public',
            globOptions: { 
                ignore: ['**/index.html'] 
            } 
        }] 
    }),
    new Dotenv()
  ];
  return {
    mode: 'development',
    entry: './src/Init.tsx',
    devtool: env.development ? undefined : false,
    output: {
      path: path.join(__dirname, '/build'),
      library: 'ArchivalIIIFViewer',
      filename: 'archival-IIIF-viewer.min.js',
      libraryExport: 'default',
      libraryTarget: 'umd',
    },
    devServer: {
      static: './build',
      historyApiFallback: true,
      compress: true,
      port: process.env.PORT ?? 3000,
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: 'svg-url-loader',
              options: {
                limit: 10000,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.css'],
      fallback: { url: false },
    },
    plugins,
  };
};