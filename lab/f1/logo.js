import * as THREE from 'three'
import { loadModel } from '../../public/utils'

const logoBaseColors = new Array(2)
const lastFrequencies = [0, 0]

export let logo

export const setLogoColors = (dataArray) => {
  for (let i = 0; i < 2; i++) {
    const currentFrequency = dataArray[5]

    //    if (Math.abs(currentFrequency - lastFrequencies[i]) > 1) {
    if (currentFrequency > 100) {
      logo.children[i].material.color = new THREE.Color(
        logoBaseColors[i].r + currentFrequency / 512 - 0.25,
        logoBaseColors[i].g + currentFrequency / 512 - 0.25,
        logoBaseColors[i].b + currentFrequency / 512 - 0.25
      )
    } else {
      logo.children[i].material.color = logoBaseColors[i]
    }
    lastFrequencies[i] = currentFrequency
  }
}

export const createLogo = async () => {
  try {
    const logoModel = await loadModel('/osiris-dreams-logo.glb')
    logoModel.castShadow
    logo = logoModel
    logo.castShadow = true

    logo.traverse((child) => {
      child.castShadow = true
    })

    logo.position.x = -13.5
    logo.position.z = 240
    logo.position.y = -0.3
    logo.scale.set(100, 100, 100)

    logo.rotation.set(-Math.PI / 2, 0, -Math.PI / 2)
    logoBaseColors[0] = logo.children[0].material.color
    logoBaseColors[1] = logo.children[1].material.color
    return logo
  } catch (error) {
    console.error(error)
  }
}
