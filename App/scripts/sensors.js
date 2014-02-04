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

navigator.geolocation.watchPosition(gpsSuccess, gpsError)

function gpsError(error)
{
    if (error.code === navigator.geolocation.PERMISSION_DENIED)
    {
    	currentScreen = 'gps'
	    console.log('GPS Error', error.code, error.message)
	}
}

function gpsSuccess(position)
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
		gps.history.unshift(thingy)

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
}