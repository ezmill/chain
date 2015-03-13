var mainScene, camera, renderer, controls;
var container;
var loader;
var w = window.innerWidth;
var h = window.innerHeight;
var mouseX, mouseY;
var mapMouseX, mapMouseY;
var FBObject1, FBObject2, mirror;
var globalUniforms;
var time = 0;

initScene();
function initScene(){
	container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(50, w / h, 1, 100000);
    camera.position.set(0,0, 750);//test
    cameraRTT = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, -10000, 10000 );
	cameraRTT.position.z = 100;
	controls = new THREE.OrbitControls(camera);
	controls.maxPolarAngle = Math.PI/2; 
	renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    renderer.setClearColor(0xffffff, 1);
    renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;

	// renderer.shadowCameraNear = 0.1;
	// renderer.shadowCameraFar = camera.far;
	// renderer.shadowCameraFov = 50;

	renderer.shadowMapBias = 0.000003;
	renderer.shadowMapDarkness = 1.0;
	renderer.shadowMapWidth = 100000;
	renderer.shadowMapHeight = 100000;

    container.appendChild(renderer.domElement);


    mainScene = new THREE.Scene();

    globalUniforms = {
		time: { type: "f", value: 0.0 } ,
		resolution: {type: "v2", value: new THREE.Vector2(w,h)},
		step_w: {type: "f", value: 1/w},
		step_h: {type: "f", value: 1/h},
		mouseX: {type: "f", value: 1.0},
		mouseY: {type: "f", value: 1.0},
		tv_resolution: {type: "f", value: 640.0},
		tv_resolution_y: {type: "f", value: 1600.0}
	}
	var path = "textures/cube/vince/";
	var format = '.png';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
	];
	var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
	reflectionCube.format = THREE.RGBFormat;

	var refractionCube = new THREE.CubeTexture( reflectionCube.image, THREE.CubeRefractionMapping );
	refractionCube.format = THREE.RGBFormat;
	var mirrorMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xaaaaaa, envMap: reflectionCube } )

	// control = new THREE.TransformControls( camera, renderer.domElement );
	// control.attach( FBObject2.mesh );
	// mainScene.add( control );

	chain = new FBObject({
			w: w,
	    	h: h, 
	    	x: 0,
	    	y: 0,
	    	z: 0,
	    	// texture: "textures/seed.png",
	    	vertexShader: "vs",
	    	fragmentShader1: "fs",
	    	fragmentShader2: "flow",
	    	mainScene: mainScene
		});
	chain.uniforms = globalUniforms;
	chain.init(w,h);
	chain.loadModel("js/models/chain.js", 0, 0, 0, 0.075, 0, 0, 0, mirrorMaterial);

	mouse = new FBObject({
			w: w,
	    	h: h, 
	    	x: 0,
	    	y: 0,
	    	z: 0,
	    	vertexShader: "vs",
	    	fragmentShader1: "fs",
	    	fragmentShader2: "flow",
	    	mainScene: mainScene
		});
	mouse.uniforms = globalUniforms;
	mouse.init(w,h);
	mouseTex = new THREE.ImageUtils.loadTexture("textures/keyboard-&-magic-mouse-by-apple-glass-mouse.jpg");
	mouseMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xaaaaaa, map: mouseTex } )
	mouse.loadModel("js/models/mouse.js", 0, 0, 0, 0.075, 0, 0, 0, mouseMaterial);

	keyboard = new FBObject({
			w: w,
	    	h: h, 
	    	x: 0,
	    	y: 0,
	    	z: 0,
	    	// texture: "textures/keyboard-&-magic-mouse-by-apple-keys.jpg",
	    	vertexShader: "vs",
	    	fragmentShader1: "fs",
	    	fragmentShader2: "fs",
	    	mainScene: mainScene
		});
	keyboard.uniforms = globalUniforms;
	keyboard.init(w,h);
	keyboardTex = new THREE.ImageUtils.loadTexture("textures/keyboard-&-magic-mouse-by-apple-keys.jpg");
	keyboardMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xaaaaaa, map: keyboardTex } )

	keyboard.loadModel("js/models/keyboard.js", 0, 0, 0, 0.075, 0, 0, 0, keyboardMaterial);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    window.addEventListener('resize', onWindowResize, false);

	var geometry = new THREE.PlaneBufferGeometry(100000,100000);
	var material = new THREE.MeshBasicMaterial({color:0xffffff, side:THREE.DoubleSide});
	var mesh = new THREE.Mesh(geometry, material);
	mesh.receiveShadow = true;
	mesh.position.set(0,-7,0);
	mesh.rotation.set(Math.PI/2,0,0);
	mainScene.add(mesh);

    addLights();
    // onWindowResize();
	animate();
}
function addLights(){
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.75 );
	mainScene.add(hemiLight)
	// var light = new THREE.PointLight( 0xff0000, 1, 100 );
	// light.position.set( FBObject2.position+100);
	// mainScene.add( light );

	light = new THREE.DirectionalLight(0xffffff, 0.22);
      light.position.x = 0;
      light.position.y = 1000;
      mainScene.add(light);

	spotLight = new THREE.SpotLight( 0xffffff );
// spotLight.position.set( 0, 30, 200 );
// spotLight.target = keyboard.modelMesh;
spotLight.castShadow = true;
light.castShadow = true;

// light.shadowCameraVisible = true
light.shadowMapWidth = 1024;
light.shadowMapHeight = 1024;
light.shadowCascadeWidth = 10000;
light.shadowCascadeHeight = 10000;

spotLight.shadowCameraNear = 500;
spotLight.shadowCameraFar = 4000;
spotLight.shadowCameraFov = 30;

mainScene.add( spotLight );


}
function map(value,max,minrange,maxrange) {
    return ((max-value)/(max))*(maxrange-minrange)+minrange;
}

function onDocumentMouseMove(event){
	mouseX = (event.clientX );
    mouseY = (event.clientY );
    mapMouseX = map(mouseX, window.innerWidth, -1.0,1.0);
    mapMouseY = map(mouseY, window.innerHeight, -1.0,1.0);
    resX = map(mouseX, window.innerWidth, 4000.0,2000.0);
    resY = map(mouseX, window.innerWidth, 10000.0,1600.0);
	globalUniforms.mouseX.value = mapMouseX;
	globalUniforms.mouseY.value = mapMouseY;
	globalUniforms.tv_resolution.value = resX;
	globalUniforms.tv_resolution_y.value = resY;



}
function onWindowResize( event ) {
	globalUniforms.resolution.value.x = window.innerWidth;
	globalUniforms.resolution.value.y = window.innerHeight;
	w = window.innerWidth;
	h = window.innerHeight;
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseDown(event){

	chain.getFrame(cameraRTT);
	mouse.getFrame(cameraRTT);
	keyboard.getFrame(cameraRTT);
}
var inc = 0;
var addFrames = true;
var translate = false;
function render(){

	// FBObject1.material1.uniforms.texture.value.needsUpdate = true;
	keyboard.modelMesh.castShadow = keyboard.modelMesh.receiveShadow = true;
	mouse.modelMesh.castShadow = mouse.modelMesh.receiveShadow = true;
	chain.modelMesh.castShadow = chain.modelMesh.receiveShadow = true;
	spotLight.target = mouse.modelMesh;

	controls.update();

	time +=0.05;
    camera.lookAt(mainScene.position);

	globalUniforms.time.value = time;

    chain.passTex();
    mouse.passTex();
    keyboard.passTex();



    inc++
	if(inc >= 10){
		addFrames = false;
	}
	if(addFrames){
		mirror.getFrame(cameraRTT);
		translate = true;
	}
	if(translate = true){
		// FBObject1.scale(1.01);
		// FBObject2.scale(0.999);

	}
		    // console.log(FBObject1.material1.uniforms.texture.value)


	chain.render(cameraRTT);
	mouse.render(cameraRTT);
	keyboard.render(cameraRTT);
	renderer.render(mainScene, camera);

	chain.cycle();
	mouse.cycle();
	keyboard.cycle();


}
function animate(){
	window.requestAnimationFrame(animate);
	render();

}