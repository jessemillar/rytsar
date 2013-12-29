var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 8787})

var enemies = new Array()
    enemies[0] = 'enemies'
var objects = new Array()
    objects[0] = 'objects'
var players = new Array()
    players[0] = 'players'

var zombieCount = 35 // 100 seems to be the max if I want ~60 FPS on the clients when not in debug mode (which is slower)
var spawnRadiusLatitude = 0.015 // 0.015 is about a half mile in the latitude plane (in San Antonio, TX)
var spawnRadiusLongitude = 0.017 // 0.017 is about a half mile in the longitude plane (in San Antonio, TX)

report() // Give a bit of feedback to show that the server started

setInterval(function()
{
    report() // Post a general update every two seconds
}, 2000)

wss.on('connection', function(socket) {
	if (enemies.length > 1) // If there are zombies, send the data to each new client when it connects
	{
		socket.send(JSON.stringify(enemies))
	}

    socket.on('message', function(message) // Do the following whenever the server receives a message
    {
    	var data = JSON.parse(message) // Change the data from JSON to an object

        if (data._type == 'player')
        {
            if (players.length == 1) // Log the first player on the server
            {
                players.push(data)
                console.log('Player connected')
            }
            else // If we're not on an empty server
            {
                for (var i = 1; i < players.length; i++)
                {
                    if (data.id == players[i].id) // Don't duplicate the player
                    {
                        break
                    }
                    
                    if (i + 1 == players.length) // Add the player if he doesn't exist
                    {
                        players.push(data)
                        console.log('Player connected')
                    }
                }
            }
        }
        else if (data._type = 'damage')
        {
            for (var i = 1; i < enemies.length; i++)
            {
                if (enemies[i].name == data.name) // Find the zombie in question in the array
                {
                    if (enemies[i].health > 0)
                    {
                        enemies[i].health -= data.damage // Apply damage
                    }

                    if (enemies[i].health < 0)
                    {
                        enemies[i].health = 0
                    }
                }
            }
        }

        updateEnemies()
		socket.send(JSON.stringify(enemies)) // Send the enemy array to the clients
    })

    socket.on('error', function(message) // Do the following whenever the server receives a message
    {
        players.length = 1
        console.log('Recovering from an unknown error')
    })

    socket.on('close', function() // Wipe the player database when someone disconnects so it can rebuilt with only active players
    {
    	players.length = 1
    	console.log('Player(s) disconnected')
    })
})

function report()
{
    var date = new Date()
	console.log((players.length - 1) + ' player(s) connected in a world with ' + (enemies.length - 1) + ' zombie(s) at ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ' on ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear())
}

function updateEnemies()
{
	if (enemies.length == 1 && players.length > 1) // If we have players but no zombies...
	{
		for (var i = 1; i < zombieCount + 1; i++) // Spawn the number of zombies we defined at the top of the script
		{
            // Spawn in relation to the first player that joined the server
			var latitude = players[1].latitude + ((Math.random() * spawnRadiusLatitude) - (Math.random() * spawnRadiusLatitude))
		    var longitude = players[1].longitude + ((Math.random() * spawnRadiusLongitude) - (Math.random() * spawnRadiusLongitude))

			make('enemy', 'zombie' + i, latitude, longitude, 100)
		}

        console.log(zombieCount + ' zombie(s) have been spawned')
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