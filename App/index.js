/* ------------------------------------------------------------------------------------------------------------------------------------------

// Maybe play a sound when a zombie gets within a certain radius to let the player know that something's coming

------------------------------------------------------------------------------------------------------------------------------------------ */

ejecta.include('functions.js')
ejecta.include('backend.js')
ejecta.include('images.js')
ejecta.include('sounds/sounds.js')

var ctx = canvas.getContext('2d')
var centerX = canvas.width / 2
var centerY = canvas.height / 2

var fps = 60
var debug = false // Can be toggled by tapping the screen in game mode

var currentScreen = 'game'

var grid = new Array() // Keeps track of grid pixel and coordinate positions for use in other functions
var gridWidth = 21 // Make sure the gridsize is always an odd number so there's a tile in the center to start the player in
var gridHeight = gridWidth
var tileSize = 33

var gpsRequiredAccuracy = 1000 // Normally set to 15

var zombies = new Array() // Our local array of zombies
var ammo = new Array() // Locally monitor the objects placed throughout the world
var reeds = new Array() // Keep track of the reeds (plants) in the environment
var vision = new Array() // The things in our field of view
var melee = new Array() // The zombies close enough to be punched

var pixelsToMeters = 10 // ...pixels equals a meter

// var renderDistance = 22 // ...in meters
var maxShotDistance = 15 // ...in meters
var minShotDistance = 3.5 // ...in meters
var damageDistance = 2 // ...in meters
var fieldOfView = 23 // ...in degrees

var totalZombies = 20
var totalAmmo = totalZombies / 3
var totalReeds = totalZombies * 3

var zombieMinHealth = 2
var zombieMaxHealth = 3
var zombieSpeedLow = 0.2 // ...meters per second
var zombieSpeedHigh = 0.6 // ...meters per second

var slowestAnimation = 800 // The longest time possible between animation frames

// How much ammo can be in a pack
var ammoCountLow = 1
var ammoCountHigh = 3

// How much motion is required for certain actions
var rotateRequiredShoot = 400
var rotateRequiredReload = 500 // Set higher than needed to prevent accidental reloading
var accelRequiredMelee = 50

// Keep the sound effects in line by setting their "length"
var canShoot = true
var canShootServer = true
var timeFire = 300
var timeReload = 1100 // canShoot manages timeReload
var timeCock = 450
var canMelee = true
var timeMelee = 350

var meleeDamage = 10

// General player variables
var playerMaxHealth = 5
var health = playerMaxHealth
var canBeHurt = true
var timeHurt = 1000 // The amount of time between each damage "tick" when a zombie is close
var capacity = 6 // Since we have a revolver right now
var magazine = random(0, capacity - 4)
var extraAmmo = random(0, 2)
var shotDamage = 3 // How much damage a bullet deals (change this later to be more dynamic)

// Color scheme
var white = '#FFFFFF'
var green = '#3D9970'
var black = '#3D9970'
var blue = '#7FDBFF'
var red = '#FF4136'

// UI values
var canvasColor = black
var flashColor = red
var debugColor = blue

// Remove once I pixel out indicator images
var indicatorWidth = 15
var indicatorHeight = 7
var indicatorSpacing = 5

// Remove when I move the menu to just images
var menuSize = canvas.width / 4.5
var menuSpacing = 3.5

var menuTotalZombies = 50
var menuZombieSandbox = 25 // The amount of pixels outside the screen that the menu zombies are allowed to go to as a destination

var xStats = centerX - menuSize / 2 - menuSpacing
var yStats = centerY - menuSize / 2 - menuSpacing - menuSize - menuSpacing * 2
var xSingle = centerX + menuSize / 2 + menuSpacing
var ySingle = centerY - menuSize / 2 - menuSpacing
var xMulti = centerX - menuSize / 2 - menuSpacing
var yMulti = centerY + menuSize / 2 + menuSpacing
var xSettings = centerX + menuSize / 2 + menuSpacing
var ySettings = centerY + menuSize / 2 + menuSpacing + menuSize + menuSpacing * 2

/*
document.addEventListener('pagehide', function() // Close the connection to the server upon leaving the app
{
	socket.close()
})

document.addEventListener('pageshow', function() // Reconnect to the server upon resuming the app
{
	zombies.length = 0 // Wipe the zombie database and don't reopen the connection
})
*/

document.addEventListener('touchstart', function(ev) // Monitor touches throughout the game
{
	var x = ev.touches[0].pageX
	var y = ev.touches[0].pageY

	if (currentScreen == 'menu')
	{
		if (Math.abs(xSingle - x) * Math.abs(xSingle - x) + Math.abs(ySingle - y) * Math.abs(ySingle - y) < menuSize * menuSize)
		{
			musMenu.pause() // Kill the menu music before moving into the game screen
			zombies.length = 0 // Wipe the zombie database so we can start playing with "real" zombies
			currentScreen = 'game'
		}
	}
	else if (currentScreen == 'game')
	{
		debug = !debug // Toggle debug mode for framerate increase
	}
	else if (currentScreen == 'gameover')
	{
		zombies.length = 0 // Wipe the zombie database so we can start playing with "real" zombies
		ammo.length = 0 // Kill the ammo packs
		currentScreen = 'game'
	}
})

setInterval(function() // Main game loop
{
	if (currentScreen == 'menu')
	{
		if (zombies.length == 0) // If there are no zombies, then this is the first time through the menu code
		{
			musMenu.play()

			for (var i = 0; i < menuTotalZombies; i++)
			{
				var thingy = new Object()
					thingy.x = random(0, canvas.width)
					thingy.y = random(0, canvas.height)
					thingy.xDestination = random(0 - menuZombieSandbox, canvas.width + menuZombieSandbox)
					thingy.yDestination = random(0 - menuZombieSandbox, canvas.height + menuZombieSandbox)
					thingy.speed = random(zombieSpeedLow, zombieSpeedHigh) * (pixelsToMeters / fps)
					thingy.frame = random(0, 1)
					thingy.animate = animate(thingy, slowestAnimation - thingy.speed * (slowestAnimation / 2))
				zombies.push(thingy)
			}
		}
		
		for (var i = 0; i < zombies.length; i++)
		{
			if (Math.floor(zombies[i].x) == Math.floor(zombies[i].xDestination) && Math.floor(zombies[i].x) == Math.floor(zombies[i].xDestination)) // Pick a new destination once we arrive
			{
				zombies[i].xDestination = random(0 - menuZombieSandbox, canvas.width + menuZombieSandbox)
				zombies[i].yDestination = random(0 - menuZombieSandbox, canvas.height + menuZombieSandbox)
			}
		}

		drawMenu()
	}
	else if (currentScreen == 'game')
	{
		if (gps.latitude && gps.longitude && gps.accuracy < gpsRequiredAccuracy) // Only do stuff if we know where we are
		{
			// ******************************
			// Run calculations
			// ******************************

			// Clear the various arrays on each pass so we get fresh results
			melee.length = 0
			vision.length = 0

			if (reeds.length == 0) // Spawn reeds if we have none currently
			{
				for (var i = 0; i < totalReeds; i++)
				{
					var thingy = new Object()
						thingy.column = Math.floor(random(1, gridWidth))
						thingy.row = Math.floor(random(1, gridHeight))
					reeds.push(thingy)
				}
			}

			if (zombies.length == 0) // Spawn zombies if we have none currently
			{
				for (var i = 0; i < totalZombies; i++)
				{
					var thingy = new Object()
						thingy.name = 'zombie' + i
						thingy.column = Math.floor(random(1, gridWidth))
						thingy.row = Math.floor(random(1, gridHeight))
						thingy.health = random(zombieMinHealth, zombieMaxHealth)
						thingy.speed = random(zombieSpeedLow, zombieSpeedHigh) * (pixelsToMeters / fps)
						thingy.frame = random(0, 1)
						thingy.animate = animate(thingy, slowestAnimation - thingy.speed * (slowestAnimation / 2))
					zombies.push(thingy)
				}
			}
			else if (zombies.length > 0)
			{
				for (var i = 0; i < zombies.length; i++) // Do stuff with the zombies
			    {
			    	// zombies[i].bearing = bearing(zombies[i].latitude, zombies[i].longitude)
					// zombies[i].distance = distance(zombies[i].latitude, zombies[i].longitude)

					/*
			    	if (zombies[i].distance < renderDistance && zombies[i].distance > (damageDistance / 2) && zombies[i].health > 0) // Move zombies closer
			    	{
			    		var ratio = zombies[i].speed / 10 / distance(zombies[i].latitude, zombies[i].longitude) // We have to change the meters-per-second speed to a decimal that can work with latitude/longitude coordinates

						zombies[i].latitude = zombies[i].latitude + ((gps.latitude - zombies[i].latitude) * ratio)
						zombies[i].longitude = zombies[i].longitude + ((gps.longitude - zombies[i].longitude) * ratio)
			    	}
			    	*/

			    	if (zombies[i].distance < minShotDistance && zombies[i].health > 0)
			    	{
			    		melee.push(zombies[i])
			    	}

			        if ((compass - fieldOfView) < zombies[i].bearing && zombies[i].bearing < (compass + fieldOfView))
			        {
			            if (zombies[i].distance > minShotDistance && zombies[i].distance < maxShotDistance && zombies[i].health > 0)
			            {
			            	vision.push(zombies[i])
				            // sfxSweep.play()
			            }
			        }
			    }
			}

			if (ammo.length == 0) // Make ammo packs if we have none
			{
				// findSpawnRadius()

				for (var i = 0; i < totalAmmo; i++)
				{
					var thingy = new Object()
						thingy.column = Math.floor(random(1, gridWidth))
						thingy.row = Math.floor(random(1, gridHeight))
						// thingy.latitude = random(gps.latitude - spawnSeedLatitude, gps.latitude + spawnSeedLatitude)
						// thingy.longitude = random(gps.longitude - spawnSeedLongitude, gps.longitude + spawnSeedLongitude)
						thingy.count = random(ammoCountLow, ammoCountHigh)
					ammo.push(thingy)
				}
			}
			else if (ammo.length > 0)
			{
			    for (var i = 1; i < ammo.length; i++) // Do stuff with the ammo packs
			    {
			    	// ammo[i].bearing = bearing(ammo[i].latitude, ammo[i].longitude)
					// ammo[i].distance = distance(ammo[i].latitude, ammo[i].longitude)
			    }
			}

		    // ******************************
			// If things are in range
			// ******************************

		    if (melee.length > 0) // If there's at least one zombie in melee range
		    {
				melee.sort(function(a, b) // Sort the vision array to find the zombie that's closest to us
				{
					return a.distance - b.distance
				})
		    }

		    if (vision.length > 0) // If we're looking at at least one zombie...
		    {
				vision.sort(function(a, b) // Sort the vision array to find the zombie that's closest to us
				{
					return a.distance - b.distance
				})
		    }

		    for (var i = 1; i < zombies.length; i++) // Get hurt by a zombie
			{
				if (zombies[i].distance < damageDistance && zombies[i].health > 0 && health > 0 && canBeHurt)
				{
					health -= 1

					if (health > 0)
					{
						sfxHurt.play()
					}
					else
					{
						sfxFlatline.play()
						currentScreen = 'gameover'
					}

					canBeHurt = false

					setTimeout(function()
					{
						canBeHurt = true
					}, timeHurt)
				}	
			}

			for (var i = 1; i < ammo.length; i++) // Pick up some ammo
			{
				if (ammo[i].distance < minShotDistance && ammo[i].count > 0)
				{
					extraAmmo += ammo[i].count
					ammo[i].count = 0
					sfxReload.play() // Change this later
				}
			}

			// ******************************
			// Attack motions
			// ******************************

		    if (acceleration.total > accelRequiredMelee) // Melee attack!
			{
				if (canMelee)
				{
					punch()
				}
			}

		    if (((90 - 25) < Math.abs(tilt.y)) && (Math.abs(tilt.y) < (90 + 25))) // Watch for gun orientation
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

		    // ******************************
			// Draw
			// ******************************

		    drawGame()
		}
		else if (gps.accuracy > 0)
		{
			blank(red)
			text('Waiting for GPS lock', 3, 3, white)
			text('Are you outside?', 3, 13, white)
			text('Can you see the sky?', 3, 23, white)
		}
		else if (gps.accuracy > 15)
		{
			blank(red)
			text('Current GPS accuracy of ' + gps.accuracy + ' meters is not accurate enough', 3, 3, white)
			text('Are you outside?', 3, 13, white)
			text('Can you see the sky?', 3, 23, white)
		}
	}
	else if (currentScreen == 'gameover')
	{
		blank(red)
		text('GAMEOVER', 3, 3, white)
		text('Tap to play again', 3, 13, white)
	}
}, 1000 / fps)