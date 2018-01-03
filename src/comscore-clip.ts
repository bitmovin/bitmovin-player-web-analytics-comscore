// import _ from 'lodash-es';

// Video matrix pdf: page 13, 14, other
let ct = {
  attributeName: 'ns_st_ct',
  content: {
    premium: {
      short: 'vc11',
      long: 'vc12',
      live: 'vc13'
    },
    ugc: {
      short: 'vc21',
      long: 'vc22',
      live: 'vc23'
    },
    other: 'vc00',
    audio: 'ac00'
  },
  ad: {
    pre: 'va11',
    mid: 'va12',
    post: 'va13',
    live: 'va21',
    other: 'va00',
    audio: 'aa00'
  }
}

/*
	Huge warning, this class DOES NOT protect from a silly input

	---------------

  ci - content id
	cn - clip number

	pn - part number
	tp - total parts
	cl - clip Length

	pu - publisher brand name
	pr - program name
	ep - episode title / name

	cu - clip url
	ad - ad flag
	ct - classification type
*/


class Clip {

  id: any
  index: number

  ct: string
  live: boolean

  url: string
  name: string
  duration: number


  constructor(metadata: any) {
    if (metadata == null) {
      throw new Error('Clip constructor needs metadata')
    }
    if (metadata.id == null) {
      throw new Error('Should at least provide an id')
    }
    // Core
    this.id = metadata.id

    // If provided, override the defaults
    this.duration = metadata.duration || 0
    this.url = metadata.uri || 'none'
    this.name = metadata.name || 'none'

    // Content Type
    this.live = metadata.live || false
    this.ct = ct.content.other
    return this
  }

  /*
  	- Add all MUST HAVE properties with sane defaults
  	- Content type is added as safenet here. should be overriden by children
  */
  serialize() {
    let raw: any = {
      ns_st_ci: this.id,
      ns_st_cl: this.duration,
      ns_st_cu: this.url,
      ns_st_ct: this.ct
    }

    // TODO: REMOVE AFTER DEV
    raw.name = this.name
    return raw
  }

  setDuration(ms: number): void {
    this.duration = Math.round(ms)
  }

  setLive(b: boolean): void {
    this.live = b
  }

}

class Ad extends Clip {
  constructor(metadata: any) {
    super(metadata)
    // Override parent defaults
    if (this.live) {
      this.ct = ct.ad.live
    } else {
      this.ct = ct.ad.other
    }
    return this
  }

  serialize() {
    let basic: any = super.serialize()
    basic.ns_st_ad = true
    if (this.live) {
      this.ct = ct.ad.live
      basic.ns_st_ct = ct.ad.live
    }
    return basic
  }

  setPre() {
    this.setLive(false)
    this.ct = ct.ad.pre
  }

  setMid() {
    this.setLive(false)
    this.ct = ct.ad.mid
  }

  setPost() {
    this.setLive(false)
    this.ct = ct.ad.post
  }

}

class Content extends Clip {

  ugc: boolean
  premium: boolean
  audioOnly: boolean

  publisher: string
  program: string
  episode: string

  constructor(metadata: any) {
    super(metadata)

    /*
    	- Configure Premium and User Generated Content defaults
    	- Assume premium as a sane default
    	- Resolve case when premium and UGC are both true
    */

    this.ugc = metadata.ugc || false
    this.premium = metadata.premium || true
    this.audioOnly = metadata.audioOnly || false
    if ((metadata.premium != null) && metadata.premium === true) {
      this.setPremium()
    }
    if ((metadata.ugc != null) && metadata.ugc === true) {
      this.setUgc()
    }

    // Meta publisher info
    this.publisher = metadata.publisher || null
    this.program = metadata.program || null
    this.episode = metadata.episode || null

    return this
  }

  setUgc() {
    this.premium = false
    this.ugc = true
  }

  setPremium() {
    this.ugc = false
    this.premium = true
  }

  serialize() {
    let a, basic

    basic = super.serialize()
    a = this._getContentType()
    basic.ns_st_ct = a

    return basic
  }

  /*
  	- Short vs long. 10 vs 10+ mins
  	- If duration is unkonwn, assume this is a short film
  	- 600000 is 10 minutes in ms
  */
  _isShort() {
    if (this.duration === 0) {
      return true
    }
    return this.duration < 600000
  }
  _isLong() {
    return !this._isShort()
  }

  _getContentType() {
    let gt = ct.content.other
    if (this.premium) {
      if (this._isShort()) {
        gt = ct.content.premium.short
      }
      if (this._isLong()) {
        gt = ct.content.premium.long
      }
      if (this.live) {
        gt = ct.content.premium.live
      }
    } else if (this.ugc) {
      if (this._isShort()) {
        gt = ct.content.ugc.short
      }
      if (this._isLong()) {
        gt = ct.content.ugc.long
      }
      if (this.live) {
        gt = ct.content.ugc.live
      }
    } else if (this.audioOnly) {
      gt = ct.content.audio
    } else {
      gt = ct.content.other
    }
    return gt
  }

  getPublisherStuffIfExists() {
    let pub: any = {}
    if (this.publisher != null) {
      pub.ns_st_pu = this.publisher
    }
    if (this.program != null) {
      pub.ns_st_pr = this.program
    }
    if (this.episode != null) {
      return pub.ns_st_ep = this.episode
    }
  }

}

export {
  Clip as Clip,
  Clip as default,
  Ad as Ad,
  Content as Content,
}
