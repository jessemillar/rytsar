function drawMenu()
{
	menuRotation += menuRotationSpeed // Rotate the menu
	grid.length = 0
	
	blank(canvasColor)

	ctx.save()
	ctx.translate(centerX, centerY)
	ctx.rotate(-menuRotation.toRad()) // Things relating to the canvas and rotation expect radians
	for (var y = 0; y < menuGridHeight + 1; y++) // Draw the grid on the newly rotated canvas
	{
		for (var x = 0; x < menuGridWidth + 1; x++)
		{
			gridCross(imgGrid, 0 - player.column * tileSize + x * tileSize + tileSize / 2, 0 - player.row * tileSize + y * tileSize + tileSize / 2, 'center')
			
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