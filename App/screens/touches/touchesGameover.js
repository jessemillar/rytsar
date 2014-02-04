function touchesGameover()
{
	reset()
	sfxFlatline.pause()
	rewind(sfxFlatline)
	rewind(musMenu)
	musMenu.play()
	currentScreen = 'menu'
}