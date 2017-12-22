path          = require 'path'
nodeExternals = require 'webpack-node-externals'

commons = require './config-webpack-commons'

module.exports =
	target: 'node'
	devtool: 'inline-cheap-module-source-map'
	output:
		devtoolModuleFilenameTemplate: '[absolute-resource-path]'
		devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
	resolve:
		extensions: commons.extensions
	module: commons.moduleDevConfig
