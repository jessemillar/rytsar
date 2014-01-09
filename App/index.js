ejecta.include('functions.js')
ejecta.include('backend.js')
ejecta.include('images/images.js')
ejecta.include('sounds/sounds.js')

var ctx = canvas.getContext('2d')
var xCenter = canvas.width / 2
var yCenter = canvas.height / 2

var debug = false // Can be toggled by tapping the screen in game mode

var currentScreen = 'menu'

var zombies = new Array() // Our local array of zombies
var ammo = new Array() // Locally monitor the objects placed throughout the world
var vision = new Array() // The things in our field of view
var melee = new Array() // The zombies close enough to be punched

var playerMaxHealth = 5
var renderDistance = 50 // Distance in meters
var maxShotDistance = 30 // Distance in meters
var minShotDistance = 10 // Distance in meters
var damageDistance = 5 // Distance in meters
var fieldOfView = 22 // In degrees
var pixelsToMeters = 4 // ...pixels equals a meter

var totalZombies = 100
var totalAmmo = 20
var spawnRadius = 100 // ...meters
var spawnSeedLatitude = 0 // Set later on
var spawnSeedLongitude = 0 // Set later on

// In meters per second
var zombieSpeedLow = 0.3
var zombieSpeedHigh = 1

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

// General gun variables
var capacity = 6 // Since we have a revolver right now
var magazine = random(0, capacity - 4)
var extraAmmo = random(0, 2)
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

var menuZombies = new Array()
var menuTotalZombies = 50
var menuZombieSpeedLow = 0.3
var menuZombieSpeedHigh = 0.5
var menuZombieSandbox = 25 // The amount of pixels outside the screen that the menu zombies are allowed to go to as a destination

var xStats = xCenter - menuSize / 2 - menuSpacing
var yStats = yCenter - menuSize / 2 - menuSpacing - menuSize - menuSpacing * 2
var xSingle = xCenter + menuSize / 2 + menuSpacing
var ySingle = yCenter - menuSize / 2 - menuSpacing
var xMulti = xCenter - menuSize / 2 - menuSpacing
var yMulti = yCenter + menuSize / 2 + menuSpacing
var xPrefs = xCenter + menuSize / 2 + menuSpacing
var yPrefs = yCenter + menuSize / 2 + menuSpacing + menuSize + menuSpacing * 2

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
			currentScreen = 'game'
		}
	}
})

setInterval(function() // Main game loop
{
	if (currentScreen == 'menu')
	{
		if (menuZombies.length == 0) // If there are no zombies, then this is the first time through the menu code
		{
			musMenu.play()

			for (var i = 0; i < menuTotalZombies; i++)
			{
				var thingy = new Object()
					thingy.x = random(0, canvas.width)
					thingy.y = random(0, canvas.height)
					thingy.xDestination = random(0 - menuZombieSandbox, canvas.width + menuZombieSandbox)
					thingy.yDestination = random(0 - menuZombieSandbox, canvas.height + menuZombieSandbox)
					thingy.speed = random(menuZombieSpeedLow, menuZombieSpeedHigh)
					thingy.frame = random(0, 1)
					thingy.animate = animate(thingy, thingy.speed * 1000)
				menuZombies.push(thingy)
			}
		}
		
		for (var i = 0; i < menuZombies.length; i++)
		{
			moveToward(menuZombies[i], menuZombies[i].xDestination, menuZombies[i].yDestination, menuZombies[i].speed)

			if (Math.floor(menuZombies[i].x) == Math.floor(menuZombies[i].xDestination) && Math.floor(menuZombies[i].x) == Math.floor(menuZombies[i].xDestination)) // Pick a new destination once we arrive
			{
				menuZombies[i].xDestination = random(0 - menuZombieSandbox, canvas.width + menuZombieSandbox)
				menuZombies[i].yDestination = random(0 - menuZombieSandbox, canvas.height + menuZombieSandbox)
			}
		}

		drawMenu()
	}
	else if (currentScreen == 'game')
	{
		if (gps.latitude && gps.longitude && compass) // Only do stuff if we know where we are
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
						thingy.latitude = random(gps.latitude - spawnSeedLatitude, gps.latitude + spawnSeedLatitude)
						thingy.longitude = random(gps.longitude - spawnSeedLongitude, gps.longitude + spawnSeedLongitude)
						thingy.speed = random(zombieSpeedLow, zombieSpeedHigh)
						thingy.frame = random(0, 1)
						thingy.animate = animate(thingy, thingy.speed * 1000)
					zombies.push(thingy)
				}
			}
			else if (zombies.length > 0)
			{
				for (var i = 1; i < zombies.length; i++) // Do stuff with the zombies
			    {
			    	zombies[i].bearing = bearing(zombies[i].latitude, zombies[i].longitude)
					zombies[i].distance = distance(zombies[i].latitude, zombies[i].longitude)

			    	if (zombies[i].distance < renderDistance)
			    	{
			    		// Move zombies closer
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

				if (debug)
				{
					// console.log(gps.latitude, gps.longitude, vision[0].name, vision[0].latitude, vision[0].longitude, vision[0].distance, vision[0].health)
				}
		    }

		    if (vision.length > 0) // If we're looking at at least one zombie...
		    {
				vision.sort(function(a, b) // Sort the vision array to find the zombie that's closest to us
				{
					return a.distance - b.distance
				})
		    }

		    for (var i = 1; i < zombies.length; i++)
			{
				if (zombies[i].distance < damageDistance && zombies[i].health > 0 && self[1].health > 0)
				{
					setTimeout(function()
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
					}, 1000)
				}	
			}

			for (var i = 1; i < ammo.length; i++)
			{
				if (ammo[i].distance < minShotDistance && ammo[i].health > 0 && canPickup)
				{
					extraAmmo += ammo[i].health
					ammo[i].health = 0
					canPickup = false
					sfxReload.play()

					setTimeout(function()
			        {
			            canPickup = true
			        }, timePickup)
					break
				}
			}

			// ******************************
			// Attack motions
			// ******************************

		    if (acceleration.total > accelRequiredMelee) // Melee attack!
			{
				if (canMelee)
				{
					sfxPunch.play()

					if (melee.length > 0) // If we're looking at at least one zombie...
					{
						shootZombie(melee[0].name, meleeDamage) // Punch the closest zombie
					}
					
					canMelee = false

					setTimeout(function()
			        {
			        	canMelee = true
			        }, timeMelee)
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
		            fire() // Fire regardless of whether we're looking at a zombie
		            if (vision.length > 0) // If we're looking at at least one zombie...
					{
						shootZombie(vision[0].name, shotDamage) // Shoot the closest zombie
					}
		        }
		    }

		    // ******************************
			// Draw
			// ******************************

		    drawGame()
		}
		else
		{
			console.log('Error: No GPS lock')
		}
	}
}, 1000 / 60) // FPS

function drawMenu()
{
	blank(canvasColor)

	for (var i = 0; i < menuZombies.length; i++) // Sort and draw the menu zombies
	{
		menuZombies.sort(function(a, b) // Order the zombies for proper depth
		{
			return a.y - b.y
		})
		
		if (menuZombies[i].xDestination < menuZombies[i].x && menuZombies[i].yDestination < menuZombies[i].y)
		{
			if (menuZombies[i].frame == 0)
			{
				image(imgZombieUpLeft, menuZombies[i].x, menuZombies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieUpLeft2, menuZombies[i].x, menuZombies[i].y, 'anchor')
			}
		}
		else if (menuZombies[i].xDestination > menuZombies[i].x && menuZombies[i].yDestination < menuZombies[i].y)
		{
			if (menuZombies[i].frame == 0)
			{
				image(imgZombieUpRight, menuZombies[i].x, menuZombies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieUpRight2, menuZombies[i].x, menuZombies[i].y, 'anchor')
			}
		}
		else if (menuZombies[i].xDestination < menuZombies[i].x && menuZombies[i].yDestination > menuZombies[i].y)
		{
			if (menuZombies[i].frame == 0)
			{
				image(imgZombieDownLeft, menuZombies[i].x, menuZombies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieDownLeft2, menuZombies[i].x, menuZombies[i].y, 'anchor')
			}
		}
		else if (menuZombies[i].xDestination > menuZombies[i].x && menuZombies[i].yDestination > menuZombies[i].y)
		{
			if (menuZombies[i].frame == 0)
			{
				image(imgZombieDownRight, menuZombies[i].x, menuZombies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieDownRight2, menuZombies[i].x, menuZombies[i].y, 'anchor')
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
    	line((xCenter) - (yCenter * Math.tan(fieldOfView.toRad())), 0, xCenter, yCenter, debugColor)
    	line(xCenter, yCenter, (xCenter) + (yCenter * Math.tan(fieldOfView.toRad())), 0, debugColor)
		circle(xCenter, yCenter, maxShotDistance * pixelsToMeters, debugColor)
		circle(xCenter, yCenter, minShotDistance * pixelsToMeters, debugColor)
		circle(xCenter, yCenter, damageDistance * pixelsToMeters, debugColor)
		text('GPS currently accurate within ' + gps.accuracy + ' meters', 5 + indicatorSpacing + indicatorWidth, canvas.height - 10, debugColor)
    }

    // Draw the zombies
    for (var i = 1; i < zombies.length; i++)
    {
    	if (zombies[i].distance < renderDistance) // This is the bit that helps with framerate
    	{
		    var x = (xCenter) + (Math.cos(((zombies[i].bearing - compass) + 270).toRad()) * (zombies[i].distance * pixelsToMeters))
		    var y = (yCenter) + (Math.sin(((zombies[i].bearing - compass) + 270).toRad()) * (zombies[i].distance * pixelsToMeters))

		    if (debug) // Write the zombie's name next to its marker if we're in debug mode
		    {
		    	ctx.fillStyle = debugColor;
	    		ctx.fillText(zombies[i].name, x + enemySize + 3, y)
		    }

		    if (zombies[i].health > 0)
		    {
		    	image(imgZombieUpLeft, x, y, 'anchor') // Draw the sucker normally
		    }
		    else
		    {
		    	// polygon(x, y, enemySize, deadColor) // He's dead, Jim
		    }
		}
	}

	// drawAmmo() // Draw the ammo packs
	// polygon(xCenter, yCenter, playerSize, playerColor) // Draw the player
	// drawHealth() // Give a visual on current health level
    // drawAmmo() // Give us a visual on how much ammo we have left
}