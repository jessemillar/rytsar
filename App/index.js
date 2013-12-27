// This gives us access to readable sensor variables
ejecta.include('backend.js')

ejecta.include('sounds/sounds.js')

var ctx = canvas.getContext('2d')

// Add 0.001 to a GPS decimal to get ~6 meters
var meterConversion = 100 // ...pixels equals ~0.65 meters

// How much motion is required for certain actions
var rotateRequiredShoot = 425
var rotateRequiredReload = 350

// These variables help the weapons feel more "realistic" and keep the sound effects in line by setting the "length" of sound effects
var canShoot = true
var timeCool = 200
var magazine = 5
var timeReload = 300

var zombieLatitude
var zombieLongitude

function world() // Run once by the GPS function once we have a lock
{
	zombieLatitude = latitude + 0.0001
	zombieLongitude = longitude + 0.0001
}

setInterval(function() // Main game loop
{
	blank()

    if (((90 - 25) < Math.abs(tilt.y)) && (Math.abs(tilt.y) < (90 + 25))) // Gun orientation
    {
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // Things are only set up for right handed users right now
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        if (-rotation.y > rotateRequiredReload) // Reload
        {
            reload()
        }

        if (-rotation.z > rotateRequiredShoot) // Fire
        {
            fire()
        }
    }
}, 1000 / 60) // FPS

function blank()
{
	ctx.fillStyle = '#ffffff'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function draw()
{
	var click = bearing(zombieLatitude, zombieLongitude)
	var distance = crow(zombieLatitude, zombieLongitude) // Distance in meters from the player to an object
	// console.log(latitude.toFixed(4), longitude.toFixed(4), zombieLatitude.toFixed(4), zombieLongitude.toFixed(4), distance, click)
	console.log(click)

    // Use radians for sin and cos calculation whenever possible
    var x = (canvas.width / 2) + (Math.cos(((click - compass) + 270) * (Math.PI / 180)) * (distance * meterConversion))
    var y = (canvas.height / 2) + (Math.sin(((click - compass) + 270) * (Math.PI / 180)) * (distance * meterConversion))

    // ctx.drawImage(image, x - 62, y - 62) // Draw the image with the anchor point at the center
    polygon(x, y, 10, '#ff0000')
}

function polygon(x, y, size, color)
{
	var numberOfSides = 4
	var size = size
	var Xcenter = x
	var Ycenter = y

	ctx.beginPath()
	ctx.moveTo(Xcenter +  size * Math.cos(0), Ycenter +  size *  Math.sin(0))

	for (var i = 1; i <= numberOfSides; i += 1)
	{
		ctx.lineTo(Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides))
	}

	ctx.closePath()
	ctx.fillStyle = color
	ctx.fill()
}

function crow(lat2, lon2)
{
	var km = 6371
	var distance = Math.acos(Math.sin(latitude) * Math.sin(lat2) + 
                	  Math.cos(latitude) * Math.cos(lat2) *
                	  Math.cos(lon2 - longitude)) * km
	return distance
}

function bearing(latitude2, longitude2)
{
	var lat1 = latitude * (Math.PI / 180)
	var lat2 = latitude2 * (Math.PI / 180)
	var dLon = (longitude2 - longitude) * (Math.PI / 180)

	var y = Math.sin(dLon) * Math.cos(lat2)
	var x = Math.cos(lat1) * Math.sin(lat2) -
			Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
	var brng = Math.atan2(y, x)

	return (brng * (180 / Math.PI) + 360) % 360
}

function fire()
{
	if (canShoot)
    {
    	// Flash the screen
    	ctx.fillStyle = '#ff434b'
    	ctx.fillRect(0, 0, canvas.width, canvas.height)

	    if (magazine > 0)
	    {
	        magazine--
	        sfxShoot.play()
	        canShoot = false

	        setTimeout(function() {
	            canShoot = true
	        }, timeCool)
	    }
	    else
	    {
	        sfxEmpty.play()
	        canShoot = false

	        setTimeout(function() {
	            canShoot = true
	        }, timeCool)
	    }
	}
}

function reload()
{
	if (canShoot)
    {
	    if (magazine < 5)
	    {
	        magazine = 5
	        sfxReload.play()
	        canShoot = false

	        setTimeout(function() {
	            canShoot = true
	        }, timeReload)
	    }
	}
}