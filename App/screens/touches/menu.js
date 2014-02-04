function touchesMenu()
{
	if (Math.abs(xSingle - touchX) * Math.abs(xSingle - touchX) + Math.abs(ySingle - touchY) * Math.abs(ySingle - touchY) < canvas.width / 4.5 * canvas.width / 4.5)
	{
		musMenu.pause() // Kill the menu music before moving into the game screen
		reset()
		currentScreen = 'game'
	}
	else if (Math.abs(xSettings - touchX) * Math.abs(xSettings - touchX) + Math.abs(ySettings - touchY) * Math.abs(ySettings - touchY) < canvas.width / 4.5 * canvas.width / 4.5)
	{
		currentScreen = 'settings'
	}
}