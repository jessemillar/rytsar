function touchesSettings()
{
	if (touchY < imgBackArrow.height + 10)
	{
		currentScreen = 'menu'
	}

	if (touchX > canvas.width / 2 - imgBug.width / 2 && touchX < canvas.width / 2 + imgBug.width / 2 && touchY > 125 - imgBug.height / 2 && touchY < 125 + imgBug.height / 2)
	{
		debug = !debug
	}
}