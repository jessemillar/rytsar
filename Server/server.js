var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 8787})

var enemies = new Array()
    enemies[0] = 'enemies'
var objects = new Array()
    objects[0] = 'objects'
var players = new Array()
    players[0] = 'players'

var proximity = new Array() // The array we'll use to move zombies closer to appropriate players

var enemyCount = 30 // 100 "seems to be" the max if I want ~60 FPS on the clients when not in debug mode (which is slower)
var spawnRadiusLatitude = 0.015 // 0.015 is about a half mile in the latitude plane (in San Antonio, TX)
var spawnRadiusLongitude = 0.017 // 0.017 is about a half mile in the longitude plane (in San Antonio, TX)
var enemySpeed = 0.15 // The ratio to divide the distance of the zombie to the target player by
var enemyMaxHealth = 4

report() // Give a bit of feedback to show that the server started

setInterval(function() // Post a general update every two seconds and move zombies closer to appropriate players
{
    report()
    if (proximity.length > 1) // Only advance the enemies if there's a player in range to advance to
    {
        advanceEnemies()
    }
}, 2000)

wss.on('connection', function(socket) {
	if (enemies.length > 1) // If there are zombies, send the data to each new client when it connects
	{
		socket.send(JSON.stringify(enemies)) // Initially send the enemies array to the clients
        socket.send(JSON.stringify(players)) // Initially send the players array to the clients
	}

    socket.on('message', function(message) // Do the following whenever the server receives a message
    {
    	var data = JSON.parse(message) // Change the data from JSON to an object

        if (data[0] == 'player')
        {
            if (players.length == 1) // Log the first player on the server
            {
                players.push(data[1])
                console.log('Player connected')
            }
            else // If we're not on an empty server
            {
                for (var i = 1; i < players.length; i++)
                {
                    if (data[1].id == players[i].id) // Don't duplicate the player
                    {
                        break
                    }
                    
                    if (i + 1 == players.length) // Add the player if he doesn't exist
                    {
                        players.push(data[1])
                        console.log('Player connected')
                    }
                }
            }
        }
        else if (data[0] == 'proximity')
        {
            proximity = data
        }
        else if (data[0] == 'damage')
        {
            for (var i = 1; i < enemies.length; i++)
            {
                if (enemies[i].name == data[1].name) // Find the zombie in question in the array
                {
                    if (enemies[i].health > 0)
                    {
                        enemies[i].health -= data[1].damage // Apply damage
                    }

                    if (enemies[i].health < 0)
                    {
                        enemies[i].health = 0 // Fix things if the health drops below zero
                    }

                    if (enemies[i].health > 0)
                    {
                        console.log('A zombie has been shot')
                    }
                    else
                    {
                        console.log('A zombie has been killed')
                    }

                    break
                }
            }
        }

        updateEnemies()
		socket.send(JSON.stringify(enemies)) // Send the enemy array to the clients
        socket.send(JSON.stringify(players)) // Send the updated player array to the clients
    })

    socket.on('error', function(message) // Do the following whenever the server receives an error message
    {
        players.length = 1
        console.log('Recovering from an "error"')
    })

    socket.on('close', function() // Wipe the player database when someone disconnects so it can rebuilt with only active players
    {
    	players.length = 1
    	console.log('Player(s) disconnected')
    })
})

function report()
{
    var liveEnemies = 0

    for (var i = 1; i < enemies.length; i++)
    {
        if (enemies[i].health > 0)
        {
            liveEnemies++
        }
    }

    var date = new Date()
	console.log((players.length - 1) + ' player(s) connected in a world with ' + liveEnemies + ' zombie(s) at ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ' on ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear())
}

function updateEnemies()
{
	if (enemies.length == 1 && players.length > 1) // If we have players but no zombies...
	{
		for (var i = 1; i < enemyCount + 1; i++) // Spawn the number of zombies we defined at the top of the script
		{
            // Spawn in relation to the first player that joined the server
			var latitude = players[1].latitude + ((Math.random() * spawnRadiusLatitude) - (Math.random() * spawnRadiusLatitude))
		    var longitude = players[1].longitude + ((Math.random() * spawnRadiusLongitude) - (Math.random() * spawnRadiusLongitude))

			make('enemy', 'zombie' + i, latitude, longitude, enemyMaxHealth)
		}

        console.log(enemyCount + ' zombie(s) have been spawned')
	}
}

function advanceEnemies()
{
    for (var i = 1; i < proximity.length; i++)
    {
        // Reset the pointer values on each pass
        var enemyPointer = 0
        var playerPointer = 0

        for (var y = 1; y < enemies.length; y++) // Find the zombie in question
        {
            if (enemies[y].name == proximity[i].name)
            {
                enemyPointer = y
                break
            }
        }

        for (var y = 1; y < players.length; y++) // Find the player in question
        {
            if (players[y].id == proximity[i].target)
            {
                playerPointer = y
                break
            }
        }

        if (enemyPointer !== 0 && playerPointer !== 0 && proximity[i].health > 0)
        {
            var ratio = enemySpeed / distance(players[playerPointer].latitude, players[playerPointer].longitude, enemies[enemyPointer].latitude, enemies[enemyPointer].longitude)

            // Move the zombie toward the proper player in the server's "database" before pushing to the player
            enemies[enemyPointer].latitude = enemies[enemyPointer].latitude + ((players[playerPointer].latitude - enemies[enemyPointer].latitude) * ratio)
            enemies[enemyPointer].longitude = enemies[enemyPointer].longitude + ((players[playerPointer].longitude - enemies[enemyPointer].longitude) * ratio)
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
}

function distance(latitude1, longitude1, latitude2, longitude2)
{
    var km = 6371 // Radius of the earth in kilometers
    var distance = Math.acos(Math.sin(latitude1) * Math.sin(latitude2) + 
                   Math.cos(latitude1) * Math.cos(latitude2) *
                   Math.cos(longitude2 - longitude1)) * km
    return distance
}