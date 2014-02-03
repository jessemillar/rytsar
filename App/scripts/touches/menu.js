function touchesMenu()
{
	if (Math.abs(xSingle - touchX) * Math.abs(xSingle - touchX) + Math.abs(ySingle - touchY) * Math.abs(ySingle - touchY) < menuSize * menuSize)
	{
		musMenu.pause() // Kill the menu music before moving into the game screen
		zombies.length = 0 // Wipe the zombie database so we can start playing with "real" zombies
		currentScreen = 'game'
	}
	else if (Math.abs(xSettings - touchX) * Math.abs(xSettings - touchX) + Math.abs(ySettings - touchY) * Math.abs(ySettings - touchY) < menuSize * menuSize)
	{
		currentScreen = 'settings'
	}
}