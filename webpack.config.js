var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: path.join(__dirname, "src"),
  devtool: debug ? "inline-sourcemap" : false,
  entry: "./js/index.js",  
  output: {
    path: __dirname + "/docs/",
    filename: "index.min.js"
  },
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
  module: {
    loaders: [ 
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-0'],
          plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
        }
      },

      {
        test: /\.js$/,
        include: path.join(__dirname, 'client'),
        loaders: [ 'react-hot', 'babel' ]
      },

      {
        test: /\.css$/, 
        loader: 'style-loader!css-loader?modules=true&localIdentName=[name]__[local]___[hash:base64:5]',
        include: /flexboxgrid/
      },

      { 
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [ 'file?hash=sha512&digest=hex&name=[hash].[ext]', 'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false']
      } 

    ]

  }

};
