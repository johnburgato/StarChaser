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

	var mouse = { x: 0, y: 0 };
	var starPs;

	var onDocumentMouseMove = function( event ) {

		event.preventDefault();

		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	};

	this.init = function(volumes) {

		container = document.getElementById('container');

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set( 0, 300, 500 );

		controls = new THREE.FlyControls( camera );

		controls.domElement = container;
		controls.autoForward = false;
		controls.dragToLook = false;
		controls.rollSpeed = 0.0005;
		controls.movementSpeed = 0.5;

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
			}
			
			// Set the colours on the geometry so that the particle system can pick them up
			starsGeometry.colors = starColours;
			
			// Start PARTICLES
			var starSprite = THREE.ImageUtils.loadTexture("Resource/ball.png");
			var partMaterial = new THREE.ParticleBasicMaterial( { size: 20, map: starSprite, vertexColors: true } );

			var particles = new THREE.ParticleSystem( starsGeometry, partMaterial );
			starPs = particles;

			scene.add( particles );

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
		new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } )
	];

	/** Highlights the passed in star with a sphere. Removes highlight from old star
	 * if star parameter is null, all highlights removed **/
	var highlightStar = function(star){
		
		if(star == highlightedStar) return;
		
		if(highlightedStarObj != null){
			scene.remove(highlightedStarObj);
			highlightedStarObj = null;
		}
		
		if(star!=null){
			// siz, latitudes, longitudes
			var starObj = THREE.SceneUtils.createMultiMaterialObject( new THREE.SphereGeometry( 10, 10, 10 ), starMaterials );
			starObj.position.set( star.x, star.y, star.z );
			scene.add( starObj );
			
			highlightedStar = star;
			highlightedStarObj = starObj;
		} else {
			highlightedStar = null;
		}
	};

	var lastTime = 0;

    this.tick = function() {
        requestAnimationFrame( Graphics.tick );
		render();
		animate();
		handleInput();
		stats.update();
    };

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
		var intersects = ParticleIntesector.GetIntersection2(ray, [ starPs ] );
		
		if ( intersects.length > 0 ) {	
			// new intersection
			highlightStar(intersects[ 0 ].object);
		} else {
			// no new intersection
			highlightStar(null);
		}
		
	};

	var render = function() {
		camera.lookAt( scene.position );
		camera.updateMatrixWorld();
		renderer.render( scene, camera );

	};
	
}
