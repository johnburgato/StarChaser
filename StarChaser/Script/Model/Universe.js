/**
 * @author BURG2666
 */

function Universe (volumeSize){
	
	this.volumes = [];
	this.volumeSize = volumeSize;
}

Universe.prototype.Generate = function (volumeSize, maxSarsPerVolume) {
	var initial = new SpaceVolume(0,0,0,volumeSize);
	initial.GenerateStars(maxSarsPerVolume);
	this.volumes[initial.GetVolumeId()] = initial;
}

Universe.prototype.AddVolumes = function (curBlockX, curBlockY, curBlockZ) {
	alert('Not implemented');
}

Universe.prototype.GetVolume = function(x, y, z){
	
	var id = x + "_" + y + "_" + z;
	var vol = this.volumes[id];
	return vol;
}
