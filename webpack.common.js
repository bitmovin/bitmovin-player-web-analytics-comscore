const CreateFileWebpack = require('create-file-webpack');
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
    filename: 'bitmovin-player-analytics-comscore.js',
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
  plugins: [
    new CreateFileWebpack({
      // path to folder in which the file will be created
      path: './dist',
      // file name
      fileName: 'bitmovin-player-analytics-comscore.d.ts',
      // content of the file
      content: 'export * from \'./lib/index\';'
    }),
  ],
};
