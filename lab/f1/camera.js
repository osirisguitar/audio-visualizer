import * as THREE from 'three'

export let camera

export const createCamera = (aspectRatio) => {
  camera = new THREE.PerspectiveCamera(40, aspectRatio, 0.1, 5000)

  //  camera.position.set(0, 500, 1000)
  camera.position.set(0, 100, 0)
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

const cameraOffset = new THREE.Vector3(0, 0.2, 1)
const lookatOffset = new THREE.Vector3(0, 0, -1)
let cameraMode = 'default'

const cameraModes = {
  default: {
    camera: new THREE.Vector3(0, 200, 1),
    lookat: new THREE.Vector3(0, 0, -0.2),
    dynamic: true,
  },
  follow: {
    camera: new THREE.Vector3(0, 0.1, -0.8),
    lookat: new THREE.Vector3(0, 0, 1),
    dynamic: true,
  },
  ahead: {
    camera: new THREE.Vector3(0, 0.2, 1),
    lookat: new THREE.Vector3(0, 0, -1),
    dynamic: true,
  },
  aheadside: {
    camera: new THREE.Vector3(0.5, 0.1, 0.8),
    lookat: new THREE.Vector3(0, 0, 0.1),
    dynamic: true,
  },
  aheadsideclose: {
    camera: new THREE.Vector3(0.3, 0.2, 0.5),
    lookat: new THREE.Vector3(0, 0, 0.1),
    dynamic: true,
  },
  onboard: {
    camera: new THREE.Vector3(0, 0.2, -0.3),
    lookat: new THREE.Vector3(0, 0, 1),
    dynamic: true,
  },
  sidepod: {
    camera: new THREE.Vector3(-0.08, 0.06, -0.01),
    lookat: new THREE.Vector3(0, 0, 1),
    dynamic: true,
  },
  above: {
    camera: new THREE.Vector3(0, 200, 0),
    lookat: new THREE.Vector3(0, 0, -1),
    dynamic: true,
  },
  godseye: {
    camera: new THREE.Vector3(30, 800, 150),
    lookat: new THREE.Vector3(30, 0, 150),
    dynamic: true,
  },
}

export const setCameraMode = (mode) => {
  const modeCameraOffset = cameraModes[mode].camera
  const modeLookatOffset = cameraModes[mode].lookat
  cameraMode = mode

  cameraOffset.copy(modeCameraOffset)
  lookatOffset.copy(modeLookatOffset)
}

export const updateCamera = (target) => {
  if (cameraModes[cameraMode].dynamic) {
    const cameraEuler = new THREE.Euler(
      target.rotation.x,
      cameraOffset.y < 100 ? target.rotation.y : 0,
      target.rotation.z,
      'XYZ'
    )
    const cameraQuat = new THREE.Quaternion().setFromEuler(cameraEuler)
    const currentCameraOffset = new THREE.Vector3()
    currentCameraOffset.copy(cameraOffset)
    currentCameraOffset.applyQuaternion(cameraQuat)
    currentCameraOffset.add(target.position)
    camera.position.copy(currentCameraOffset)

    const lookatQuat = new THREE.Quaternion().setFromEuler(cameraEuler)
    const currentLookatOffset = new THREE.Vector3()
    currentLookatOffset.copy(lookatOffset)
    currentLookatOffset.applyQuaternion(lookatQuat)
    currentLookatOffset.add(target.position)
    camera.lookAt(currentLookatOffset)
  } else {
    console.log(cameraOffset, lookatOffset)
    camera.position.copy(cameraOffset)
    camera.lookAt(lookatOffset)
  }

  if (camera.position.y > 0.1) {
    //camera.position.y -= camera.position.y / 200
  }

  if (camera.position.z - target.position.z > 2) {
    //camera.position.z -= camera.position.z / 300
  } else {
    //camera.position.z = target.position.z - 1
  }
  //camera.position.x = target.position.x
}
