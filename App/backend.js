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
var gps = new Object()
	gps.latitude = 0
	gps.longitude = 0
	gps.accuracy = 0
var compass = 0

var genesis = false // Whether or not the world has been created

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
}, true)

navigator.geolocation.watchPosition(geolocation, error) // For GPS and compass

function geolocation(position)
{
	if (!genesis)
	{
		if (gps.latitude && gps.longitude)
		{
			init()
			genesis = true
		}
	}

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

function rounded(x, y, width, height, roundness, color, alpha)
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
	ctx.moveTo(x + roundness, y)
	ctx.lineTo(x + width - roundness, y)
	ctx.quadraticCurveTo(x + width, y, x + width, y + roundness)
	ctx.lineTo(x + width, y + height - roundness)
	ctx.quadraticCurveTo(x + width, y + height, x + width - roundness, y + height)
	ctx.lineTo(x + roundness, y + height)
	ctx.quadraticCurveTo(x, y + height, x, y + height - roundness)
	ctx.lineTo(x, y + roundness)
	ctx.quadraticCurveTo(x, y, x + roundness, y)
	ctx.fillStyle = color
	ctx.fill()
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