const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'bitmovinplayer-analytics-comscore.js',
    umdNamedDefine: true,
    path: path.resolve(__dirname, 'dist'),
    library: {
      root: ['bitmovin', 'player', 'analytics'],
      amd: 'bitmovin-player-analytics-comscore',
      commonjs: 'bitmovin-player-analytics-comscore'
    },
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
};
