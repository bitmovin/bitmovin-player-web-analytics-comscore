import _ from 'lodash-es'

# Video matrix pdf: page 13, 14, other
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

class Clip

	constructor: (metadata) ->
		if !metadata?    then throw new Error 'Clip constructor needs metadata'
		if !metadata.id? then throw new Error 'Should at least provide an id'

		# These are the defaults.
		@ad = false
		@id = null
		@stub = 1212
		@duration = 0
		@url = 'none'
		@name = metadata.name || 'none'
		@ct = ct.content.other # Default classification type

		# Read config
		@id = metadata.id

		if metadata.ad? and metadata.ad
			@ad = true

		return @

	getRawClip: ->
		raw =
			id: @id
			ad: @ad
			duration: @duration
			url: @url
			name: @name

		if @ad
			raw.ad = true
		else
			delete raw.ad

		return raw

	# Make this ad type specific
	setPre: ->
		@ad = true
		@ct = ct.ad.pre
	setMid: ->
		@ad = true
		@ct = ct.ad.mid
	setPost: ->
		@ad = true
		@ct = ct.ad.post




export default Clip
