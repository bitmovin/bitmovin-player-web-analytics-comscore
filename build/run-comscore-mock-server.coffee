express = require 'express'
morgan = require 'morgan'

app = express()

app.get '/', (req, res) -> res.send 'hello, world!'
app.get '/log', (req, res) ->

	now = new Date()
	t1 = "[#{now.getHours()}:#{now.getMinutes()}:#{now.getSeconds()}] - "
	t2 = "#{req.query.ns_st_ev || '??'} - #{req.query.name || 'no name'}"
	console.log t1+t2

	res.status(200).send 'OK'

app.use '*', (req, res) -> res.status(200).send 'OK'


PORT = 9050
app.listen PORT, ->
	console.log "Example app listening on port #{PORT}!\n"
