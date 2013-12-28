var debug = false

ejecta.include('backend.js') // This gives us access to readable sensor variables

ejecta.include('sounds/sounds.js')

var ctx = canvas.getContext('2d')

var socket = new WebSocket('ws://www.jessemillar.com:8787') // Connect to the server

var enemies = new Array() // Our array of zombies
var serverEnemies = new Array() // The zombie array we "download" from the server
var objects = new Array() // Monitor the objects placed throughout the world
var players = new Array() // Keep track of the players "logged in" and their coordinates
var self = new Object()

var vision = new Array() // The things in our field of view

// Add 0.001 to a GPS decimal to get ~6 meters
var metersToPixels = 25 // ...pixels equals ~0.65 meters

// How much motion is required for certain actions
var rotateRequiredShoot = 400
var rotateRequiredReload = 450 // Set higher than needed to prevent accidental reloading

// These variables help the weapons feel more "realistic" and keep the sound effects in line by setting the "length" of sound effects
var canShoot = true
var timeCool = 200
var capacity = 8
var magazine = capacity
var timeReload = 300

var maxShotDistance = 10
var minShotDistance = 2
var fieldOfView = 22

var canvasColor = '#2a303a'

var sweepColor = '#ffffff'
var sweepTick = 0
var sweepHeight = 4
var sweepSpeed = 20 // Lower values result in a faster sweep
var canScan = true // For the sound
var timeScan = 500 // Also for the sound

function world() // Run once by the GPS function once we have a lock
{
	self.id = Math.floor(Math.random() * 90000) + 10000 // Generate a five-digit-long id for this user
	self.latitude = gps.latitude
	self.longitude = gps.longitude

	socket.addEventListener('message', function(message)
	{
		serverEnemies = JSON.parse(message.data)
	})
}

setInterval(function() // Server update loop and zombie calculation loop for higher FPS
{
	socket.send(JSON.stringify(self)) // Tell the server where the player is

	enemies = serverEnemies
	for (var i = 0; i < serverEnemies.length; i++) // Set and store the relative bearing and distance for all the enemies in the world
	{
		enemies[i].bearing = bearing(enemies[i].latitude, enemies[i].longitude)
		enemies[i].distance = distance(enemies[i].latitude, enemies[i].longitude)
	}
}, 1000) // Update once every second

setInterval(function() // Main game loop
{
	vision.length = 0 // Clear the field of view array on each pass so we get fresh results

    for (var i = 0; i < enemies.length; i++) // Beep if we're "looking" at a zombie
    {
        if ((compass - fieldOfView) < enemies[i].bearing && enemies[i].bearing < (compass + fieldOfView))
        {
            if (enemies[i].distance > minShotDistance && enemies[i].distance < maxShotDistance)
            {
            	vision.push(enemies[i])
	            // sfxBeep.play()
            }
        }
    }

    if (vision.length > 0) // If we're looking at at least one zombie...
    {
		vision.sort(function(a, b) // Sort the vision array to find the zombie that's closest to us
		{
			return a.distance - b.distance
		})

		if (debug)
		{
			// console.log(vision[0].name, vision[0].distance, vision[0].health)
		}
    }

    // enemies are drawn in a stack.  Things drawn last effectively have a greater z-index and appear on top.
    blank() // Place draw calls after this

    // Draw the aiming cone for debugging purposes
    if (debug)
    {
    	line((canvas.width / 2) - (canvas.height / 2 * Math.tan(fieldOfView.toRad())), 0, canvas.width / 2, canvas.height / 2, '#4c4c4c')
    	line(canvas.width / 2, canvas.height / 2, (canvas.width / 2) + (canvas.height / 2 * Math.tan(fieldOfView.toRad())), 0, '#4c4c4c')
		circle(canvas.width / 2, canvas.height / 2, maxShotDistance * metersToPixels, '#4c4c4c')
		circle(canvas.width / 2, canvas.height / 2, minShotDistance * metersToPixels, '#4c4c4c')
    }

	polygon(canvas.width / 2, canvas.height / 2, 10, '#ffffff') // Draw the player

	drawEnemies()

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
            if (vision.length > 0) // If we're looking at at least one zombie...
			{
				shootZombie(vision[0].name, 50)
			}
        }
    }

    sweep()
}, 1000 / 60) // FPS

function blank()
{
	ctx.fillStyle = canvasColor
	ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawEnemies()
{
	// console.log(JSON.stringify(enemies))

	for (var i = 0; i < enemies.length; i++)
    {
	    var x = (canvas.width / 2) + (Math.cos(((enemies[i].bearing - compass) + 270).toRad()) * (enemies[i].distance * metersToPixels))
	    var y = (canvas.height / 2) + (Math.sin(((enemies[i].bearing - compass) + 270).toRad()) * (enemies[i].distance * metersToPixels))

	    if (debug)
	    {
	    	ctx.fillStyle = '#ffffff';
    		ctx.fillText(enemies[i].name, x + 9, y + 2)
	    }

	    polygon(x, y, 6, '#ff0000')
	}
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

function shootZombie(zombieName, damage)
{
	var zombie = find(zombieName)
    setTimeout(function() // Add a timeout so the zombie doesn't scream instantly
    {
        enemies[zombie].health -= damage
        
        if (enemies[zombie].health > 0)
        {
            sfxGroan.play()
        }
        else
        {
            // Kill the zombie if it's health is low enough
            sfxImpact.play()
            // Remove the dead zombie from the database
            enemies.splice(zombie, 1)
        }
    }, 200)
}

function sweep()
{
	ctx.fillStyle = sweepColor
	ctx.fillRect(0, Math.sin(sweepTick / sweepSpeed) * canvas.height / 2 + canvas.height / 2 - sweepHeight / 2, canvas.width, sweepHeight) // Animate the sweep
	sweepTick++

	if (Math.sin(sweepTick / sweepSpeed) > 0.999 || Math.sin(sweepTick / sweepSpeed) < -0.999)
	{
		if (canScan)
		{
			sfxBeep.play()
			canScan = false

			setTimeout(function() {
				canScan = true
			}, timeScan)
		}
	}
}