import { GLTFLoader } from 'three/addons'
import { FBXLoader } from 'three/addons'

let gltfLoader = new GLTFLoader()
let fbxLoader = new FBXLoader()

export const loadModel = async (filename) => {
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
