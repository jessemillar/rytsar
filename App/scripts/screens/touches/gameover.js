function touchesGameover()
{
	zombies.length = 0 // Wipe the zombie database so we can start playing with "real" zombies
	ammo.length = 0 // Kill the ammo packs
	currentScreen = 'game'
}