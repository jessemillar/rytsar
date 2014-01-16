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
		
		if (zombies[i].xDestination < zombies[i].x && zombies[i].yDestination < zombies[i].y)
		{
			if (zombies[i].frame == 0)
			{
				image(imgZombieUpLeft, zombies[i].x, zombies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieUpLeft2, zombies[i].x, zombies[i].y, 'anchor')
			}
		}
		else if (zombies[i].xDestination > zombies[i].x && zombies[i].yDestination < zombies[i].y)
		{
			if (zombies[i].frame == 0)
			{
				image(imgZombieUpRight, zombies[i].x, zombies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieUpRight2, zombies[i].x, zombies[i].y, 'anchor')
			}
		}
		else if (zombies[i].xDestination < zombies[i].x && zombies[i].yDestination > zombies[i].y)
		{
			if (zombies[i].frame == 0)
			{
				image(imgZombieDownLeft, zombies[i].x, zombies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieDownLeft2, zombies[i].x, zombies[i].y, 'anchor')
			}
		}
		else if (zombies[i].xDestination > zombies[i].x && zombies[i].yDestination > zombies[i].y)
		{
			if (zombies[i].frame == 0)
			{
				image(imgZombieDownRight, zombies[i].x, zombies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieDownRight2, zombies[i].x, zombies[i].y, 'anchor')
			}
		}
	}

	// Logo shape
	polygon(xStats, yStats, menuSize, white)
	polygon(xSingle, ySingle, menuSize, blue)
	polygon(xMulti, yMulti, menuSize, white)
	polygon(xPrefs, yPrefs, menuSize, white)
}

function drawGame()
{
	grid.length = 0 // Wipe the database of pixel to grid coordinants to start fresh

	blank(canvasColor) // Place draw calls after this

	// Draw the grid
	ctx.save()
	ctx.translate(centerX, centerY)
	ctx.rotate(-compass.toRad()) // Things relating to the canvas expect radians
	for (var y = 0; y < gridHeight + 1; y++)
	{
		for (var x = 0; x < gridWidth + 1; x++)
		{
			if (x < gridWidth && y < gridHeight)
			{
				var thingy = new Object() // Write grid data to an array to use later for drawing stuff in the tiles
					thingy.column = x + 1
					thingy.row = y + 1
					thingy.x = (x * tileSize - 1) + (tileSize / 2) - (tileSize * gridWidth / 2 + 2)
					thingy.y = (y * tileSize - 1) + (tileSize / 2) - (tileSize * gridHeight / 2 + 2)
				grid.push(thingy)

				if (debug)
				{
					text(grid.length + ',' + grid[grid.length - 1].column + ',' + grid[grid.length - 1].row, grid[grid.length - 1].x, grid[grid.length - 1].y, debugColor)
				}
			}

			image(imgGrid, (x * tileSize - 1) - (tileSize * gridWidth / 2 + 2), (y * tileSize - 1) - (tileSize * gridHeight / 2 + 2), 'normal')
		}
	}

	gridImage(imgZombieDownRight, 2, 2, 'anchor')
	ctx.restore()

    if (debug) // Draw the aiming cone for debugging purposes
    {
    	line((centerX) - (centerY * Math.tan(fieldOfView.toRad())), 0, centerX, centerY, debugColor)
    	line(centerX, centerY, (centerX) + (centerY * Math.tan(fieldOfView.toRad())), 0, debugColor)
		circle(centerX, centerY, maxShotDistance * pixelsToMeters, debugColor)
		circle(centerX, centerY, minShotDistance * pixelsToMeters, debugColor)
		circle(centerX, centerY, damageDistance * pixelsToMeters, debugColor)
		text('GPS currently accurate within ' + gps.accuracy + ' meters', 5 + indicatorSpacing + indicatorWidth, canvas.height - 10, debugColor)
    }

    /*
    zombies.sort(function(a, b) // Order the zombies for proper depth
	{
		return a.y - b.y
	})
	*/

	polygon(centerX, centerY, 10, white) // Draw the player

	for (var i = 0; i < ammo.length; i++) // Draw the ammo packs
    {
    	if (ammo[i].distance < renderDistance) // This is the bit that helps with framerate
    	{
		    var x = centerX + Math.cos(((ammo[i].bearing - compass) + 270).toRad()) * (ammo[i].distance * pixelsToMeters)
			var y = centerY + Math.sin(((ammo[i].bearing - compass) + 270).toRad()) * (ammo[i].distance * pixelsToMeters)

			if (ammo[i].count > 0)
			{
				image(imgAmmoPack, x, y, 'anchor')
			}
			else
			{
				image(imgEmptyAmmoPack, x, y, 'anchor')
			}
		}
	}

    // Draw the zombies
    for (var i = 0; i < zombies.length; i++)
    {
    	if (zombies[i].distance < renderDistance) // This is the bit that helps with framerate
    	{
			zombies[i].x = centerX + Math.cos(((zombies[i].bearing - compass) + 270).toRad()) * (zombies[i].distance * pixelsToMeters)
			zombies[i].y = centerY + Math.sin(((zombies[i].bearing - compass) + 270).toRad()) * (zombies[i].distance * pixelsToMeters)

			if (debug)
			{
				text(zombies[i].name, zombies[i].x + 15, zombies[i].y - 10)
			}

		    if (zombies[i].health > 0) // Draw zombies facing in the right direction
		    {	
				if (centerX < zombies[i].x && centerY < zombies[i].y)
				{
					if (zombies[i].frame == 0)
					{
						image(imgZombieUpLeft, zombies[i].x, zombies[i].y, 'anchor')
					}
					else
					{
						image(imgZombieUpLeft2, zombies[i].x, zombies[i].y, 'anchor')
					}
				}
				else if (centerX > zombies[i].x && centerY < zombies[i].y)
				{
					if (zombies[i].frame == 0)
					{
						image(imgZombieUpRight, zombies[i].x, zombies[i].y, 'anchor')
					}
					else
					{
						image(imgZombieUpRight2, zombies[i].x, zombies[i].y, 'anchor')
					}
				}
				else if (centerX < zombies[i].x && centerY > zombies[i].y)
				{
					if (zombies[i].frame == 0)
					{
						image(imgZombieDownLeft, zombies[i].x, zombies[i].y, 'anchor')
					}
					else
					{
						image(imgZombieDownLeft2, zombies[i].x, zombies[i].y, 'anchor')
					}
				}
				else if (centerX > zombies[i].x && centerY > zombies[i].y)
				{
					if (zombies[i].frame == 0)
					{
						image(imgZombieDownRight, zombies[i].x, zombies[i].y, 'anchor')
					}
					else
					{
						image(imgZombieDownRight2, zombies[i].x, zombies[i].y, 'anchor')
					}
				}
		    }
		    else
		    {
		    	image(imgDeadZombie, zombies[i].x, zombies[i].y, 'anchor') // Draw dead zombies
		    }
		}
	}

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