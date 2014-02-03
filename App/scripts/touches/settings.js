function touchesSettings()
{
	if (touchX > 10 && touchX < imgBackArrow.width + 10 && touchY > 10 && touchY < imgBackArrow.height + 10)
	{
		currentScreen = 'menu'
	}

	if (touchX > canvas.width / 2 - imgBug.width / 2 && touchX < canvas.width / 2 + imgBug.width / 2 && touchY > 150 - imgBug.height / 2 && touchY < 150 + imgBug.height / 2)
	{
		debug = !debug
	}
}