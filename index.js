import noise from './lib/perlin.js'

const canvas = document.getElementById('canvas') // Get the canvas element
const engine = new BABYLON.Engine(canvas, true) // Generate the BABYLON 3D engine

// TODO: deal with webgpu
// const engine = new BABYLON.WebGPUEngine(canvas)
// await engine.initAsync()

const createScene = function () {
  // Creates a basic Babylon Scene object
  const scene = new BABYLON.Scene(engine)
  // Creates and positions a free camera
  const camera = new BABYLON.FreeCamera(
    'camera1',
    new BABYLON.Vector3(0, 5, -10),
    scene
  )
  // Targets the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero())
  // This attaches the camera to the canvas
  camera.attachControl(canvas, true)

  const light = new BABYLON.DirectionalLight(
    'dirLight',
    new BABYLON.Vector3(0.3, -0.42, -0.97),
    scene
  )
  light.intensity = 1
  light.autoUpdateExtends = false
  light.shadowMinZ = 0.5
  light.shadowMaxZ = 1.5
  light.orthoLeft = -0.15
  light.orthoRight = 0.2
  light.orthoBottom = -0.15
  light.orthoTop = 0.4

  const defaultRSMTextureRatio = 8
  const defaultGITextureRatio = 2

  const outputDimensions = {
    width: engine.getRenderWidth(true),
    height: engine.getRenderHeight(true),
  }

  const rsmTextureDimensions = {
    width: Math.floor(engine.getRenderWidth(true) / defaultRSMTextureRatio),
    height: Math.floor(engine.getRenderHeight(true) / defaultRSMTextureRatio),
  }

  const giTextureDimensions = {
    width: Math.floor(engine.getRenderWidth(true) / defaultGITextureRatio),
    height: Math.floor(engine.getRenderHeight(true) / defaultGITextureRatio),
  }

  const giRSMs = [
    new BABYLON.GIRSM(
      new BABYLON.ReflectiveShadowMap(scene, light, rsmTextureDimensions)
    ),
  ]
  giRSMs.forEach((girsm) => (girsm.rsm.forceUpdateLightParameters = true))

  const giRSMMgr = new BABYLON.GIRSMManager(
    scene,
    outputDimensions,
    giTextureDimensions,
    2048
  )

  giRSMMgr.addGIRSM(giRSMs)

  giRSMMgr.enable = true
  giRSMMgr.addMaterial() // no specific material transmitted to addMaterial, so all materials in the scene will be configured to render with GI

  const mapSubX = 1000 // map number of points on the width
  const mapSubZ = 800 // map number of points on the depth
  const seed = 0.3 // set the noise seed for the Y value (elevation)
  noise.setSeed(seed) // generate the simplex noise, don't care about this
  const mapData = new Float32Array(mapSubX * mapSubZ * 3) // x3 because 3 values per point: x, y, z
  for (let l = 0; l < mapSubZ; l++) {
    // loop on depth points
    for (let w = 0; w < mapSubX; w++) {
      // loop on width points
      const x = (w - mapSubX * 0.5) * 5.0 // distance inter-points = 5 on the width
      const z = (l - mapSubZ * 0.5) * 2.0 // distance inter-points = 2 on the depth
      const y = noise.simplex2(x, z) // elevation

      mapData[3 * (l * mapSubX + w)] = x
      mapData[3 * (l * mapSubX + w) + 1] = y
      mapData[3 * (l * mapSubX + w) + 2] = z
    }
  }

  return scene
}

const scene = createScene() //Call the createScene function
// Register a render loop to repeatedly render the scene

engine.runRenderLoop(function () {
  scene.render()
})

// Watch for browser/canvas resize events
window.addEventListener('resize', function () {
  engine.resize()
})
