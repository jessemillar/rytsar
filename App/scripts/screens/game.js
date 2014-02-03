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

		if (reeds.length == 0) // Spawn reeds if we have none currently
		{
			for (var i = 0; i < totalReeds; i++)
			{
				var thingy = new Object()
					thingy.column = Math.floor(random(1, gridWidth))
					thingy.row = Math.floor(random(1, gridHeight))
				reeds.push(thingy)
			}
		}

		if (zombies.length == 0) // Spawn zombies if we have none currently
		{
			for (var i = 0; i < totalZombies; i++)
			{
				var thingy = new Object()
					thingy.name = 'zombie' + i
					thingy.column = Math.floor(random(1, gridWidth))
					thingy.row = Math.floor(random(1, gridHeight))
					thingy.health = random(zombieMinHealth, zombieMaxHealth)
					thingy.frame = random(0, 1)
					thingy.animate = animate(thingy, slowestAnimation)
					thingy.nature = Math.floor(random(0, 1))
					thingy.hunt = hunt(thingy, random(0, 1))
				zombies.push(thingy)
			}

			setInterval(function()
			{
				hurtPlayer()
			}, 1000)
		}
		else // Or do things with the zombies we have
		{
            for (var i = 0; i < totalZombies; i++)
            {
                zombies[i].distance = distance(zombies[i])
                zombies[i].bearing = bearing(zombies[i])
        
                if ((compass - fieldOfView) < zombies[i].bearing && zombies[i].bearing < (compass + fieldOfView))
                {
                    if (zombies[i].distance > minShotDistance && zombies[i].distance < maxShotDistance && zombies[i].health > 0)
                    {
                        vision.push(zombies[i])
                        // sfxSweep.play()
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
			for (var i = 0; i < totalAmmo; i++)
			{
				var thingy = new Object()
					thingy.column = Math.floor(random(1, gridWidth))
					thingy.row = Math.floor(random(1, gridHeight))
					thingy.count = random(ammoCountLow, ammoCountHigh)
				ammo.push(thingy)
			}
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
	else if (gps.accuracy == 0)
	{
		blank(red)
		text('Waiting for GPS lock', 3, 3, white)
		text('Are you outside?', 3, 13, white)
		text('Can you see the sky?', 3, 23, white)
	}
	else if (gps.accuracy > 15)
	{
		blank(red)
		text('Current GPS accuracy of ' + gps.accuracy + ' meters is not accurate enough', 3, 3, white)
		text('Are you outside?', 3, 13, white)
		text('Can you see the sky?', 3, 23, white)
	}
}