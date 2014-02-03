function screenMenu()
{
	if (zombies.length == 0) // If there are no zombies, then this is the first time through the menu code
	{
		musMenu.play()

		for (var i = 0; i < menuTotalReeds; i++)
		{
			var thingy = new Object()
				thingy.column = Math.floor(random(1, menuGridWidth))
				thingy.row = Math.floor(random(1, menuGridHeight))

			reeds.push(thingy)
		}
		
		for (var i = 0; i < menuTotalZombies; i++)
		{
			var thingy = new Object()
				thingy.name = 'zombie' + i
				thingy.column = Math.floor(random(1, menuGridWidth))
				thingy.row = Math.floor(random(1, menuGridHeight))
				thingy.frame = random(0, 1)
				thingy.animate = animate(thingy, slowestAnimation)
			
			zombies.push(thingy)
		}
	}

	drawMenu()
}