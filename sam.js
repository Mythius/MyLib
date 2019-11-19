var SAM = function(grid,obj,w,h,a=['middle','center']){
	var dim = grid.getDimensions();
	var go = grid.getObject();
	var ox = go.offsetLeft,oy = go.offsetTop;
	var x = 1,y = 1;

	var ai_algor;

	obj.style.position='absolute';
	obj.style.transition='left .3s, top .3s linear'; 
	obj.style.width=w+'px';
	obj.style.height=h+'px';
	setPos(x,y);

	function moveTo(x,y){
		obj.style.left=x+'px';
		obj.style.top=y+'px';
	}
	function setPos(xp,yp){
		x=xp;
		y=yp;
		let ax,ay;
		if(a.includes('left')) {
			ax = ox+(x-1)*dim.t;
		} else if(a.includes('right')) {
			ax = ox+(x-1)*dim.t + dim.t - w;
		} else {
			ax = ox+(x-1)*dim.t-(dim.t-w/2);
		}
		if(a.includes('top')) {
			ay = oy+(y-1)*dim.t;
		} else if(a.includes('bottom')) {
			ay = oy+(y-1)*dim.t + dim.t - h;
		} else {
			ay = oy+(y-1)*dim.t-(dim.t-h/2);
		}
		console.log(ax,ay);
		moveTo(ax,ay);
	}
	this.obj = obj;
	this.getPosition = function(){
		return {x:x,y:y};
	};
	this.goTo = function(x,y){
		setPos(x,y);
	};
	this.addControls = function(c,cond){
		document.on('keydown',function(e){
			let handled=true;
			switch(e.keyCode){
				case c[0]: if (typeof cond != 'function'||cond(x,y-1,'u')) y--; break;
				case c[1]: if (typeof cond != 'function'||cond(x,y+1,'d')) y++; break;
				case c[2]: if (typeof cond != 'function'||cond(x-1,y,'l')) x--; break;
				case c[3]: if (typeof cond != 'function'||cond(x+1,y,'r')) x++; break;
				default: handled=false;
			}
			if(handled){
				e.preventDefault();
				setPos(x,y);
			} 
		});
	};
	this.addAI = function(fn){
		ai_algor=fn;
	};
	this.step = function(info){
		var dir = ai_algor(info);
		x += dir.x;
		y += dir.y;
		setPos(x,y);
	}
	function getDims(){
		return obj.getBoundingClientRect();
	}
	this.touching = function(sprite){
		let d1 = getDims();
		let d2 = sprite.getDimensions();
		let ox = Math.abs(d1.x - d2.x) < (d1.x < d2.x ? d2.width : d1.width);
		let oy = Math.abs(d1.y - d2.y) < (d1.y < d2.y ? d2.height : d1.height);
		return ox && oy;
	}
	this.getDimensions = getDims;
}