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
						console.log("inVisible unit");
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