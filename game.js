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
function exampleUnitsGeneration(playersNames){
	let un1 = new Unit(playersNames[0], 3, 3);
	let un2 = new Unit(playersNames[0], 3, 4);
	let un3 = new Unit(playersNames[0], 4, 3);
	
	let un4 = new Unit(playersNames[1], 18, 18);
	let un5 = new Unit(playersNames[1], 17, 18);
	let un6 = new Unit(playersNames[1], 18, 17);
	units.push(un1, un2, un3, un4, un5, un6);
}
function getPlayerUnits(playerName){
	// Возвращает всех юнитов указанного игрока
	let units = [];
	for (let i=0; i<units.length; i++)
		if (units[i].owner == playerName)
			units.push(units[i]);
	return units;
}


// Настройки игроков
var players = [new BotFarmer("FarmerBot", "#32cd32"), new BotRandom("RandomBot", "#005000")]; // [bot1, bot2....]
exampleUnitsGeneration([players[0].name, players[1].name]);
var currPlayer = players[0].name; // Who starts the game
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
		if ((players[p].name == currPlayer) && (p != players.length-1)){
			currPlayer = players[p+1].name;
			return;
		}
		else if ((players[p].name == currPlayer) && (p == players.length-1)){
			currPlayer = players[0].name;
			return;
		}
		else{
			continue;
		}
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