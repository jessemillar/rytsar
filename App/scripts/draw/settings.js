function drawSettings()
{
	blank(black)
	image(imgBackArrow, 10, 10, 'normal', 0.25)
	if (debug)
	{
		image(imgBug, canvas.width / 2, 150, 'center')
	}
	else
	{
		image(imgBug, canvas.width / 2, 150, 'center', 0.5)
	}
}