function hunt(zombie, time) // Use an external function (outside of zombie creation) to move the zombie toward the player
{
	var speed = time * zombieSlowest

	if (speed < zombieFastest)
	{
		speed = zombieFastest + time * zombieSlowest
	}

	setInterval(function()
	{
		if (zombie.health > 0)
		{
			if (zombie.nature == 0)
			{
				if (player.column < zombie.column)
				{
					zombie.column -= 1
				}
				else if (player.column > zombie.column)
				{
					zombie.column += 1
				}
				else if (zombie.column == player.column)
				{
					if (player.row < zombie.row)
					{
						zombie.row -= 1
					}
					else if (player.row > zombie.row)
					{
						zombie.row += 1
					}
				}
			}
			else if (zombie.nature == 1)
			{
				if (player.row < zombie.row)
				{
					zombie.row -= 1
				}
				else if (player.row > zombie.row)
				{
					zombie.row += 1
				}
				else if (zombie.row == player.row)
				{
					if (player.column < zombie.column)
					{
						zombie.column -= 1
					}
					else if (player.column > zombie.column)
					{
						zombie.column += 1
					}
				}
			}
		}
	}, speed)
}

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
	for (var i = 0; i < zombies.length; i++)
	{
		if (zombies[i].column == player.column && zombies[i].row == player.row)
		{
			if (player.health > 1)
			{
				player.health -= 1
				sfxHurt.play()
			}
			else
			{
				player.health -= 1
				sfxFlatline.play()
				currentScreen = 'gameover'
			}
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
				if (player.row > 1)
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
				if (player.row < gridHeight)
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