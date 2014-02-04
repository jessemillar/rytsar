function screenGame()
{
	if (debug)
	{
		gpsRequiredAccuracy = 10000
	}

	if (gps.latitude && gps.longitude && gps.accuracy < gpsRequiredAccuracy) // Only do stuff if we know where we are
	{
		// ******************************
		// Run calculations
		// ******************************

		pickup()
		gpsMove() // Check if we've moved far enough in the real world to mandate a player position change

		// Clear the various arrays on each pass so we get fresh results
		melee.length = 0
		vision.length = 0

		if (zombies.length == 0) // Spawn zombies if we have none currently
		{
			makeZombies()

			if (!hurtPlayerTimer)
			{
				setInterval(function()
				{
					hurtPlayer()
				}, 1000)
				hurtPlayerTimer = true
			}
		}
		else // Or do things with the zombies we have
		{
            for (var i = 0; i < zombies.length; i++)
            {
                zombies[i].distance = distance(zombies[i])
                zombies[i].bearing = bearing(zombies[i])
        
                if (zombies[i].column == player.column && zombies[i].row == player.row && zombies[i].health > 0)
				{
					melee.push(zombies[i])
				}

                if ((compass - fieldOfView) < zombies[i].bearing && zombies[i].bearing < (compass + fieldOfView))
                {
                    if (zombies[i].distance > minShotDistance && zombies[i].distance < maxShotDistance && zombies[i].health > 0)
                    {
                        vision.push(zombies[i])
                    }
                }

                if ((compass - fieldOfView / 3) < zombies[i].bearing && zombies[i].bearing < (compass + fieldOfView / 3))
                {
                    if (zombies[i].distance > minShotDistance && zombies[i].distance < maxShotDistance && zombies[i].health > 0)
                    {
                        sfxSweep.play()
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

		if (ammo.length == 0) // Make ammo packs if we have none
		{
			makeAmmo()
		}

		if (reeds.length == 0) // Spawn reeds if we have none currently
		{
			makeReeds()
		}

		// ******************************
		// Attack motions
		// ******************************

	    if (acceleration.total > accelRequiredMelee) // Melee attack!
		{
			if (canMelee)
			{
				punch()
			}
		}

	    if (((90 - 25) < Math.abs(tilt.y)) && (Math.abs(tilt.y) < (90 + 25))) // Watch for gun orientation
	    {
	        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	        // Things are only set up for right handed users right now
	        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

	        if (-rotation.y > rotateRequiredReload) // Reload
	        {
	            reload()
	        }

	        if (-rotation.z > rotateRequiredShoot) // Fire
	        {
	            fire()
	        }
	    }

	    // ******************************
		// Draw
		// ******************************

	    drawGame()
	}
	else if (gps.accuracy == 0 || gps.accuracy > gpsRequiredAccuracy)
	{
		currentScreen = 'gps'
	}
}