function findSpawnRadius() // Spawn stuff in relation to the player
{
    spawnSeedLatitude = 0
    spawnSeedLongitude = 0

    while (spawnRadius > distance(gps.latitude + spawnSeedLatitude, gps.longitude)) // Find spawnSeedLatitude
    {
        spawnSeedLatitude += 0.00001
    }

    while (spawnRadius > distance(gps.latitude, gps.longitude + spawnSeedLongitude)) // Find spawnSeedLongitude
    {
        spawnSeedLongitude += 0.00001
    }
}

function fire()
{
	if (canShoot)
    {
	    if (magazine > 0) // Don't fire if we don't have ammo
	    {
	    	blank(flashColor) // Flash the screen
	        magazine-- // Remove a bullet
	        sfxFire.play()
	        canShoot = false
	    }
	    else
	    {
	        sfxEmpty.play()
	        canShoot = false
	    }

	    setTimeout(function()
        {
        	sfxCock.play()
        }, timeFire)

        setTimeout(function()
        {
            canShoot = true
        }, timeFire + timeCock)
	}
}

function shootZombie(zombieName, damageAmount)
{
	if (canShootServer)
	{
		if (magazine > 0) // Don't fire if we don't have ammo
	    {
		    setTimeout(function() // Add a timeout so the zombie doesn't groan instantly
		    {
		    	sfxGroan.play()
		    }, 200)
	    }
	}
}

function reload()
{
	if (canShoot) // Prevent reloading during the playback of sound effects
    {
	    if (magazine < capacity && extraAmmo > 0) // Don't reload if we already have a full magazine or if we don't have ammo to reload with
	    {
	        while (magazine < capacity - 1 && extraAmmo > 0) // Fill the magazine with our extra ammo
	        {
	        	magazine += 1
	        	extraAmmo -= 1
	        }
	        sfxReload.play()
	        canShoot = false

	        setTimeout(function()
	        {
	        	sfxCock.play()
	        }, timeReload)

	        setTimeout(function()
	        {
	            canShoot = true
	        }, timeCock + timeReload)
	    }
	}
}

function drawEnemies()
{
	
}

function drawAmmoPacks()
{
	for (var i = 1; i < ammo.length; i++)
    {
    	if (ammo[i].distance < renderDistance) // This is the bit that helps with framerate
    	{
		    var x = (xCenter) + (Math.cos(((ammo[i].bearing - compass) + 270).toRad()) * (ammo[i].distance * metersToPixels))
		    var y = (yCenter) + (Math.sin(((ammo[i].bearing - compass) + 270).toRad()) * (ammo[i].distance * metersToPixels))

		    polygon(x, y, ammoPackSize, itemColor) // Draw the item in question
		}
	}
}