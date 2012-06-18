var ParticleIntesector = new function(){

	function distanceFromIntersection( origin, direction, position ) {

		var v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
		var dot, intersect, distance;

		v0.sub( position, origin );
		dot = v0.dot( direction );

		intersect = v1.add( origin, v2.copy( direction ).multiplyScalar( dot ) );
		distance = position.distanceTo( intersect );

		return distance;
	}


	this.GetIntersection2 = function(ray, systems){
		
		var intersect, intersects = [];
		
		for(var i=0;i<systems.length;i++){
            for(var j=0;j<systems[i].geometry.vertices.length;j++){
                //var point = group_points[i].geometry.vertices[j].position;
                var point = systems[i].geometry.vertices[j];
                
                var distance = distanceFromIntersection( ray.origin, ray.direction, point );

				//if ( distance > systems[i].scale.x ) { // hmm
				if ( distance > 20 ) {
					//return [];
					continue;
				}
	
				intersect = {
					distance: distance,
					point: point,
					face: null,
					object: systems[i].geometry.vertices[j]
				};
	
				intersects.push( intersect );
            
            } // each vertex
    	} // each particle system 
    	
    	return intersects;
	} // end

	this.GetIntersection = function(ray, group_points){
	    //these are the available attributes in ray that I can use
	        //ray.origin.x/y/z
	    //ray.direction.x/y/z
	    var threashold=1;
	    var retpoint=false;
	
        var distance=99999999;
        for(var i=0;i<group_points.length;i++){
            for(var j=0;j<group_points[i].geometry.vertices.length;j++){
                //var point = group_points[i].geometry.vertices[j].position;
                var point = group_points[i].geometry.vertices[j];
                var scalar = (point.x - ray.origin.x) / ray.direction.x;
                if(scalar<0) continue;//this means the point was behind the camera, so discard
                //test the y scalar
                var testy = (point.y - ray.origin.y) / ray.direction.y
                if(Math.abs(testy - scalar) > threashold) continue;
                //test the z scalar
                var testz = (point.z - ray.origin.z) / ray.direction.z
                if(Math.abs(testz - scalar) > threashold) continue;

                //if it gets here, we have a hit!
                if(distance>scalar){
                    distance=scalar;
                    retpoint=point;
                }
            }
        }
        
	    return retpoint;
	}
	
	
	/*var intersectSphere = function(rayDir, rayOrigin, spherePoint, r){
		
		var a = rayDir.dot(rayDir);
	}
	
	bool SpherePrimitive::intersect(const Ray& ray, float* t)
	{
	    //Compute A, B and C coefficients
	    float a = dot(ray.d, ray.d);
	    float b = 2 * dot(ray.d, ray.o);
	    float c = dot(ray.o, ray.o) - (r * r);
	
	    //Find discriminant
	    float disc = b * b - 4 * a * c;
	    
	    // if discriminant is negative there are no real roots, so return 
	    // false as ray misses sphere
	    if (disc < 0)
	        return false;
	
	    // compute q as described above
	    float distSqrt = sqrtf(disc);
	    float q;
	    if (b < 0)
	        q = (-b - distSqrt)/2.0;
	    else
	        q = (-b + distSqrt)/2.0;
	
	    // compute t0 and t1
	    float t0 = q / a;
	    float t1 = c / q;
	
	    // make sure t0 is smaller than t1
	    if (t0 > t1)
	    {
	        // if t0 is bigger than t1 swap them around
	        float temp = t0;
	        t0 = t1;
	        t1 = temp;
	    }
	
	    // if t1 is less than zero, the object is in the ray's negative direction
	    // and consequently the ray misses the sphere
	    if (t1 < 0)
	        return false;
	
	    // if t0 is less than zero, the intersection point is at t1
	    if (t0 < 0)
	    {
	        t = t1;
	        return true;
	    }
	    // else the intersection point is at t0
	    else
	    {
	        t = t0;
	        return true;
	    }
	}*/
	
	
}