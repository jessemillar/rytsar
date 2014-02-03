// --------------------------------------------------------------
// External scripts
// --------------------------------------------------------------

ejecta.include('images/images.js')
ejecta.include('sounds/sounds.js')

ejecta.include('scripts/backend.js')
ejecta.include('scripts/functions.js')
ejecta.include('scripts/sensors.js')
ejecta.include('scripts/visuals.js')
ejecta.include('scripts/weapons.js')

ejecta.include('scripts/focus/hide.js')
ejecta.include('scripts/focus/show.js')

ejecta.include('scripts/screens/game.js')
	ejecta.include('scripts/screens/draw/game.js')
	ejecta.include('scripts/screens/touches/game.js')
ejecta.include('scripts/screens/gameover.js')
	ejecta.include('scripts/screens/draw/gameover.js')
	ejecta.include('scripts/screens/touches/gameover.js')
ejecta.include('scripts/screens/menu.js')
	ejecta.include('scripts/screens/draw/menu.js')
	ejecta.include('scripts/screens/touches/menu.js')
ejecta.include('scripts/screens/settings.js')
	ejecta.include('scripts/screens/draw/settings.js')
	ejecta.include('scripts/screens/touches/settings.js')

// --------------------------------------------------------------
// Global variables
// --------------------------------------------------------------

var ctx = canvas.getContext('2d')
var centerX = canvas.width / 2
var centerY = canvas.height / 2

var debug = false // Can be toggled by tapping the screen in game mode

var touchX
var touchY

var currentScreen = 'menu'

var grid = new Array() // Keeps track of grid pixel and coordinate positions for use in other functions
var tileSize = 45
var gridWidth = 21 // Make sure the gridsize is always an odd number so there's a tile in the center to start the player in
var gridHeight = gridWidth

var tileSizeMeters = 10
var gpsRequiredAccuracy = 15 // Normally set to 15

var zombies = new Array() // Our local array of zombies
var ammo = new Array() // Locally monitor the objects placed throughout the world
var reeds = new Array() // Keep track of the reeds (plants) in the environment
var vision = new Array() // The things in our field of view
var melee = new Array() // The zombies close enough to be punched

// var renderDistance = 22 // ...in meters
var maxShotDistance = 5 // ...in meters
var minShotDistance = 0 // ...in meters
var damageDistance = 0 // ...in meters
var fieldOfView = 25 // ...in degrees

var totalZombies = 15
var totalAmmo = totalZombies / 3
var totalReeds = totalZombies * 3

var zombieMinHealth = 2
var zombieMaxHealth = 3
var zombieSlowest = 5000 // Longest time possible for zombies to move to a new square
var zombieFastest = 3000 // Shortest time possible for zombies to move to a new square

var slowestAnimation = 800 // The longest time possible between animation frames

// How much ammo can be in a pack
var ammoCountLow = 1
var ammoCountHigh = 3

// How much motion is required for certain actions
var rotateRequiredShoot = 400
var rotateRequiredReload = 500 // Set higher than needed to prevent accidental reloading
var accelRequiredMelee = 50

// Keep the sound effects in line by setting their "length"
var canShoot = true
var canShootServer = true
var timeFire = 300
var timeReload = 1100 // canShoot manages timeReload
var timeCock = 450
var canMelee = true
var timeMelee = 350

var gunCapacity = 6 // Since we have a revolver right now
var shotDamage = 3 // How much damage a bullet deals (change this later to be more dynamic)
var meleeDamage = 10

// General player variables
var playerMaxHealth = 5
var player = new Object()
	player.column = Math.ceil(gridWidth / 2)
	player.row = Math.ceil(gridHeight / 2)
	player.health = playerMaxHealth
	player.magazine = random(0, gunCapacity - 3)
	player.ammo = random(0, 2) // Ammo not in the gun
	player.history = new Array() // Keeps track of where the player's been on the grid

// Color scheme
var white = '#FFFFFF'
var green = '#3D9970'
var black = '#111111'
var blue = '#7FDBFF'
var navy = '#001F3F'
var red = '#FF4136'

// General UI values
var canvasColor = green
var flashColor = red
var debugColor = blue

var darkestNight = 0.5 // The deepest night value possible

var indicatorSpacing = 5 // Used for spacing the health and ammo indicators on the game screen

var menuGridWidth = 19
var menuGridHeight = menuGridWidth
var menuRotation = 0
var menuRotationSpeed = 0.035
var menuTotalZombies = 40
var menuTotalReeds = menuTotalZombies * 2

// Magic numbers ahoy!
var xStats = centerX - canvas.width / 4.5 / 2 - 3.5
var yStats = centerY - canvas.width / 4.5 / 2 - 3.5 - canvas.width / 4.5 - 3.5 * 2
var xSingle = centerX + canvas.width / 4.5 / 2 + 3.5
var ySingle = centerY - canvas.width / 4.5 / 2 - 3.5
var xMulti = centerX - canvas.width / 4.5 / 2 - 3.5
var yMulti = centerY + canvas.width / 4.5 / 2 + 3.5
var xSettings = centerX + canvas.width / 4.5 / 2 + 3.5
var ySettings = centerY + canvas.width / 4.5 / 2 + 3.5 + canvas.width / 4.5 + 3.5 * 2

// --------------------------------------------------------------
// Game "skeleton" (events referencing external functions)
// --------------------------------------------------------------

document.addEventListener('pagehide', function()
{
	focusHide()
})

document.addEventListener('pageshow', function()
{
	focusShow()
})

document.addEventListener('touchstart', function(ev) // Monitor touches throughout the game
{
	touchX = ev.touches[0].pageX
	touchY = ev.touches[0].pageY

	if (currentScreen == 'menu')
	{
		touchesMenu()
	}
	else if (currentScreen == 'game')
	{
		touchesGame()
	}
	else if (currentScreen == 'settings')
	{
		touchesSettings()
	}
	else if (currentScreen == 'gameover')
	{
		touchesGameover()
	}
})

setInterval(function() // Main game loop at 60 frames per second
{
	if (currentScreen == 'menu')
	{
		screenMenu()
	}
	else if (currentScreen == 'game')
	{
		screenGame()
	}
	else if (currentScreen == 'settings')
	{
		screenSettings()
	}
	else if (currentScreen == 'gameover')
	{
		screenGameover()
	}
}, 1000 / 60)