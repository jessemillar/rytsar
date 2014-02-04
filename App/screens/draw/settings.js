function drawSettings()
{
	blank(black)
	image(imgBackArrow, 10, 10, 'normal')
	if (debug)
	{
		image(imgBug, canvas.width / 2, 125, 'center')
	}
	else
	{
		image(imgBug, canvas.width / 2, 125, 'center', 0.25)
	}
}