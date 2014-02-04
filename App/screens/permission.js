function screenPermission()
{
	if (gps.latitude && gps.longitude)
	{
		currentScreen = 'menu'
	}

	drawPermission()
}