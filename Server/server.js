var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 8787})

var enemies = new Array()
    enemies[0] = 'enemies'
var ammoPacks = new Array()
    ammoPacks[0] = 'ammo'
var players = new Array()
    players[0] = 'players'

var proximity = new Array() // The array we'll use to move zombies closer to appropriate players

var enemyCount = 10 // 100 "seems to be" the max if I want ~60 FPS on the clients when not in debug mode (which is slower)
var enemySpeed = 0.25 // ...meter(s) per 1/4 second
var enemyMaxHealth = 4

var spawnRadius = 200 // ...meters
var spawnLatitude = 0 // Set later on
var spawnLongitude = 0 // Set later on

var ammoPackCount = 800
var maxAmmoDrop = 4

console.log('Server started')

setInterval(function() // Post a general update every second and move zombies closer to appropriate players
{
    report() // Post some information to the debug console
    if (proximity.length > 1 && players.length > 1) // Only advance the enemies if there's a player in range to advance to
    {
        advanceEnemies()
    }
}, 250)

wss.on('connection', function(socket) // Monitors connections for each client that connects...?
{
    socket.on('message', function(message) // Do the following whenever the server receives a message...
    {
    	var data = JSON.parse(message) // Ejecta only sends data as strings so change the string to an object

        if (data == 'genocide')
        {
            if (enemies.length > 1)
            {
                enemies.length = 1 // Wipe the zombie "database"
                console.log('Every zombie just died')
                spawn() // Respawn zombies if we have at least one player logged in
            }
        }
        else if (data[0] == 'player') // If the message type is data about a player...
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
                    if (data[1].id == players[i].id) // Don't duplicate players
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
        else if (data[0] == 'proximity') // If a client is sending data about which zombies are close to him...
        {
            proximity = data
        }
        else if (data[0] == 'pickup') // If a client is sending data about which zombies are close to him...
        {
            for (var i = 1; i < ammoPacks.length; i++)
            {
                if (ammoPacks[i].name == data[1].name)
                {
                    ammoPacks.splice(i, 1)
                    console.log('An ammo pack has been picked up')
                    break
                }
            }
        }
        else if (data[0] == 'damage') // If a player shot a zombie...
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

        if (players.length > 1) // If we have players...
        {
            if (enemies.length == 1) // Spawn zombies if we have none
            {
                spawn()
            }

            socket.send(JSON.stringify(enemies)) // Send the enemy array to the client
            socket.send(JSON.stringify(ammoPacks)) // Send the ammo pack locations and amounts to the client
            socket.send(JSON.stringify(players)) // Send the updated player array to the client
        }
    })

    socket.on('error', function(message) // Do the following whenever the server receives an "error" message
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
	console.log((players.length - 1) + ' player(s) connected in a world with ' + liveEnemies + ' zombie(s) and ' + (ammoPacks.length - 1) + ' ammo pack(s) at ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ' on ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear())
}

function make(markerKind, markerName, markerLatitude, markerLongitude, markerHealth)
{
    // Make something from the function's values
    var something = new Object()
        something.name = markerName
        something.latitude = markerLatitude
        something.longitude = markerLongitude
        something.health = markerHealth
        
    // Push these values to the appropriate database array
    if (markerKind == 'enemy')
    {
        enemies.push(something)
    }
    else if (markerKind == 'ammo')
    {
        ammoPacks.push(something)
    }   
}

function spawn() // Spawn stuff in relation to the first player that joined the server
{
    spawnLatitude = 0
    spawnLongitude = 0

    while (spawnRadius > distance(players[1].latitude, players[1].longitude, players[1].latitude + spawnLatitude, players[1].longitude)) // Find spawnLatitude
    {
        spawnLatitude += 0.001
    }

    while (spawnRadius > distance(players[1].latitude, players[1].longitude, players[1].latitude, players[1].longitude + spawnLongitude)) // Find spawnLongitude
    {
        spawnLongitude += 0.001
    }

    for (var i = 1; i < ammoPackCount + 1; i++) // Spawn the number of ammo packs we defined at the top of the script
    {
        var lat = random(players[1].latitude - spawnLatitude, players[1].latitude + spawnLatitude)
        var lon = random(players[1].longitude - spawnLongitude, players[1].longitude + spawnLongitude)

        make('ammo', 'pack' + i, lat, lon, random(1, maxAmmoDrop))
    }
    console.log(ammoPackCount + ' ammo packs(s) have been spawned')

	for (var i = 1; i < enemyCount + 1; i++) // Spawn the number of zombies we defined at the top of the script
	{
		var lat = random(players[1].latitude - spawnLatitude, players[1].latitude + spawnLatitude)
	    var lon = random(players[1].longitude - spawnLongitude, players[1].longitude + spawnLongitude)

		make('enemy', 'zombie' + i, lat, lon, enemyMaxHealth)
	}
    console.log(enemyCount + ' zombie(s) have been spawned')
}

function advanceEnemies()
{
    for (var i = 1; i < proximity.length; i++)
    {
        // Reset the pointer values on each pass
        var enemyPointer = 0 // Find the zombie in the enemy array
        var playerPointer = 0 // Find the player in the player array

        for (var y = 1; y < enemies.length; y++) // Find the zombie
        {
            if (enemies[y].name == proximity[i].name)
            {
                enemyPointer = y
                break
            }
        }

        for (var y = 1; y < players.length; y++) // Find the player
        {
            if (players[y].id == proximity[i].target)
            {
                playerPointer = y
                break
            }
        }

        if (proximity[i].health > 0)
        {
            var ratio = enemySpeed / distance(players[playerPointer].latitude, players[playerPointer].longitude, enemies[enemyPointer].latitude, enemies[enemyPointer].longitude)

            // Move the zombie toward the proper player in the server's "database" before pushing to the player
            enemies[enemyPointer].latitude = enemies[enemyPointer].latitude + ((players[playerPointer].latitude - enemies[enemyPointer].latitude) * ratio)
            enemies[enemyPointer].longitude = enemies[enemyPointer].longitude + ((players[playerPointer].longitude - enemies[enemyPointer].longitude) * ratio)
        }
    }
}

function random(min, max)
{
    return Math.random() * (max - min) + min
}

Number.prototype.toRad = function()
{
    return this * Math.PI / 180
}

Number.prototype.toDeg = function()
{
    return this * 180 / Math.PI
}

function distance(lat1, lon1, lat2, lon2) // Returns distance in meters
{
    var radius = 6371000
    var dLat = (lat2 - lat1).toRad()
    var dLon = (lon2 - lon1).toRad()
    var lat1 = lat1.toRad()
    var lat2 = lat2.toRad()

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    var d = radius * c
    return d
}