/*

NOTES
-----------------------

Maybe play a sound when a zombie gets within a certain radius to let the player know that something's coming

*/

ejecta.include('functions.js')
ejecta.include('backend.js')
ejecta.include('images/images.js')
ejecta.include('sounds/sounds.js')

var ctx = canvas.getContext('2d')
var centerX = canvas.width / 2
var centerY = canvas.height / 2

var fps = 60
var debug = true // Can be toggled by tapping the screen in game mode

var currentScreen = 'menu'

var zombies = new Array() // Our local array of zombies
var ammo = new Array() // Locally monitor the objects placed throughout the world
var vision = new Array() // The things in our field of view
var melee = new Array() // The zombies close enough to be punched

var pixelsToMeters = 10 // ...pixels equals a meter

var spawnRadius = 100 // ...meters
var spawnSeedLatitude = 0 // Set later by findSpawnRadius()
var spawnSeedLongitude = 0 // Set later by findSpawnRadius()

var renderDistance = 20 // ...in meters
var maxShotDistance = 15 // ...in meters
var minShotDistance = 3.5 // ...in meters
var damageDistance = 2 // ...in meters
var fieldOfView = 23 // ...in degrees

var totalZombies = 100
var totalAmmo = 50

var zombieMinHealth = 2
var zombieMaxHealth = 5
var zombieSpeedLow = 0.2 // ...meters per second
var zombieSpeedHigh = 1 // ...meters per second

var slowestAnimation = 900 // The longest time possible between animation frames

// How much ammo can be in a pack
var ammoCountLow = 1
var ammoCountHigh = 4

// How much motion is required for certain actions
var rotateRequiredShoot = 400
var rotateRequiredReload = 500 // Set higher than needed to prevent accidental reloading
var accelRequiredMelee = 35

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
var magazine = random(0, capacity - 3)
var extraAmmo = random(0, 3)
var shotDamage = 2 // How much damage a bullet deals (change this later to be more dynamic)

// Color scheme
var white = '#fff8e3'
var green = '#cccc9f'
var black = '#33322d'
var blue = '#9fb4cc'
var red = '#db4105'

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
var xPrefs = centerX + menuSize / 2 + menuSpacing
var yPrefs = centerY + menuSize / 2 + menuSpacing + menuSize + menuSpacing * 2

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

	if (currentScreen == 'game')
	{
		debug = !debug // Toggle debug mode for framerate increase
	}
	else if (currentScreen == 'menu')
	{
		if (Math.abs(xMulti - x) * Math.abs(xMulti - x) + Math.abs(yMulti - y) * Math.abs(yMulti - y) < menuSize * menuSize)
		{
			musMenu.pause() // Kill the menu music before moving into the game screen
			zombies.length = 0 // Wipe the zombie database so we can start playing with "real" zombies
			currentScreen = 'game'
		}
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
			moveToward(zombies[i], zombies[i].xDestination, zombies[i].yDestination, zombies[i].speed)

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
		if (gps.latitude && gps.longitude && compass && gps.accuracy < 15) // Only do stuff if we know where we are
		{
			// ******************************
			// Run calculations
			// ******************************

			// Clear the various arrays on each pass so we get fresh results
			melee.length = 0
			vision.length = 0

			if (zombies.length == 0) // Spawn zombies if we have none currently
			{
				findSpawnRadius()

				for (var i = 0; i < totalZombies; i++)
				{
					var thingy = new Object()
						thingy.name = 'zombie' + i
						thingy.latitude = random(gps.latitude - spawnSeedLatitude, gps.latitude + spawnSeedLatitude)
						thingy.longitude = random(gps.longitude - spawnSeedLongitude, gps.longitude + spawnSeedLongitude)
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
			    	zombies[i].bearing = bearing(zombies[i].latitude, zombies[i].longitude)
					zombies[i].distance = distance(zombies[i].latitude, zombies[i].longitude)

			    	if (zombies[i].distance < renderDistance && zombies[i].distance > (damageDistance / 2) && zombies[i].health > 0) // Move zombies closer
			    	{
			    		var ratio = zombies[i].speed / 10 / distance(zombies[i].latitude, zombies[i].longitude) // We have to change the meters-per-second speed to a decimal that can work with latitude/longitude coordinates

						zombies[i].latitude = zombies[i].latitude + ((gps.latitude - zombies[i].latitude) * ratio)
						zombies[i].longitude = zombies[i].longitude + ((gps.longitude - zombies[i].longitude) * ratio)
			    	}

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
				findSpawnRadius()

				for (var i = 0; i < totalAmmo; i++)
				{
					var thingy = new Object()
						thingy.latitude = random(gps.latitude - spawnSeedLatitude, gps.latitude + spawnSeedLatitude)
						thingy.longitude = random(gps.longitude - spawnSeedLongitude, gps.longitude + spawnSeedLongitude)
						thingy.count = random(ammoCountLow, ammoCountHigh)
					ammo.push(thingy)
				}
			}
			else if (ammo.length > 0)
			{
			    for (var i = 1; i < ammo.length; i++) // Do stuff with the ammo packs
			    {
			    	ammo[i].bearing = bearing(ammo[i].latitude, ammo[i].longitude)
					ammo[i].distance = distance(ammo[i].latitude, ammo[i].longitude)
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
			blank(blue)
			text('Waiting for GPS lock', 3, 3, white)
		}
		else if (gps.accuracy > 15)
		{
			blank(red)
			text('Current GPS accuracy of ' + gps.accuracy + ' meters is not accurate enough', 3, 3, white)
		}
	}
}, 1000 / fps)

function drawMenu()
{
	blank(canvasColor)

	for (var i = 0; i < zombies.length; i++) // Sort and draw the menu zombies
	{
		zombies.sort(function(a, b) // Order the zombies for proper depth
		{
			return a.y - b.y
		})
		
		if (zombies[i].xDestination < zombies[i].x && zombies[i].yDestination < zombies[i].y)
		{
			if (zombies[i].frame == 0)
			{
				image(imgZombieUpLeft, zombies[i].x, zombies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieUpLeft2, zombies[i].x, zombies[i].y, 'anchor')
			}
		}
		else if (zombies[i].xDestination > zombies[i].x && zombies[i].yDestination < zombies[i].y)
		{
			if (zombies[i].frame == 0)
			{
				image(imgZombieUpRight, zombies[i].x, zombies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieUpRight2, zombies[i].x, zombies[i].y, 'anchor')
			}
		}
		else if (zombies[i].xDestination < zombies[i].x && zombies[i].yDestination > zombies[i].y)
		{
			if (zombies[i].frame == 0)
			{
				image(imgZombieDownLeft, zombies[i].x, zombies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieDownLeft2, zombies[i].x, zombies[i].y, 'anchor')
			}
		}
		else if (zombies[i].xDestination > zombies[i].x && zombies[i].yDestination > zombies[i].y)
		{
			if (zombies[i].frame == 0)
			{
				image(imgZombieDownRight, zombies[i].x, zombies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieDownRight2, zombies[i].x, zombies[i].y, 'anchor')
			}
		}
	}

	// Logo shape
	polygon(xStats, yStats, menuSize, white)
	polygon(xSingle, ySingle, menuSize, white)
	polygon(xMulti, yMulti, menuSize, white)
	polygon(xPrefs, yPrefs, menuSize, white)
}

function drawGame()
{
	blank(canvasColor) // Place draw calls after this

    if (debug) // Draw the aiming cone for debugging purposes
    {
    	line((centerX) - (centerY * Math.tan(fieldOfView.toRad())), 0, centerX, centerY, debugColor)
    	line(centerX, centerY, (centerX) + (centerY * Math.tan(fieldOfView.toRad())), 0, debugColor)
		circle(centerX, centerY, maxShotDistance * pixelsToMeters, debugColor)
		circle(centerX, centerY, minShotDistance * pixelsToMeters, debugColor)
		circle(centerX, centerY, damageDistance * pixelsToMeters, debugColor)
		text('GPS currently accurate within ' + gps.accuracy + ' meters', 5 + indicatorSpacing + indicatorWidth, canvas.height - 10, debugColor)
    }

    /*
    zombies.sort(function(a, b) // Order the zombies for proper depth
	{
		return a.y - b.y
	})
	*/

	polygon(centerX, centerY, 10, white) // Draw the player

	for (var i = 0; i < ammo.length; i++) // Draw the ammo packs
    {
    	if (ammo[i].distance < renderDistance && ammo[i].count > 0) // This is the bit that helps with framerate
    	{
		    var x = centerX + Math.cos(((ammo[i].bearing - compass) + 270).toRad()) * (ammo[i].distance * pixelsToMeters)
			var y = centerY + Math.sin(((ammo[i].bearing - compass) + 270).toRad()) * (ammo[i].distance * pixelsToMeters)

		    image(imgAmmoPack, x, y, 'anchor')
		}
	}

    // Draw the zombies
    for (var i = 0; i < zombies.length; i++)
    {
    	if (zombies[i].distance < renderDistance) // This is the bit that helps with framerate
    	{
			zombies[i].x = centerX + Math.cos(((zombies[i].bearing - compass) + 270).toRad()) * (zombies[i].distance * pixelsToMeters)
			zombies[i].y = centerY + Math.sin(((zombies[i].bearing - compass) + 270).toRad()) * (zombies[i].distance * pixelsToMeters)

			if (debug)
			{
				text(zombies[i].name, zombies[i].x + 15, zombies[i].y - 10)
			}

		    if (zombies[i].health > 0) // Draw zombies facing in the right direction
		    {	
				if (centerX < zombies[i].x && centerY < zombies[i].y)
				{
					if (zombies[i].frame == 0)
					{
						image(imgZombieUpLeft, zombies[i].x, zombies[i].y, 'anchor')
					}
					else
					{
						image(imgZombieUpLeft2, zombies[i].x, zombies[i].y, 'anchor')
					}
				}
				else if (centerX > zombies[i].x && centerY < zombies[i].y)
				{
					if (zombies[i].frame == 0)
					{
						image(imgZombieUpRight, zombies[i].x, zombies[i].y, 'anchor')
					}
					else
					{
						image(imgZombieUpRight2, zombies[i].x, zombies[i].y, 'anchor')
					}
				}
				else if (centerX < zombies[i].x && centerY > zombies[i].y)
				{
					if (zombies[i].frame == 0)
					{
						image(imgZombieDownLeft, zombies[i].x, zombies[i].y, 'anchor')
					}
					else
					{
						image(imgZombieDownLeft2, zombies[i].x, zombies[i].y, 'anchor')
					}
				}
				else if (centerX > zombies[i].x && centerY > zombies[i].y)
				{
					if (zombies[i].frame == 0)
					{
						image(imgZombieDownRight, zombies[i].x, zombies[i].y, 'anchor')
					}
					else
					{
						image(imgZombieDownRight2, zombies[i].x, zombies[i].y, 'anchor')
					}
				}
		    }
		    else
		    {
		    	image(imgDeadZombie, zombies[i].x, zombies[i].y, 'anchor') // Draw dead zombies
		    }
		}
	}

	// drawHealth() // Give a visual on current health level

	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Things are only set up for right handed users right now
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    for (var i = 0; i < health; i++) // Draw out health
	{
		rectangle(canvas.width - indicatorSpacing - indicatorWidth, indicatorSpacing + (indicatorHeight + indicatorSpacing) * i, indicatorWidth, indicatorHeight, red)
	}

	for (var i = 0; i < magazine + 1; i++) // Draw the ammo in our gun
	{
		rectangle(canvas.width - indicatorSpacing - indicatorWidth, canvas.height - (indicatorHeight + indicatorSpacing) * i, indicatorWidth, indicatorHeight, white)
	}

	for (var i = 0; i < extraAmmo + 1; i++) // Draw our extraAmmo
	{
		rectangle(indicatorSpacing, canvas.height - (indicatorHeight + indicatorSpacing) * i, indicatorWidth, indicatorHeight, blue)
	}
}