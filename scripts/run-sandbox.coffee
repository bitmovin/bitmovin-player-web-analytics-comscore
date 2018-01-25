path                 = require 'path'
express              = require 'express'

# Config section
PORT = process.env.PORT || 9002

# Run Section
app = express()

app.set 'views', './public'
app.set 'view engine', 'pug'

app.get '/favicon.ico' , (req , res) -> res.redirect 301, 'https://bitmovin.com/favicon.ico'
app.use '/dist', express.static path.resolve __dirname, '../dist'
app.use '/', express.static path.resolve __dirname, '../public'

app.get '/', (req, res) -> res.render 'index'
app.get '*', (req, res) -> res.render req.originalUrl.substr(1)

app.listen PORT, -> console.log "Express Sandbox serveris listening on #{PORT}!\n"
