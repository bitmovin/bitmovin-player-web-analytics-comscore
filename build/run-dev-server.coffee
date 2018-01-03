path                 = require 'path'
express              = require 'express'
webpack              = require 'webpack'
webpackDevMiddleware = require 'webpack-dev-middleware'

# Config section
config = require './config-webpack-develop.coffee'
server =
	libs: path.resolve __dirname, '../libs'
	sandbox: path.resolve __dirname, '../sandbox'
	port: process.env.PORT || 9002

# Run Section
app = express()
compiler = webpack config

app.set 'views', './sandbox'
app.set 'view engine', 'pug'

app.get '/favico.ico', (req , res) -> res.redirect 301, 'https://bitmovin.com/favicon.ico'
app.use '/dist', webpackDevMiddleware compiler, publicPath: config.output.publicPath
app.use '/libs', express.static server.libs
app.use '/sandbox', express.static server.sandbox

app.get '*', (req, res) -> res.render req.originalUrl.substr(1)


app.listen server.port, ->
	console.log "Webpack-express is listening on #{server.port}!\n"
