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



###
	Huge warning, this class DOES NOT protect from a silly input
	
	---------------
	
	cn - clip number
	ci - content id
	pn - part number
	tp - total parts
	cl - clip Length

	pu - publisher brand name
	pr - program name
	ep - episode title / name

	cu - clip url
	ad - ad flag
	ct - classification type
###

# 
class Clip

	constructor: (metadata) ->
		if !metadata?    then throw new Error 'Clip constructor needs metadata'
		if !metadata.id? then throw new Error 'Should at least provide an id'

		# Core
		@id = metadata.id

		# If provided, override the defaults
		@duration = metadata.duration || 0
		@url = metadata.uri || 'none'
		@name = metadata.name || 'none'

		# Content Type
		@live = metadata.live || false
		@ct = ct.content.other

		return @

	###
		- Add all MUST HAVE properties with sane defaults
		- Content type is added as safenet here. should be overriden by children
	###
	serialize: ->
		raw =
			ns_st_ci: @id
			ns_st_cl: @duration
			ns_st_cu: @url
			ns_st_ct: @ct

		return raw

	setDuration: (ms) ->
		@duration = Math.round ms

	setLive: (b) -> @live = b




class Ad extends Clip

	constructor: (metadata) ->
		super metadata

		# Override parent defaults
		if @live 
			@ct = ct.ad.live
		else 
			@ct = ct.ad.other


		return @

	serialize: ->
		basic = super()

		basic.ns_st_ad = true
		if @live
			@ct = ct.ad.live
			basic.ns_st_ct = ct.ad.live


		return basic

	setPre: ->
		@setLive false
		@ct = ct.ad.pre
	setMid: ->
		@setLive false
		@ct = ct.ad.mid
	setPost: ->
		@setLive false
		@ct = ct.ad.post


class Content extends Clip

	constructor: (metadata) ->
		super metadata


		###
			- Configure Premium and User Generated Content defaults
			- Assume premium as a sane default
			- Resolve case when premium and UGC are both true
		###
		@ugc = metadata.ugc || false
		@premium = metadata.premium || true
		@audioOnly = metadata.audioOnly || false

		if metadata.premium? and metadata.premium == true
			@setPremium()
		if metadata.ugc? and metadata.ugc == true
			@setUgc()

		# Meta publisher info
		@publisher = metadata.publisher || null
		@program   = metadata.program || null
		@episode   = metadata.episode || null

		return @

	setUgc: ->
		@premium = false
		@ugc = true

	setPremium: ->
		@ugc = false
		@premium = true

	serialize: ->
		basic = super()

		a = @_getContentType()
		basic.ns_st_ct = a

		return basic

	###
		- Short vs long. 10 vs 10+ mins
		- If duration is unkonwn, assume this is a short film
		- 600000 is 10 minutes in ms
	###
	_isShort: () ->
		return true if @duration == 0
		return (@duration < 600000)


	_isLong: () ->
		return false if @duration == 0
		return !@_isShort()

	_getContentType: ->

		gt = ct.content.other

		if @premium
			if @_isShort() then gt = ct.content.premium.short
			if @_isLong()  then gt = ct.content.premium.long
			if @live       then gt = ct.content.premium.live

		else if @ugc
			if @_isShort() then gt = ct.content.ugc.short
			if @_isLong()  then gt = ct.content.ugc.long
			if @live       then gt = ct.content.ugc.live

		else if @audioOnly
			gt = ct.content.audio
		else
			gt = ct.content.other

		return gt

	getPublisherStuffIfExists: ->
		pub = {}

		if @publisher? then pub.ns_st_pu = @publisher
		if @program?   then pub.ns_st_pr = @program
		if @episode?   then pub.ns_st_ep = @episode


export {
	Clip as Clip
	Clip as default
	Ad as Ad
	Content as Content
}
