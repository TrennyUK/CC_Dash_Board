import * as THREE from "three"; // Three.js will be imported via importmap

// Get shader data from the global variable defined in shaderData.js
// Ensure shaderData.js is loaded BEFORE this script, and that window.nodetoyShaderData exists.
const shaderData = window.nodetoyShaderData; 

if (!shaderData || !shaderData.shader || !shaderData.shader.vertex || !shaderData.shader.fragment) {
    console.error("Error: Nodetoy shader data is not properly loaded or accessible from window.nodetoyShaderData.");
    // You might want to halt execution or load a default shader here.
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create ShaderMaterial from the exported Nodetoy data
// This is the most important part for applying your shader
let material = new THREE.ShaderMaterial({
    vertexShader: shaderData.shader.vertex,
    fragmentShader: shaderData.shader.fragment,
    uniforms: {
        // Initialize uniforms required by Nodetoy
        _Time: { value: 0.0 },
        // You need to check shaderData.uniforms for other uniforms
        // and add them here if you want to control them from JavaScript.
        // Example:
        // _RippleSpeed: { value: new THREE.Vector2(0.05, 0.05) },
        // _Anchor: { value: new THREE.Vector2(0.5, 0.5) },
        // _ErosionPower: { value: 1.6 },
        // If there's a uniform that is a Texture (like RippleTexture), you would declare it like this:
        // _RippleTexture: { value: new THREE.TextureLoader().load('path/to/your/texture.png') },
    }
});

// Create geometry and mesh
let geometry = new THREE.BoxGeometry(1, 1);
let mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
camera.position.z = 2;

// Create lights
const ambientLight = new THREE.AmbientLight( 0x404040, 0.5 ); // soft white light
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set(-10, -10, -5);
scene.add( directionalLight );

// Animate loop
function animate(time) {
    requestAnimationFrame(animate);

    // Update the _Time uniform of the shader
    // (time is a millisecond value provided by requestAnimationFrame)
    if (material.uniforms._Time) {
        material.uniforms._Time.value = time / 1000; // Convert to seconds
    }

    // Rotate the mesh (cube object)
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;

    renderer.render(scene, camera);
}
animate();

// On resize window 
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);