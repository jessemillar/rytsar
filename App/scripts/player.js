function turnPlayer()
{
	visible() // Check if we're looking at a zombie

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
					updatePlayerHistory()
				}
			}
			else if (bearing < 135) // Right
			{
				if (player.column < gridWidth)
				{
					player.column += 1
					updatePlayerHistory()
				}
			}
			else if (bearing < 225) // Down
			{
				if (player.row > 1)
				{
					player.row -= 1
					updatePlayerHistory()
				}
			}
			else if (bearing < 315) // Left
			{
				if (player.column > 1)
				{
					player.column -= 1
					updatePlayerHistory()
				}
			}
			gps.history.length = 0 // Wipe the GPS log for a clean turn

			pickup() // Pickup something we may have stepped on
			proximity() // Check for nearby zombies
			turnZombies() // Make the zombies react to the player's movement
		}
	}
}

function updatePlayerHistory()
{
	var thingy = new Object()
		thingy.column = player.column
		thingy.row = player.row

	player.history.unshift(thingy)
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

function visible()
{
	vision.length = 0 // Clear to get fresh results

	for (var i = 0; i < zombies.length; i++)
    {
		zombies[i].bearing = bearing(zombies[i])

		if ((compass - fieldOfView) < zombies[i].bearing && zombies[i].bearing < (compass + fieldOfView))
	    {
	        if (zombies[i].distance > minShotDistance && zombies[i].distance < maxShotDistance && zombies[i].health > 0)
	        {
	            vision.push(zombies[i])
	        }
	    }

	   	// Beep when we're looking at a zombie
	    if ((compass - fieldOfView / 3) < zombies[i].bearing && zombies[i].bearing < (compass + fieldOfView / 3))
	    {
	        if (zombies[i].distance > minShotDistance && zombies[i].distance < maxShotDistance && zombies[i].health > 0)
	        {
	        	if (debug)
	        	{
	        		console.log('Looking at ' + vision[0].name)
	        	}

	        	if (canBeep)
	        	{
	        		sfxSweep.play()

	                canBeep = false

					setTimeout(function()
				    {
				    	canBeep = true
				    }, timeBeep)
	        	}
	        }
	    }
	}

	if (vision.length > 0)
    {
        zombies.sort(function(a, b) // Order the zombies that are in our sights according to distance
        {
            return a.distance - b.distance
        })
    }
}

function proximity()
{
	// Clear the various arrays on each pass so we get fresh results
	melee.length = 0

    for (var i = 0; i < zombies.length; i++)
    {
        zombies[i].distance = distance(zombies[i])

        if (zombies[i].column == player.column && zombies[i].row == player.row && zombies[i].health > 0)
		{
			melee.push(zombies[i])
		}
    }

    if (currentScreen == 'game' || currentScreen == 'gun')
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
}