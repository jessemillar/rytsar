// --------------------------
// sounds/guns/revolver/
// --------------------------
var sfxCock = document.createElement('audio')
	sfxCock.src = 'sounds/guns/revolver/cock.mp3'
	sfxCock.preload = true
	sfxCock.loop = false
	sfxCock.volume = 1
	sfxCock.load()
	document.body.appendChild(sfxCock)
var sfxEmpty = document.createElement('audio')
	sfxEmpty.src = 'sounds/guns/revolver/empty.mp3'
	sfxEmpty.preload = true
	sfxEmpty.loop = false
	sfxEmpty.volume = 1
	sfxEmpty.load()
var sfxFire = document.createElement('audio')
	sfxFire.src = 'sounds/guns/revolver/fire.mp3'
	sfxFire.preload = true
	sfxFire.loop = false
	sfxFire.volume = 1
	sfxFire.load()
	document.body.appendChild(sfxFire)
var sfxReload = document.createElement('audio')
	sfxReload.src = 'sounds/guns/revolver/reload.mp3'
	sfxReload.preload = true
	sfxReload.loop = false
	sfxReload.volume = 1
	sfxReload.load()
	document.body.appendChild(sfxReload)

// --------------------------
// sounds/interface/
// --------------------------
var sfxProximity = document.createElement('audio')
	sfxProximity.src = 'sounds/interface/proximity.mp3'
	sfxProximity.preload = true
	sfxProximity.loop = false
	sfxProximity.volume = 1
	sfxProximity.load()
	document.body.appendChild(sfxProximity)
var sfxSweep = document.createElement('audio')
	sfxSweep.src = 'sounds/interface/sweep.wav'
	sfxSweep.preload = true
	sfxSweep.loop = false
	sfxSweep.volume = 1
	sfxSweep.load()
	document.body.appendChild(sfxSweep)

// --------------------------
// sounds/music/
// --------------------------
var musMenu = document.createElement('audio')
	musMenu.src = 'sounds/music/menu.wav'
	musMenu.preload = true
	musMenu.loop = true
	musMenu.volume = 1
	musMenu.load()
	document.body.appendChild(musMenu)

// --------------------------
// sounds/player/
// --------------------------
var sfxFlatline = document.createElement('audio')
	sfxFlatline.src = 'sounds/flatline.mp3'
	sfxFlatline.preload = true
	sfxFlatline.loop = false
	sfxFlatline.volume = 1
	sfxFlatline.load()
	document.body.appendChild(sfxFlatline)
var sfxHurt = document.createElement('audio')
	sfxHurt.src = 'sounds/hurt.wav'
	sfxHurt.preload = true
	sfxHurt.loop = false
	sfxHurt.volume = 1
	sfxHurt.load()
	document.body.appendChild(sfxHurt)
var sfxPunch = document.createElement('audio')
	sfxPunch.src = 'sounds/punch.mp3'
	sfxPunch.preload = true
	sfxPunch.loop = false
	sfxPunch.volume = 1
	sfxPunch.load()
	document.body.appendChild(sfxPunch)

// --------------------------
// sounds/zombies/
// --------------------------
var sfxGroan = document.createElement('audio')
	sfxGroan.src = 'sounds/zombies/groan.mp3'
	sfxGroan.preload = true
	sfxGroan.loop = false
	sfxGroan.volume = 1
	sfxGroan.load()
	document.body.appendChild(sfxGroan)
var sfxWalk = document.createElement('audio')
	sfxWalk.src = 'sounds/zombies/walk.mp3'
	sfxWalk.preload = true
	sfxWalk.loop = false
	sfxWalk.volume = 1
	sfxWalk.load()