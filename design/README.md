The purpose of Rytsar is to engage audiences in a collaborative game environment that urges them to get outside their houses and interact with the real world through digital means. In Rytsar, players assume the role of a knight. The player's purpose is to claim territory for their king and earn gold for their land. Doing so brings them honor.

The art design will be based off a steampunk knight-in-shining-armor style a la [this forum post](http://forums.cgsociety.org/showpost.php?p=5578927&postcount=10).

The game will, at set intervals, spawn loot chests in random locations located within a certain radius of players. Around these loot chests will be hoards of monsters. There will be at least a few types of monsters. The player will attempt to clear the hoards and access the loot using their steampunk crossbow/revolver.

Players will move through the game via the GPS chip embedded in their phones. This chip can only guarantee accuracy to twenty meters which prohibits true multiplayer. Instead of viewing other players on their devices, players will share loot locations and claim territory together fighting off waves of monsters spawned on each individual phones.

A central database will be needed to manage loot locations and player usernames/money/territory totals (this is all that will be synced). This database will be SQL, accessed via a phpMyAdmin web interface, and modified via RESTful endpoints managed by a Go microservice running on a DigitalOcean droplet.

The current code base is written in JavaScript (which didn't run well in a native environment despite the Internet's promises two years ago) and has a different, zombie-based theme. The project will be reworked and rewritten in Swift and compiled natively for iOS devices.
