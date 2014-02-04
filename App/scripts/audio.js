function fadeOut(file, rate)
{
	var fadeInterval = setInterval(function()
	{
		if (file.volume > 0)
		{
			file.volume -= 0.1
		}
		else
		{
			file.pause()
			clearInterval(fadeInterval)
		}
	}, rate)
}

function rewind(file)
{
	file.currentTime = 0
	file.volume = 1
}