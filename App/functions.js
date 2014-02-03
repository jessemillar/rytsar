function punch()
{
	sfxPunch.play()

	if (melee.length > 0) // If we're within range of at at least one zombie...
	{
		melee[0].health -= meleeDamage

		setTimeout(function() // Add a timeout so the zombie doesn't groan instantly
    	{
    		sfxGroan.play()
    	}, 200)
	}

	canMelee = false

	setTimeout(function()
    {
    	canMelee = true
    }, timeMelee)
}

function fire()
{
	if (canShoot)
    {
	    if (player.magazine > 0) // Don't fire if we don't have ammo
	    {
	    	blank(flashColor) // Flash the screen
	        player.magazine-- // Remove a bullet
	        sfxFire.play()
	        canShoot = false

	        if (vision.length > 0) // If we're looking at at least one zombie...
			{
				vision[0].health -= shotDamage

				setTimeout(function() // Add a timeout so the zombie doesn't groan instantly
		    	{
		    		sfxGroan.play()
		    	}, 200)
			}
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

function reload()
{
	if (canShoot) // Prevent reloading during the playback of sound effects
    {
	    if (player.magazine < capacity && player.ammo > 0) // Don't reload if we already have a full player.magazine or if we don't have ammo to reload with
	    {
	        while (player.magazine < capacity - 1 && player.ammo > 0) // Fill the player.magazine with our extra ammo
	        {
	        	player.magazine += 1
	        	player.ammo -= 1
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

function daylight(value)
{
	ctx.globalAlpha = darkestNight - darkestNight * value
	
	ctx.fillStyle = navy
	ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function hunt(zombie, time) // Use an external function (outside of zombie creation) to move the zombie toward the player
{
	var speed = time * zombieSlowest

	if (speed < zombieFastest)
	{
		speed = zombieFastest + time * zombieSlowest
	}

	setInterval(function()
	{
		if (zombie.health > 0)
		{
			if (zombie.nature == 0)
			{
				if (player.column < zombie.column)
				{
					zombie.column -= 1
				}
				else if (player.column > zombie.column)
				{
					zombie.column += 1
				}
				else if (zombie.column == player.column)
				{
					if (player.row < zombie.row)
					{
						zombie.row -= 1
					}
					else if (player.row > zombie.row)
					{
						zombie.row += 1
					}
				}
			}
			else if (zombie.nature == 1)
			{
				if (player.row < zombie.row)
				{
					zombie.row -= 1
				}
				else if (player.row > zombie.row)
				{
					zombie.row += 1
				}
				else if (zombie.row == player.row)
				{
					if (player.column < zombie.column)
					{
						zombie.column -= 1
					}
					else if (player.column > zombie.column)
					{
						zombie.column += 1
					}
				}
			}
		}
	}, speed)
}

function pickup()
{
	for (var i = 0; i < ammo.length; i++)
	{
		if (ammo[i].column == player.column && ammo[i].row == player.row)
		{
			player.ammo += ammo[i].count
			ammo[i].count = 0
		}
	}
}

function hurtPlayer()
{
	for (var i = 0; i < zombies.length; i++)
	{
		if (zombies[i].column == player.column && zombies[i].row == player.row)
		{
			if (player.health > 1)
			{
				player.health -= 1
				sfxHurt.play()
			}
			else
			{
				player.health -= 1
				sfxFlatline.play()
				currentScreen = 'gameover'
			}
		}
	}
}