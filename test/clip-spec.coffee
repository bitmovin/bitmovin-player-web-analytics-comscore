_ = require 'lodash'
chai = require 'chai'
should = chai.should()
assert = chai.assert
path = require 'path'

process.env.DEBUG = 'bt-comscore:*'

import Clip from '../src/comscore-clip.coffee'

try
	describe 'Clip tests: ', ->
		delay = (t, f) -> setTimeout f, t
		before ->
			# server.recreateDatabase()

		beforeEach ->
			# server.truncateAll()

		it 'Test the test runner', (done) ->
			c = new Clip id: 12
			c.stub.should.eql 1212
			done()

		it 'Clip constructor should throw on empty Clip config or lack of id', ->
			should.Throw -> new Clip()
			should.Throw -> new Clip {}
			should.Throw -> new Clip ugc: true

		it 'Clip constructor accept a config with just an id', ->
			should.not.Throw -> new Clip id: 12





catch e
	console.log '--..>> ', e
