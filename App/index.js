ejecta.include('functions.js')
ejecta.include('backend.js')
ejecta.include('images/images.js')
ejecta.include('sounds/sounds.js')

var ctx = canvas.getContext('2d')
var xCenter = canvas.width / 2
var yCenter = canvas.height / 2

var debug = true // Can be toggled by tapping the screen in game mode

var currentScreen = 'menu'

var enemies = new Array() // Our local array of zombies
var ammoPacks = new Array() // Locally monitor the objects placed throughout the world
var vision = new Array() // The things in our field of view
var melee = new Array() // The zombies close enough to be punched

var playerMaxHealth = 5
var renderDistance = 50 // Distance in meters
var maxShotDistance = 30 // Distance in meters
var minShotDistance = 10 // Distance in meters
var damageDistance = 5 // Distance in meters
var fieldOfView = 22 // In degrees
var metersToPixels = 4 // ...pixels equals a meter

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
var canPickup = true
var timePickup = 1000

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

var menuEnemies = new Array()
var menuEnemyCount = 50
var menuEnemySpeedLow = 0.3
var menuEnemySpeedHigh = 0.5
var menuEnemySandbox = 25 // The amount of pixels outside the screen that the menu zombies are allowed to go to as a destination

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
	enemies.length = 0 // Wipe the zombie database and don't reopen the connection
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
		if (menuEnemies.length == 0) // If there are no zombies, then this is the first time through the menu code
		{
			musMenu.play()

			for (var i = 0; i < menuEnemyCount; i++)
			{
				var enemy = new Object()
					enemy.x = Math.random() * canvas.width
					enemy.y = Math.random() * canvas.height
					enemy.xDestination = random(0 - menuEnemySandbox, canvas.width + menuEnemySandbox)
					enemy.yDestination = random(0 - menuEnemySandbox, canvas.height + menuEnemySandbox)
					enemy.speed = random(menuEnemySpeedLow, menuEnemySpeedHigh)
					enemy.frame = random(0, 1)
					enemy.animate = animate(enemy, enemy.speed * 1000)
				menuEnemies.push(enemy)
			}
		}
		
		for (var i = 0; i < menuEnemies.length; i++)
		{
			moveToward(menuEnemies[i], menuEnemies[i].xDestination, menuEnemies[i].yDestination, menuEnemies[i].speed)

			if (Math.floor(menuEnemies[i].x) == Math.floor(menuEnemies[i].xDestination) && Math.floor(menuEnemies[i].x) == Math.floor(menuEnemies[i].xDestination)) // Pick a new destination once we arrive
			{
				menuEnemies[i].xDestination = random(0 - menuEnemySandbox, canvas.width + menuEnemySandbox)
				menuEnemies[i].yDestination = random(0 - menuEnemySandbox, canvas.height + menuEnemySandbox)
			}
		}

		drawMenu()
	}
	else if (currentScreen == 'game')
	{
		melee.length = 0
		proximity.length = 1 // Wipe the proximity array so we can send fresh data
		vision.length = 0 // Clear the field of view array on each pass so we get fresh results

	    for (var i = 1; i < enemies.length; i++) // Do stuff with the zombies
	    {
	    	enemies[i].bearing = bearing(enemies[i].latitude, enemies[i].longitude)
			enemies[i].distance = distance(enemies[i].latitude, enemies[i].longitude)

	    	if (enemies[i].distance < renderDistance)
	    	{
	    		enemies[i].target = localStorage.getItem('id') // Add the user's ID so the server knows which player to move the zombies toward
	    		proximity.push(enemies[i])
	    	}

	    	if (enemies[i].distance < minShotDistance && enemies[i].health > 0)
	    	{
	    		melee.push(enemies[i])
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
	    	players[i].bearing = bearing(players[i].latitude, players[i].longitude)
			players[i].distance = distance(players[i].latitude, players[i].longitude)
	    }

	    for (var i = 1; i < ammoPacks.length; i++) // Do stuff with the ammo packs
	    {
	    	ammoPacks[i].bearing = bearing(ammoPacks[i].latitude, ammoPacks[i].longitude)
			ammoPacks[i].distance = distance(ammoPacks[i].latitude, ammoPacks[i].longitude)
	    }

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

			if (debug)
			{
				// console.log(gps.latitude, gps.longitude, vision[0].name, vision[0].latitude, vision[0].longitude, vision[0].distance, vision[0].health)
			}
	    }

	    enemyAttack() // Potentially hurt the player if a zombie is close enough

		pickup()

	    if (acceleration.total > accelRequiredMelee)
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

	    blank(canvasColor) // Place draw calls after this

	    if (debug) // Draw the aiming cone for debugging purposes
	    {
	    	line((xCenter) - (yCenter * Math.tan(fieldOfView.toRad())), 0, xCenter, yCenter, debugColor)
	    	line(xCenter, yCenter, (xCenter) + (yCenter * Math.tan(fieldOfView.toRad())), 0, debugColor)
			circle(xCenter, yCenter, maxShotDistance * metersToPixels, debugColor)
			circle(xCenter, yCenter, minShotDistance * metersToPixels, debugColor)
			circle(xCenter, yCenter, damageDistance * metersToPixels, debugColor)
			text('GPS currently accurate within ' + gps.accuracy + ' meters', 5 + indicatorSpacing + indicatorWidth, canvas.height - 10, debugColor)
	    }

	    drawGame()
	}
}, 1000 / 60) // FPS

function drawMenu()
{
	blank(canvasColor)

	for (var i = 0; i < menuEnemies.length; i++) // Sort and draw the menu zombies
	{
		menuEnemies.sort(function(a, b) // Order the zombies for proper depth
		{
			return a.y - b.y
		})
		
		if (menuEnemies[i].xDestination < menuEnemies[i].x && menuEnemies[i].yDestination < menuEnemies[i].y)
		{
			if (menuEnemies[i].frame == 0)
			{
				image(imgZombieUpLeft, menuEnemies[i].x, menuEnemies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieUpLeft2, menuEnemies[i].x, menuEnemies[i].y, 'anchor')
			}
		}
		else if (menuEnemies[i].xDestination > menuEnemies[i].x && menuEnemies[i].yDestination < menuEnemies[i].y)
		{
			if (menuEnemies[i].frame == 0)
			{
				image(imgZombieUpRight, menuEnemies[i].x, menuEnemies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieUpRight2, menuEnemies[i].x, menuEnemies[i].y, 'anchor')
			}
		}
		else if (menuEnemies[i].xDestination < menuEnemies[i].x && menuEnemies[i].yDestination > menuEnemies[i].y)
		{
			if (menuEnemies[i].frame == 0)
			{
				image(imgZombieDownLeft, menuEnemies[i].x, menuEnemies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieDownLeft2, menuEnemies[i].x, menuEnemies[i].y, 'anchor')
			}
		}
		else if (menuEnemies[i].xDestination > menuEnemies[i].x && menuEnemies[i].yDestination > menuEnemies[i].y)
		{
			if (menuEnemies[i].frame == 0)
			{
				image(imgZombieDownRight, menuEnemies[i].x, menuEnemies[i].y, 'anchor')
			}
			else
			{
				image(imgZombieDownRight2, menuEnemies[i].x, menuEnemies[i].y, 'anchor')
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
	drawAmmoPacks() // Draw the ammo packs
	polygon(xCenter, yCenter, playerSize, playerColor) // Draw the player
	drawEnemies() // Duh
	drawHealth() // Give a visual on current health level
    drawAmmo() // Give us a visual on how much ammo we have left
}