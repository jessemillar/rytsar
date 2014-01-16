// Save everything to easily-readable variables that we can access from other scripts
var tilt = new Object()
	tilt.x = 0
	tilt.y = 0
	tilt.z = 0
var rotation = new Object()
	rotation.x = 0
	rotation.y = 0
	rotation.z = 0
var acceleration = new Object()
	acceleration.x = 0
	acceleration.y = 0
	acceleration.z = 0
	acceleration.total = 0
var gps = new Object()
	gps.latitude = 0
	gps.longitude = 0
	gps.accuracy = 0
	gps.history = new Array()
var compass = 0

document.addEventListener('deviceorientation', function(orientation)
{
	tilt.x = orientation.beta
	tilt.y = orientation.alpha
	tilt.z = orientation.gamma
}, true)

document.addEventListener('devicemotion', function(motion)
{
	rotation.x = motion.rotationRate.alpha
	rotation.y = motion.rotationRate.beta
	rotation.z = motion.rotationRate.gamma

	acceleration.x = motion.acceleration.x
	acceleration.y = motion.acceleration.y
	acceleration.z = motion.acceleration.z
	acceleration.total = Math.abs(acceleration.x + acceleration.y + acceleration.z)
}, true)

// For GPS and compass
navigator.geolocation.watchPosition(function(position)
{
	gps.latitude = position.coords.latitude
	gps.longitude = position.coords.longitude
	gps.accuracy = position.coords.accuracy

	// Push the updated coordinates to the gps.history object
	if (gps.history.length == 0)
	{
		gps.history[0] = new Object()
		gps.history[0].latitude = gps.latitude
		gps.history[0].longitude = gps.longitude
	}
	else if (gps.latitude != gps.history[gps.history.length - 1].latitude || gps.longitude != gps.history[gps.history.length - 1].longitude)
	{
		var thingy = new Object()
			thingy.latitude = gps.latitude
			thingy.longitude = gps.longitude
		gps.history.push(thingy)
	}

	if (((90 - 25) < Math.abs(tilt.y)) && (Math.abs(tilt.y) < (90 + 25))) // Gun orientation
    {
    	compass = position.coords.heading - tilt.x // Compass value with compensation for holding the phone in gun orientation
    
    	if (compass < 0)
    	{
    		compass += 360
    	}
    }
    else
    {
    	compass = position.coords.heading
    }
})

function random(min, max)
{
	return Math.random() * (max - min) + min
}

Number.prototype.toRad = function()
{
	return this * Math.PI / 180
}

Number.prototype.toDeg = function()
{
	return this * 180 / Math.PI
}

function distance(lat2, lon2) // Returns distance in meters
{
	var radius = 6371000
	var dLat = (lat2 - gps.latitude).toRad()
	var dLon = (lon2 - gps.longitude).toRad()
	var lat1 = gps.latitude.toRad()
	var lat2 = lat2.toRad()

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
	var d = radius * c
	return d
}

function bearing(firstObject, secondObject)
{
	var differenceX = firstObject.column - secondObject.column
	var differenceY = firstObject.row - secondObject - row
	
	// Find an angle or summat
}

function blank(color)
{
	ctx.fillStyle = color
	ctx.fillRect(0, 0, canvas.width, canvas.height)
}

// Kill this when I move the menu to all images
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

function polygon(x, y, size, color, alpha)
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
	ctx.moveTo(x, y - size)
	ctx.lineTo(x + size, y)
	ctx.lineTo(x, y + size)
	ctx.lineTo(x - size, y)
	ctx.closePath()
	ctx.fillStyle = color
	ctx.fill()
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
		ctx.drawImage(image, image.width / 2 - x, image.height / 2 - y)
	}
	else if (anchor == 'anchor')
	{
		ctx.drawImage(image, x - image.width / 2, y - image.height)
	}
}

function gridCheck(object, value)
{
	for (var i = 0; i < grid.length; i++)
	{
		if (grid[i].column == object.column && grid[i].row == object.row)
		{
			if (value == 'x')
			{
				return grid[i].x + centerX
			}
			else if (value == 'y')
			{
				return grid[i].y + centerY
			}
		}
	}
}

function gridImage(image, column, row, anchor, alpha)
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
				ctx.rotate(compass.toRad()) // Rotate the image so it's not affected by the compass-aware orientation of the map
				ctx.drawImage(image, 0, 0)
			}
			else if (anchor == 'center')
			{
				ctx.translate(grid[i].x, grid[i].y)
				ctx.rotate(compass.toRad()) // Rotate the image so it's not affected by the compass-aware orientation of the map
				ctx.drawImage(image, 0 - image.width / 2, 0 - image.height / 2)
			}
			else if (anchor == 'anchor')
			{
				ctx.translate(grid[i].x, grid[i].y)
				ctx.rotate(compass.toRad()) // Rotate the image so it's not affected by the compass-aware orientation of the map
				ctx.drawImage(image, 0 - image.width / 2, 0 - image.height) // Don't quite anchor all the way at the bottom of the image
			}
			ctx.restore()
			break
		}
	}
}

function moveToward(thingy, x, y, speed) // Move a thingy toward a specific pixel coordinate at a constant speed
{
	var destinationX = x - thingy.x
	var destinationY = y - thingy.y
	var hypotenuse = Math.sqrt(destinationX * destinationX + destinationY * destinationY)
	var radians = Math.atan2(destinationY, destinationX)
	var angle = radians.toDeg()

	thingy.x += (destinationX / hypotenuse) * speed
	thingy.y += (destinationY / hypotenuse) * speed
}

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