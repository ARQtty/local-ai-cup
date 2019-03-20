// TODO make it dinamically
// var cellSize = 25;
var subscribeUnits = true;

function drawGameState(){
	drawGameField();
	drawGameUnits();
	drawGameFood();		
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
	// console.log("drawed");
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