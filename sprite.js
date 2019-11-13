function Sprite(element){
	element.classList.add('sprite');

	var x = 0;
	var y = 0;
	var speed = 10;

	function move(cx,cy){
		x += cx;
		y += cy;
		element.style.left = x + 'px';
		element.style.top = y + 'px';
	}
	function moveTo(tx,ty){
		x = tx;
		y = ty;
		element.style.left = x + 'px';
		element.style.top = y + 'px';
	}
	function getDims(){
		return element.getBoundingClientRect();
	}
	this.touching = function(sprite){
		let d1 = getDims();
		let d2 = sprite.getDimensions();
		let ox = Math.abs(d1.x - d2.x) < (d1.x < d2.x ? d2.width : d1.width);
		let oy = Math.abs(d1.y - d2.y) < (d1.y < d2.y ? d2.height : d1.height);
		return ox && oy;
	}
	this.movement = function(keys){
		if(keys[0]) move(0,-speed);
		if(keys[1]) move(0,speed);
		if(keys[2]) move(-speed,0);
		if(keys[3]) move(speed,0);
	}
	this.moveTo = moveTo;
	this.getDimensions = getDims;
}