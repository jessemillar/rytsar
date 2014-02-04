function pickup()
{
	for (var i = 0; i < ammo.length; i++)
	{
		if (ammo[i].column == player.column && ammo[i].row == player.row)
		{
			player.ammo += ammo[i].count
			ammo[i].count = 0
		}
	}
}

function hurtPlayer()
{
	if (melee.length > 0)
	{
		if (player.health > 1)
		{
			player.health -= 1
			sfxHurt.play()
		}
		else if (player.health == 1)
		{
			player.health -= 1
			sfxFlatline.play()
			currentScreen = 'gameover'
		}
	}
}

function gpsMove()
{
	for (var i = 0; i < gps.history.length; i++)
	{
		if (gpsDistance(gps.latitude, gps.longitude, gps.history[i].latitude, gps.history[i].longitude) > tileSizeMeters)
		{
			var bearing = gpsBearing(gps.latitude, gps.longitude, gps.history[i].latitude, gps.history[i].longitude)

			if (bearing > 315 || bearing < 45) // Up
			{
				if (player.row < gridHeight)
				{
					player.row += 1
					updatePlayerHistory('up')
				}
			}
			else if (bearing < 135) // Right
			{
				if (player.column < gridWidth)
				{
					player.column += 1
					updatePlayerHistory('right')
				}
			}
			else if (bearing < 225) // Down
			{
				if (player.row > 1)
				{
					player.row -= 1
					updatePlayerHistory('down')
				}
			}
			else if (bearing < 315) // Left
			{
				if (player.column > 1)
				{
					player.column -= 1
					updatePlayerHistory('left')
				}
			}
			gps.history.length = 0
		}
	}
}

function updatePlayerHistory(direction)
{
	var thingy = new Object()
		thingy.column = player.column
		thingy.row = player.row
		thingy.direction = direction

	player.history.unshift(thingy)
}