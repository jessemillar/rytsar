function touchesMenu()
{
	if (Math.abs(xSingle - touchX) * Math.abs(xSingle - touchX) + Math.abs(ySingle - touchY) * Math.abs(ySingle - touchY) < canvas.width / 4.5 * canvas.width / 4.5)
	{
		fadeOut(musMenu, 250)
		reset()
		currentScreen = 'game'
	}
	else if (Math.abs(xSettings - touchX) * Math.abs(xSettings - touchX) + Math.abs(ySettings - touchY) * Math.abs(ySettings - touchY) < canvas.width / 4.5 * canvas.width / 4.5)
	{
		currentScreen = 'settings'
	}
}