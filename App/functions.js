function reload()
{
	if (canShoot) // Prevent reloading during the playback of sound effects
    {
	    if (magazine < capacity && extraAmmo > 0) // Don't reload if we already have a full magazine or if we don't have ammo to reload with
	    {
	        while (magazine < capacity - 1 && extraAmmo > 0) // Fill the magazine with our extra ammo
	        {
	        	magazine += 1
	        	extraAmmo -= 1
	        }
	        sfxReload.play()
	        canShoot = false

	        setTimeout(function()
	        {
	        	sfxCock.play()
	        }, timeReload)

	        setTimeout(function()
	        {
	            canShoot = true
	        }, timeCock + timeReload)
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
	    }
	    else
	    {
	        sfxEmpty.play()
	        canShoot = false
	    }

	    setTimeout(function()
        {
        	sfxCock.play()
        }, timeFire)

        setTimeout(function()
        {
            canShoot = true
        }, timeFire + timeCock)
	}
}

function pickup()
{
	for (var i = 1; i < ammoPacks.length; i++)
	{
		if (ammoPacks[i].distance < minShotDistance && ammoPacks[i].health > 0 && canPickup)
		{
			extraAmmo += ammoPacks[i].health
			ammoPacks[i].health = 0
			canPickup = false
			sfxReload.play()

			setTimeout(function()
	        {
	            canPickup = true
	        }, timePickup)
			break
		}
	}
}

function shootZombie(zombieName, damageAmount)
{
	if (canShootServer)
	{
		if (magazine > 0) // Don't fire if we don't have ammo
	    {
		    setTimeout(function() // Add a timeout so the zombie doesn't groan instantly
		    {
		    	sfxGroan.play()
		    }, 200)
	    }
	}
}

function enemyAttack()
{
	for (var i = 1; i < enemies.length; i++)
	{
		if (enemies[i].distance < damageDistance && enemies[i].health > 0 && self[1].health > 0)
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

function drawAmmoPacks()
{
	for (var i = 1; i < ammoPacks.length; i++)
    {
    	if (ammoPacks[i].distance < renderDistance) // This is the bit that helps with framerate
    	{
		    var x = (xCenter) + (Math.cos(((ammoPacks[i].bearing - compass) + 270).toRad()) * (ammoPacks[i].distance * metersToPixels))
		    var y = (yCenter) + (Math.sin(((ammoPacks[i].bearing - compass) + 270).toRad()) * (ammoPacks[i].distance * metersToPixels))

		    polygon(x, y, ammoPackSize, itemColor) // Draw the item in question
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

	for (var i = 0; i < magazine + 1; i++) // Draw the ammo in our gun
	{
		rectangle(canvas.width - indicatorSpacing - indicatorWidth, canvas.height - (indicatorHeight + indicatorSpacing) * i, indicatorWidth, indicatorHeight, ammoColor)
	}

	for (var i = 0; i < extraAmmo + 1; i++) // Draw our extraAmmo
	{
		rectangle(indicatorSpacing, canvas.height - (indicatorHeight + indicatorSpacing) * i, indicatorWidth, indicatorHeight, itemColor)
	}
}