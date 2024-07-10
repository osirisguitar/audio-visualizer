import * as THREE from 'three'

let audio1 = new Audio()
audio1.src =
  'OSIRIS DREAMS - The Cybergenix Conspiracy - 02 Emerging Sentience.mp3'
//'OSIRIS DREAMS - The Cybergenix Conspiracy - 01 Biomechanoid Prototype.mp3'

const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
let audioSource = null
let analyser = null

audio1.volume = 1
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
context.font = '21px Digital-7'
context.fillText('OSIRIS DREAMS - Emerging Sentience', 0, 50)

init()

function init() {
  const ASPECT_RATIO = window.innerWidth / window.innerHeight
  camera = new THREE.PerspectiveCamera(40, ASPECT_RATIO, 0.1, 100)

  const WIDTH = window.innerWidth * window.devicePixelRatio
  const HEIGHT = window.innerHeight * window.devicePixelRatio

  camera.viewport = new THREE.Vector4(
    Math.floor(WIDTH),
    Math.floor(HEIGHT),
    Math.ceil(WIDTH),
    Math.ceil(HEIGHT)
  )
  camera.position.x = 0.5
  camera.position.y = 1.5
  camera.position.z = 4
  camera.position.multiplyScalar(2)
  camera.lookAt(0, 0, 0)
  camera.updateMatrixWorld()

  scene = new THREE.Scene()

  scene.add(new THREE.AmbientLight(0x999999))

  const geometryBackground = new THREE.PlaneGeometry(100, 100)
  const materialBackground = new THREE.MeshPhongMaterial({ color: 0x000066 })

  const background = new THREE.Mesh(geometryBackground, materialBackground)
  background.receiveShadow = true
  background.position.set(0, 0, -1)
  //scene.add(background)

  const floorGeometry = new THREE.PlaneGeometry(100, 100)
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 })

  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.receiveShadow = true
  //floor.position.set(0, 0, 0)
  floor.rotation.x = -1.508
  //scene.add(floor)

  const colorLinesCenter = new THREE.Color('lime')
  const colorLinesGrid = new THREE.Color('lime')
  const grid = new THREE.GridHelper(16, 16, colorLinesCenter, colorLinesGrid)
  grid.material.linewidth = 6
  scene.add(grid)

  const light = new THREE.DirectionalLight(0xffffff, 3)
  light.position.set(0.5, 0.5, 1)
  light.castShadow = true
  light.shadow.camera.zoom = 1 // tighter shadow map
  scene.add(light)

  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  var textMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  })
  textMaterial.transparent = true
  const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), textMaterial)
  textMesh.position.set(0, 0, 2)
  textMesh.rotation.x = -1.508

  scene.add(textMesh)

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
  const green = (0x59 - 0x15) * (value / 255) + 0x15
  const blue = (0xf0 - 0xac) * (value / 255) + 0xac

  return new THREE.Color((red - 100) / 255, green / 255, blue / 255)
}

function animate() {
  if (camera.position.x >= CAMERA_X_MAX) {
    cameraXDirection = -0.01
  } else if (camera.position.x <= -CAMERA_X_MAX) {
    cameraXDirection = 0.01
  }

  camera.position.x += cameraXDirection
  camera.lookAt(0, 0, camera.position.x / 2)

  analyser.getByteFrequencyData(dataArray)
  for (let i = 0; i < bufferLength; i++) {
    bars[i].scale.y = dataArray[i] / 255 / 2
    bars[i].position.y = (dataArray[i] / 255) * 0.75
    bars[i].material.color = getColorForValue(dataArray[i])
  }

  renderer.render(scene, camera)
}
