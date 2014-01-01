var canvas = document.getElementById('canvas')
	canvas.MSAAEnabled = true
	canvas.MSAASamples = 2

var ctx = canvas.getContext('2d')
var socket = new WebSocket('ws://www.jessemillar.com:8787') // The global variable we'll use to keep track of the server

ejecta.include('backend.js')
ejecta.include('sounds/sounds.js')

var debug = true // Can be toggled by tapping the screen

var gameScreen = 'menu'

var self = new Array() // The array we push to the server with data about the player/client
	self[0] = 'player'

var data = new Array() // The array we'll use to parse the JSON the server will send to us

var enemies = new Array() // Our array of zombies
var objects = new Array() // Monitor the objects placed throughout the world
var players = new Array() // Keep track of connected players and their coordinates

var proximity = new Array() // The zombies close enough to see us
	proximity[0] = 'proximity'
var vision = new Array() // The things in our field of view

var renderDistance = 15 // Distance in "meters"
var maxShotDistance = 5 // Distance in "meters"
var minShotDistance = 2 // Distance in "meters"
var damageDistance = 1 // Distance in "meters"
var fieldOfView = 22 // In degrees
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
var shotDamage = 2 // How much damage a bullet deals (change this later to be more dynamic)

var playerMaxHealth = 5

// UI values
var xCenter = canvas.width / 2
var yCenter = canvas.height / 2
var iosRadius = 9
var canvasColor = '#33322d'
var flashColor = '#fff8e3'
var debugColor = '#61737e'
var enemyColor = '#db4105'
var deadColor = '#61737e'
var playerColor = '#fff8e3'
var sweepColor = '#fff8e3'
var sweepHeight = 4 // ...in pixels
var ammoColor = '#fff8e3'
var healthColor = '#9fb4cc'
var indicatorWidth = 15
var indicatorHeight = 7
var indicatorSpacing = 5
var playerSize = 15
var otherPlayerSize = 15
var enemySize = 15

// Radar sweep variables
var sweepTick = 0
var sweepSpeed = 20 // Lower values result in a faster sweep

document.addEventListener('pagehide', function() // Close the connection to the server upon leaving the app
{
	socket.close()
})

document.addEventListener('pageshow', function() // Reconnect to the server upon resuming the app
{
	enemies.length = 0 // Wipe the zombie database and don't reopen the connection
})

document.addEventListener('touchstart', function(ev) // Monitor touches
{
	debug = !debug // Toggle debug mode for framerate increase
})

socket.addEventListener('message', function(message) // Keep track of messages coming from the server
{
	data = JSON.parse(message.data)

	if (data[0] == 'enemies')
	{
		enemies = data
	}
	else if (data[0] == 'players')
	{
		players = data
	}
})

function init() // Run once by the GPS function when we have a location lock
{
	self[1] = new Object()

	if (localStorage.getItem('id'))
	{
		self[1].id = localStorage.getItem('id') // Reload the previous player ID if there is one
	}
	else
	{
		self[1].id = Math.floor(Math.random() * 90000000000000) + 10000000000000 // Generate a fifteen-digit-long ID for this user
		localStorage.setItem('id', self[1].id)
	}

	self[1].latitude = gps.latitude
	self[1].longitude = gps.longitude
	self[1].health = playerMaxHealth

	// socket.send(JSON.stringify(self)) // Tell the server where the player is
}

setInterval(function() // Server update loop
{
	if (gameScreen == 'game')
	{
		enemyAttack() // Potentially hurt the player if a zombie is close enough
		socket.send(JSON.stringify(self)) // Tell the server on a regular basis where the player is	
		if (proximity.length > 1)
		{
			socket.send(JSON.stringify(proximity)) // Tell the server which zombies are close to us
		}
	}
}, 2000) // Update once every two seconds

setInterval(function() // Main game loop
{
	if (gameScreen == 'menu')
	{
		blank(canvasColor)
		polygon(xCenter, yCenter, enemySize, enemyColor, 0.3)
		rounded(15, 15, canvas.width - 30, 70, iosRadius, sweepColor)
	}
	else if (gameScreen == 'game')
	{
		proximity.length = 1 // Wipe the proximity array so we can send fresh data
		vision.length = 0 // Clear the field of view array on each pass so we get fresh results

	    for (var i = 1; i < enemies.length; i++) // Do stuff with the zombies
	    {
	    	if (enemies[i].distance < renderDistance)
	    	{
	    		enemies[i].bearing = bearing(enemies[i].latitude, enemies[i].longitude)
				enemies[i].distance = distance(enemies[i].latitude, enemies[i].longitude)
	    	}

	    	if (enemies[i].distance < renderDistance)
	    	{
	    		enemies[i].target = localStorage.getItem('id') // Add the user's ID so the server knows which player to move the zombies toward
	    		proximity.push(enemies[i])
	    	}

	        if ((compass - fieldOfView) < enemies[i].bearing && enemies[i].bearing < (compass + fieldOfView))
	        {
	            if (enemies[i].distance > minShotDistance && enemies[i].distance < maxShotDistance && enemies[i].health > 0)
	            {
	            	vision.push(enemies[i])
		            // sfxSweep.play()
	            }
	        }
	    }

	    for (var i = 1; i < players.length; i++) // Do stuff with the players
	    {
	    	if (players[i].distance < renderDistance)
	    	{
	    		players[i].bearing = bearing(players[i].latitude, players[i].longitude)
				players[i].distance = distance(players[i].latitude, players[i].longitude)
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
				console.log(gps.latitude, gps.longitude, vision[0].name, vision[0].latitude, vision[0].longitude, vision[0].distance, vision[0].health)
			}
	    }

	    blank(canvasColor) // Place draw calls after this

	    if (debug) // Draw the aiming cone for debugging purposes
	    {
	    	line((xCenter) - (yCenter * Math.tan(fieldOfView.toRad())), 0, xCenter, yCenter, debugColor)
	    	line(xCenter, yCenter, (xCenter) + (yCenter * Math.tan(fieldOfView.toRad())), 0, debugColor)
			circle(xCenter, yCenter, maxShotDistance * metersToPixels, debugColor)
			circle(xCenter, yCenter, minShotDistance * metersToPixels, debugColor)
			circle(xCenter, yCenter, damageDistance * metersToPixels, debugColor)
	    }

	    polygon(xCenter, yCenter, playerSize, playerColor) // Draw the player
		drawEnemies() // Duh
		drawPlayers() // Draw the other players

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

	    drawHealth() // Give a visual on current health level
	    drawAmmo() // Give us a visual on how much ammo we have left
	    sweep() // Put this last so it draws on top of everything
	}
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
			var shot = new Array()
				shot[0] = 'damage'
				shot[1] = new Object()
				shot[1].name = zombieName // Tell the server the name of the zombie and it'll find it's location in the array and do the rest
				shot[1].damage = damageAmount

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

function enemyAttack()
{
	for (var i = 1; i < enemies.length; i++)
	{
		if (enemies[i].distance < damageDistance && self[1].health > 0)
		{
			self[1].health -= 1
			if (self[1].health > 0)
			{
				sfxHurt.play()
			}
			else
			{
				sfxFlatline.play()
			}
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
	for (var i = 1; i < enemies.length; i++)
    {
    	if (enemies[i].distance < renderDistance) // This is the bit that helps with framerate
    	{
		    var x = (xCenter) + (Math.cos(((enemies[i].bearing - compass) + 270).toRad()) * (enemies[i].distance * metersToPixels))
		    var y = (yCenter) + (Math.sin(((enemies[i].bearing - compass) + 270).toRad()) * (enemies[i].distance * metersToPixels))

		    if (debug) // Write the zombie's name next to its marker if we're in debug mode
		    {
		    	ctx.fillStyle = debugColor;
	    		ctx.fillText(enemies[i].name, x + enemySize + 3, y)
		    }

		    if (enemies[i].health > 0)
		    {
		    	polygon(x, y, enemySize, enemyColor) // Draw the sucker normally
		    }
		    else
		    {
		    	polygon(x, y, enemySize, deadColor) // He's dead, Jim
		    }
		}
	}
}

function drawPlayers()
{
	for (var i = 1; i < players.length; i++)
    {
    	if (players[i].distance < renderDistance && players[i].id !== localStorage.getItem('id')) // This is the bit that helps with framerate
    	{
		    var x = (xCenter) + (Math.cos(((players[i].bearing - compass) + 270).toRad()) * (players[i].distance * metersToPixels))
		    var y = (yCenter) + (Math.sin(((players[i].bearing - compass) + 270).toRad()) * (players[i].distance * metersToPixels))

		    polygon(x, y, otherPlayerSize, playerColor) // Draw the player in question
		}
	}
}

function drawHealth()
{
	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Things are only set up for right handed users right now
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

	for (var i = 0; i < self[1].health; i++)
	{
		rectangle(canvas.width - indicatorSpacing - indicatorWidth, indicatorSpacing + (indicatorHeight + indicatorSpacing) * i, indicatorWidth, indicatorHeight, healthColor)
	}
}

function drawAmmo()
{
	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Things are only set up for right handed users right now
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

	for (var i = 0; i < magazine + 1; i++)
	{
		rectangle(canvas.width - indicatorSpacing - indicatorWidth, canvas.height - (indicatorHeight + indicatorSpacing) * i, indicatorWidth, indicatorHeight, ammoColor)
	}
}

function sweep()
{
	rectangle(0, Math.sin(sweepTick / sweepSpeed) * yCenter + yCenter - sweepHeight / 2, canvas.width, sweepHeight, sweepColor) // Draw the sweep
	sweepTick++ // Increase the seed we use to run the sin function and make the sweep animate smoothly

	if (Math.sin(Math.sin(sweepTick / sweepSpeed)) < -0.8) // Beep only at the top of the screen
	{
		if (canScan) // Don't play the beep more than once
		{
			sfxSweep.play()
			canScan = false

			setTimeout(function()
			{
				canScan = true
			}, timeScan)
		}
	}
}