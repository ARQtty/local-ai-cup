// Размер игрового поля
var sizeY = field.length;
var sizeX = field[0].length;
var gameProcess;

var DEBUG = false;
var visualDistance = 4;

// Настройка юнитов
var idCounter = 0;
var units = [];
function Unit(player, posX, posY){
	// Класс Юнит
	this.owner = player;
	this.position = {x: posX, y: posY};
	this.id = generateId();
}
function generateId(){
	idCounter++;
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
	// Возвращает всех юнитов указанного игрока
	let units = [];
	for (let i=0; i<units.length; i++)
		if (units[i].owner == playerName)
			units.push(units[i]);
	return units;
}


// Настройки игроков
var currPlayer = "ARQ"; // Who starts the game
var players = [new BotFarmer("FarmerBot", "#32cd32"), new BotRandom("RandomBot", "#005000")]; // [bot1, bot2....]
// Распределение юнитов по игрокам
players[0].units = units.slice(0, 3);
players[1].units = units.slice(3, 6);



// Методы хост-процесса игры
var steps = 0;
var iterationInterval, foodSpawnChance, foodOnStart, warFog, cellSize;
function startGame(){
	// Хост-процесс игры
	loadSettings();

	console.log("Сверху - "+players[0].name);
	console.log("Снизу  - "+players[1].name);
	
	for (let i=0; i<foodOnStart; i++) spawnFood();
	drawGameState();
	
	// Раз в iterationInterval миллисекунд запускается функция, вызывающая метод
	// .step() у игрока, деающего ход
	gameProcess = setInterval(function(){
		for (let p=0; p<players.length; p++){
			if (players[p].name == currPlayer){
				players[p].step();
			}
		}
		if (Math.random() < foodSpawnChance)
			spawnFood();

		drawGameState();
		nextPlayerTurn();
		steps++;
	}, iterationInterval);
}
function relaunchGame(){
	// Перезапускает игру по нажатию кнопки на панели настроек
	clearInterval(gameProcess);
	loadSettings();
	startGame();
}
function loadSettings(){
	// Загружает данные из панели настроек
	iterationInterval = document.getElementById("iterationTime").value;
	foodSpawnChance = document.getElementById("foodSpawnChance").value;
	foodOnStart = document.getElementById("foodOnStart").value;
	cellSize = document.getElementById("cellSize").value;
	warFog = document.getElementById("warFog").checked;
}
// unused
function countPlayersScore(){
	for (let p=0; p<players.length; p++){
		let score = players[p].killed + players[p].eaten;
		if (score > 5){
			console.warn("Игрок "+players[p].name+" победил, достигнув цели по счёту!");
			return false;
		}
	}
	return true;
}
function nextPlayerTurn(){
	// Обновляет очередь игроков ходить
	for (let p=0; p<players.length; p++){
		if ((players[p].name == currPlayer) && (p != players.length-1))
			currPlayer = players[p+1].name;
		else if ((players[p].name == currPlayer) && (p == players.length-1))
			currPlayer = players[0].name;
		else
			console.error("Невозможно построить очередь игроков. Нет игрока после "+currPlayer);
	}
}


// Private
// Внутриигровые методы изменения состояния игры
function getUnitById(id){
	for (let i=0; i<units.length; i++)
		if (units[i].id == id)
			return units[i];
	console.error("Невозможно найти юнита с id "+id);
}
function fedUnit(unit_id){
	// Засчитывает съеденную еду
	for (let p=0; p<players.length; p++)
		if (players[p].name == currPlayer)
			players[p].eaten++;

	console.log("Юнит "+unit_id+" съел еду");
}
function countKillFor(unit_id){
	// Засчитывает убийство боту, чей юнит совершил убийство
	for (let p=0; p<players.length; p++)
		if (players[p].name == currPlayer)
			players[p].kills++;
}
function deleteDeadUnit(unit_id){
	// Актуализирует информацию о живых юнитах. Запускается после смерти юнита на поле
	for (let i=0; i<units.length; i++){
		if (units[i].id == unit_id){
			units = units.slice(0, i).concat(units.slice(i+1, units.length));
			// Обновляет массив units каждого игрока
			for (let p=0; p<players.length; p++){
				try{
					players[p].updateAliveUnits();
				}catch(e){
					console.error("У бота "+players[p].name+"отсутствует метод updateAliveUnits()");
				}
			}
		}
	}
}
function spawnFood(){
	// Кладёт еду в случайную клетку поля. Если невозможно нарандомить пустую клетку, запускается ещё раз
	let x = Math.round(Math.random()*(sizeX-1));
	let y = Math.round(Math.random()*(sizeY-1));

	if (isFree(x, y) && !isUnit(x, y))
		field[y][x] = "F";
	else
		spawnFood();
}
function isUnit(posX, posY){
	// Проверяет наличие юнита в клетке. Если он есть, возвращает объект с этим юнитом
	for (let i=0; i<units.length; i++)
		if ((units[i].position.x == posX) && (units[i].position.y == posY))
			return units[i];
}


// Public
// Для изменения ботами состояния игры
function moveUp(unit_id){
	let unit = getUnitById(unit_id);
	if (unit.owner != currPlayer){
		console.error("Невозможно подвинуть юнита "+unit_id+". Сейчас не ход "+currPlayer);
	}else{
		if (isFree(unit.position.x, unit.position.y-1)){
			for (let i=0; i<units.length; i++)
				if (units[i].id == unit_id){
					units[i].position.y--;
				}
		}else{
			if (DEBUG)
				console.log("Невозможно подвинуть юнита "+unit_id+". Клетка ("+unit.position.x+","+(unit.position.y-1)+") занята");
		}
	}
}
function moveDown(unit_id){
	let unit = getUnitById(unit_id);
	if (unit.owner != currPlayer){
		console.error("Невозможно подвинуть юнита "+unit_id+". Сейчас не ход "+currPlayer);
	}else{
		if (isFree(unit.position.x, unit.position.y+1)){
			for (let i=0; i<units.length; i++)
				if (units[i].id == unit_id)
					units[i].position.y++;
		}else{
			if (DEBUG)
				console.log("Невозможно подвинуть юнита "+unit_id+". Клетка ("+unit.position.x+","+(unit.position.y+1)+") занята");
		}
	}
}
function moveLeft(unit_id){
	let unit = getUnitById(unit_id);
	if (unit.owner != currPlayer){
		console.error("Невозможно подвинуть юнита "+unit_id+". Сейчас не ход "+currPlayer);
	}else{
		if (isFree(unit.position.x-1, unit.position.y)){
			for (let i=0; i<units.length; i++)
				if (units[i].id == unit_id)
					units[i].position.x--;
		}else{
			if (DEBUG)
				console.log("Невозможно подвинуть юнита "+unit_id+". Клетка ("+(unit.position.x-1)+","+unit.position.y+") занята");
		}
	}
}
function moveRight(unit_id){
	let unit = getUnitById(unit_id);
	if (unit.owner != currPlayer){
		console.error("Невозможно подвинуть юнита "+unit_id+". Сейчас не ход "+currPlayer);
	}else{
		if (isFree(unit.position.x+1, unit.position.y)){
			for (let i=0; i<units.length; i++)
				if (units[i].id == unit_id)
					units[i].position.x++;
		}else{
			if (DEBUG)
				console.log("Невозможно подвинуть юнита "+unit_id+". Клетка ("+(unit.position.x+1)+","+unit.position.y+") занята");
	}
}
function eatFood(unit_id, foodPos) {
	let unit = getUnitById(unit_id);
	if (unit.owner != currPlayer){
		console.error("Невозможно съесть еду юнитом "+unit_id+". Сейчас не ход "+currPlayer);
	}else{
		if (isFood(foodPos.x, foodPos.y) && dist(unit.position, foodPos) == 1){
			field[foodPos.x][foodPos.y] = 0;
			fedUnit(unit_id);
		}else{
			if (dist(unit.position, foodPos) >1){
				console.error("Слишком большая дистанция для поедания юнитом "+unit_id+" еды в клетке ("+foodPos.x+","+foodPos.y+"). Дистанция="+dist(unit.position, foodPos));
			}else
				console.error("Невозможно съесть юнитом "+unit_id+". Нет еды в клетке ("+foodPos.x+","+foodPos.y+")");
		}
	}
}
function attackUnit(unit_id, enemy_unit_id) {
	let unit = getUnitById(unit_id);
	let enemy= getUnitById(enemy_unit_id);
	if (unit.owner != currPlayer){
		console.error("Невозможно атаковать юнитом "+unit_id+" юнита "+enemy_unit_id+". Сейчас не ход "+currPlayer);
	}else{
		if (dist(unit.position, enemy.position) <= 1){
			countKillFor(unit_id);
			console.log("Юнит "+unit_id+" убил юнита "+enemy_unit_id);
			deleteDeadUnit(enemy_unit_id);
		}else{
			console.error("Слишком большая дистанция для атаки юнитом "+unit_id+" юнита "+enemy_unit_id);
		}
	}
}


// Public
// Для получения ботами информации о мире
function dist(pos1, pos2) {
	// Расстояние от от одной клетки до другой (в клетках пути)
	return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}
function inField(posX, posY) {
	// Используется в isFree(), isFood() и inVisible() для избежания выхода за границы массива
	
	if ((posX >= 0) && (posY >= 0) && (posX < sizeX) && (posY < sizeY))
		return true;
}
function isFree(posX, posY) {
	// Проверяет доступность клетки для шага в неё. Не проверяет наличие юнита в ней!
	
	if (inField(posX, posY) && (field[posX][posY] == 0)){
		for (let i=0; i<units.length; i++){
			if ((units[i].position.x == posX) && (units[i].position.y == posY))
				return false;
		}
	   	return true;
	}
}
function isFood(posX, posY) {
	// Проверяет клетку с указанными координатами на наличие еды
	
	// F is food
	if (inField(posX, posY) && (field[posX][posY] == "F"))
		return true;
}
function inVisible(unit_id) {
	// Возвращает список объектов в окрестности Фон Неймана
	
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
		console.error("Невозможно получить видимое "+unit_id+". Сейчас не ход "+currPlayer);
	}else{
		let visibleObjs = [];
		for (let i=-visualDistance; i<=visualDistance; i++){
			for (let j=-visualDistance; j<=visualDistance; j++){
				// TODO заменить на BFS
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
