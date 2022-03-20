<template>
  <div
    class="fixed top-0 bottom-0 left-0 right-0 pointer-events-none"
    style="z-index: -1"
  >
    <canvas ref="el" width="400" height="400" />
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

<script setup="props" lang="ts">
import { Fn } from "@vueuse/core"
const { random } = Math

const el = ref<HTMLCanvasElement | null>(null)
const size = reactive(useWindowSize())

const cst = {
  r15: Math.PI / 12,
  r90: Math.PI / 2,
  r180: Math.PI,
  //
  fps: 40, // refresh rate
}

interface Opts {
  decay: number // number of splits before considering to stop
  stepSize: number // distance
  color: string // line color
  splitRad: number // angle at splitting

  maxBranches: number // max number of branches generated
}

const opts: Opts = {
  decay: 3,
  stepSize: 6,
  color: "#88888825",
  splitRad: cst.r15,
  //
  maxBranches: size.width * 4,
}

function initCanvas(
  canvas: HTMLCanvasElement,
  width = 400,
  height = 400,
  _dpi?: number,
) {
  const ctx = canvas.getContext("2d")!

  const dpr = window.devicePixelRatio || 1

  const bsr =
    // @ts-ignore
    ctx.webkitBackingStorePixelRatio ||
    // @ts-ignore
    ctx.mozBackingStorePixelRatio ||
    // @ts-ignore
    ctx.msBackingStorePixelRatio ||
    // @ts-ignore
    ctx.oBackingStorePixelRatio ||
    // @ts-ignore
    ctx.backingStorePixelRatio ||
    1

  const dpi = _dpi || dpr / bsr

  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  canvas.width = dpi * width
  canvas.height = dpi * height
  ctx.scale(dpi, dpi)

  return { ctx, dpi }
}

function polar2cart(x = 0, y = 0, r = 0, theta = 0) {
  const dx = r * Math.cos(theta)
  const dy = r * Math.sin(theta)
  return [x + dx, y + dy]
}

const isInRadBounds = (rad: number, initialRad: number) => {
  return (
    initialRad - 3 * opts.splitRad < rad && rad < initialRad + 3 * opts.splitRad
  )
}

interface State {
  nbranches: number // current number of branches
  initialRad: number // keep track of global direction
  steps: Fn[] // new steps to execute
  prevSteps: Fn[] // steps to execute
}

onMounted(() => {
  const canvas = el.value!

  const { ctx } = initCanvas(canvas, size.width, size.height)
  const { width, height } = canvas

  let lastTime = performance.now() // keep track of time

  const stepPlum = (x: number, y: number, rad: number, state: State) => {
    if (state.nbranches > opts.maxBranches) return

    const [nx, ny] = polar2cart(x, y, random() * opts.stepSize, rad)

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(nx, ny)
    ctx.stroke()

    const radStep = random() * opts.splitRad
    const rad1 = isInRadBounds(rad + radStep, state.initialRad)
      ? rad + radStep
      : rad - 3 * radStep
    const rad2 = isInRadBounds(rad - radStep, state.initialRad)
      ? rad - radStep
      : rad + 3 * radStep

    ;[rad1, rad2].forEach((r) => {
      const canExpand = state.nbranches <= opts.decay || random() > 0.5
      if (canExpand) {
        state.steps.push(() => stepPlum(nx, ny, r, state))
      }
    })

    if (!state.steps.length) {
      state.steps.push(() => stepPlum(nx, ny, state.initialRad, state))
    }
  }

  const getInitialState = (x: number, y: number, rad: number): State => {
    const state = {
      nbranches: 0,
      initialRad: rad,
      steps: [] as Fn[],
      prevSteps: [] as Fn[],
    }
    state.steps.push(() => stepPlum(x, y, rad, state))
    return state
  }

  let controls: ReturnType<typeof useRafFn>

  let states = [
    getInitialState(size.width, size.height - 100, -cst.r180),
    getInitialState(0, size.height - 100, 0),
  ]

  const frame = () => {
    if (cst.fps < 1000 / (performance.now() - lastTime)) return
    lastTime = performance.now()

    const totalSteps = states.reduce(
      (agg, state) => (agg += state.steps.length),
      0,
    )
    const allDone = states.reduce(
      (agg, state) => (agg = agg && opts.maxBranches < state.nbranches),
      true,
    )

    if (!totalSteps || allDone) {
      states.forEach((state) => {
        console.debug(
          `Stopped after ${state.nbranches}/${opts.maxBranches} branches.`,
        )
      })
      controls.pause()
    }

    states.forEach((state) => {
      state.nbranches += state.steps.length

      state.prevSteps = state.steps
      state.steps = []
      state.prevSteps.forEach((i) => i())
    })
  }

  controls = useRafFn(frame, { immediate: false })

  const trigger = () => {
    // Cleanup & init
    controls.pause()
    ctx.clearRect(0, 0, width, height)
    ctx.lineWidth = 1
    ctx.strokeStyle = opts.color

    // Object.keys(state.draws).forEach(
    //   (label) => (state.draws[label].prevSteps = [])
    // );

    controls.resume()
  }

  trigger()
})
</script>
