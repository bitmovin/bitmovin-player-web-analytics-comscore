path = require 'path'

moduleDevConfig =
	rules: [
			test: /\.coffee$/
			exclude: /node_modules/
			use: [
					loader: 'babel-loader'
					options: presets: [ 'env' ]
				,
					loader: 'coffee-loader'
					options: sourceMap: true
			]
		,
			test: /\.ts$/
			exclude: /node_modules/
			use: [
					loader: 'babel-loader'
					options: presets: [ 'env' ]
				,
					loader: 'ts-loader'
					options: transpileOnly: false
			]
	]

if (process.env.NODE_ENV == 'coverage')
	moduleDevConfig =
		rules: [
				test: /\.coffee$/
				exclude: /node_modules/
				use: [
						loader: 'istanbul-instrumenter-loader'
						options: presets: [ 'env' ]
					,
						loader: 'babel-loader'
						options: presets: [ 'env' ]
					,
						loader: 'coffee-loader'
						options: sourceMap: true
				]
			,
				test: /\.ts$/
				exclude: /node_modules/
				use: [
						loader: 'istanbul-instrumenter-loader'
						options: presets: [ 'env' ]
					,
						loader: 'babel-loader'
						options: presets: [ 'env' ]
					,
						loader: 'ts-loader'
						options: transpileOnly: false
				]

		]

coreExtensions = [
	'.js'
	'.jsx'
	'.ts'
	'.coffee'
]

externals =
	BitmovinBundle: 'bitmovin'
	streamsense: 'ns_'

rules =
	coffee:
		test: /\.coffee$/,
		use: [
			loader: 'coffee-loader'
			options:
				sourceMap: true
		]
	ts:
		test: /\.ts$/
		use: [
			loader: 'ts-loader'
			options:
				transpileOnly: false
		]

	pug:
		test: /\.pug$/,
		use: [
			loader: 'pug-loader'
			options:
				sourceMap: true
		]

module.exports =
	moduleDevConfig: moduleDevConfig
	coreExtensions: coreExtensions
	externals: externals
	rules: rules
