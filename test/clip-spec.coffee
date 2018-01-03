_ = require 'lodash'
chai = require 'chai'
should = chai.should()
assert = chai.assert
path = require 'path'

process.env.DEBUG = 'bt-comscore:*'

import Clip from '../src/comscore-clip.coffee'
import { Ad, Content } from '../src/comscore-clip.coffee'

try
	describe 'Clip tests: ', ->
		delay = (t, f) -> setTimeout f, t
		before ->
			# server.recreateDatabase()

		beforeEach ->
			# server.truncateAll()

		it 'Test the test runner', (done) ->
			c = new Clip id: 12
			done()

		it 'Clip constructor should throw on empty Clip config or lack of id', ->
			should.Throw -> new Clip()
			should.Throw -> new Clip {}
			should.Throw -> new Clip duration: 10

		it 'Clip constructor accept a config with just an id', ->
			should.not.Throw -> new Clip id: 12

		describe 'Asset duration validation: ', ->

			it 'Clip should accept valid content type based on duration', ->

				c = new Clip id: 12
				c.duration = 12000
				c.duration.should.eql 12000

		describe 'Ad tests: ', ->

			it 'Ad should accept valid content type based on duration', ->

				c = new Ad id: 12
				c.duration = 12000
				c.duration.should.eql 12000

			it 'Pre/mid/post rolls should not be marked as live', ->
				l = []
				for i in [0..2]
					a = new Ad id: 12
					a.live = true
					l.push a

				l[0].setPre()
				l[1].setMid()
				l[2].setPost()

				for i in [0..2]
					l[i].live.should.eql false

			it 'Should be able to classify an [ad:pre/post/mid]', ->

				# Simple pre roll
				a = new Ad id: 11
				b = new Ad id: 12
				c = new Ad id: 13

				a.setPre()
				b.setMid()
				c.setPost()

				a.serialize().ns_st_ct.should.eql 'va11'
				b.serialize().ns_st_ct.should.eql 'va12'
				c.serialize().ns_st_ct.should.eql 'va13'

		describe 'Content tests: ', ->



			it 'Sane defaults for content should be live: false and premium: true', ->

				a = new Content id: 1
				a.premium.should.eql true
				a.ugc.should.eql false



			describe 'Should be able to classify a content via config. UGC/PREMIUM, SHORT/LONG/LIVE', ->

				a = new Content { id: 1, premium: true, duration: 2 * 60 * 1000 }
				b = new Content { id: 1, premium: true, duration: 22 * 60 * 1000 }
				c = new Content { id: 1, premium: true, live: true }

				x = new Content { id: 1, ugc: true,     duration: 2 * 60 * 1000 }
				y = new Content { id: 1, ugc: true,     duration: 20 * 60 * 1000 }
				z = new Content { id: 1, ugc: true,     live: true }

				it 'premium: short/long/live', ->

					a.serialize().ns_st_ct.should.eql 'vc11'
					b.serialize().ns_st_ct.should.eql 'vc12'
					c.serialize().ns_st_ct.should.eql 'vc13'

				it 'ugc: short/long/live', ->

					x.serialize().ns_st_ct.should.eql 'vc21'
					y.serialize().ns_st_ct.should.eql 'vc22'
					z.serialize().ns_st_ct.should.eql 'vc23'

			it.skip 'config should work for all properties', ->

				a = new Content
					id: 1
					premium: false
					duration: 2 * 60 * 1000

			it.skip 'Pure Test', ->

				a = new Ad id: 12
				a.duration = 1200

				b = a.serialize()
				console.log a
				console.log '----'
				console.log b

		describe 'Livestream tests: ', ->

			it 'Should be able to classify an [ad:live]', ->

				a = new Ad { id: 1, live: true }
				a.serialize().ns_st_ct.should.eql 'va21'


			it 'Should be able to classify an [content:live]', ->

				a = new Content { id: 1, premium: true, live: true }
				b = new Content { id: 1, ugc: true,     live: true }

				a.serialize().ns_st_ct.should.eql 'vc13'
				b.serialize().ns_st_ct.should.eql 'vc23'

			it.skip 'Mark content live via a later on config switch [content:live]'

# Catch for any unhandled promise in the code
catch e
	console.log '>> ', e




###
	-----
	CRUFT, Expiry date 2018-MAR-1
	-----


	ct =
		attributeName: 'ns_st_ct'
		content:
			premium:
				short: 'vc11'
				long: 'vc12'
				live: 'vc13'

			ugc:
				short: 'vc21'
				long: 'vc22'
				live: 'vc23'

			other: 'vc00'
			audio: 'ac00'
		ad:
			pre: 'va11'
			mid: 'va12'
			post: 'va13'
			live: 'va21'

			other: 'va00'
			audio: 'aa00'




###
