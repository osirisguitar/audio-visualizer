import * as THREE from 'three'
import { EffectComposer } from 'three/addons'
import { RenderPass } from 'three/addons'
import { ShaderPass } from 'three/addons'
import { UnrealBloomPass } from 'three/addons'
import { OutputPass } from 'three/addons'
import { logo, createLogo, setLogoColors } from './logo'
import { loadModel, rotateAboutPoint } from '../../public/utils'
import { camera, createCamera, setCameraMode, updateCamera } from './camera'

let audio1 = new Audio()
audio1.src = '/synthwave11e.mp3'

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

const BLOOM_SCENE = 1
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_SCENE)
const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })
const materials = {}

let bloomComposer
let finalComposer
let scene
let ambientLight
let spotlight
let renderer
let f1
let leftFrontWheel
let rightFrontWheel
let leftRearWheel
let rightRearWheel
let keyRotationObject
let floor

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

const createF1 = async () => {
  try {
    let f1Model = await loadModel('formula1b.glb')
    f1Model.receiveShadow = true
    let f1 = f1Model
    f1.scale.set(0.1, 0.1, 0.1)
    f1.rotation.set(0, 0, 0)
    f1.position.set(0, 0, -2)
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

        child.material.wireframe = true
        child.layers.enable(BLOOM_SCENE)
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
  const floor = new THREE.GridHelper(700, 250, colorLinesCenter, colorLinesGrid)
  floor.material.linewidth = 6

  floor.position.x = 80
  floor.position.z = 250

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
  finalComposer.render()
}

const spinWheel = (wheel) => {
  if (wheel) {
    wheel.children[0].rotation.x -= 0.15
    wheel.children[1].rotation.z -= 0.15
  }
}

let wheelLock = Math.PI / 6
let wheelTurn = 0
let currentWheelTurn = 0

const turnWheels = (finalAngle) => {
  wheelLock = finalAngle
  wheelTurn = finalAngle > currentWheelTurn ? 0.05 : -0.05
}

let fullSpeed = 0.1
let currentSpeed = fullSpeed
let currentTurnRate = 0
let destinationAngle = null

const turnCar = (finalAngle) => {
  destinationAngle = finalAngle
  currentTurnRate = f1.rotation.y < destinationAngle ? 0.03 : -0.03
}

let currentKeyframeIndex = 0
const keyframes = [
  {
    // F0
    condition: () => {
      return f1.position.z > 40
    },
    transformation: () => {
      setCameraMode('sidepod')
      return true
    },
  },
  {
    // F1
    condition: () => {
      return f1.position.z > 76
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI / 2)
      return true
    },
  },
  {
    // F2
    condition: () => {
      return f1.position.x > 8
    },
    transformation: () => {
      //setCameraMode('above')
      setCameraMode('aheadside')
      return true
    },
  },
  {
    // F3
    condition: () => {
      return f1.position.x > 20
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(0)
      return true
    },
  },
  {
    // F4
    condition: () => {
      return f1.position.z > 108
    },
    transformation: () => {
      setCameraMode('godseye')
      return true
    },
  },
  {
    // F5
    condition: () => {
      return f1.position.z > 108
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(-Math.PI / 4)
      return true
    },
  },
  {
    // F6
    condition: () => {
      return f1.position.x < 2
    },
    transformation: () => {
      setCameraMode('onboard')
      return true
    },
  },
  {
    // F7
    condition: () => {
      return f1.position.x < 0
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(0)
      return true
    },
  },
  {
    // F9
    condition: () => {
      return f1.position.z > 157.5
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI / 2)
      return true
    },
  },
  {
    // F10
    condition: () => {
      return f1.position.x > 10
    },
    transformation: () => {
      setCameraMode('above')
      return true
    },
  },
  {
    // F11
    condition: () => {
      return f1.position.x > 20
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(0)
      return true
    },
  },
  {
    // F12
    condition: () => {
      return f1.position.z > 190
    },
    transformation: () => {
      setCameraMode('sidepod')
      return true
    },
  },
  {
    // F13
    condition: () => {
      return f1.position.z > 220
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(-Math.PI / 4)
      return true
    },
  },
  {
    // F14
    condition: () => {
      return f1.position.x < 14
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(0)
      return true
    },
  },
  {
    // F15
    condition: () => {
      return f1.position.z > 260
    },
    transformation: () => {
      setCameraMode('above')
      return true
    },
  },
  {
    // F16
    condition: () => {
      return f1.position.z > 260
    },
    transformation: () => {
      setCameraMode('above')
      return true
    },
  },
  {
    // F17
    condition: () => {
      return f1.position.z > 270
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(-Math.PI / 4)
      return true
    },
  },
  {
    // F18
    condition: () => {
      return f1.position.z > 275
    },
    transformation: () => {
      setCameraMode('aheadside')
      return true
    },
  },
  {
    // F19
    condition: () => {
      return f1.position.z > 283
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(0)
      return true
    },
  },
  {
    // F20
    condition: () => {
      return f1.position.z > 354
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI / 2)
      return true
    },
  },
  {
    // F21
    condition: () => {
      return f1.position.x > 20
    },
    transformation: () => {
      setCameraMode('above')
      return true
    },
  },
  {
    // F22
    condition: () => {
      return f1.position.x > 31
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(0)
      return true
    },
  },
  {
    // F23
    condition: () => {
      return f1.position.z > 390
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(-Math.PI / 2)
      return true
    },
  },
  {
    // F25
    condition: () => {
      return f1.position.x < 5
    },
    transformation: () => {
      setCameraMode('onboard')
      return true
    },
  },
  {
    // F25
    condition: () => {
      return f1.position.x < 3
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(0)
      return true
    },
  },
  {
    // F14
    condition: () => {
      return f1.position.z > 425
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI / 2)
      return true
    },
  },
  {
    // F15
    condition: () => {
      return f1.position.x > 11
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(0)
      return true
    },
  },
  {
    // F16
    condition: () => {
      return f1.position.z > 475
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI)
      return true
    },
  },
  {
    // F17
    condition: () => {
      return f1.position.z < 437
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar((Math.PI * 3) / 4)
      return true
    },
  },
  {
    // F18
    condition: () => {
      return f1.position.z < 427
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(Math.PI / 2)
      return true
    },
  },
  {
    // F19
    condition: () => {
      return f1.position.x > 64
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI / 4)
      return true
    },
  },
  {
    // F20
    condition: () => {
      return f1.position.x > 85
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(0)
      return true
    },
  },
  {
    // F21
    condition: () => {
      return f1.position.z > 485
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI / 4)
      return true
    },
  },
  {
    // F22
    condition: () => {
      return f1.position.x > 98
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI)
      return true
    },
  },
  {
    // F23
    condition: () => {
      return f1.position.z < 416
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(Math.PI / 2)
      return true
    },
  },
  {
    // F24
    condition: () => {
      return f1.position.x > 144
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI)
      return true
    },
  },
  {
    // F25
    condition: () => {
      return f1.position.z < 363
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar((Math.PI * 5) / 4)
      return true
    },
  },
  {
    // F25
    condition: () => {
      return f1.position.x < 136
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(Math.PI)
      return true
    },
  },
  {
    // F26
    condition: () => {
      return f1.position.z < 316
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar((Math.PI * 5) / 4)
      return true
    },
  },
  {
    // F27
    condition: () => {
      return f1.position.x < 107
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI)
      return true
    },
  },
  {
    // F28
    condition: () => {
      return f1.position.z < 255.5
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(Math.PI / 2)
      return true
    },
  },
  {
    // F29
    condition: () => {
      return f1.position.x > 134
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar((Math.PI * 3) / 4)
      return true
    },
  },
  {
    // F30
    condition: () => {
      return f1.position.z < 241
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI)
      return true
    },
  },
  {
    // F31
    condition: () => {
      return f1.position.z < 206
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar((Math.PI * 11) / 8)
      return true
    },
  },
  {
    // F32
    condition: () => {
      return f1.position.x < 121
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar((Math.PI * 3) / 2)
      return true
    },
  },
  {
    // F33
    condition: () => {
      return f1.position.x < 110
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI)
      return true
    },
  },
  {
    // F34
    condition: () => {
      return f1.position.z < 102
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(Math.PI / 2)
      return true
    },
  },
  {
    // F35
    condition: () => {
      return f1.position.x > 122
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(0)
      return true
    },
  },
  {
    // F36
    condition: () => {
      return f1.position.z > 150
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI)
      return true
    },
  },
  {
    // F37
    condition: () => {
      return f1.position.z < 112
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar((Math.PI * 3) / 4)
      return true
    },
  },
  {
    // F38
    condition: () => {
      return f1.position.x > 146.5
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI)
      return true
    },
  },
  {
    // F39
    condition: () => {
      return f1.position.z < 63
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(Math.PI / 2)
      return true
    },
  },
  {
    // F40
    condition: () => {
      return f1.position.x > 164
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI)
      return true
    },
  },
  {
    // F41
    condition: () => {
      return f1.position.z < 36
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar((Math.PI * 3) / 2)
      return true
    },
  },
  {
    // F42
    condition: () => {
      return f1.position.x < 151
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(Math.PI)
      return true
    },
  },
]

const animate = () => {
  const currentKeyframe =
    currentKeyframeIndex < keyframes.length
      ? keyframes[currentKeyframeIndex]
      : null

  if (currentKeyframe && currentKeyframe.condition()) {
    console.log('frame', currentKeyframeIndex, f1.position.x, f1.position.z)
    if (currentKeyframe.transformation()) {
      currentKeyframeIndex++
    }
  }

  spinWheel(leftFrontWheel)
  spinWheel(rightFrontWheel)
  spinWheel(leftRearWheel)
  spinWheel(rightRearWheel)

  if (wheelTurn !== 0) {
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
    if (
      (wheelTurn > 0 && currentWheelTurn > wheelLock) ||
      (wheelTurn < 0 && wheelLock > currentWheelTurn)
    ) {
      wheelTurn = 0
    }
  }

  if (currentTurnRate !== 0) {
    f1.rotation.y += currentTurnRate
    if (
      (currentTurnRate > 0 && f1.rotation.y > destinationAngle) ||
      (currentTurnRate < 0 && f1.rotation.y < destinationAngle)
    ) {
      currentTurnRate = 0
      f1.rotation.y = destinationAngle
      destinationAngle = 0
      currentSpeed = fullSpeed
      turnWheels(0)
    }
  }

  const euler = new THREE.Euler(
    f1.rotation.x,
    f1.rotation.y,
    f1.rotation.z,
    'XYZ'
  )
  const quat = new THREE.Quaternion().setFromEuler(euler)
  const vector = new THREE.Vector3(0, 0, currentSpeed).applyQuaternion(quat)

  f1.position.add(vector)

  updateCamera(f1)

  const maxGray = 0.8
  floor.material.color.r = Math.min(10 / camera.position.y, maxGray)
  floor.material.color.g = Math.min(10 / camera.position.y, maxGray)
  floor.material.color.b = Math.min(10 / camera.position.y, maxGray)

  analyser.getByteFrequencyData(dataArray)
  setLogoColors(dataArray)

  render()
}

// Set animation current state
const setAnimationFrame = (frame, x, z) => {
  f1.position.set(x, 0, z)
  currentKeyframeIndex = frame
}

const createScene = async () => {
  const params = {
    threshold: 0,
    strength: 0.5,
    radius: 0.3,
    exposure: 0.5,
  }

  createCamera(window.innerWidth / window.innerHeight)
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

  await createLogo()
  scene.add(logo)

  f1 = await createF1()
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
  renderer.toneMapping = THREE.ReinhardToneMapping

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
  window.addEventListener('mousedown', () => {
    console.log(f1.position.x, f1.position.z)
    console.log(f1.rotation)
    console.log(camera.rotation)
  })

  //f1.rotation.y = Math.PI
  //setAnimationFrame(40, 147.48164755483327, 80.43642102212316)
}

createScene()
