// TODO make it dinamically
// var cellSize = 25;
var subscribeUnits = true;

function drawGameState(){
	drawGameField();
	drawGameUnits();
	drawGameFood();
	if (warFog === true)
		drawGameWarFog();
}

function drawGameField(){
	ctx.beginPath();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "pink";
	ctx.strokeStyle = "black";
	ctx.lineWidth = 0.3;
	ctx.rect(0, 0, sizeX*cellSize, sizeY*cellSize);
	ctx.fill();
	

	let j=0;
	for (let i=0; i<sizeX; i++){
		ctx.moveTo(i*cellSize, 0);
		ctx.lineTo(i*cellSize, cellSize*sizeY);
		
		if (j < sizeY){
			ctx.moveTo(0, j*cellSize);
			ctx.lineTo(cellSize*sizeX, j*cellSize);
			j++;
		}
	}
	ctx.stroke();


	ctx.beginPath();
	ctx.fillStyle = "brown";

	j=0;
	for (let i=0; i<sizeX; i++){
		for (let j=0; j<sizeX; j++){
			if (field[i][j] == 1){
				// Стена
				ctx.rect(i*cellSize, j*cellSize, cellSize, cellSize);
			}
		}
	}
	ctx.fill();
}

function drawGameWarFog(){
	let transparencyMap = [];
	for (let i=0; i<sizeY; i++){
		transparencyMap.push([]);
		for (let j=0; j<sizeX; j++){
			transparencyMap[i].push(0);
		}
	}

	for (let u=0; u<units.length; u++){
		for (let i=-visualDistance; i<=visualDistance; i++){
			for (let j=-visualDistance; j<=visualDistance; j++){
				if (Math.abs(j) + Math.abs(i) < visualDistance){
					let currX = units[u].position.x + i;
					let currY = units[u].position.y + j;

					if ((currX >= 0) && (currX < sizeX) && (currY >= 0) && (currY < sizeY)){
						transparencyMap[currX][currY] = 1;
					}
				}
			}
		}
	}

	ctx.beginPath();
	ctx.fillStyle = "grey";
	ctx.globalAlpha = 0.3;
	for (let i=0; i<sizeY; i++){
		for (let j=0; j<sizeX; j++){
			if (!transparencyMap[i][j]){
				ctx.rect(i*cellSize, j*cellSize, cellSize, cellSize);
			}
		}
	}
	ctx.fill();
	ctx.globalAlpha = 1;
}

function drawGameUnits(){
	for (let player=0; player<players.length; player++){
		ctx.fillStyle = players[player].color;
		for (let i=0; i<players[player].units.length; i++){
			let unit = players[player].units[i];
			if (unit.owner == players[player].name){
				let cellCenter_ds = Math.round(cellSize/2);
				ctx.beginPath();
				ctx.arc(unit.position.x*cellSize + cellCenter_ds,
						unit.position.y*cellSize + cellCenter_ds,
						cellSize/2.5, 0, 2*Math.PI, false);
				ctx.fill();
				if (subscribeUnits){
					ctx.beginPath();
					ctx.font = Math.round(cellSize/2.3)+"px Arial";
					ctx.strokeStyle = "white";
					ctx.strokeText(unit.id, unit.position.x*cellSize + cellCenter_ds/2,
									  		unit.position.y*cellSize + cellCenter_ds*1.3);
				}
			}
		}
	}
}

function drawGameFood(){
	ctx.beginPath();
	for (let f=0; f<sizeX*sizeY; f++){
		ctx.fillStyle = "red";
		let cellCenter_ds = Math.round(cellSize/3);
		
		let y = Math.round(f / sizeY);
		let x = f % sizeY;
		if (isFood(x, y)){
			// console.log("Food "+x+" "+y+" field("+x+","+y+")="+field[y][x]);
			ctx.rect(x*cellSize+cellCenter_ds, y*cellSize+cellCenter_ds,
					 cellCenter_ds, cellCenter_ds);
		}
	}
	ctx.fill();
}