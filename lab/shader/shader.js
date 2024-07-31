import * as THREE from 'three'

let camera
let scene
let plane
let ambientLight
let spotlight
let renderer
let keyRotationObject

function vertexShader() {
  return `
  // -- Vertex Shader --
precision mediump float;

// Input from buffers
attribute vec3 aPosition;
attribute vec2 aBaryCoord;

// Value interpolated accross pixels and passed to the fragment shader
varying vec2 vBaryCoord;

// Uniforms
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

void main() {
    vBaryCoord = aBaryCoord;
    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(aPosition,1.0);
}

    /*varying vec3 vUv;

    void main() {
      vUv = position; 

      vec4 modelViewPosition = modelViewMatrix * vec4(position.x, position.y, position.z + 2.0 * sin(position.x), 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
    }*/
  `
}

function fragmentShader() {
  return `
// -- Fragment Shader --
// This shader doesn't perform any lighting
precision mediump float;

varying vec2 vBaryCoord;

uniform vec3 uMeshColour;

float edgeFactor() {
    vec3 d = fwidth(vBaryCoord);
    vec3 a3 = smoothstep(vec3(0.0,0.0,0.0),d * 1.5,vBaryCoord);
    return min(min(a3.x,a3.y),a3.z);
}

void main() {
    gl_FragColor = vec4(uMeshColour,(1.0 - edgeFactor()) * 0.95);
}
// ---------------------
  `
}

const createCamera = (aspectRatio) => {
  const camera = new THREE.PerspectiveCamera(40, aspectRatio, 0.1, 2000)

  const width = window.innerWidth * window.devicePixelRatio
  const height = window.innerHeight * window.devicePixelRatio

  camera.viewport = new THREE.Vector4(
    Math.floor(width),
    Math.floor(height),
    Math.ceil(width),
    Math.ceil(height)
  )
  camera.position.z = 5
  camera.updateMatrixWorld()

  return camera
}

const createAmbientLight = (color) => {
  return new THREE.AmbientLight(color)
}

const createDirectionalLight = (color, intensity) => {
  const light = new THREE.DirectionalLight(color, intensity)
  light.position.set(5, 5, 5)
  light.shadow.camera.far = 500
  light.shadow.mapSize = new THREE.Vector2(1000, 1000)
  light.castShadow = true

  return light
}

const createPlane = () => {
  const geometry = new THREE.PlaneGeometry(2, 2, 10, 10)
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
  })

  const plane = new THREE.Mesh(geometry, material)

  return plane
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

const onKeyDown = (evt) => {
  switch (String.fromCharCode(evt.keyCode)) {
    case 'Q':
      keyRotationObject.rotation.x += 0.05
      break
    case 'A':
      keyRotationObject.rotation.x -= 0.05
      break
    case 'W':
      keyRotationObject.rotation.y += 0.05
      break
    case 'S':
      keyRotationObject.rotation.y -= 0.05
      break
    case 'E':
      keyRotationObject.rotation.z += 0.05
      break
    case 'D':
      keyRotationObject.rotation.z -= 0.05
      break
    case 'R':
      spotlight.target.position.x += 0.5
      break
    case 'F':
      spotlight.target.position.x -= 0.5
      break
    default:
      break
  }
  console.log(
    keyRotationObject.rotation.x,
    keyRotationObject.rotation.y,
    keyRotationObject.rotation.z,
    spotlight.position.x
  )
}

const animate = () => {
  renderer.render(scene, camera)
}

const createScene = async () => {
  camera = createCamera(window.innerWidth / window.innerHeight)
  scene = new THREE.Scene()

  ambientLight = createAmbientLight(0x999999)
  scene.add(ambientLight)

  spotlight = createDirectionalLight(0xffffff, 3)
  scene.add(spotlight)
  scene.add(spotlight.target)

  plane = createPlane()
  scene.add(plane)

  keyRotationObject = plane

  renderer = new THREE.WebGLRenderer({
    antialias: true,
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(animate)
  renderer.shadowMap.enabled = true
  document.body.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize)
  window.addEventListener('keydown', onKeyDown)
}

createScene()
