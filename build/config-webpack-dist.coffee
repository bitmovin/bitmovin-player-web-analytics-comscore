path                          = require 'path'
webpack                       = require 'webpack'
HtmlWebpackPlugin             = require 'html-webpack-plugin'
CleanWebpackPlugin            = require 'clean-webpack-plugin'
UglifyJSPlugin                = require 'uglifyjs-webpack-plugin'
WebpackMonitor                = require 'webpack-monitor'
LodashModuleReplacementPlugin = require 'lodash-webpack-plugin'

commons = require './config-webpack-commons'
rootDir = path.resolve __dirname, '../'

module.exports =
	entry:
		index: rootDir + '/src/index.coffee'
	output:
		filename: '[name].js'
		path: rootDir + '/dist'

	resolve:
		extensions: commons.coreExtensions
		alias: libs: "#{rootDir}/libs/"

	module:
		rules: [
				test: /\.coffee$/
				exclude: /node_modules/
				use: [
						loader: 'babel-loader'
						options:
							presets: [ 'env' ]
							plugins: [ 'lodash' ]
					,
						loader: 'coffee-loader'
						options:
							sourceMap: true
				]
			,
				test: /\.ts$/
				exclude: /node_modules/
				use: [
						loader: 'babel-loader'
						options:
							presets: [ 'env' ]
							plugins: [ 'lodash' ]
					,
						loader: 'ts-loader'
						options:
							transpileOnly: false
				]
		]

	externals: commons.externals
	plugins: [
		new CleanWebpackPlugin [ rootDir + '/dist' ]
		new WebpackMonitor
			capture: true
			launch: true
			port: 3030
			excludeSourceMaps: true
			target: '../.tmp/prod-build-stats.json'

		new webpack.DefinePlugin
			__DEV__:        JSON.stringify false
			__PRODUCTION__: JSON.stringify true

		new LodashModuleReplacementPlugin
			paths: true

		new UglifyJSPlugin()

	]
