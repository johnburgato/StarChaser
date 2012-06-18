/**
 * @author BURG2666
 */

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var container, stats;

	var camera, scene, renderer;

	init();
	animate();

	function init() {

		container = document.getElementById('container');

		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.y = 400;
		scene.add( camera );

		var light, object, materials;

		/*scene.add( new THREE.AmbientLight( 0x404040 ) );

		light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 0, 1, 0 );
		scene.add( light );
		*/
		
		materials = [
			new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, opacity: 0.1 } )
		];

		object = THREE.SceneUtils.createMultiMaterialObject( new THREE.CubeGeometry( 100, 100, 100, 1, 1, 1 ), materials );
		object.position.set( -200, 0, 400 );
		scene.add( object );
		
		/*
		object = new THREE.AxisHelper();
		object.position.set( 200, 0, -200 );
		object.scale.x = object.scale.y = object.scale.z = 0.5;
		scene.add( object );

		object = new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 0 ), 50 );
		object.position.set( 200, 0, 400 );
		scene.add( object );*/

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setSize( window.innerWidth, window.innerHeight );

		container.appendChild( renderer.domElement );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild( stats.domElement );

	}

	//

	function animate() {

		requestAnimationFrame( animate );

		render();
		stats.update();

	}

	function render() {

		var timer = Date.now() * 0.0001;

		camera.position.x = Math.cos( timer ) * 800;
		camera.position.z = Math.sin( timer ) * 800;

		camera.lookAt( scene.position );

		for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

			var object = scene.children[ i ];

			object.rotation.x += 0.01;
			object.rotation.y += 0.005;

		}

		renderer.render( scene, camera );

	}