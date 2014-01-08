var ctx = canvas.getContext('2d')
var socket = new WebSocket('ws://www.jessemillar.com:8787') // The global variable we'll use to keep track of the server

var debug = true // Can be toggled by tapping the screen in game mode

var currentScreen = 'menu'

var self = new Array() // The array we push to the server with data about the player/client
	self[0] = 'player'

var data = new Array() // The array we'll use to parse the JSON the server will send to us

var enemies = new Array() // Our local array of zombies
var ammoPacks = new Array() // Locally monitor the objects placed throughout the world
var players = new Array() // Locally keep track of connected players and their coordinates

var proximity = new Array() // The zombies close enough to see/smell us
	proximity[0] = 'proximity'
var vision = new Array() // The things in our field of view
var melee = new Array() // The zombies close enough to be punched

var renderDistance = 50 // Distance in meters
var maxShotDistance = 30 // Distance in meters
var minShotDistance = 10 // Distance in meters
var damageDistance = 5 // Distance in meters
var fieldOfView = 22 // In degrees
var metersToPixels = 4 // ...pixels equals a meter

// How much motion is required for certain actions
var rotateRequiredShoot = 400
var rotateRequiredReload = 500 // Set higher than needed to prevent accidental reloading

var accelRequiredMelee = 35
var canMelee = true
var timeMelee = 350
var meleeDamage = 10

// Keep the sound effects in line by setting their "length"
var canShoot = true
var canShootServer = true
var timeFire = 300
var timeReload = 1100 // canShoot manages timeReload
var timeCock = 450
var canPickup = true
var timePickup = 1000

// General gun variables
var capacity = 6
var magazine = random(0, capacity - 4)
var extraAmmo = random(0, 2)
var shotDamage = 2 // How much damage a bullet deals (change this later to be more dynamic)

var playerMaxHealth = 5

// UI values
var xCenter = canvas.width / 2
var yCenter = canvas.height / 2
var iosRadius = 9
var canvasColor = '#33322d'
var flashColor = '#fff8e3'
var debugColor = '#61737e'
var enemyColor = '#db4105'
var deadColor = '#61737e'
var playerColor = '#fff8e3'
var itemColor = '#9fb4cc'
var ammoColor = '#9fb4cc'
var healthColor = '#db4105'
var indicatorWidth = 15
var indicatorHeight = 7
var indicatorSpacing = 5
var playerSize = 10
var otherPlayerSize = 7
var ammoPackSize = 7
var enemySize = 10
var menuSize = canvas.width / 4.5
var menuSpacing = 3.5
var menuGlyphWidth = menuSize / 3.5
var menuGlyphHeight = menuGlyphWidth * 1.6
var menuGlyphSpacing = menuSize / 24
var menuGlyphColor = canvasColor
var menuEnemyCount = 35
var menuEnemies = new Array()
var menuEnemySpeed = 0.25
var menuEnemySandbox = 50 // The amount of pixels outside the screen that the menu zombies are allowed to go to as a destination
var menuMusicPlaying = false
var menuSfx = 1

var diamondStats = new Array()
var diamondSingle = new Array()
var diamondMulti = new Array()
var diamondPrefs = new Array()

var xStats = xCenter - menuSize / 2 - menuSpacing
var yStats = yCenter - menuSize / 2 - menuSpacing - menuSize - menuSpacing * 2
var xSingle = xCenter + menuSize / 2 + menuSpacing
var ySingle = yCenter - menuSize / 2 - menuSpacing
var xMulti = xCenter - menuSize / 2 - menuSpacing
var yMulti = yCenter + menuSize / 2 + menuSpacing
var xPrefs = xCenter + menuSize / 2 + menuSpacing
var yPrefs = yCenter + menuSize / 2 + menuSpacing + menuSize + menuSpacing * 2