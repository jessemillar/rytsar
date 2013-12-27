// This gives us access to readable sensor variables
ejecta.include('backend.js')

ejecta.include('sounds/sounds.js')

var ctx = canvas.getContext('2d')

// Add 0.001 to a GPS decimal to get ~6 meters
var meterConversion = 100 // ...pixels equals ~0.65 meters

// How much motion is required for certain actions
var rotateRequiredShoot = 425
var rotateRequiredReload = 500 // Set higher than needed to prevent accidental reloading

// These variables help the weapons feel more "realistic" and keep the sound effects in line by setting the "length" of sound effects
var canShoot = true
var timeCool = 200
var capacity = 8
var magazine = capacity
var timeReload = 300

var zombieLatitude
var zombieLongitude

function world() // Run once by the GPS function once we have a lock
{
	zombieLatitude = gps.latitude + 0.0001
	zombieLongitude = gps.longitude + 0.0001
}

setInterval(function() // Main game loop
{
	ctx.fillStyle = '#2b2e26'
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	polygon(canvas.width / 2, canvas.height / 2, 10, '#ffffff') // Draw the player

	var click = bearing(zombieLatitude, zombieLongitude)
	var distance = crow(zombieLatitude, zombieLongitude) // Distance in meters from the player to an object

    // Use radians for sin and cos calculation whenever possible
    var x = (canvas.width / 2) + (Math.cos(((click - compass) + 270) * (Math.PI / 180)) * (distance * meterConversion))
    var y = (canvas.height / 2) + (Math.sin(((click - compass) + 270) * (Math.PI / 180)) * (distance * meterConversion))

    polygon(x, y, 6, '#ff0000')

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
	        sfxFire.play()
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
	    if (magazine < capacity)
	    {
	        magazine = capacity
	        sfxReload.play()
	        canShoot = false

	        setTimeout(function() {
	            canShoot = true
	        }, timeReload)
	    }
	}
}