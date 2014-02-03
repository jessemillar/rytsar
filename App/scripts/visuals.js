function animate(thingy, time) // Use a function outside of the zombie generation to animate so the function can remember the name of the zombie that's animating
{
	setInterval(function()
	{
		if (thingy.frame == 0)
		{
			thingy.frame = 1
		}
		else
		{
			thingy.frame = 0
		}
	}, time)
}

function daylight(value)
{
	ctx.globalAlpha = darkestNight - darkestNight * value
	
	ctx.fillStyle = navy
	ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function highlight(column, row, color, alpha)
{
	for (var i = 0; i < grid.length; i++)
	{
		if (grid[i].column == column && grid[i].row == row) // Find the right grid tile
		{
			if (alpha)
			{
				ctx.globalAlpha = alpha
			}
			else
			{
				ctx.globalAlpha = 1
			}
			ctx.fillStyle = color
			ctx.fillRect(grid[i].x - tileSize / 2, grid[i].y - tileSize / 2, tileSize, tileSize)
			break
		}
	}
}

function blank(color)
{
	ctx.fillStyle = color
	ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function rectangle(x, y, width, height, color, alpha)
{
	if (alpha)
	{
		ctx.globalAlpha = alpha
	}
	else
	{
		ctx.globalAlpha = 1
	}

	ctx.fillStyle = color
	ctx.fillRect(x, y, width, height)
}

function line(x1, y1, x2, y2, color, alpha)
{
	if (alpha)
	{
		ctx.globalAlpha = alpha
	}
	else
	{
		ctx.globalAlpha = 1
	}

	ctx.strokeStyle = color

	ctx.beginPath()
	ctx.moveTo(x1, y1)
	ctx.lineTo(x2, y2)
	ctx.lineWidth = 1
	ctx.stroke()
}

function circle(x, y, radius, color, alpha)
{
	if (alpha)
	{
		ctx.globalAlpha = alpha
	}
	else
	{
		ctx.globalAlpha = 1
	}

	ctx.beginPath()
	ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
	ctx.lineWidth = 1
	ctx.strokeStyle = color
	ctx.stroke()
}

function text(message, x, y, color, alpha)
{
	if (alpha)
	{
		ctx.globalAlpha = alpha
	}
	else
	{
		ctx.globalAlpha = 1
	}

	ctx.fillStyle = color
	ctx.fillText(message, x, y + 7)
}

function image(image, x, y, anchor, alpha)
{
	if (alpha)
	{
		ctx.globalAlpha = alpha
	}
	else
	{
		ctx.globalAlpha = 1
	}

	if (anchor == 'normal')
	{
		ctx.drawImage(image, x, y)
	}
	else if (anchor == 'center')
	{
		ctx.drawImage(image, x - image.width / 2, y - image.height / 2)
	}
	else if (anchor == 'anchor')
	{
		ctx.drawImage(image, x - image.width / 2, y - image.height * 0.75)
	}
}

function gridImage(image, column, row, anchor, alpha, menu)
{
	for (var i = 0; i < grid.length; i++)
	{
		if (grid[i].column == column && grid[i].row == row) // Find the right grid tile
		{
			if (alpha)
			{
				ctx.globalAlpha = alpha
			}
			else
			{
				ctx.globalAlpha = 1
			}

			ctx.save()
			if (anchor == 'normal')
			{
				ctx.translate(grid[i].x, grid[i].y)
				if (!menu)
				{
					ctx.rotate(compass.toRad()) // Rotate the image so it's not affected by the compass-aware orientation of the map
				}
				else
				{
					ctx.rotate(menuRotation.toRad())
				}
				ctx.drawImage(image, 0, 0)
			}
			else if (anchor == 'center')
			{
				ctx.translate(grid[i].x, grid[i].y)
				if (!menu)
				{
					ctx.rotate(compass.toRad()) // Rotate the image so it's not affected by the compass-aware orientation of the map
				}
				else
				{
					ctx.rotate(menuRotation.toRad())
				}
				ctx.drawImage(image, 0 - image.width / 2, 0 - image.height / 2)
			}
			else if (anchor == 'anchor')
			{
				ctx.translate(grid[i].x, grid[i].y)
				if (!menu)
				{
					ctx.rotate(compass.toRad()) // Rotate the image so it's not affected by the compass-aware orientation of the map
				}
				else
				{
					ctx.rotate(menuRotation.toRad())
				}
				ctx.drawImage(image, 0 - image.width / 2, 0 - image.height * 0.85) // Don't quite anchor all the way at the bottom of the image
			}
			ctx.restore()
			break
		}
	}
}