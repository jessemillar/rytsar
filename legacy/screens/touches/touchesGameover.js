function touchesGameover()
{
	reset()
	sfxFlatline.pause()
	rewind(sfxFlatline)
	fadeTo(musMenu, 1, 3000)
	currentScreen = 'menu'
}