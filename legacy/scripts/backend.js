Number.prototype.toRad = function()
{
	return this * Math.PI / 180
}

Number.prototype.toDeg = function()
{
	return this * 180 / Math.PI
}

function random(min, max)
{
	return Math.random() * (max - min) + min
}

function distance(thingy)
{
	var differenceX = player.column - thingy.column
	var differenceY = player.row - thingy.row

	return Math.sqrt(differenceX * differenceX + differenceY * differenceY)
}

function bearing(thingy)
{
    var angle = Math.atan2(thingy.row - player.row, thingy.column - player.column).toDeg() + 90
    
    if (angle > 0)
    {
        return angle
    }
    else
    {
        return angle + 360
    }
}

function gpsDistance(lat1, lon1, lat2, lon2)
{
	var radius = 6371000
	var dLat = (lat2 - lat1).toRad()
	var dLon = (lon2 - lon1).toRad()
	var lat1 = lat1.toRad()
	var lat2 = lat2.toRad()

	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	var d = radius * c
	return d
}

function gpsBearing(latitude1, longitude1, latitude2, longitude2)
{
	var lat1 = latitude1.toRad()
	var lat2 = latitude2.toRad()
	var dLon = (longitude2 - longitude1).toRad()

	var y = Math.sin(dLon) * Math.cos(lat2)
	var x = Math.cos(lat1) * Math.sin(lat2) -
			Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
	var bearing = Math.atan2(y, x)

	return (bearing.toDeg() + 360) % 360
}