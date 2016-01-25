function screenGPS()
{
	if (gps.accuracy > gpsRequiredAccuracy)
	{
		currentScreen = 'game'
	}

	drawGPS()
}