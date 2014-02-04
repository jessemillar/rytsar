function drawGPS()
{
	gpsRotation += gpsRotationSpeed // Rotate the icon

	blank(black)
	ctx.save()
	ctx.translate(centerX, centerY)
	ctx.rotate(-gpsRotation.toRad()) // Things relating to the canvas and rotation expect radians
	image(imgSatellite, 0, 0, 'center')
	ctx.restore()
}