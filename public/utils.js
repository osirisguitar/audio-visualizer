import { GLTFLoader } from 'three/addons'
import { FBXLoader } from 'three/addons'

const gltfLoader = new GLTFLoader()
const fbxLoader = new FBXLoader()

export const loadModel = async (filename) => {
  let loader = gltfLoader
  if (filename.toLowerCase().endsWith('.fbx')) {
    loader = fbxLoader
  }

  return new Promise((resolve, reject) => {
    try {
      loader.load(filename, (model) => {
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

// obj - your object (THREE.Object3D or derived)
// point - the point of rotation (THREE.Vector3)
// axis - the axis of rotation (normalized THREE.Vector3)
// theta - radian value of rotation
// pointIsWorld - boolean indicating the point is in world coordinates (default = false)
export const rotateAboutPoint = (
  obj,
  point,
  axis,
  theta,
  pointIsWorld = false
) => {
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
