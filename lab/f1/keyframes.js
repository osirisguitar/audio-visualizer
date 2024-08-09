const keyframes = [
  {
    index: 1,
    isFinished: false,
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
    index: 2,
    isFinished: false,
    condition: () => {
      return f1.rotation.y == Math.PI / 2
    },
    transformation: () => {
      turnWheels(0)
      return true
    },
  },
  {
    index: 3,
    isFinished: false,
    condition: () => {
      return f1.position.x > 20.5
    },
    transformation: () => {
      turnWheels(-Math.PI / 6)
      turnCar(0)
      return true
    },
  },
  {
    index: 4,
    isFinished: false,
    condition: () => {
      return f1.rotation.y == 0
    },
    transformation: () => {
      turnWheels(0)
      return true
    },
  },
  {
    index: 5,
    isFinished: false,
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
    index: 6,
    isFinished: false,
    condition: () => {
      return f1.rotation.y == -Math.PI / 4
    },
    transformation: () => {
      turnWheels(0)
      return true
    },
  },
  {
    index: 7,
    isFinished: false,
    condition: () => {
      return f1.position.z > 132
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(0)
      return true
    },
  },
  {
    index: 8,
    isFinished: false,
    condition: () => {
      return f1.rotation.y == 0
    },
    transformation: () => {
      turnWheels(0)
      return true
    },
  },
  {
    index: 9,
    isFinished: false,
    condition: () => {
      return f1.position.z > 272
    },
    transformation: () => {
      turnWheels(Math.PI / 6)
      turnCar(Math.PI / 4)
      return true
    },
  },
  {
    index: 10,
    isFinished: false,
    condition: () => {
      return f1.rotation.y == Math.PI / 4
    },
    transformation: () => {
      turnWheels(0)
      return true
    },
  },
]
