// Game field is rectangle with size N
var sizeY = field.length;
var sizeX = field[0].length;

var gameProcess;
var DEBUG = false;

// Units service code
var idCounter = 0;
var units = [];
function Unit(player, posX, posY){
	this.owner = player;
	this.position = {x: posX, y: posY};
	this.killed = 0;
	this.eaten  = 0;
	this.id = generateId();
}
function generateId(){
	idCounter++;
	// console.log(idCounter);
	return "u" + idCounter;
}
(function exampleUnitsGeneration(){
	let un1 = new Unit("ARQ", 3, 3);
	let un2 = new Unit("ARQ", 3, 4);
	let un3 = new Unit("ARQ", 4, 3);
	
	let un4 = new Unit("Guest", 18, 18);
	let un5 = new Unit("Guest", 17, 18);
	let un6 = new Unit("Guest", 18, 17);
	units.push(un1, un2, un3, un4, un5, un6);
})();
function getPlayerUnits(playerName){
	let units = [];
	for (let i=0; i<units.length; i++)
		if (units[i].owner == playerName)
			units.push(units[i]);
	return units;
}


// Players service code
var currPlayer = "ARQ"; // Who starts the game
var players = [new BotFarmer("ARQ", "#32cd32"), new BotRandom("Guest", "#005000")]; // [bot1, bot2....]
// Distributing units to players
players[0].units = units.slice(0, 3);
players[1].units = units.slice(3, 6);



// Game service code
var steps = 0;
var iterationInterval, foodSpawnChance, foodOnStart, cellSize;
function startGame(){
	// Game main loop
	loadSettings();

	console.log("On top - "+players[0].strategyName);
	console.log("On bottom - "+players[1].strategyName);
	
	for (let i=0; i<foodOnStart; i++) spawnFood();
	drawGameState();
	
	gameProcess = setInterval(function(){
		for (let p=0; p<players.length; p++){
			if (players[p].name == currPlayer){
				players[p].step();
			}
		}
		if (Math.random() < foodSpawnChance)
			spawnFood();

		drawGameState();
		currPlayer = (currPlayer == "ARQ")? "Guest" : "ARQ";
		steps++;
	}, iterationInterval);
}
function relaunchGame(){
	clearInterval(gameProcess);
	loadSettings();
	startGame();
}
function loadSettings(){
	iterationInterval = document.getElementById("iterationTime").value;
	foodSpawnChance = document.getElementById("foodSpawnChance").value;
	foodOnStart = document.getElementById("foodOnStart").value;
	cellSize = document.getElementById("cellSize").value;
}
function countPlayersScore(){
	for (let p=0; p<players.length; p++){
		let score = players[p].killed + players[p].eaten;
		if (score > 5){
			console.warn("Player "+players[p].name+" wins by score!");
			return false;
		}
	}
	return true;
}



// Private
// Methods for change game data throgh the game
function getUnitById(id){
	for (let i=0; i<units.length; i++)
		if (units[i].id == id)
			return units[i];
	console.error("Cant find unit with id " + id);
}
function fedUnit(unit_id){
	for (let i=0; i<units.length; i++)
		if (units[i].id ==	unit_id)
			units[i].eaten++;

	for (let p=0; p<players.length; p++)
		if (players[p].name == currPlayer)
			players[p].eaten++;

	console.log("Unit "+unit_id+" fed");
}
function countKillFor(unit_id){
	for (let i=0; i<units.length; i++)
		if (units[i].id == unit_id)
			units[i].killed++;

	for (let p=0; p<players.length; p++)
		if (players[p].name == currPlayer)
			players[p].kills++;
}
function deleteDeadUnit(unit_id){
	for (let i=0; i<units.length; i++){
		if (units[i].id == unit_id){
			units = units.slice(0, i).concat(units.slice(i+1, units.length));
			for (let p=0; p<players.length; p++){
				try{
					players[p].updateAliveUnits();
				}catch(e){
					console.error("Cant find "+players[p].name+"'s method updateAliveUnits()");
				}
			}
		}
	}
}
function spawnFood(){
	let x = Math.round(Math.random()*(sizeX-1));
	let y = Math.round(Math.random()*(sizeY-1));
	// console.log(x, y)
	if (isFree(x, y) && !isUnit(x, y))
		field[y][x] = "F";
	else
		spawnFood();
}
function isUnit(posX, posY){
	for (let i=0; i<units.length; i++)
		if ((units[i].position.x == posX) && (units[i].position.y == posY))
			return units[i];
}


// Public
// Game statements are change with basic actions of units
// Bots are interrating with game by these methods
function moveUp(unit_id){
	let unit = getUnitById(unit_id);
	if (unit.owner != currPlayer){
		console.error("Cant move unit "+unit_id+" course its not "+currPlayer+"'s step");
	}else{
		if (isFree(unit.position.x, unit.position.y-1)){
			for (let i=0; i<units.length; i++)
				if (units[i].id == unit_id){
					units[i].position.y--;
				}
		}else{
			if (DEBUG)
				console.log("Cant move unit "+unit_id+" course of cell is not empty");
		}
	}
}
function moveDown(unit_id){
	let unit = getUnitById(unit_id);
	if (unit.owner != currPlayer){
		console.error("Cant move unit "+unit_id+" course its not "+currPlayer+"'s step");
	}else{
		if (isFree(unit.position.x, unit.position.y+1)){
			for (let i=0; i<units.length; i++)
				if (units[i].id == unit_id)
					units[i].position.y++;
		}else{
			if (DEBUG)
				console.log("Cant move unit "+unit_id+" course of cell is not empty");
		}
	}
}
function moveLeft(unit_id){
	let unit = getUnitById(unit_id);
	if (unit.owner != currPlayer){
		console.error("Cant move unit "+unit_id+" course its not "+currPlayer+"'s step");
	}else{
		if (isFree(unit.position.x-1, unit.position.y)){
			for (let i=0; i<units.length; i++)
				if (units[i].id == unit_id)
					units[i].position.x--;
		}else{
			if (DEBUG)
				console.log("Cant move unit "+unit_id+" course of cell is not empty");
		}
	}
}
function moveRight(unit_id){
	let unit = getUnitById(unit_id);
	if (unit.owner != currPlayer){
		console.error("Cant move unit "+unit_id+" course its not "+currPlayer+"'s step");
	}else{
		if (isFree(unit.position.x+1, unit.position.y)){
			for (let i=0; i<units.length; i++)
				if (units[i].id == unit_id)
					units[i].position.x++;
		}else{
			if (DEBUG)
				console.log("Cant move unit "+unit_id+" course of cell is not empty");
		}
	}
}
function eatFood(unit_id, foodPos) {
	let unit = getUnitById(unit_id);
	if (unit.owner != currPlayer){
		console.error("Cant eat foot with unit "+unit_id+" course its not "+currPlayer+"'s step");
	}else{
		if (isFood(foodPos.x, foodPos.y) && dist(unit.position, foodPos) == 1){
			field[foodPos.x][foodPos.y] = 0;
			fedUnit(unit_id);
		}else{
			if (dist(unit.position, foodPos) >1){
				console.error("Cant eat foot with unit "+unit_id+" course food at ("+foodPos.x+","+foodPos.y+") is too far (dist "+dist(unit.position, foodPos));
			}else
				console.error("Cant eat foot with unit "+unit_id+" course there is no food at ("+foodPos.x+","+foodPos.y+")");
		}
	}
}
function attackUnit(unit_id, enemy_unit_id) {
	let unit = getUnitById(unit_id);
	let enemy= getUnitById(enemy_unit_id);
	if (unit.owner != currPlayer){
		console.error("Cant attack with unit "+unit_id+" course its not "+currPlayer+"'s step");
	}else{
		if (dist(unit.position, enemy.position) <= 1){
			countKillFor(unit_id);
			console.log("Unit "+unit_id+" killed unit "+enemy_unit_id);
			deleteDeadUnit(enemy_unit_id);
		}else{
			console.error("Distance to attack with unit "+unit_id+" is too much to attack");
		}
	}
}


// Public
// Bots can borrow information about world by these methods
function dist(pos1, pos2) {
	return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + 
					 Math.pow(pos1.y - pos2.y, 2));
}
function inField(posX, posY) {
	// Used in isFree(), isFood() and inVisible() methods to avoid indexing to negative cells
	
	if ((posX >= 0) && (posY >= 0) && (posX < sizeX) && (posY < sizeY))
		return true;
}
function isFree(posX, posY) {
	// Checks availability of position with coordinates (x, y) to move into
	// Warning! Doesn't check for placing enemy unit in this cell
	
	if (inField(posX, posY) && (field[posX][posY] == 0)){
		for (let i=0; i<units.length; i++){
			// console.log("unit with pos ",units[i].position);
			if ((units[i].position.x == posX) && (units[i].position.y == posY))
				return false;
		}
	   	return true;
	}
}
function isFood(posX, posY) {
	// Checks the cell with coordinates (posX, posY) for food
	
	// F is food
	if (inField(posX, posY) && (field[posX][posY] == "F"))
		return true;
}
function inVisible(unit_id) {
	// Returns list of all objects in neighborhood (units and food)
	
	// Food object example 
	// {
	//  type: "food",
	//  position: {x: 2, y: 3}
	// }
	
	// Unit object example
	// {
	//  type: "unit",
	//  position: {x: 2, y: 3},
	//  owner: "ARQ"
	// }

	// Von Neumann neighborhood
	// ##########
	// ####.#####
	// ###...####
	// ##.....###
	// #...X...##
	// ##.....###
	// ###...####
	// ####.#####
	// ########## 
	let unit = getUnitById(unit_id);
	if (unit.owner != currPlayer){
		console.error("Cant get vision with unit "+unit_id+" course its not "+currPlayer+"'s step");
	}else{
		let visDist = 5;
		let visibleObjs = [];
		for (let i=-visDist; i<=visDist; i++){
			for (let j=-visDist; j<=visDist; j++){
				// console.log("In field", i, j, ((j == 0) && (i == 0)));
				if ((j == 0) && (i == 0) || (Math.abs(j) + Math.abs(i) > 3)){
					continue;
				}
				let currX = unit.position.x + i;
				let currY = unit.position.y + j;
				if (inField(currX, currY)){
					if (field[currX][currY] == "F"){
						visibleObjs.push({type: "food", 
										  position: {x: currX, y: currY}});
					}else if (isUnit(i, j)){
						let someUnit = isUnit(i, j);
						visibleObjs.push({type: "unit",
										  position: {x: someUnit.position.x, 
										  			 y: someUnit.position.y},
										  owner: someUnit.owner});
					}
				}
			}
		}
		return visibleObjs;
	}
}
