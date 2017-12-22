
## Notes about comScore and comScore SDK

Make sure you have the Streaming Tag JavaScript library. Your comScore account team will have provided you with the library together with this document.

- Attribute ns_st_ad should not be used with content assets.
- . Clip numbers start counting from 1

-----


.setPlaylist()

Not clear from the docs how it works. Does seem to accept an array.

It looks like if you leave it empty, the lib will still send the requests. Only without an attached playlist. Probably should init it with a list of ids. And provide more info with setClip.

If you pass a Clip objects, as the docs suggests, the lib will send "[object Object]" string to the server with every GET request.

If you pass anything else like null it will just send it.

If you pass nothing, it will not include any playlist related stuff


.setClip

it is there it is fine

-

onAdStarted
	clickThroughUrl: "someuri"
	clientType: "ima"
	duration: 30
	indexInQueue: 0
	skipOffset: 5
	timeOffset: "pre"
	timestamp: 1513783733242
	type: "onAdStarted"


==



# Release Notes


## Ad Time issue

player.getCurrentTime() is not compatible with comscore.

bt player does not provide info about ads current time.
And it looks important to comscore logic

# Comscore gotchas

http://direct.comscore.com/clients/Video.aspx.

Implementation Checklist

Before deploying the plugin, please complete the following checklist first:
▪ Make sure you have obtained your comScore client ID. The client ID differentiates clients from one another and is provided to you by your comScore account team. You can also lookup your Client ID in the comScore Direct interface (see inset below).
▪ Make sure you have the Streaming Tag JavaScript library. Your comScore account team will have provided you with the library together with this document.
▪ Determine the values that need to be sent along with the collected data. See   Collected Data on page 9 for more information about collected data.



Comscore docs:
--------------

Some info about latest sdk:
http://cocoadocs.org/docsets/ComScore-iOS/3.1510.232/Classes/CSStreamSensePlugin.html

###
#   Content ID should be 0 if not defined. docs (page 14) - Attribute name: ns_st_ci
# #

Part Number
Attribute name: ns_st_pn

    The part number is used to identify segments of content that are separated by mid-roll ads.

Total Number of Parts
Attribute name: ns_st_tp

    When you do not know the total number of parts please set ns_st_tp to value 0.

Clip Length
Attribute name: ns_st_cl

    milliseconds(!!!)
    If the length of the content or ad is unknown or cannot be provided then please provide value 0.

Clip URL
Attribute name: ns_st_cu

    If you are no able to get the URL of the streaming asset in the implementation, please provide value none.
