function turnZombies() // Use an external function (outside of zombie creation) to move the zombie toward the player
{
	for (var i = 0; i < zombies.length; i++)
	{
		if (zombies[i].health > 0)
		{
			var distanceToPlayer = distance(zombies[i])

			if (distanceToPlayer <= zombieHuntDistance)
			{
				if (zombies[i].nature == 0)
				{
					if (player.column < zombies[i].column)
					{
						zombies[i].column -= 1
					}
					else if (player.column > zombies[i].column)
					{
						zombies[i].column += 1
					}
					else if (zombies[i].column == player.column)
					{
						if (player.row < zombies[i].row)
						{
							zombies[i].row -= 1
						}
						else if (player.row > zombies[i].row)
						{
							zombies[i].row += 1
						}
					}
				}
				else if (zombies[i].nature == 1)
				{
					if (player.row < zombies[i].row)
					{
						zombies[i].row -= 1
					}
					else if (player.row > zombies[i].row)
					{
						zombies[i].row += 1
					}
					else if (zombies[i].row == player.row)
					{
						if (player.column < zombies[i].column)
						{
							zombies[i].column -= 1
						}
						else if (player.column > zombies[i].column)
						{
							zombies[i].column += 1
						}
					}
				}
			}
		}
	}
	
	sfxWalk.pause()
	rewind(sfxWalk)
	sfxWalk.play() // Play a walk sound to let the player know that the zombies just took a turn
	proximity() // Check if we're near the player
}