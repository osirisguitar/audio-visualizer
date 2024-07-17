import * as THREE from 'three'
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js'

let audio1 = new Audio()
audio1.src =
  'OSIRIS DREAMS - The Cybergenix Conspiracy - 02 Emerging Sentience.mp3'
//'OSIRIS DREAMS - The Cybergenix Conspiracy - 01 Biomechanoid Prototype.mp3'

const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
let audioSource = null
let analyser = null

audio1.volume = 0.25
audio1.fastSeek(10)
audio1.play()
audioSource = audioCtx.createMediaElementSource(audio1)
analyser = audioCtx.createAnalyser()
audioSource.connect(analyser)
analyser.connect(audioCtx.destination)

analyser.fftSize = 32
const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)

let camera, scene, renderer
const NUMBER_OF_BARS = analyser.fftSize / 2
let bars = Array(NUMBER_OF_BARS)
const canvas = document.createElement('canvas')
const context = canvas.getContext('2d')
context.fillStyle = 'green'
context.font = '42px Digital-7'
context.fillText('OSIRIS DREAMS - Emerging Sentience', 0, 50)
let ship
let timeTexture

const timeCanvas = document.createElement('canvas')
const timeContext = timeCanvas.getContext('2d')
timeContext.fillStyle = 'green'
timeContext.font = '42px Digital-7 mono'
timeContext.fillText(audio1.duration, 0, 500)

function timeString(duration) {
  const durationMinutes = Math.floor(duration / 60)
  const durationSeconds = Math.floor(duration % 60)

  let durationString = durationMinutes

  if (durationMinutes < 10) {
    durationString = '0' + durationString
  }

  durationString += ':'

  if (durationSeconds < 10) {
    durationString += '0' + durationSeconds
  } else {
    durationString += durationSeconds
  }

  return durationString
}

function updateTimeCanvas() {
  let durationString = timeString(audio1.duration)
  let currentString = timeString(audio1.currentTime)

  timeContext.clearRect(0, 0, 1000, 1000)
  timeContext.fillText(currentString + ' / ' + durationString, 0, 500)
  timeTexture.needsUpdate = true
}

init()

async function init() {
  const ASPECT_RATIO = window.innerWidth / window.innerHeight
  camera = new THREE.PerspectiveCamera(40, ASPECT_RATIO, 0.1, 2000)

  const WIDTH = window.innerWidth * window.devicePixelRatio
  const HEIGHT = window.innerHeight * window.devicePixelRatio

  camera.viewport = new THREE.Vector4(
    Math.floor(WIDTH),
    Math.floor(HEIGHT),
    Math.ceil(WIDTH),
    Math.ceil(HEIGHT)
  )
  camera.position.x = 0
  camera.position.y = 1
  camera.position.z = 50
  camera.position.multiplyScalar(2)
  camera.lookAt(0, 0, -1000)
  camera.rotation.z = -Math.PI / 4
  camera.updateMatrixWorld()

  scene = new THREE.Scene()

  scene.add(new THREE.AmbientLight(0x999999))

  const colorLinesCenter = new THREE.Color('lime')
  const colorLinesGrid = new THREE.Color('lime')
  const grid = new THREE.GridHelper(16, 16, colorLinesCenter, colorLinesGrid)
  grid.material.linewidth = 6
  //scene.add(grid)

  const light = new THREE.DirectionalLight(0xffffff, 3)
  light.position.set(0.5, 0.5, 1)
  light.castShadow = true
  light.shadow.camera.zoom = 1
  scene.add(light)

  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  var textMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  })
  textMaterial.transparent = true
  const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), textMaterial)
  textMesh.position.set(0, 0.1, 30)
  //textMesh.rotation.x = -1.508
  scene.add(textMesh)

  timeTexture = new THREE.Texture(timeCanvas)
  timeTexture.needsUpdate = true
  var timeTextMaterial = new THREE.MeshBasicMaterial({
    map: timeTexture,
    side: THREE.DoubleSide,
  })
  timeTextMaterial.transparent = true
  const timeTextMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 2),
    timeTextMaterial
  )
  timeTextMesh.position.set(0, 0.1, 10)
  scene.add(timeTextMesh)

  for (let i = 0; i < NUMBER_OF_BARS; i++) {
    const geometryCylinder = new THREE.CylinderGeometry(0.2, 0.2, 3, 32)
    const materialCylinder = new THREE.MeshPhongMaterial({ color: 0xff0000 })

    bars[i] = new THREE.Mesh(geometryCylinder, materialCylinder)
    bars[i].castShadow = true
    bars[i].receiveShadow = true
    bars[i].position.x = i / 1.95 - 4
    bars[i].position.y = 1
    scene.add(bars[i])
  }

  const spaceLoader = new THREE.TextureLoader()
  const spaceTexture = spaceLoader.load('stars.jpg', (texture) => {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(30, 150)
    texture.needsUpdate = true
  })

  texture.colorSpace = THREE.SRGBColorSpace

  const spaceGeometry = new THREE.CylinderGeometry(100, 100, 5000, 32, 1, true)
  const spaceMaterial = new THREE.MeshBasicMaterial({
    color: 0x444444,
    map: spaceTexture,
    side: THREE.BackSide,
  })

  const spaceMesh = new THREE.Mesh(spaceGeometry, spaceMaterial)
  spaceMesh.castShadow = false
  spaceMesh.receiveShadow = false
  spaceMesh.rotation.z = Math.PI / 2
  spaceMesh.rotation.y = Math.PI / 2
  scene.add(spaceMesh)

  const loader = new GLTFLoader()

  loader.load('osiris-dreams-logo.glb', (logoModel) => {
    logoModel.scene.traverse((obj) => {
      if (obj.name === 'path2') {
        console.log(obj.material)
      }
    })
    logoModel.scene.scale.set(5, 5, 5)
    logoModel.scene.position.set(0, -3, -30)
    scene.add(logoModel.scene)
  })

  loader.load('spaceship/scene.gltf', (shipModel) => {
    shipModel.scene.scale.set(0.15, 0.15, 0.15)
    shipModel.scene.position.set(0, 0.2, 0)
    shipModel.scene.rotation.set(0, 1.508, -0.75)
    ship = shipModel.scene
    scene.add(shipModel.scene)
  })

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(animate)
  renderer.shadowMap.enabled = true
  document.body.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize)

  renderer.render(scene, camera)
}

function onWindowResize() {
  const ASPECT_RATIO = window.innerWidth / window.innerHeight

  camera.aspect = ASPECT_RATIO
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

const CAMERA_X_MAX = 3
let cameraXDirection = 0.01

function getColorForValue(value) {
  const red = (0xf5 - 0x23) * (value / 255) + 0x23
  const green = (0x59 - 0x40) * (value / 255) + 0x40
  const blue = (0xf0 - 0xac) * (value / 255) + 0xac

  return new THREE.Color((red - 100) / 255, green / 255, blue / 255)
}

let angle = 0
let radius = 3.6
let t = 0

function animate() {
  /*if (camera.position.x >= CAMERA_X_MAX) {
    cameraXDirection = -0.01
  } else if (camera.position.x <= -CAMERA_X_MAX) {
    cameraXDirection = 0.01
  }

  camera.position.x += cameraXDirection

  */

  //camera.position.x = -Math.cos(angle) * (radius + 3) * 3
  //camera.position.z = -Math.sin(angle) * radius * 3

  updateTimeCanvas()

  if (ship) {
    ship.position.x = -Math.cos(angle) * (radius + 3)
    ship.position.z = -Math.sin(angle) * radius
    ship.rotation.y = -angle

    if (angle >= 360) {
      angle = 0
    }

    angle += 0.02
    //camera.lookAt(ship.position)
  }

  camera.position.z -= 0.1
  camera.rotation.z += 0.001
  camera.updateProjectionMatrix()

  analyser.getByteFrequencyData(dataArray)
  for (let i = 0; i < bufferLength; i++) {
    bars[i].scale.y = dataArray[i] / 255 / 2
    bars[i].position.y = (dataArray[i] / 255) * 0.75
    bars[i].material.color = getColorForValue(dataArray[i])
  }

  t++

  renderer.render(scene, camera)
}
