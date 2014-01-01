var musMenu = document.createElement('audio')
	musMenu.src = 'sounds/music/menu.mp3'
	musMenu.preload = true
	musMenu.loop = true
	musMenu.volume = 1
	musMenu.load()
	document.body.appendChild(musMenu)

var sfxEmpty = document.createElement('audio')
	sfxEmpty.src = 'sounds/guns/nineteen/empty.mp3'
	sfxEmpty.preload = true
	sfxEmpty.loop = false
	sfxEmpty.volume = 1
	sfxEmpty.load()
var sfxFire = document.createElement('audio')
	sfxFire.src = 'sounds/guns/nineteen/fire.mp3'
	sfxFire.preload = true
	sfxFire.loop = false
	sfxFire.volume = 1
	sfxFire.load()
	document.body.appendChild(sfxFire)
var sfxReload = document.createElement('audio')
	sfxReload.src = 'sounds/guns/nineteen/reload.mp3'
	sfxReload.preload = true
	sfxReload.loop = false
	sfxReload.volume = 1
	sfxReload.load()
	document.body.appendChild(sfxReload)

var sfxSweep = document.createElement('audio')
	sfxSweep.src = 'sounds/sweep.wav'
	sfxSweep.preload = true
	sfxSweep.loop = false
	sfxSweep.volume = 1
	sfxSweep.load()
	document.body.appendChild(sfxSweep)

var sfxWalk = document.createElement('audio')
	sfxWalk.src = 'sounds/zombie/walk.mp3'
	sfxWalk.preload = true
	sfxWalk.loop = false
	sfxWalk.volume = 1
	sfxWalk.load()
var sfxGroan = document.createElement('audio')
	sfxGroan.src = 'sounds/zombie/groan.mp3'
	sfxGroan.preload = true
	sfxGroan.loop = false
	sfxGroan.volume = 1
	sfxGroan.load()
	document.body.appendChild(sfxGroan)

var sfxHurt = document.createElement('audio')
	sfxHurt.src = 'sounds/hurt.wav'
	sfxHurt.preload = true
	sfxHurt.loop = false
	sfxHurt.volume = 1
	sfxHurt.load()
	document.body.appendChild(sfxHurt)
var sfxFlatline = document.createElement('audio')
	sfxFlatline.src = 'sounds/flatline.mp3'
	sfxFlatline.preload = true
	sfxFlatline.loop = false
	sfxFlatline.volume = 1
	sfxFlatline.load()
	document.body.appendChild(sfxFlatline)