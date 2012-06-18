/**
 * @author BURG2666
 */

function SpaceVolume(xBlock, yBlock, zBlock, size){
	
	this.xBlock = xBlock;
	this.yBlock = yBlock;
	this.zBlock = zBlock;
	
	this.stars = [];
	
	this.size = size;
	this.minX = this.xBlock * size;
	this.minY = this.yBlock * size;
	this.minZ = this.zBlock * size;
}

SpaceVolume.prototype.GenerateStars = function (maxStars) {
	var noStars = Math.random() * maxStars;
	
	for(var i=0; i<noStars; ++i){
		var x = (Math.random() * this.size) + this.minX;
		var y = (Math.random() * this.size) + this.minY;
		var z = (Math.random() * this.size) + this.minZ;
		
		
		
		var colour = (Math.random() * 0x808080) + 0x808080;
		var mass = (Math.random() * 10) + 10;
		var star = new Star(x, y, z, mass, colour, this);
		this.stars.push(star);
	}
}

SpaceVolume.prototype.GetVolumeId = function(){
	
	return this.xBlock + "_" + this.yBlock + "_" + this.zBlock;
}
