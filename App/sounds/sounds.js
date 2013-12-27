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
	sfxBeep.src = 'sounds/beep.mp3'
	sfxBeep.preload = true
	sfxBeep.loop = false
	sfxBeep.volume = 1
	sfxBeep.load()
	document.body.appendChild(sfxBeep)