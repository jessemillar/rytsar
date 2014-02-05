function fadeTo(file, endVolume, time)
{
	var startVolume = file.volume
	var step = 0.05 // How far a fade step is
	var rate = time / ((file.volume - endVolume) / step)

	var fadeInterval = setInterval(function()
	{
		if (startVolume > endVolume)
		{
			if (file.volume > endVolume)
			{
				file.volume -= step
			}
			else
			{
				clearInterval(fadeInterval)
			}
		}
		else if (startVolume < endVolume)
		{
			if (file.volume < endVolume)
			{
				file.volume += step
			}
			else
			{
				clearInterval(fadeInterval)
			}
		}
	}, rate)
}

function rewind(file)
{
	file.currentTime = 0
}