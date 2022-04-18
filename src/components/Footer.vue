<script setup lang="ts">
// Highly inspired from https://github.com/antfu/plum-demo

const canvas = $ref<HTMLCanvasElement>()
const { width, height } = useWindowSize()

const ctx = $computed(() => canvas!.getContext("2d")!)

const opts = {
  color: "#88888825", // line color
  //
  decay: 3, // number of splits before considering to stop
  stepSize: 6, // distance
  splitRad: Math.PI / 12, // angle at splitting
}

interface Point {
  x: number
  y: number
}

interface Branch {
  start: Point
  length: number
  theta: number
}

interface DrawingState {
  depth: number // current number of branches for drawing
  initTheta: number // keep track of global direction
  pendingTasks: Function[] // steps pending for next frame
}

function drawLine(start: Point, end: Point) {
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()
}

function step(b: Branch, state: DrawingState) {
  const end: Point = {
    x: b.start.x + b.length * Math.cos(b.theta),
    y: b.start.y + b.length * Math.sin(b.theta),
  }

  drawLine(b.start, end)

  function getThetaInBounds(theta: number, noise: number): number {
    const isInBounds =
      state.initTheta - 3 * opts.splitRad < theta + noise &&
      theta + noise < state.initTheta + 3 * opts.splitRad

    return isInBounds ? theta + noise : theta - 3 * noise
  }

  const theta1 = getThetaInBounds(b.theta, Math.random() * opts.splitRad)
  const theta2 = getThetaInBounds(b.theta, -Math.random() * opts.splitRad)

  const thetas = [theta1, theta2]

  thetas.forEach((theta) => {
    if (state.depth < 4 || Math.random() < 0.5) {
      state.depth += 1
      state.pendingTasks.push(() =>
        step(
          {
            start: end,
            length: Math.random() * opts.stepSize,
            theta,
          },
          state,
        ),
      )
    }
  })

  if (!state.pendingTasks.length) {
    state.depth += 1
    state.pendingTasks.push(() =>
      step({ start: end, length: b.length, theta: state.initTheta }, state),
    )
  }
}

onMounted(() => {
  watchEffect(() => {
    const dpr = window.devicePixelRatio || 1
    const bsr = 1 // backing store pixel ratio
    const dpi = dpr / bsr

    // Set canvas style
    canvas.style.width = `${width.value}px`
    canvas.style.height = `${height.value}px`

    canvas.width = dpi * width.value
    canvas.height = dpi * height.value
  })

  const maxBranches = width.value * 2 // max number of branches generated

  // Set color of stroke
  ctx.strokeStyle = opts.color

  const drawings = [
    { x: canvas.width, y: canvas.height - 100, theta: -Math.PI },
    { x: 0, y: canvas.height - 100, theta: 0 },
  ]
  const initDrawings: { branch: Branch; state: DrawingState }[] = drawings.map(
    (cfg) => ({
      branch: {
        start: { x: cfg.x, y: cfg.y },
        length: opts.stepSize,
        theta: cfg.theta,
      },
      state: { depth: 0, initTheta: cfg.theta, pendingTasks: [] },
    }),
  )
  const initStates = initDrawings.map((e) => e.state)

  function frame() {
    const tasks: Function[] = []
    initStates.forEach((state) => {
      state.pendingTasks = state.pendingTasks.filter((fn) => {
        if (Math.random() > 0.4) {
          tasks.push(fn)
          return false
        }
        return true
      })
    })

    tasks.forEach((fn) => fn())
  }

  function startFrame() {
    // Check if all done
    const allDone = initStates.reduce(
      (agg, state) => (agg = agg && maxBranches < state.depth),
      true,
    )
    if (allDone) return

    requestAnimationFrame(() => {
      frame()
      startFrame()
    })
  }

  initDrawings.forEach((cfg) => step(cfg.branch, cfg.state))
  startFrame()
})
</script>

<template>
  <div
    class="fixed top-0 bottom-0 left-0 right-0 pointer-events-none"
    style="z-index: -1"
  >
    <canvas ref="canvas" width="400" height="400" />
  </div>

  <div class="fixed w-full bottom-3 font-thin text-xs opacity-40">
    <p class="flex justify-center space-x-1">
      <span>Made with ♥ using</span>
      <a class="underline" href="https://github.com/antfu/vitesse">vitesse</a>
      <span>from the amazing</span>
      <a class="underline" href="https://github.com/antfu">antfu</a>
    </p>
  </div>
</template>
