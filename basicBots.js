var abs = Math.abs;

function BotPasser(name, color){
	// Do nothing
	this.name = name;
	this.color = color;
	this.strategyName = "Passer Bot";
	this.kills = 0;
	this.eaten = 0;
	this.units = [];

	this.step = function(){
		return;
	}

	this.__updateAliveUnits = function(){};
}


function BotRandom(name, color){
	// Walks in random direction

	this.name = name;
	this.strategyName = "Random Bot";
	this.color = color;
	this.kills = 0;
	this.eaten = 0;
	this.units = [];

	this.step = function(){
		let actions = [moveUp, moveDown, moveLeft, moveRight];
		let randomActIndex = Math.round(Math.random()*3);
		let randomUnitIndex = Math.round(Math.random()*(this.units.length-1));
		// console.log(randomActIndex, randomUnitIndex);
		actions[randomActIndex](this.units[randomUnitIndex].id);
	}

	this.__updateAliveUnits = function(){};
}


function BotFarmer(name, color){
	// Walks in random direction. If see some food it will go and eat food

	this.name = name;
	this.strategyName = "Farmer Bot";
	this.color = color;
	this.kills = 0;
	this.eaten = 0;
	this.units = [];

	this.step = function(){
		// Take the unit who is the most close to food and move him
		// In other cases, move randomly
		let closestFoodUnit = null;
		let closestFoodDist = 99999;
		let closestFoodPos = null;

		for (let u=0; u<this.units.length; u++){
			let unit = this.units[u];
			// For every visible object
			let objects = inVisible(unit.id);

			for (let q=0; q<objects.length; q++){
				let object = objects[q];
				if ((object.type == "food") && (dist(unit.position, object.position) < closestFoodDist)){
					closestFoodDist = dist(unit.position, object.position);
					closestFoodPos  = object.position;
					closestFoodUnit = unit;
				}
			}
		}

		if (closestFoodPos){
			if (closestFoodDist == 1)
				eatFood(closestFoodUnit.id, closestFoodPos);
			else
				this.moveToFood(closestFoodUnit, closestFoodPos);
		}else{
			// If there is no food near
			let actions = [moveUp, moveDown, moveLeft, moveRight];
			let randomActIndex = Math.round(Math.random()*3);
			let randomUnitIndex = Math.round(Math.random()*(this.units.length-1));
			actions[randomActIndex](this.units[randomUnitIndex].id);
		}
	}

	this.moveToFood = function(unit, foodPos){
		let dx = foodPos.x - unit.position.x;
		let dy = foodPos.y - unit.position.y;

		if (abs(dx) >= abs(dy)){
			// horizontal moving
			if (dx > 0){
				moveRight(unit.id);
				return;
			}else{
				moveLeft(unit.id);
				return;
			}
		}else{
			// vertical moving
			if (dy > 0){
				moveDown(unit.id);
				return;
			}else{
				moveUp(unit.id);
				return;
			}
		}
	}

	this.__updateAliveUnits = function(){};
}