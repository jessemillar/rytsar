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

var sfxBeep = document.createElement('audio')
	sfxBeep.src = 'sounds/beep.wav'
	sfxBeep.preload = true
	sfxBeep.loop = false
	sfxBeep.volume = 0.1
	sfxBeep.load()
	document.body.appendChild(sfxBeep)

var sfxGroan = document.createElement('audio')
	sfxGroan.src = 'sounds/zombie/groan.mp3'
	sfxGroan.preload = true
	sfxGroan.loop = false
	sfxGroan.volume = 1
	sfxGroan.load()
	document.body.appendChild(sfxGroan)

var sfxImpact = document.createElement('audio')
	sfxImpact.src = 'sounds/guns/impact.mp3'
	sfxImpact.preload = true
	sfxImpact.loop = false
	sfxImpact.volume = 1
	sfxImpact.load()
	document.body.appendChild(sfxImpact)