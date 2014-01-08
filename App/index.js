ejecta.include('variables.js')
ejecta.include('functions.js')
ejecta.include('backend.js')
ejecta.include('images/images.js')
ejecta.include('sounds/sounds.js')

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

	document.addEventListener('touchstart', function(ev) // Monitor touches
	{
		var x = ev.touches[0].pageX
		var y = ev.touches[0].pageY

		if (currentScreen == 'game')
		{
			debug = !debug // Toggle debug mode for framerate increase
		}
		else if (currentScreen == 'menu')
		{
			if (Math.abs(xStats - x) * Math.abs(xStats - x) + Math.abs(yStats - y) * Math.abs(yStats - y) < menuSize * menuSize)
			{
				currentScreen = 'stats'
			}
			else if (Math.abs(xMulti - x) * Math.abs(xMulti - x) + Math.abs(yMulti - y) * Math.abs(yMulti - y) < menuSize * menuSize)
			{
				musMenu.pause()
				currentScreen = 'game'
			}
			else if (Math.abs(xPrefs - x) * Math.abs(xPrefs - x) + Math.abs(yPrefs - y) * Math.abs(yPrefs - y) < menuSize * menuSize)
			{
				currentScreen = 'prefs'
			}
		}
	})

	socket.addEventListener('message', function(message) // Keep track of messages coming from the server
	{
		// console.log(message.data)
		data = JSON.parse(message.data)

		if (data[0] == 'enemies')
		{
			enemies = data
		}
		else if (data[0] == 'players')
		{
			players = data
		}
		else if (data[0] == 'ammo')
		{
			ammoPacks = data
		}
	})

	setInterval(function() // Animate the menu zombies
	{
		for (var i = 0; i < menuEnemies.length; i++)
		{
			if (menuEnemies[i].frame == 0)
			{
				menuEnemies[i].frame = 1
			}
			else
			{
				menuEnemies[i].frame = 0
			}
		}
	}, 500)
}

setInterval(function() // Main game loop
{
	if (currentScreen == 'prefs') // The preferences button acts as a nuke for the moment
	{
		socket.send(JSON.stringify(self)) // Tell the server on a regular basis where the player is	
		var message = new Array()
			message[0] = 'genocide'
		socket.send(JSON.stringify(message)) // Temporary genocide for testing purposes
		blank(enemyColor)
		musMenu.pause()
		currentScreen = 'game'
	}
	else if (currentScreen == 'menu')
	{
		if (!menuMusicPlaying)
		{
			musMenu.play()
			menuMusicPlaying = true
		}

		if (Math.random() > 0.999) // Play random zombie sounds
		{
			sfxGroan.play()
		}

		if (menuEnemies.length == 0) // Generate menu zombies if there are none
		{
			for (var i = 0; i < menuEnemyCount; i++)
			{
				var enemy = new Object()
					enemy.x = Math.random() * canvas.width
					enemy.y = Math.random() * canvas.height
					enemy.xDestination = random(0 - menuEnemySandbox, canvas.width + menuEnemySandbox)
					enemy.yDestination = random(0 - menuEnemySandbox, canvas.height + menuEnemySandbox)
					enemy.frame = random(0, 1)
				menuEnemies.push(enemy)
			}
		}
		else // Move the zombies toward their destination
		{
			for (var i = 0; i < menuEnemies.length; i++)
			{
				moveToward(menuEnemies[i], menuEnemies[i].xDestination, menuEnemies[i].yDestination, 1)

				if (Math.floor(menuEnemies[i].x) == Math.floor(menuEnemies[i].xDestination) && Math.floor(menuEnemies[i].x) == Math.floor(menuEnemies[i].xDestination)) // Pick a new destination once we arrive
				{
					menuEnemies[i].xDestination = random(0 - menuEnemySandbox, canvas.width + menuEnemySandbox)
					menuEnemies[i].yDestination = random(0 - menuEnemySandbox, canvas.height + menuEnemySandbox)
				}
			}
		}

		blank(canvasColor)

		for (var i = 0; i < menuEnemies.length; i++)
		{
			// polygon(menuEnemies[i].x, menuEnemies[i].y, enemySize, enemyColor)
			menuEnemies.sort(function(a, b) // Order the zombies for proper depth
			{
				return a.y - b.y
			})
			
			if (menuEnemies[i].xDestination > menuEnemies[i].x)
			{
				if (menuEnemies[i].frame == 0)
				{
					image(imgZombie, menuEnemies[i].x, menuEnemies[i].y)
				}
				else
				{
					image(imgZombie2, menuEnemies[i].x, menuEnemies[i].y)
				}
			}
			else
			{
				if (menuEnemies[i].frame == 0)
				{
					image(imgZombieLeft, menuEnemies[i].x, menuEnemies[i].y)
				}
				else
				{
					image(imgZombieLeft2, menuEnemies[i].x, menuEnemies[i].y)
				}
			}
		}

		// Logo shape
		polygon(xStats, yStats, menuSize, playerColor)
		polygon(xSingle, ySingle, menuSize, playerColor)
		polygon(xMulti, yMulti, menuSize, playerColor)
		polygon(xPrefs, yPrefs, menuSize, playerColor)

		// Stats
		rectangle(xMulti - menuGlyphWidth - menuGlyphSpacing * 2 - menuGlyphWidth / 2, yStats - menuGlyphHeight / 2 - menuGlyphWidth / 2 - menuGlyphSpacing * 2, menuGlyphWidth, menuGlyphHeight + menuGlyphSpacing + menuGlyphWidth, menuGlyphColor)
		rectangle(xStats - menuGlyphWidth / 2, yStats - menuGlyphHeight / 2 - menuGlyphWidth / 2 - menuGlyphSpacing * 2, menuGlyphWidth, menuGlyphHeight + menuGlyphSpacing + menuGlyphWidth, menuGlyphColor)
		rectangle(xMulti + menuGlyphSpacing * 2 + menuGlyphWidth / 2, yStats - menuGlyphHeight / 2 - menuGlyphWidth / 2 - menuGlyphSpacing * 2, menuGlyphWidth, menuGlyphHeight + menuGlyphSpacing + menuGlyphWidth, menuGlyphColor)
		rectangle(xMulti - menuGlyphWidth - menuGlyphSpacing * 2 - menuGlyphWidth / 2, yStats - menuGlyphHeight / 2 - menuGlyphWidth / 2 - menuGlyphSpacing * 2, menuGlyphWidth, menuGlyphSpacing + menuGlyphWidth, playerColor) // Mask
		rectangle(xMulti + menuGlyphSpacing * 2 + menuGlyphWidth / 2, yStats - menuGlyphHeight / 2 - menuGlyphWidth / 2 - menuGlyphSpacing * 2, menuGlyphWidth, menuGlyphSpacing * 4, playerColor) // Mask

		// Single player
		polygon(xSingle, ySingle - menuGlyphSpacing * 2 - menuGlyphWidth / 2 - menuGlyphSpacing, menuGlyphWidth / 2, menuGlyphColor)
		rectangle(xSingle - menuGlyphWidth / 2, ySingle - menuGlyphSpacing * 2, menuGlyphWidth, menuGlyphHeight, menuGlyphColor)

		// Multiplayer
		polygon(xMulti - menuGlyphWidth - menuGlyphSpacing * 2, yMulti - menuGlyphSpacing * 2 - menuGlyphWidth / 2 - menuGlyphSpacing, menuGlyphWidth / 2, menuGlyphColor)
		rectangle(xMulti - menuGlyphWidth - menuGlyphSpacing * 2 - menuGlyphWidth / 2, yMulti - menuGlyphSpacing * 2, menuGlyphWidth, menuGlyphHeight, menuGlyphColor)
		polygon(xMulti, yMulti - menuGlyphSpacing - menuGlyphWidth / 2 - menuGlyphSpacing * 2, menuGlyphWidth / 2, menuGlyphColor)
		rectangle(xMulti - menuGlyphWidth / 2, yMulti - menuGlyphSpacing * 2, menuGlyphWidth, menuGlyphHeight, menuGlyphColor)
		polygon(xMulti + menuGlyphWidth + menuGlyphSpacing * 2, yMulti - menuGlyphSpacing * 2 - menuGlyphWidth / 2 - menuGlyphSpacing, menuGlyphWidth / 2, menuGlyphColor)
		rectangle(xMulti + menuGlyphSpacing * 2 + menuGlyphWidth / 2, yMulti - menuGlyphSpacing * 2, menuGlyphWidth, menuGlyphHeight, menuGlyphColor)

		// Prefs
		polygon(xPrefs, yPrefs - menuGlyphWidth / 2 - menuGlyphSpacing, menuGlyphWidth, menuGlyphColor)
		rectangle(xPrefs - menuGlyphWidth / 2, yPrefs - menuGlyphSpacing * 2, menuGlyphWidth, menuGlyphHeight, menuGlyphColor)
		rectangle(xPrefs - menuGlyphWidth * 0.6 / 2, yPrefs - menuGlyphWidth / 2 - menuGlyphSpacing - menuGlyphWidth, menuGlyphWidth * 0.6, menuGlyphWidth, playerColor) // Mask
	}
	else if (currentScreen == 'stats')
	{
		// Shots fired
		// Damage dealt
		// Damage taken
		// Zombies killed
		// Miles walked
		// Accuracy

		blank(canvasColor)

		// Logo shape
		polygon(canvas.width / 5, canvas.height / 10 * 2, canvas.height / 12, playerColor)
		polygon(canvas.width / 5, canvas.height / 10 * 4, canvas.height / 12, playerColor)
		polygon(canvas.width / 5, canvas.height / 10 * 6, canvas.height / 12, playerColor)
		polygon(canvas.width / 5, canvas.height / 10 * 8, canvas.height / 12, playerColor)
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
		socket.send(JSON.stringify(self)) // Tell the server on a regular basis where the player is	
		if (proximity.length > 1)
		{
			socket.send(JSON.stringify(proximity)) // Tell the server which zombies are close to us
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

	    draw()

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
	}
}, 1000 / 60) // FPS