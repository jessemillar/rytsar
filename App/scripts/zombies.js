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