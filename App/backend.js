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
			world()
			genesis = true
		}
	}

	gps.latitude = position.coords.latitude
	gps.longitude = position.coords.longitude
	gps.accuracy = position.coords.accuracy

	if (((90 - 25) < Math.abs(tilt.y)) && (Math.abs(tilt.y) < (90 + 25))) // Gun orientation
    {
    	compass = position.coords.heading - tilt.x
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

Number.prototype.toRad = function()
{
	return this * Math.PI / 180
}

Number.prototype.toDeg = function()
{
	return this * 180 / Math.PI
}

function distance(lat2, lon2)
{
	var km = 6371
	var distance = Math.acos(Math.sin(gps.latitude) * Math.sin(lat2) + 
                   Math.cos(gps.latitude) * Math.cos(lat2) *
            	   Math.cos(lon2 - gps.longitude)) * km
	return distance
}

function bearing(latitude2, longitude2)
{
	var lat1 = gps.latitude * (Math.PI / 180)
	var lat2 = latitude2 * (Math.PI / 180)
	var dLon = (longitude2 - gps.longitude) * (Math.PI / 180)

	var y = Math.sin(dLon) * Math.cos(lat2)
	var x = Math.cos(lat1) * Math.sin(lat2) -
			Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
	var bearing = Math.atan2(y, x)

	return (bearing * (180 / Math.PI) + 360) % 360
}

function polygon(x, y, size, color)
{
	ctx.beginPath()
	ctx.moveTo(x, y - size)
	ctx.lineTo(x + size, y)
	ctx.lineTo(x, y + size)
	ctx.lineTo(x - size, y)
	ctx.closePath()
	ctx.fillStyle = color
	ctx.fill()
}

function line(x1, y1, x2, y2, color)
{
	ctx.strokeStyle = color

	ctx.beginPath()
	ctx.moveTo(x1, y1)
	ctx.lineTo(x2, y2)
	ctx.lineWidth = 1
	ctx.stroke()
}

function circle(x, y, radius, color)
{
	ctx.beginPath()
	ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
	ctx.lineWidth = 1
	ctx.strokeStyle = '#4c4c4c'
	ctx.stroke()
}

function find(name) // Find a zombie by it's name
{
	for (var i = 0; i < objects.length; i++)
	{
		if (objects[i].name == name)
		{
			return i
		}
	}
}

function keyboard(title, message)
{
	ejecta.getText(title, message, function(text)
	{
		console.log(text)
	})
}