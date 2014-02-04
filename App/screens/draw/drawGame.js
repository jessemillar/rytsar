function drawGame()
{
	grid.length = 0 // Wipe the database of pixel to grid coordinants to start fresh

	blank(canvasColor) // Place draw calls after this

	if (debug) // Draw the aiming cone for debugging purposes
    {
    	line((centerX) - (centerY * Math.tan(fieldOfView.toRad())), 0, centerX, centerY, debugColor)
    	line(centerX, centerY, (centerX) + (centerY * Math.tan(fieldOfView.toRad())), 0, debugColor)
		circle(centerX, centerY, maxShotDistance * tileSize, debugColor)
		text('GPS currently accurate within ' + gps.accuracy + ' meters', 5 + indicatorSpacing + imgBullet.width, canvas.height - 10, debugColor)
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
			var positionX = 0 - player.column * tileSize + x * tileSize + tileSize / 2
			var positionY = 0 - player.row * tileSize + y * tileSize + tileSize / 2

			gridCross(imgGrid, positionX, positionY, 'center')

			if (x < gridWidth && y < gridHeight) // Only save squares inside the play area, not the ones on the outside bottom and bottom-right (that are used to just make the visual square markers)
			{
				var thingy = new Object() // Write grid data to an array to use later for drawing stuff in the tiles
					thingy.column = x + 1
					thingy.row = y + 1
					thingy.x = 0 - player.column * tileSize + x * tileSize + tileSize // Relates to positionX but is slightly different
					thingy.y = 0 - player.row * tileSize + y * tileSize + tileSize // Relates to positionY but is slightly different
				grid.push(thingy)
			}
		}
	}

	for (var i = 0; i < player.history.length; i++) // Draw the player's footprints to mark where they've been
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

	// gridImage(imgCloud, 5, 5, 'center') // Draw a cloud for testing purposes

	ctx.restore() // Unrotate the canvas

	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Things are only set up for right handed users right now
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // Draw the compass
    ctx.save()
    ctx.translate(25, 25)
    image(imgCompassBack, 0, 0, 'center')
    ctx.rotate(-compass.toRad())
    image(imgCompassNeedle, 0, 0, 'center')
    ctx.restore()

    for (var i = 0; i < player.health; i++) // Draw out health
	{
		image(imgHeart, canvas.width - indicatorSpacing - imgHeart.width, indicatorSpacing + (imgHeart.height + indicatorSpacing) * i, 'normal')
	}

	for (var i = 0; i < player.magazine + 1; i++) // Draw the ammo in our gun's magazine
	{
		image(imgMagazineBullet, canvas.width - indicatorSpacing - imgMagazineBullet.width, canvas.height - (imgMagazineBullet.height + indicatorSpacing) * i, 'normal')
	}

	for (var i = 0; i < player.ammo + 1; i++) // Draw our extraAmmo
	{
		image(imgBullet, indicatorSpacing, canvas.height - (imgBullet.height + indicatorSpacing) * i, 'normal')
	}
}