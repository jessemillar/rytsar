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

navigator.geolocation.watchPosition(geolocation, error) // For GPS and compass

function geolocation(position)
{
	gps.latitude = position.coords.latitude
	gps.longitude = position.coords.longitude
	gps.accuracy = position.coords.accuracy

	if (((90 - 25) < Math.abs(tilt.y)) && (Math.abs(tilt.y) < (90 + 25))) // Gun orientation
    {
    	compass = position.coords.heading - tilt.x // Compass value with compensation for holding the phone in gun orientation
    }
    else
    {
    	compass = position.coords.heading
    }
}

function error(error)
{
	console.log('error', error.code, error.message)

    if (error.code === navigator.geolocation.PERMISSION_DENIED)
    {
        console.log('GPS permission denied')
    }
}

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

function bearing(latitude, longitude)
{
	var lat1 = gps.latitude.toRad()
	var lat2 = latitude.toRad()
	var dLon = (longitude - gps.longitude).toRad()

	var y = Math.sin(dLon) * Math.cos(lat2)
	var x = Math.cos(lat1) * Math.sin(lat2) -
			Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
	var bearing = Math.atan2(y, x)

	return (bearing.toDeg() + 360) % 360
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
		ctx.drawImage(image, image.anchorX - x, image.anchorY - y)
	}
}

function moveToward(thingy, x, y, speed) // Move a thingy toward a specific pixel coordinate at a constant speed
{
	var destinationX = x - thingy.x
	var destinationY = y - thingy.y
	var hypotenuse = Math.sqrt(destinationX * destinationX + destinationY * destinationY)
	var radians = Math.atan2(destinationY, destinationX)
	var angle = radians / Math.PI * 180

	thingy.x += (destinationX / hypotenuse) * speed
	thingy.y += (destinationY / hypotenuse) * speed
}