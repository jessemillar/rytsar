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

function punch()
{
	sfxPunch.play()

	if (melee.length > 0) // If we're within range of at at least one zombie...
	{
		melee[0].health -= meleeDamage

		setTimeout(function() // Add a timeout so the zombie doesn't groan instantly
    	{
    		sfxGroan.play()
    	}, 200)
	}

	canMelee = false

	setTimeout(function()
    {
    	canMelee = true
    }, timeMelee)
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

	        if (vision.length > 0) // If we're looking at at least one zombie...
			{
				vision[0].health -= shotDamage

				setTimeout(function() // Add a timeout so the zombie doesn't groan instantly
		    	{
		    		sfxGroan.play()
		    	}, 200)
			}
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

function drawMenu()
{
	blank(canvasColor)

	for (var i = 0; i < zombies.length; i++) // Sort and draw the menu zombies
	{
		zombies.sort(function(a, b) // Order the zombies for proper depth
		{
			return a.y - b.y
		})
		
		if (zombies[i].frame == 0)
		{
			image(imgZombieLeft, zombies[i].x, zombies[i].y, 'anchor')
		}
		else
		{
			image(imgZombieLeft2, zombies[i].x, zombies[i].y, 'anchor')
		}
	}

	// Logo shape
	image(imgMenuStats, xStats, yStats, 'center')
	image(imgMenuSingle, xSingle, ySingle, 'center')
	image(imgMenuMulti, xMulti, yMulti, 'center')
	image(imgMenuSettings, xSettings, ySettings, 'center')
}

function drawGame()
{
	grid.length = 0 // Wipe the database of pixel to grid coordinants to start fresh

	blank(canvasColor) // Place draw calls after this

	polygon(centerX, centerY, 10, white) // Draw the player

	if (debug) // Draw the aiming cone for debugging purposes
    {
    	line((centerX) - (centerY * Math.tan(fieldOfView.toRad())), 0, centerX, centerY, debugColor)
    	line(centerX, centerY, (centerX) + (centerY * Math.tan(fieldOfView.toRad())), 0, debugColor)
		circle(centerX, centerY, maxShotDistance * pixelsToMeters, debugColor)
		circle(centerX, centerY, minShotDistance * pixelsToMeters, debugColor)
		circle(centerX, centerY, damageDistance * pixelsToMeters, debugColor)
		text('GPS currently accurate within ' + gps.accuracy + ' meters', 5 + indicatorSpacing + indicatorWidth, canvas.height - 10, debugColor)
    }

	// Draw the grid
	ctx.save()
	ctx.translate(centerX, centerY)
	ctx.rotate(-compass.toRad()) // Things relating to the canvas expect radians
	for (var y = 0; y < gridHeight + 1; y++)
	{
		for (var x = 0; x < gridWidth + 1; x++)
		{
			if (x < gridWidth && y < gridHeight) // Only save squares inside the play area, not the ones on the outside bottom and bottom-right (that are used to just make the visual square markers)
			{
				var thingy = new Object() // Write grid data to an array to use later for drawing stuff in the tiles
					thingy.column = x + 1
					thingy.row = y + 1
					thingy.x = (x * tileSize) + (tileSize / 2) - (tileSize * gridWidth / 2)
					thingy.y = (y * tileSize) + (tileSize / 2) - (tileSize * gridWidth / 2)
				grid.push(thingy)

				if (debug)
				{
					text((x + 1) + ',' + (y + 1), x * tileSize + imgGrid.width - tileSize * gridWidth / 2, y * tileSize + imgGrid.height - tileSize * gridHeight / 2, debugColor)
					polygon((x * tileSize) + (tileSize / 2) - (tileSize * gridWidth / 2), (y * tileSize) + (tileSize / 2) - (tileSize * gridWidth / 2), 2, debugColor)
				}
			}

			image(imgGrid, x * tileSize - imgGrid.width / 2 - tileSize * gridWidth / 2, y * tileSize - imgGrid.height / 2 - tileSize * gridHeight / 2, 'normal')
		}
	}

	for (var i = 0; i < reeds.length; i++)
	{
		gridImage(imgReed, reeds[i].column, reeds[i].row, 'anchor')
	}

	for (var i = 0; i < ammo.length; i++) // Draw the ammo packs
    {
		if (ammo[i].count > 0)
		{
			gridImage(imgAmmoPack, ammo[i].column, ammo[i].row, 'anchor')
		}
		else
		{
			gridImage(imgEmptyAmmoPack, ammo[i].column, ammo[i].row, 'anchor')
		}
	}

    for (var i = 0; i < zombies.length; i++) // Draw the zombies
    {
		if (debug)
		{
			// text(zombies[i].name, gridCheck(zombies[i], 'x') + 15, gridCheck(zombies[i], 'y') - 10)
		}

		if (zombies[i].health > 0)
		{
			if (zombies[i].frame == 0)
			{
				gridImage(imgZombieLeft, zombies[i].column, zombies[i].row, 'anchor')
			}
			else
			{
				gridImage(imgZombieLeft2, zombies[i].column, zombies[i].row, 'anchor')
			}
		}
		else
	    {
	    	image(imgZombieDead, zombies[i].column, zombies[i].row, 'anchor') // Draw dead zombies
	    }
	}

	image(imgCloud, 200, 200, 'normal')

	ctx.restore()

    /*
    zombies.sort(function(a, b) // Order the zombies for proper depth
	{
		return a.y - b.y
	})
	*/

	// drawHealth() // Give a visual on current health level

	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Things are only set up for right handed users right now
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    for (var i = 0; i < health; i++) // Draw out health
	{
		rectangle(canvas.width - indicatorSpacing - indicatorWidth, indicatorSpacing + (indicatorHeight + indicatorSpacing) * i, indicatorWidth, indicatorHeight, red)
	}

	for (var i = 0; i < magazine + 1; i++) // Draw the ammo in our gun
	{
		rectangle(canvas.width - indicatorSpacing - indicatorWidth, canvas.height - (indicatorHeight + indicatorSpacing) * i, indicatorWidth, indicatorHeight, white)
	}

	for (var i = 0; i < extraAmmo + 1; i++) // Draw our extraAmmo
	{
		rectangle(indicatorSpacing, canvas.height - (indicatorHeight + indicatorSpacing) * i, indicatorWidth, indicatorHeight, blue)
	}
}