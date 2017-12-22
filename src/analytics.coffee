# Browser
import bitmovin from 'BitmovinBundle'

# Local
import _ from 'lodash-es'
# import Comscore from './comscore'
import Clip from './comscore-clip'

# TODO: Add validation if it is avaliable in the browser
import StreamSense from 'streamsense'

###
	--Streamsense Events--

	ns_.StreamSense.PlayerEvents.BUFFER
		Media player pauses playback of the current clip
		(this also applies to seeking during playback)

	ns_.StreamSense.PlayerEvents.PAUSE
		Media player pauses playback of the current clip
		(this also applies to seeking during playback)

	ns_.StreamSense.PlayerEvents.PLAY
		edia player starts or continues playback of the current clip
		(this also applies to resuming playback after seeking)

	ns_.StreamSense.PlayerEvents.END
		Media player ends playback of the current clip

###

# Stream Sense Events
sse =
	buffer: ns_.StreamSense.PlayerEvents.BUFFER
	pause:  ns_.StreamSense.PlayerEvents.PAUSE
	play:   ns_.StreamSense.PlayerEvents.PLAY
	end:    ns_.StreamSense.PlayerEvents.END




# <----  CRUFT FOR TESTS
delay = (t, f) -> setTimeout f, t
samplePlaylist = []
# CRUFT ----->

class Analytics

	constructor: (player, config) ->
		if !player?          then throw new Error 'No player reference'
		if !config?          then throw new Error 'No config'
		if !config.clientId? then throw new Error 'Client ID must be provided'

		# Defaults
		@player = player
		@config = config
		@isAd = false

		# Relate to comscore playlist mindset
		@sessionIsActive = false
		@contentDefined = false


		# Comscore Related data
		# -------------------------

		# We start with 0, but comscore starts with 1.
		@currentClipIndex = 0


		# Run Stuff
		# -------------------------


		# TODO: Remove after initial DEV phase
		# @debug = config.debug || false
		@debug = true
		@stub = 1212

		# Only for debug and reverse engineering
		if @debug && config.alternativeUri?
			@comscoreUri = config.alternativeUri
		else
			@comscoreUri = "https//b.scorecardresearch.com/p?c1=2&c2=#{config.clientId}"

		@tracker = new StreamSense.StreamSense {}, @comscoreUri


		@registerCoreEvents()


		# player.addEventHandler 'onSourceLoaded', (payload) ->
		# 	console.log 'Event Fired: onSourceLoaded ->', payload


		return @

	registerCoreEvents: ->

		coreEvents = [
			'onReady'
			'onPlay'
			'onPaused'
			'onPlaybackFinished'

			'onSourceLoaded'
			'onSourceUnloaded'

			'onTimeChanged'
			'onSeek'
			'onSeeked'
			'onError'

			'onAdStarted'
			'onAdFinished'
			'onAdSkipped'
			'onAdError'

			"onStallStarted"
			"onStallEnded"
		]

		# TODO: Remove when dev is done
		_.forEach coreEvents, (name) =>
			if _.isFunction @[name]
				@player.addEventHandler name, (payload) =>
					if @debug
						console.log "#{name}: ", payload
					@[name].apply @, [payload]

	playbackHasStarted: -> (@player.isPlaying() || !@player.isPaused())
	onPaused: (payload) ->
		@tracker.notify sse.pause, {}, @player.getCurrentTime()

	###
		- Define a content clip if it is appropriate
	###
	onPlay: (payload) ->
		if @playbackHasStarted()
			if !@contentDefined and !@isAd
				console.log 'Defining content Clip'
				conf = player.getConfig()

				@currentClipIndex += 1
				contentClip = new Clip
					id: conf.source.contentId || 0
					name: conf.source.title || 'title_not_defined'
					duration: (player.getDuration() * 1000) || 0
					ad: false
					url: 'https://example.com/test.mp4'

				@tracker.setClip contentClip.getRawClip()
				@contentDefined = true
				samplePlaylist.push contentClip


		@tracker.notify sse.play, {}, @player.getCurrentTime()



		if !@sessionIsActive
			@startPlaybackSession()

	###
		- switch analytics into an AD mode
		- update Clip index, update clip meta
		- register a new Clip with a Comscore SDK
	###
	onAdStarted: (e) ->
		@isAd = true

		# Configure ad and inspect ad type pre/mid/post
		@currentClipIndex += 1
		ad = new Clip
			id: 0
			ad: true
			duration: e.duration * 1000
			index: @currentClipIndex
		switch e.timeOffset
			when 'pre' then ad.setPre()
			when 'post' then ad.setPost()
			else ad.setMid()
		@tracker.setClip ad.getRawClip()

	onAdSkipped: (e) -> @onAdFinished e
	onAdError: (e) -> @onAdFinished e
	onAdFinished: (e) ->
		@isAd = false
		@tracker.notify sse.end, {}, @player.getCurrentTime()



	###
		- If there is no active session, go make one
	###
	onPlaybackFinished: (e) -> @sessionIsActive = false
	startPlaybackSession: ->
		if @sessionIsActive == true
			throw new Error "Don't start another session before ending the last one"

		@tracker.setPlaylist()
		@sessionIsActive = true


	onStallStarted: (e) ->
		@tracker.notify sse.buffer, {}, @player.getCurrentTime()
	onStallEnded: (e) ->











export default Analytics
