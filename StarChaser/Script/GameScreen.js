/**
 * @author BURG2666
 */

$(document).ready(function(){
	GameScreen.Init();
});

var GameScreen = new function(){
	
	var universe;
	
	this.Init = function(){
		
		loadModels();

	};
	
	var numLoaded = 0;
	var numToLoad = 0;
	var loadModels = function(){
		loadScript('Script/Model/Star.js');
		loadScript('Script/Model/SpaceVolume.js');
		loadScript('Script/Model/Universe.js');
		loadScript('Script/Model/Fleet.js');
	}
	
	var loadScript = function(path){
		numToLoad++;
		$.getScript(path)
		.done(function(script, textStatus){
			console.log(textStatus);
			numLoaded++;
			checkAllScriptsLoaded();
		})
		.fail(function(jqxhr, settings, exception){
			alert("Error loading script " + path);
		});
	};
	
	var checkAllScriptsLoaded = function(){
		if(numLoaded==numToLoad){
			runGame();
		}
	};
	
	var runGame = function(){
		universe = new Universe();
		universe.Generate(1000,200);
		var volumes = [];
		volumes.push(universe.GetVolume(0,0,0));
		
		Graphics.init(volumes);
		Graphics.tick();
	};
}

var Graphics = new function(){
	
	var container, stats;
	var camera, scene, projector, renderer;
	var controls;

	var PI2 = Math.PI * 2;

	var INTERSECTED;
	var mouse = { x: 0, y: 0 }, INTERSECTED;

	var onDocumentMouseMove = function( event ) {

		event.preventDefault();

		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	}

	var programFill = function ( context ) {

		context.beginPath();
		context.arc( 0, 0, 1, 0, PI2, true );
		context.closePath();
		context.fill();
	};

	var programStroke = function ( context ) {

		context.lineWidth = 0.05;
		context.beginPath();
		context.arc( 0, 0, 1, 0, PI2, true );
		context.closePath();
		context.stroke();
	};

	
	this.init = function(volumes) {

		container = document.getElementById('container');

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set( 0, 300, 500 );

		controls = new THREE.FlyControls( camera );

		controls.domElement = container;
		controls.autoForward = false;
		controls.dragToLook = false;


		scene = new THREE.Scene();

		scene.add( camera );

		var geometry = new THREE.CubeGeometry( 1, 1, 1 );
		var material = new THREE.MeshBasicMaterial( { color: 0x00ffff, wireframe: true } );
		
		for(var vIndex in volumes){
			var volume = volumes[vIndex];
			
			// Draw volume outlines			
			var object = new THREE.Mesh( geometry, material );
			object.doubleSided = true;
			object.flipSided = true;
			object.frustumCulled = false;
		
			cSiz = volume.size / 2;
		
			object.position.x = volume.minX + cSiz;
			object.position.y = volume.minY + cSiz;
			object.position.z = volume.minZ + cSiz;

			object.scale.x = volume.size;
			object.scale.y = volume.size;
			object.scale.z = volume.size;

			scene.add( object );
			
			/*var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.5 } ) );
			cSiz = volume.size / 2;
			line.position.x = volume.minX + cSiz;
			line.position.y = volume.minY + cSiz;
			line.position.z = volume.minZ + cSiz;

			line.scale.x = volume.size;
			line.scale.y = volume.size;
			line.scale.z = volume.size;
			
			scene.add( line );*/

			//objects.push( object ); // Used for intersections

			// Draw stars in volume
			for(var sIndex in volume.stars){
				var star = volume.stars[sIndex];
				//var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808080 + 0x808080, program: programFill } ) );
				var particle = 
					new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: star.colour, program: programFill } ) );
				particle.position.x = star.x;
				particle.position.y = star.y;
				particle.position.z = star.z;
				particle.scale.x = particle.scale.y = star.mass;
				particle.starPtr = star;
				scene.add( particle );
			}
		}

		projector = new THREE.Projector();

		renderer = new THREE.CanvasRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );

		container.appendChild( renderer.domElement );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );

		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	};


	var lastTime = 0;

    this.tick = function() {
        requestAnimationFrame( Graphics.tick );
		render();
		animate();
		handleInput();
		stats.update();
    };

	var radius = 600;
	var theta = 180;

	var animate = function() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;

			// rotate camera 20 deg per second
            //theta += (10 * elapsed) / 1000.0;
            
            controls.update( elapsed );
        }
        lastTime = timeNow;
    };

	var handleInput = function(){
		
		var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
		projector.unprojectVector( vector, camera );

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

		var intersects = ray.intersectObjects( scene.children );

		if ( intersects.length > 0 ) {
			// new intersection
			if ( INTERSECTED != intersects[ 0 ].object ) { 
				// if not the same object
				if ( INTERSECTED ) INTERSECTED.material.program = programFill; // clear old intersection

				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.material.program = programStroke;
				
				var star = INTERSECTED.starPtr;
				//alert(star.id);
			}

		} else {
			// no new intersection
			if ( INTERSECTED ) INTERSECTED.material.program = programFill;

			INTERSECTED = null;
		}
		
	};

	var render = function() {

		/*camera.position.x = radius * Math.sin( theta * Math.PI / 360 );
		camera.position.y = radius * Math.sin( theta * Math.PI / 360 );
		camera.position.z = radius * Math.cos( theta * Math.PI / 360 );*/
		camera.lookAt( scene.position );

		// find intersections

		camera.updateMatrixWorld();

		

		renderer.render( scene, camera );

	};
	
}
