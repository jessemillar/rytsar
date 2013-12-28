var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 8787})

var enemies = new Array()
var objects = new Array()
var players = new Array()

var zombieCount = 50 // 100 seems to be the max if I want ~60 FPS on the clients when not in debug mode (which is slower)
var spawnRadiusLatitude = 0.015 // 0.015 is about a half mile in the latitude plane (in San Antonio, TX)
var spawnRadiusLongitude = 0.017 // 0.017 is about a half mile in the longitude plane (in San Antonio, TX)

sayPopulation() // Give a bit of feedback to show that the server started

wss.on('connection', function(socket) {
	if (enemies.length > 0) // If there are zombies, send the data to each new client when it connects
	{
		socket.send(enemies)
	}

    socket.on('message', function(message) // Do the following whenever the server receives a message
    {
    	var data = JSON.parse(message)

        if (players.length == 0) // If we're on an empty server
        {
        	players.push(data)
        }
        else
        {
        	for (var i = 0; i < players.length; i++) // If we're not on an empty server
	        {
	        	if (players[i].id == data.id) // Don't duplicate the player
	        	{
	        		break
	        	}
	        	else if (i == players.length) // Add the player if he doesn't exist
	        	{
	        		players.push(data)
	        	}
	        }
	    }

        updateEnemies()
        sayPopulation()
		socket.send(JSON.stringify(enemies))
    })

    socket.on('close', function() // Wipe the player database when someone disconnects so it can rebuilt with only active players
    {
    	players.length = 0
    	sayPopulation()
    })
})

function sayPopulation()
{
	console.log(players.length + ' player(s) connected with ' + enemies.length + ' zombie(s)')
}

function updateEnemies()
{
	if (enemies.length == 0 && players.length > 0)
	{
		for (var i = 0; i < zombieCount; i++)
		{
			var latitude = players[0].latitude + ((Math.random() * spawnRadiusLatitude) - (Math.random() * spawnRadiusLatitude))
		    var longitude = players[0].longitude + ((Math.random() * spawnRadiusLongitude) - (Math.random() * spawnRadiusLongitude))

			make('enemy', 'zombie' + i, latitude, longitude, 100)
		}
	}
}

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