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
	var starPs;

	var onDocumentMouseMove = function( event ) {

		event.preventDefault();

		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	}

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

		//var geometry = new THREE.CubeGeometry( 1, 1, 1 );
		//var material = new THREE.MeshBasicMaterial( { color: 0x00ffff, wireframe: true } );
		var materials = [
			new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 0.1 } )
		];
		
		var starMaterials = [
			new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } )
		];
		
		
		for(var vIndex in volumes){
			var volume = volumes[vIndex];
			
			// Draw volume outlines			
			var siz = volume.size;
			var object = THREE.SceneUtils.createMultiMaterialObject( new THREE.CubeGeometry( siz, siz, siz, 3, 3, 3 ), materials );
			cSiz = volume.size / 2;
			object.position.set( volume.minX + cSiz, volume.minY + cSiz, volume.minZ + cSiz);
			scene.add( object );
			
			// Draw stars in volume
			
			var starsGeometry = new THREE.Geometry();
			var starColours = [];
			for(var sIndex in volume.stars){
				var star = volume.stars[sIndex];

				var vertex = new THREE.Vector3();
				vertex.x = star.x;
				vertex.y = star.y;
				vertex.z = star.z;
				
				vertex.starPtr = star;

				starsGeometry.vertices.push( vertex );
				
				starColours[ sIndex ] = new THREE.Color( star.colour );
				
				// stars as spheres
				// siz, latitudes, longitudes
				/*var starObj = THREE.SceneUtils.createMultiMaterialObject( new THREE.SphereGeometry( 10, 10, 10 ), starMaterials );
				starObj.position.set( star.x, star.y, star.z );
				scene.add( starObj );*/
			}
			
			starsGeometry.colors = starColours;
			
			// Start PARTICLES
			//var parameters = [ [ [1.0, 1.0, 1.0], 5 ], [ [0.95, 1, 1], 4 ], [ [0.90, 1, 1], 3 ], [ [0.85, 1, 1], 2 ], [ [0.80, 1, 1], 1 ] ];
			//var parameters = [ [ 0xff0000, 5 ], [ 0xff3300, 4 ], [ 0xff6600, 3 ], [ 0xff9900, 2 ], [ 0xffaa00, 1 ] ];
			//parameters = [ [ 0xffffff, 5 ], [ 0xdddddd, 4 ], [ 0xaaaaaa, 3 ], [ 0x999999, 2 ], [ 0x777777, 1 ] ];
			
			var parameters = [ [ 0xff0000, 5 ], [ 0x00ff00, 4 ]];
			var starSprite = THREE.ImageUtils.loadTexture("Resource/ball.png");

			var partMaterials = [];
			var i = 0;
			for ( i = 0; i < parameters.length; i ++ ) {

				var size  = parameters[i][1];
				var color = parameters[i][0];

				partMaterials[i] = new THREE.ParticleBasicMaterial( { size: 20, map: starSprite, vertexColors: true } );

				//partMaterials[i] = new THREE.ParticleBasicMaterial( { size: size } );
				//partMaterials[i].color.setHSV( color[0], color[1], color[2] );

				var particles = new THREE.ParticleSystem( starsGeometry, partMaterials[i] );
				starPs = particles;

				scene.add( particles );
			}
			// end PARTICLES
		}

		projector = new THREE.Projector();

		//renderer = new THREE.CanvasRenderer();
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setSize( window.innerWidth, window.innerHeight );

		container.appendChild( renderer.domElement );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );

		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	};

	var highlightedStar = null; // Currently highlighted star
	var highlightedStarObj = null; // The 3d objecr representing the highlight
	var starMaterials = [
		new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
	];

	var highlightStar = function(star){
		if(star == highlightedStar) return;
		
		if(highlightedStarObj != null){
			scene.remove(highlightedStarObj);
		}
		
		// stars as spheres
		// siz, latitudes, longitudes
		var starObj = THREE.SceneUtils.createMultiMaterialObject( new THREE.SphereGeometry( 10, 10, 10 ), starMaterials );
		starObj.position.set( star.x, star.y, star.z );
		scene.add( starObj );
		
		highlightedStar = star;
		highlightedStarObj = starObj;
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
            controls.update( elapsed );
        }
        lastTime = timeNow;
    };

	var handleInput = function(){
		
		var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
		projector.unprojectVector( vector, camera );

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

		//var intersects = ray.intersectObjects( scene.children );
		//var intersects = ParticleIntesector.GetIntersection(ray, [ starPs ] );
		var intersects = ParticleIntesector.GetIntersection2(ray, [ starPs ] );
		
		if ( intersects.length > 0 ) {
			
			// new intersection
			INTERSECTED = intersects[ 0 ].object;
			highlightStar(INTERSECTED.starPtr);
			/*
			
			if ( INTERSECTED != intersects[ 0 ].object ) { 
				// if not the same object
				if ( INTERSECTED ) INTERSECTED.material.program = programFill; // clear old intersection

				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.material.program = programStroke;
				
				highlightedStar = INTERSECTED.starPtr;
				alert(highlightedStar);
			}*/

		} else {
			// no new intersection
			highlightStar(INTERSECTED.starPtr);
			/*if ( INTERSECTED ) INTERSECTED.material.program = programFill;

			INTERSECTED = null;*/
		}
		
	};

	var render = function() {
		camera.lookAt( scene.position );
		camera.updateMatrixWorld();
		renderer.render( scene, camera );

	};
	
}
