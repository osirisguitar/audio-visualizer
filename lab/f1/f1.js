import * as THREE from 'three'
import { GLTFLoader } from 'three/addons'
import { FBXLoader } from 'three/addons'
import { EffectComposer } from 'three/addons'
import { RenderPass } from 'three/addons'
import { ShaderPass } from 'three/addons'
import { UnrealBloomPass } from 'three/addons'
import { OutputPass } from 'three/addons'

let audio1 = new Audio()
audio1.src = '/synthwave11e.mp3'

const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
let audioSource = null
let analyser = null

audio1.volume = 0.25
audio1.play()
audioSource = audioCtx.createMediaElementSource(audio1)
analyser = audioCtx.createAnalyser()
audioSource.connect(analyser)
analyser.connect(audioCtx.destination)

analyser.fftSize = 32
const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)

const BLOOM_SCENE = 1
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_SCENE)
const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })
const materials = {}

let bloomComposer
let finalComposer
let camera
let scene
let gltfLoader = new GLTFLoader()
let fbxLoader = new FBXLoader()
let ambientLight
let spotlight
let renderer
let logo
let f1
/*let tires = []
let rims = []
let tireDecals = []
let leftFrontTire
let leftFrontRim
let rightFrontTire
let rightFrontRim
let leftFrontDecalOutside
let leftFrontDecalInside
let leftFrontWheel
let rightFrontDecalOutside
let rightFrontDecalInside
let rightFrontWheel*/
let leftFrontWheel
let rightFrontWheel
let leftRearWheel
let rightRearWheel
let keyRotationObject
let floor
let lastFrequency = 0
let logoBaseColor

const createCamera = (aspectRatio) => {
  const camera = new THREE.PerspectiveCamera(40, aspectRatio, 0.1, 5000)

  //camera.position.set(0, 500, 5000)
  camera.position.set(0, 0.1, 0.5)
  camera.lookAt(0, 0, 0)

  const width = window.innerWidth * window.devicePixelRatio
  const height = window.innerHeight * window.devicePixelRatio

  camera.viewport = new THREE.Vector4(
    Math.floor(width),
    Math.floor(height),
    Math.ceil(width),
    Math.ceil(height)
  )
  camera.updateMatrixWorld()

  return camera
}

const createAmbientLight = (color) => {
  return new THREE.AmbientLight(color)
}

const createDirectionalLight = (color, intensity) => {
  const light = new THREE.DirectionalLight(color, intensity)
  light.position.set(20, 100, 100)
  light.shadow.camera.far = 500
  light.shadow.mapSize = new THREE.Vector2(1000, 1000)
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
        console.log(model)
        if (model.scene) {
          model = model.scene
        }
        return resolve(model)
      })
    } catch (error) {
      console.error('Error loading model ' + filename, error)
      reject(error)
    }
  })
}

const createLogo = async () => {
  try {
    const logoModel = await loadModel('/osiris-dreams-logo.glb')
    logoModel.castShadow
    let logo = logoModel
    logo.castShadow = true

    logo.traverse((child) => {
      child.castShadow = true
    })

    logo.position.x = -14
    logo.position.z = 240
    logo.position.y = -0.3
    logo.scale.set(100, 100, 100)

    /*    logo.position.x = -65
    logo.position.z = 1000
    logo.position.y = -1
    logo.scale.set(100, 100, 100)*/
    logo.rotation.set(-Math.PI / 2, 0, -Math.PI / 2)
    logoBaseColor = logo.children[1].material.color
    return logo
  } catch (error) {
    console.error(error)
  }
}

const createF1 = async () => {
  try {
    let f1Model = await loadModel('formula1b.glb')
    f1Model.receiveShadow = true
    let f1 = f1Model
    ///    f1.scale.set(0.5, 0.5, 0.5)
    f1.scale.set(0.1, 0.1, 0.1)
    f1.rotation.set(0, 0, 0)
    f1.receiveShadow = true

    const wheels = {
      leftFront: [],
      rightFront: [],
      leftRear: [],
      rightRear: [],
    }

    f1.traverse((child) => {
      if (child.isMesh) {
        child.material.color = new THREE.Color('Lime')

        console.log(child)
        child.material.wireframe = true
        child.layers.enable(BLOOM_SCENE)
        /*if (child.name.startsWith('Tire_')) {
          tires.push(child)
          switch (child.name) {
            case 'Tire_FL':
              leftFrontTire = child
              break
            case 'Tire_FK':
              rightFrontTire = child
              break
            default:
              break
          }
        } else if (child.name.startsWith('Rim_')) {
          switch (child.name) {
            case 'Rim_FL':
              leftFrontRim = child
              break
            default:
              break
          }
          rims.push(child)
        } else if (child.name.startsWith('Decal_Tire_')) {
          tireDecals.push(child)
          switch (child.name) {
            case 'Decal_Tire_FL001':
              leftFrontDecalOutside = child
              break
            case 'Decal_Tire_FL002':
              // leftRearOutside
              break
            case 'Decal_Tire_FL003':
              // leftRearInside
              //leftFrontDecalOutside = child
              break
            case 'Decal_Tire_FL004':
              // rightFrontInside
              rightFrontDecalInside = child
              break
            case 'Decal_Tire_FL0005':
              // ?
              break
            case 'Decal_Tire_FL0006':
              child.rotation.x += 1
              break
            case 'Decal_Tire_FL0007':
              child.rotation.x += 1
              break
            case 'Decal_Tire_FL':
              // rightFrontInside
              leftFrontDecalInside = child
              break
            default:
              break
          }
        }*/
      }
      child.castShadow = true
    })

    wheels.leftFront.push(f1.getObjectByName('Tire_FL'))
    wheels.leftFront.push(f1.getObjectByName('Rim_FL'))
    wheels.leftFront.push(f1.getObjectByName('Decal_Tire_FL'))
    wheels.leftFront.push(f1.getObjectByName('Decal_Tire_FL001'))

    wheels.rightFront.push(f1.getObjectByName('Tire_FК'))
    wheels.rightFront.push(f1.getObjectByName('Rim_FК'))
    wheels.rightFront.push(f1.getObjectByName('Decal_Tire_FL004'))
    wheels.rightFront.push(f1.getObjectByName('Decal_Tire_FL005'))

    wheels.rightRear.push(f1.getObjectByName('Tire_RL001'))
    wheels.rightRear.push(f1.getObjectByName('Rim_RL001'))
    wheels.rightRear.push(f1.getObjectByName('Decal_Tire_FL007'))
    wheels.rightRear.push(f1.getObjectByName('Decal_Tire_FL006'))

    wheels.leftRear.push(f1.getObjectByName('Tire_RL'))
    wheels.leftRear.push(f1.getObjectByName('Rim_RL'))
    wheels.leftRear.push(f1.getObjectByName('Decal_Tire_FL002'))
    wheels.leftRear.push(f1.getObjectByName('Decal_Tire_FL003'))

    leftFrontWheel = new THREE.Group()
    wheels.leftFront.forEach((obj) => {
      leftFrontWheel.add(obj)
    })
    f1.add(leftFrontWheel)

    rightFrontWheel = new THREE.Group()
    wheels.rightFront.forEach((obj) => {
      rightFrontWheel.add(obj)
    })
    f1.add(rightFrontWheel)

    leftRearWheel = new THREE.Group()
    wheels.leftRear.forEach((obj) => {
      leftRearWheel.add(obj)
    })
    f1.add(leftRearWheel)

    rightRearWheel = new THREE.Group()
    wheels.rightRear.forEach((obj) => {
      rightRearWheel.add(obj)
    })
    f1.add(rightRearWheel)

    return f1
  } catch (error) {
    console.error(error)
  }
}

const createFloor = () => {
  const colorLinesCenter = new THREE.Color('gray')
  const colorLinesGrid = new THREE.Color('gray')
  const floor = new THREE.GridHelper(700, 125, colorLinesCenter, colorLinesGrid)
  console.log(floor)
  floor.material.linewidth = 6

  floor.position.x = 80
  floor.position.z = 250

  //floor.rotation.x = -Math.PI / 2

  return floor
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

const onKeyDown = (evt) => {
  switch (String.fromCharCode(evt.keyCode)) {
    case 'Q':
      keyRotationObject.position.x += 0.05
      break
    case 'A':
      keyRotationObject.position.x -= 0.05
      break
    case 'W':
      keyRotationObject.position.y += 0.05
      break
    case 'S':
      keyRotationObject.position.y -= 0.05
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

let angle = 0
let radius = 1.5

function darkenNonBloomed(obj) {
  if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
    materials[obj.uuid] = obj.material
    obj.material = darkMaterial
  }
}

function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid]
    delete materials[obj.uuid]
  }
}

const render = () => {
  scene.traverse(darkenNonBloomed)
  bloomComposer.render()
  scene.traverse(restoreMaterial)

  // render the entire scene, then render bloom scene on top
  finalComposer.render()
  //  renderer.render(scene, camera)
}

function getColorForValue(value) {
  const red = (0xf5 - 0x23) * (value / 255) + 0x23
  const green = (0x59 - 0x40) * (value / 255) + 0x40
  const blue = (0xf0 - 0xac) * (value / 255) + 0xac

  return new THREE.Color(
    (red - 150) / 255,
    (green - 50) / 255,
    (blue - 150) / 255
  )
}

// obj - your object (THREE.Object3D or derived)
// point - the point of rotation (THREE.Vector3)
// axis - the axis of rotation (normalized THREE.Vector3)
// theta - radian value of rotation
// pointIsWorld - boolean indicating the point is in world coordinates (default = false)
function rotateAboutPoint(obj, point, axis, theta, pointIsWorld = false) {
  if (pointIsWorld) {
    obj.parent.localToWorld(obj.position) // compensate for world coordinate
  }

  obj.position.sub(point) // remove the offset
  obj.position.applyAxisAngle(axis, theta) // rotate the POSITION
  obj.position.add(point) // re-add the offset

  if (pointIsWorld) {
    obj.parent.worldToLocal(obj.position) // undo world coordinates compensation
  }

  obj.rotateOnAxis(axis, theta) // rotate the OBJECT
}

const spinWheel = (wheel) => {
  if (wheel) {
    wheel.children[0].rotation.x -= 0.15
    wheel.children[1].rotation.z += 0.15
  }
}

let wheelLock = Math.PI / 6
let wheelTurn = 0.01
let currentWheelTurn = 0

const animate = () => {
  spinWheel(leftFrontWheel)
  spinWheel(rightFrontWheel)
  spinWheel(leftRearWheel)
  spinWheel(rightRearWheel)

  rotateAboutPoint(
    rightFrontWheel,
    rightFrontWheel.children[0].position,
    new THREE.Vector3(0, 1, 0),
    wheelTurn
  )
  rotateAboutPoint(
    leftFrontWheel,
    leftFrontWheel.children[0].position,
    new THREE.Vector3(0, 1, 0),
    wheelTurn
  )

  currentWheelTurn += wheelTurn

  if (Math.abs(currentWheelTurn) > wheelLock) {
    wheelTurn = -wheelTurn
  }

  f1.position.z += 0.1
  camera.position.z = f1.position.z + Math.max(camera.position.y * 3, 0.5)
  camera.position.x = -Math.cos(angle) * radius // + camera.position.y / 5)

  if (camera.position.y > 0.1) {
    camera.position.y -= camera.position.y / 300
  }

  if (angle >= 360) {
    angle = 0
  }

  angle += 0.002

  camera.lookAt(f1.position.x, f1.position.y, f1.position.z)

  analyser.getByteFrequencyData(dataArray)
  const currentFrequency = dataArray[5]

  if (Math.abs(currentFrequency - lastFrequency) > 1) {
    //logo.children[1].material.color = getColorForValue(currentFrequency)
    //floor.material.color = getColorForValue(currentFrequency)
    logo.children[1].material.color = new THREE.Color(
      logoBaseColor.r + currentFrequency / 512 - 0.25,
      logoBaseColor.g + currentFrequency / 512 - 0.25,
      logoBaseColor.b + currentFrequency / 512 - 0.25
    )
  }
  lastFrequency = currentFrequency

  //  spotlight.target.position.set(f1.position.x, f1.position.y, f1.position.z)

  render()
}

const createScene = async () => {
  const params = {
    threshold: 0,
    strength: 0.5,
    radius: 0.3,
    exposure: 0.5,
  }

  camera = createCamera(window.innerWidth / window.innerHeight)
  scene = new THREE.Scene()

  const renderScene = new RenderPass(scene, camera)
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8,
    0.2,
    0.5
  )
  bloomPass.threshold = params.threshold
  bloomPass.strength = params.strength
  bloomPass.radius = params.radius

  ambientLight = createAmbientLight(0x999999)
  scene.add(ambientLight)

  spotlight = createDirectionalLight(0xffffff, 3)
  scene.add(spotlight)
  scene.add(spotlight.target)

  logo = await createLogo()
  scene.add(logo)

  f1 = await createF1()
  console.log(f1)

  scene.add(f1)

  floor = createFloor()
  scene.add(floor)

  keyRotationObject = camera

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(animate)
  renderer.shadowMap.enabled = true
  //  renderer.toneMapping = THREE.ReinhardToneMapping

  document.body.appendChild(renderer.domElement)

  bloomComposer = new EffectComposer(renderer)
  bloomComposer.renderToScreen = false
  bloomComposer.addPass(renderScene)
  bloomComposer.addPass(bloomPass)

  const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: `
        varying vec2 vUv;

			  void main() {
  				vUv = uv;
  				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	  		}`,
      fragmentShader: `
  			uniform sampler2D baseTexture;
	  		uniform sampler2D bloomTexture;

		  	varying vec2 vUv;

			  void main() {
  				gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
  			}`,
      defines: {},
    }),
    'baseTexture'
  )
  mixPass.needsSwap = true
  const outputPass = new OutputPass()

  finalComposer = new EffectComposer(renderer)
  finalComposer.addPass(renderScene)
  finalComposer.addPass(mixPass)
  finalComposer.addPass(outputPass)

  window.addEventListener('resize', onWindowResize)
  window.addEventListener('keydown', onKeyDown)
}

createScene()
