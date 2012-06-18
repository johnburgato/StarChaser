/**
 * @author BURG2666
 */

function Star(x, y, z, mass, colour, owningVolume) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.mass = mass;
	this.colour = colour;
	
	this.planets = [];
	this.volume = owningVolume;
	
	this.id = "S" + x + y + z; // TODO: generate GUID
}
