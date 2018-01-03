_                  = require 'lodash'
path               = require 'path'
webpack            = require 'webpack'
HtmlWebpackPlugin  = require 'html-webpack-plugin'
CleanWebpackPlugin = require 'clean-webpack-plugin'

commons = require './config-webpack-commons'
rootDir = path.resolve __dirname, '../'

module.exports =
	devtool: 'cheap-module-eval-source-map'
	entry:
		app: rootDir + '/src/index.coffee'
	output:
		path: rootDir + '/dist'
		publicPath: '/'
		filename: 'index.js'

	resolve:
		extensions: _.concat [], commons.coreExtensions, ['.styl', '.pug', '.html' ]
		alias:
			libs: rootDir + '/libs'


	module:
		rules: _.concat( [],
			commons.rules.coffee
			commons.rules.ts
			commons.rules.pug
		)

	externals: commons.externals
	plugins: [
		new webpack.DefinePlugin
			__DEV__:        JSON.stringify true
			__PRODUCTION__: JSON.stringify false
	]
