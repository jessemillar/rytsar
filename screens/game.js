function screenGame()
{
	if (debug)
	{
		gpsRequiredAccuracy = 10000
	}

	if (gps.latitude && gps.longitude && gps.accuracy < gpsRequiredAccuracy) // Only do stuff if we know where we are
	{
		if (zombies.length == 0) // Spawn zombies if we have none currently
		{
			makeZombies()
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

	        currentScreen = 'gun'

	        if (-rotation.y > rotateRequiredReload) // Reload
	        {
	            reload()
	        }

	        if (-rotation.z > rotateRequiredShoot) // Fire
	        {
	            fire()
	        }
	    }
	    else
	    {
	    	currentScreen = 'game'
	    }

	    // Place this after the tracker for attack motions
	    turnPlayer() // Let the player take their turn whenever they move in the real world

	    // ******************************
		// Draw
		// ******************************

		if (currentScreen == 'game') // Draw the game screen if we're not in gun orientation
		{
			drawGame()
		}
		else if (currentScreen == 'gun') // ...or draw the gun if we're in that orientation
		{
			drawGun()
		}
	}
	else if (gps.accuracy == 0 || gps.accuracy > gpsRequiredAccuracy)
	{
		currentScreen = 'gps'
	}
}