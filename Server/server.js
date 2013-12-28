var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 8787})

var enemies = new Array()
var objects = new Array()
var players = new Array()

var spawnRadiusLatitude = 0.015 // 0.015 is about a half mile in the latitude plane (in San Antonio, TX)
var spawnRadiusLongitude = 0.017 // 0.017 is about a half mile in the longitude plane (in San Antonio, TX)

console.log('Zombits server started')

if (enemies.length == 0 && players.length > 0)
{
	var zombieCount = 50 // 100 seems to be the max if I want ~60 FPS on the clients when not in debug mode (which is slower)
	for (var i = 0; i < zombieCount; i++)
	{
		var latitude = players[0].latitude + ((Math.random() * spawnRadiusLatitude) - (Math.random() * spawnRadiusLatitude))
	    var longitude = players[0].longitude + ((Math.random() * spawnRadiusLongitude) - (Math.random() * spawnRadiusLongitude))

		make('enemy', 'zombie' + i, latitude, longitude, 100)
	}
}

wss.on('connection', function(socket) {
	if (objects.length > 0)
	{
		socket.send(objects)
		console.log('sent: ' + JSON.stringify(objects))
	}

    socket.on('message', function(message)
    {
        console.log('received: ' + message)
        objects = message.objects
        socket.send(message)
    })
})

function make(markerKind, markerName, markerLatitude, markerLongitude, markerHealth)
{
    // Make an object with the function's values
	var object = new Object()

    object.name = markerName
    object.latitude = markerLatitude
    object.longitude = markerLongitude
    object.health = markerHealth
    object.bearing = null
    object.distance = null

    // Push these values to the appropriate database array
    if (markerKind == 'enemy')
    {
    	enemies.push(object)
    }
    else if (markerKind == 'object')
    {
    	objects.push(object)
    }
    else if (markerKind == 'player')
    {
    	// Do stuff
    }	
}

function distance(latitude1, longitude1, latitude2, longitude2)
{
	var km = 6371
	var distance = Math.acos(Math.sin(latitude1) * Math.sin(latitude2) + 
                   Math.cos(latitude1) * Math.cos(latitude2) *
            	   Math.cos(longitude2 - longitude1)) * km
	return distance
}

function bearing(latitude1, longitude1, latitude2, longitude2)
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

Number.prototype.toRad = function()
{
	return this * Math.PI / 180
}

Number.prototype.toDeg = function()
{
	return this * 180 / Math.PI
}