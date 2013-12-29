var debug = true

ejecta.include('backend.js') // This gives us access to readable sensor variables
ejecta.include('sounds/sounds.js')

var ctx = canvas.getContext('2d')
var socket = new WebSocket('ws://www.jessemillar.com:8787') // The global variable we'll use to keep track of the server

var self = new Object() // The object we push to the server with data about the player/client

var enemies = new Array() // Our array of zombies
var objects = new Array() // Monitor the objects placed throughout the world
var players = new Array() // Keep track of the players "logged in" and their coordinates

var vision = new Array() // The things in our field of view

var renderDistance = 15 // Distance in "meters"
var maxShotDistance = 10 // Distance in "meters"
var minShotDistance = 2 // Distance in "meters"
var fieldOfView = 24 // In degrees
var metersToPixels = 20 // ...pixels equals ~0.65 meters

// How much motion is required for certain actions
var rotateRequiredShoot = 400
var rotateRequiredReload = 500 // Set higher than needed to prevent accidental reloading

// Keep the sound effects in line by setting their "length"
var canShoot = true
var canShootServer = true
var timeShoot = 200
var timeReload = 300 // canShoot manages timeReload
var canScan = true
var timeScan = 1000 // Set higher than needed for safety

// General gun variables
var capacity = 8
var magazine = capacity
var shotDamage = 50 // How much damage a bullet deals (change this later to be more dynamic)

// UI values
var canvasColor = '#2a303a'
var flashColor = '#ffffff'
var debugColor = '#61737e'
var enemyColor = '#ff0000'
var deadColor = '#61737e'
var playerColor = '#ffffff'
var sweepColor = '#ffffff'
var sweepHeight = 4 // ...in pixels
var playerSize = 15
var enemySize = 10

// Radar sweep variables
var sweepTick = 0
var sweepSpeed = 20 // Lower values result in a faster sweep

document.addEventListener('pagehide', function() // Close the connection to the server upon leaving the app
{
	socket.close()
})

document.addEventListener('pageshow', function() // Reconnect to the server upon resuming the app
{
	enemies.length = 1 // Wipe the zombie database and don't reopen the connection
})

socket.addEventListener('message', function(message) // Keep track of messages coming from the server
{
	enemies = JSON.parse(message.data) // Right now, the only messages coming refer to zombies
})

function init() // Run once by the GPS function once we have a lock
{
	self._type = 'player' // Set the message type so the server knows what to do
	self.id = Math.floor(Math.random() * 90000000000000) + 10000000000000 // Generate a fifteen-digit-long ID for this user
	self.latitude = gps.latitude
	self.longitude = gps.longitude

	socket.send(JSON.stringify(self)) // Tell the server where the player is
}

setInterval(function() // Server update loop
{
	socket.send(JSON.stringify(self)) // Tell the server on a regular basis where the player is	
}, 2000) // Update once every two seconds

setInterval(function() // Main game loop
{
	vision.length = 0 // Clear the field of view array on each pass so we get fresh results

    for (var i = 0; i < enemies.length; i++) // Do stuff with the zombies
    {
    	if (enemies[i].distance < renderDistance)
    	{
    		enemies[i].bearing = bearing(enemies[i].latitude, enemies[i].longitude)
			enemies[i].distance = distance(enemies[i].latitude, enemies[i].longitude)
    	}

        if ((compass - fieldOfView) < enemies[i].bearing && enemies[i].bearing < (compass + fieldOfView))
        {
            if (enemies[i].distance > minShotDistance && enemies[i].distance < maxShotDistance && enemies[i].health > 0)
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
			console.log(vision[0].name, vision[0].distance, vision[0].health)
		}
    }

    blank(canvasColor) // Place draw calls after this

    if (debug) // Draw the aiming cone for debugging purposes
    {
    	line((canvas.width / 2) - (canvas.height / 2 * Math.tan(fieldOfView.toRad())), 0, canvas.width / 2, canvas.height / 2, debugColor)
    	line(canvas.width / 2, canvas.height / 2, (canvas.width / 2) + (canvas.height / 2 * Math.tan(fieldOfView.toRad())), 0, debugColor)
		circle(canvas.width / 2, canvas.height / 2, maxShotDistance * metersToPixels, debugColor)
		circle(canvas.width / 2, canvas.height / 2, minShotDistance * metersToPixels, debugColor)
    }

	drawEnemies() // Duh
	polygon(canvas.width / 2, canvas.height / 2, playerSize, playerColor) // Draw the player

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
            fire() // Fire regardless of whether we're looking at a zombie
            if (vision.length > 0) // If we're looking at at least one zombie...
			{
				shootZombie(vision[0].name, shotDamage) // Shoot the closest zombie
			}
        }
    }

    sweep() // Put this last so it draws on top of everything
}, 1000 / 60) // FPS

function reload()
{
	if (canShoot) // Prevent reloading during the playback of sound effects
    {
	    if (magazine < capacity) // Don't reload if we already have a full magazine
	    {
	        magazine = capacity // Fill the magazine to capacity
	        sfxReload.play()
	        canShoot = false

	        setTimeout(function()
	        {
	            canShoot = true
	        }, timeReload)
	    }
	}
}

function fire()
{
	if (canShoot)
    {
	    if (magazine > 0) // Don't fire if we don't have ammo
	    {
	    	blank(flashColor) // Flash the screen
	        magazine-- // Remove a bullet
	        sfxFire.play()
	        canShoot = false

	        setTimeout(function()
	        {
	            canShoot = true
	        }, timeShoot)
	    }
	    else
	    {
	        sfxEmpty.play()
	        canShoot = false

	        setTimeout(function()
	        {
	            canShoot = true
	        }, timeShoot)
	    }
	}
}

function shootZombie(zombieName, damageAmount)
{
	if (canShootServer)
	{
		if (magazine > 0) // Don't fire if we don't have ammo
	    {
			var shot = new Object()
				shot._type = 'damage' // Set the message type
				shot.name = zombieName // Tell the server the name of the zombie and it'll find it's location in the array and do the rest
				shot.damage = damageAmount

			socket.send(JSON.stringify(shot))

		    setTimeout(function() // Add a timeout so the zombie doesn't groan instantly
		    {
		    	sfxGroan.play()
		    }, 200)

		    canShootServer = false

	        setTimeout(function()
	        {
	            canShootServer = true
	        }, timeShoot)
	    }
	}
}

function blank(color)
{
	ctx.fillStyle = color
	ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawEnemies()
{
	for (var i = 0; i < enemies.length; i++)
    {
    	if (enemies[i].distance < renderDistance) // This is the bit that helps with framerate
    	{
		    var x = (canvas.width / 2) + (Math.cos(((enemies[i].bearing - compass) + 270).toRad()) * (enemies[i].distance * metersToPixels))
		    var y = (canvas.height / 2) + (Math.sin(((enemies[i].bearing - compass) + 270).toRad()) * (enemies[i].distance * metersToPixels))

		    if (debug) // Write the zombie's name next to its marker if we're in debug mode
		    {
		    	ctx.fillStyle = debugColor;
	    		ctx.fillText(enemies[i].name, x + enemySize + 3, y)
		    }

		    if (enemies[i].health > 0)
		    {
		    	polygon(x, y, enemySize, enemyColor) // Draw the sucker
		    }
		    else
		    {
		    	polygon(x, y, enemySize, deadColor) // He's dead, Jim
		    }
		}
	}
}

function sweep()
{
	square(0, Math.sin(sweepTick / sweepSpeed) * canvas.height / 2 + canvas.height / 2 - sweepHeight / 2, canvas.width, sweepHeight, sweepColor) // Draw the sweep
	sweepTick++ // Increase the seed we use to run the sin function and make the sweep animate smoothly

	if (Math.sin(Math.sin(sweepTick / sweepSpeed)) < -0.8) // Beep only at the top of the screen
	{
		if (canScan) // Don't play the beep more than once
		{
			sfxBeep.play()
			canScan = false

			setTimeout(function()
			{
				canScan = true
			}, timeScan)
		}
	}
}