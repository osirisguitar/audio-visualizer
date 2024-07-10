let audio1 = new Audio()
audio1.src =
  'OSIRIS DREAMS - The Cybergenix Conspiracy - 01 Biomechanoid Prototype.mp3'

const container = document.getElementById('container')
const canvas = document.getElementById('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const ctx = canvas.getContext('2d')

const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
let audioSource = null
let analyser = null

audio1.volume = 0.1
audio1.play()
audioSource = audioCtx.createMediaElementSource(audio1)
analyser = audioCtx.createAnalyser()
audioSource.connect(analyser)
analyser.connect(audioCtx.destination)

analyser.fftSize = 128
const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)
const barWidth = canvas.width / bufferLength

document.getElementById('container').onclick = (evt) => {
  if (audio1.paused) {
    audio1.play()
  } else {
    audio1.pause()
  }
}

let x = 0
function animate() {
  x = 0
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  analyser.getByteFrequencyData(dataArray)
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i]
    ctx.fillStyle = 'white'
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
    x += barWidth
  }

  requestAnimationFrame(animate)
}

animate()
