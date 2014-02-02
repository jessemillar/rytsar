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

	// Draw the grid
	ctx.save()
	ctx.translate(centerX, centerY)
	menuRotation += menuRotationSpeed // Rotate the menu
	ctx.rotate(-menuRotation.toRad()) // Things relating to the canvas and rotation expect radians
	for (var y = 0; y < menuGridHeight + 1; y++) // Draw the grid on the newly rotated canvas
	{
		for (var x = 0; x < menuGridWidth + 1; x++)
		{
			image(imgGrid, 0 - player.column * tileSize + x * tileSize + tileSize / 2, 0 - player.row * tileSize + y * tileSize + tileSize / 2, 'center')
			
			if (x < menuGridWidth && y < menuGridHeight) // Only save squares inside the play area, not the ones on the outside bottom and bottom-right (that are used to just make the visual square markers)
			{
				var thingy = new Object() // Write grid data to an array to use later for drawing stuff in the tiles
				thingy.column = x + 1
				thingy.row = y + 1
				thingy.x = 0 - player.column * tileSize + x * tileSize + tileSize
				thingy.y = 0 - player.row * tileSize + y * tileSize + tileSize
				grid.push(thingy)
			}
		}
	}
	
	for (var i = 0; i < reeds.length; i++)
	{
		gridImage(imgReed, reeds[i].column, reeds[i].row, 'anchor', 1, true)
	}
	
    for (var i = 0; i < zombies.length; i++) // Draw the zombies
    {
		if (zombies[i].frame == 0)
		{
			gridImage(imgZombieLeft, zombies[i].column, zombies[i].row, 'anchor', 1, true)
		}
		else
		{
			gridImage(imgZombieLeft2, zombies[i].column, zombies[i].row, 'anchor', 1, true)
		}
	}

	ctx.restore()
	
	daylight(0) // Make it night

	// Logo shape and shadow
	image(imgMenuStats, xStats, yStats, 'center')
	image(imgMenuSingle, xSingle, ySingle, 'center')
	image(imgMenuMulti, xMulti, yMulti, 'center')
	image(imgMenuSettings, xSettings, ySettings, 'center')
}

function drawGame()
{
	grid.length = 0 // Wipe the database of pixel to grid coordinants to start fresh

	blank(canvasColor) // Place draw calls after this

	if (debug) // Draw the aiming cone for debugging purposes
    {
    	line((centerX) - (centerY * Math.tan(fieldOfView.toRad())), 0, centerX, centerY, debugColor)
    	line(centerX, centerY, (centerX) + (centerY * Math.tan(fieldOfView.toRad())), 0, debugColor)
		circle(centerX, centerY, maxShotDistance * pixelsToMeters, debugColor)
		circle(centerX, centerY, minShotDistance * pixelsToMeters, debugColor)
		circle(centerX, centerY, damageDistance * pixelsToMeters, debugColor)
		text('GPS currently accurate within ' + gps.accuracy + ' meters', 5 + indicatorSpacing + indicatorWidth, canvas.height - 10, debugColor)
    }
	
	// Aiming cone
	image(imgCone, centerX, centerY - imgCone.height / 2 - 15, 'center')

	// Draw the grid
	ctx.save()
	ctx.translate(centerX, centerY)
	ctx.rotate(-compass.toRad()) // Things relating to the canvas and rotation expect radians
	for (var y = 0; y < gridHeight + 1; y++) // Draw the grid on the newly rotated canvas
	{
		for (var x = 0; x < gridWidth + 1; x++)
		{
			image(imgGrid, 0 - player.column * tileSize + x * tileSize + tileSize / 2, 0 - player.row * tileSize + y * tileSize + tileSize / 2, 'center')

			if (x < gridWidth && y < gridHeight) // Only save squares inside the play area, not the ones on the outside bottom and bottom-right (that are used to just make the visual square markers)
			{
				var thingy = new Object() // Write grid data to an array to use later for drawing stuff in the tiles
					thingy.column = x + 1
					thingy.row = y + 1
					thingy.x = 0 - player.column * tileSize + x * tileSize + tileSize
					thingy.y = 0 - player.row * tileSize + y * tileSize + tileSize
				grid.push(thingy)

				if (debug)
				{
					text((x + 1) + ',' + (y + 1), x * tileSize + imgGrid.width - tileSize * gridWidth / 2, y * tileSize + imgGrid.height - tileSize * gridHeight / 2, debugColor)
					polygon((x * tileSize) + (tileSize / 2) - (tileSize * gridWidth / 2), (y * tileSize) + (tileSize / 2) - (tileSize * gridWidth / 2), 2, debugColor)
				}
			}
		}
	}

	for (var i = 1; i < player.history.length; i++) // Draw the player's footprints to mark where they've been
	{
		highlight(player.history[i].column, player.history[i].row, white, 0.05)
	}

	for (var i = 0; i < reeds.length; i++)
	{
		gridImage(imgReed, reeds[i].column, reeds[i].row, 'anchor')
	}
    
    gridImage(imgPlayer, player.column, player.row, 'anchor') // Draw the player

	for (var i = 0; i < ammo.length; i++) // Draw the ammo packs
    {
		if (ammo[i].count > 0)
		{
			gridImage(imgAmmoPack, ammo[i].column, ammo[i].row, 'anchor')
		}
	}

    for (var i = 0; i < zombies.length; i++) // Draw the zombies
    {
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
	    	gridImage(imgZombieDead, zombies[i].column, zombies[i].row, 'anchor') // Draw dead zombies
	    }
	}

	gridImage(imgCloud, 5, 5, 'center') // Draw a cloud for testing purposes

	ctx.restore() // Unrotate the canvas

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

function daylight(value)
{
	ctx.globalAlpha = darkestNight - darkestNight * value
	
	ctx.fillStyle = navy
	ctx.fillRect(0, 0, canvas.width, canvas.height)
}

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