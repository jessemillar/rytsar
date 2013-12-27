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
var latitude = 0
var longitude = 0
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
		if (latitude && longitude)
		{
			world()
			genesis = true
		}
	}

	latitude = position.coords.latitude
	longitude = position.coords.longitude

	compass = position.coords.heading
}

function error(error)
{
	console.log('error', error.code, error.message)

    if (error.code === navigator.geolocation.PERMISSION_DENIED)
    {
        console.log('GPS permission denied')
    }
}