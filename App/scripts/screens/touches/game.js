function touchesGame()
{
	if (debug)
	{
		if (gps.history.length == 0)
		{
			gps.history[0] = new Object()
			gps.history[0].latitude = gps.latitude
			gps.history[0].longitude = gps.longitude
		}

		if (touchY < canvas.height / 3)
		{
			gps.history[0].latitude -= 1
		}
		else if (touchY < canvas.height / 3 * 2)
		{
			if (touchX < canvas.width / 2)
			{
				gps.history[0].longitude -= 1
			}
			else
			{
				gps.history[0].longitude += 1
			}
		}
		else
		{
			gps.history[0].latitude += 1
		}
	}
}