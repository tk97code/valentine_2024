import * as THREE from "three";

import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';


var renderer, scene, camera, heart, controls, cubes = [], groups = [];
var geometry = new THREE.BoxGeometry(60, 60, 60);
var offset = 70;
var animation = new TimelineMax({ repeat: -1, delay: 2 });

function initScene() {
    scene = new THREE.Scene();
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 2000);
    camera.position.y = 300;
    camera.position.z = 800;
    camera.lookAt(scene.position);

}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xF6F1E9);
    document.body.appendChild(renderer.domElement);

    // controls = new OrbitControls(camera, renderer.domElement);
}



window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
});

function createHeart() {
    heart = new THREE.Group();
    scene.add(heart);
    createLevel(0, 1);
    createLevel(1, 3);
    createLevel(2, 5);
    createLevel(3, 7);
    createLevel(4, 7);
    createLevel(5, 5, true);
}

var index = 1;

function createLevel(level, lineCount, excludeCenter) {
    var group = new THREE.Group();
    group.level = level;
    var color = 0xE31749;
    heart.add(group);
    groups.push(group);
    group.position.y = -150 + offset * level;
    var x = -offset * parseInt(lineCount / 2);

    for (var i = 0; i < lineCount; ++i) {
        if (excludeCenter && i == parseInt(lineCount / 2)) {
            x += offset;
            continue;
        }
        // if (level % 2) {
        //     color = 0xF22C5D;
        // }
        const loader = new THREE.TextureLoader();
        var material = new THREE.MeshBasicMaterial({ map: loader.load("image/1 (" + index + ").jpg") });
        // var material = new THREE.MeshBasicMaterial({ color: color });
        var cube0 = new THREE.Mesh(geometry, material);
        // var cube1 = new THREE.Mesh(geometry, material);
        cubes.push(cube0);
        cube0.position.set(x, 0, offset / 2);
        // cube1.position.set(x, 0, -offset / 2);

        if (index == 13) {
            var outlineMaterial2 = new THREE.MeshBasicMaterial( { color: 0xFC2947, side: THREE.BackSide } );
            var outlineMesh2 = new THREE.Mesh( geometry, outlineMaterial2 );
            outlineMesh2.position.set(x, 0, offset / 2);
            // outlineMesh2.position.set(x, 0, -offset / 2);
            outlineMesh2.scale.multiplyScalar(1.15);
            group.add( outlineMesh2 );
            cubes.push(outlineMesh2);
        } else {
            var outlineMaterial2 = new THREE.MeshBasicMaterial( { color: 0xFF55BB, side: THREE.BackSide } );
            var outlineMesh2 = new THREE.Mesh( geometry, outlineMaterial2 );
            outlineMesh2.position.set(x, 0, offset / 2);
            // outlineMesh2.position.set(x, 0, -offset / 2);
            outlineMesh2.scale.multiplyScalar(1.05);
            group.add( outlineMesh2 );
            cubes.push(outlineMesh2);
        }

        group.add(cube0);
        // group.add(cube1);
        x += offset;
        ++index;   
    }
}



function fitToHeart() {
    var animation = new TimelineMax();
    for (var i = 0, len = cubes.length; i < len; ++i) {
        var cube = cubes[i];
        var x = cube.position.x;
        var y = cube.position.y;
        var z = cube.position.z;
        cube.position.x = parseInt((-1 + 2 * Math.random()) * innerWidth);
        cube.position.y = parseInt((-1 + 2 * Math.random()) * innerHeight);
        cube.position.z = parseInt((-1 + 2 * Math.random()) * 100);
        if (i == 24) {
            cube.position.x = 0;
            cube.position.y = 200;
            cube.position.z = 700;            
        }
        animation.to(cube.position, 5, { x: x, y: y, z: z, ease: Expo.easeInOut }, 0);
    }
}

function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function rotateHeart() {
    for (var i = 0, len = groups.length; i < len; ++i) {
        var group = groups[i];
        animation
            .to(group.rotation, 0.4, { y: -0.2 }, 0)
            .to(group.rotation, 5, { y: 2 * Math.PI, ease: Expo.easeInOut }, 1.4 - 0.2 * group.level);
    }
}

const raycaster = new THREE.Raycaster();
const mousePos = new THREE.Vector2();

function intersect(mousePos) {
    raycaster.setFromCamera(mousePos, camera);
    return raycaster.intersectObjects(scene.children);
}

window.addEventListener("click", (event) => {

    mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;

    var animation = new TimelineMax();
    var cube_clone = null;
    const found = intersect(mousePos);

    if (found.length > 0) {
        const cube_found = found[0].object;
        cube_clone = cube_found.clone();
        cube_clone.name = "clone";
        cube_clone.position.set(0, 0, 0);

        var outlineMaterial2 = new THREE.MeshBasicMaterial( { color: 0xFF55BB, side: THREE.BackSide } );
        var outlineMesh2 = new THREE.Mesh( geometry, outlineMaterial2 );
        outlineMesh2.name = "outline_clone";
        outlineMesh2.position.set(0, 0, 0);
        outlineMesh2.scale.multiplyScalar(1.05);

        scene.add(outlineMesh2);
        scene.add(cube_clone);

        animation.to(cube_clone.position, 2, { x: 1500, y: 200, z: 500, ease: Expo.easeInOut }, 0);
        animation.to(cube_clone.rotation, 2, { y: Math.PI * 1.2, ease: Expo.easeInOut}, 0);
        animation.to(cube_clone.scale, 2, {x: 1.5, y: 1.5, z: 1.5, ease: Expo.easeInOut}, 0);

        animation.to(outlineMesh2.position, 2, { x: 1500, y: 200, z: 500, ease: Expo.easeInOut }, 0);
        animation.to(outlineMesh2.rotation, 2, { y: Math.PI * 1.2, ease: Expo.easeInOut}, 0);
        animation.to(outlineMesh2.scale, 2, {x: 1.55, y: 1.55, z: 1.55, ease: Expo.easeInOut}, 0);

        camera.lookAt(cube_clone.position);
        animation.to(camera.position, 2, { x: 1500, y: 300, z: 800, ease: Expo.easeInOut }, 0); 
    } else {
        var cloneObj = scene.getObjectByName("clone");
        var outlineCloneObj = scene.getObjectByName("outline_clone");
        animation.to(camera.position, 2, { x: 0, y: 300, z: 800, ease: Expo.easeInOut }, 0);
        setTimeout(() => {
            scene.remove(cloneObj);
            scene.remove(outlineCloneObj);
        }, 1000);
    }
    

    // console.log(found);
});

initScene();
initCamera();
initRenderer();
createHeart();
fitToHeart();
rotateHeart();
render();