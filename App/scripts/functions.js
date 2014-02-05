function reset()
{
	zombies.length = 0 // Wipe the zombie database so we can start playing with "real" zombies
	reeds.length = 0 // Kill the reeds too
	ammo.length = 0 // Wipe the ammo packs
	player.column = Math.ceil(gridWidth / 2)
	player.row = Math.ceil(gridHeight / 2)
	player.health = playerMaxHealth
	player.magazine = random(0, gunCapacity - 3)
	player.ammo = random(0, 2) // Ammo not in the gun
	player.history.length = 0
}

function makeZombies()
{
	for (var i = 0; i < totalZombies; i++)
	{
		var thingy = new Object()
			thingy.name = 'zombie' + i
			thingy.column = Math.floor(random(1, gridWidth))
			thingy.row = Math.floor(random(1, gridHeight))
			thingy.health = random(zombieMinHealth, zombieMaxHealth)
			thingy.frame = random(0, 1)
			thingy.animate = animate(thingy, zombieAnimationSpeed)
			thingy.nature = Math.floor(random(0, 1))
		zombies.push(thingy)
	}
}

function makeAmmo()
{
	for (var i = 0; i < totalAmmo; i++)
	{
		var thingy = new Object()
			thingy.column = Math.floor(random(1, gridWidth))
			thingy.row = Math.floor(random(1, gridHeight))
			thingy.count = random(ammoCountLow, ammoCountHigh)
		ammo.push(thingy)
	}
}

function makeReeds()
{
	for (var i = 0; i < totalReeds; i++)
	{
		var thingy = new Object()
			thingy.column = Math.floor(random(1, gridWidth))
			thingy.row = Math.floor(random(1, gridHeight))
		reeds.push(thingy)
	}
}