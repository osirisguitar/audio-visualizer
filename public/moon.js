import * as THREE from 'three'
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'https://unpkg.com/three/examples/jsm/loaders/FBXLoader'

let camera
let scene
let gltfLoader = new GLTFLoader()
let fbxLoader = new FBXLoader()
let ambientLight
let spotlight
let renderer
let moon
let logo
let keyRotationObject

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
  camera.position.z = 10
  camera.updateMatrixWorld()

  return camera
}

const createAmbientLight = (color) => {
  return new THREE.AmbientLight(color)
}

const createDirectionalLight = (color, intensity) => {
  const light = new THREE.DirectionalLight(color, intensity)
  light.position.set(40, 25, 40)
  light.shadow.camera.far = 500
  light.shadow.mapSize = new THREE.Vector2(1000, 1000)
  light.target.position.set(-30, -20, -30)
  light.castShadow = true
  light.shadow.camera.zoom = 0.5

  return light
}

const loadModel = async (filename) => {
  let loader = gltfLoader
  if (filename.toLowerCase().endsWith('.fbx')) {
    loader = fbxLoader
  }

  return new Promise((resolve, reject) => {
    try {
      loader.load(filename, (model) => {
        return resolve(model)
      })
    } catch (error) {
      console.error('Error loading model ' + filename, error)
      reject(error)
    }
  })
}

const createMoon = async () => {
  try {
    const moonModel = await loadModel('moon.glb')
    moonModel.receiveShadow = true
    let moon = moonModel.scene
    moon.receiveShadow = true
    moon.traverse((child) => {
      child.receiveShadow = true
    })
    moon.scale.set(0.4, 0.4, 0.4)
    moon.position.set(-25, -25, -50)
    moon.rotation.z = Math.PI / 2
    return moon
  } catch (error) {
    console.error(error)
  }
}

const createLogo = async () => {
  try {
    const logoModel = await loadModel('osiris-dreams-logo.glb')
    logoModel.castShadow
    let logo = logoModel.scene
    logo.castShadow = true

    logo.traverse((child) => {
      child.castShadow = true
    })

    logo.scale.set(2, 2, 2)
    logo.position.set(-5, -2, -13)
    logo.rotation.set(-0.45, 0.5, 0.85)
    return logo
  } catch (error) {
    console.error(error)
  }
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
  moon.rotation.y -= 0.00005
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

  moon = await createMoon()
  scene.add(moon)

  logo = await createLogo()
  scene.add(logo)
  keyRotationObject = logo

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(animate)
  renderer.shadowMap.enabled = true
  document.body.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize)
  window.addEventListener('keydown', onKeyDown)
}

createScene()
