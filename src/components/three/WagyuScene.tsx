import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { createCrustTexture, createMarbleTexture } from './marbleTexture'

/** Ribeye silhouette (units ≈ world units) */
function ribeyeShape() {
  const s = new THREE.Shape()
  s.moveTo(-1.9, -0.1)
  s.bezierCurveTo(-2.0, 1.0, -1.0, 1.55, 0.2, 1.5)
  s.bezierCurveTo(1.3, 1.45, 2.1, 1.0, 2.05, 0.05)
  s.bezierCurveTo(2.0, -0.9, 1.3, -1.45, 0.1, -1.45)
  s.bezierCurveTo(-1.1, -1.45, -1.8, -1.0, -1.9, -0.1)
  return s
}

function Steak({ scroll, pointer }: { scroll: MutableRefObject<number>; pointer: MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null!)
  const { geometry, materials, salt } = useMemo(() => {
    const shape = ribeyeShape()
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.72,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.12,
      bevelSegments: 8,
      curveSegments: 64,
    })
    geometry.center()
    // Normalise cap UVs to the shape's bounding box so the marbling covers it once
    geometry.computeBoundingBox()
    const bb = geometry.boundingBox!
    const uv = geometry.attributes.uv as THREE.BufferAttribute
    const pos = geometry.attributes.position as THREE.BufferAttribute
    const w = bb.max.x - bb.min.x
    const h = bb.max.y - bb.min.y
    const groups = geometry.groups
    const capEnd = groups[0].start + groups[0].count
    const index = geometry.index
    const capVerts = new Set<number>()
    for (let i = groups[0].start; i < capEnd; i++) capVerts.add(index ? index.getX(i) : i)
    capVerts.forEach((vi) => uv.setXY(vi, (pos.getX(vi) - bb.min.x) / w, (pos.getY(vi) - bb.min.y) / h))
    uv.needsUpdate = true

    const marble = createMarbleTexture(10, 1024)
    const crust = createCrustTexture()
    crust.repeat.set(3, 1)
    const materials = [
      new THREE.MeshPhysicalMaterial({ map: marble, bumpMap: marble, bumpScale: 0.3, roughness: 0.78, specularIntensity: 0.35, sheen: 0.25, sheenRoughness: 0.5, sheenColor: new THREE.Color('#ff9a8a') }),
      new THREE.MeshStandardMaterial({ map: crust, bumpMap: crust, bumpScale: 2, roughness: 0.7, color: '#c98a6a' }),
    ]

    // Coarse salt flakes on the top face
    const rand = (() => {
      let s = 42
      return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
    })()
    const salt: Array<[number, number, number, number]> = []
    while (salt.length < 70) {
      const x = (rand() * 2 - 1) * 1.7
      const y = (rand() * 2 - 1) * 1.2
      if ((x / 1.8) ** 2 + (y / 1.3) ** 2 < 0.85) salt.push([x, y, rand() * Math.PI, 0.025 + rand() * 0.03])
    }
    return { geometry, materials, salt }
  }, [])

  useFrame((state, dt) => {
    const g = group.current
    const p = scroll.current
    const t = state.clock.elapsedTime
    const targetX = -0.95 + p * 0.9 + pointer.current.y * 0.15
    const targetY = t * 0.12 + p * Math.PI * 0.9 + pointer.current.x * 0.25
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 3, dt)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 3, dt)
    g.rotation.z = Math.sin(t * 0.4) * 0.05
    g.position.y = Math.sin(t * 0.8) * 0.08 - p * 0.6
    const s = (window.innerWidth < 768 ? 0.72 : 0.8) + p * 0.3
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 3, dt))
  })

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={materials} castShadow />
      {salt.map(([x, y, r, sz], i) => (
        <mesh key={i} position={[x, y, 0.5]} rotation={[r, r * 1.3, r * 0.7]}>
          <boxGeometry args={[sz, sz, sz]} />
          <meshStandardMaterial color="#ffffff" emissive="#d8d2c8" emissiveIntensity={0.35} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

/** Rising embers, additive-blended */
function Embers({ count = 260 }) {
  const ref = useRef<THREE.Points>(null!)
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1
      speeds[i] = 0.2 + Math.random() * 0.6
    }
    return { positions, speeds }
  }, [count])
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')!
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grd.addColorStop(0, 'rgba(255,220,160,1)')
    grd.addColorStop(0.3, 'rgba(255,120,40,0.8)')
    grd.addColorStop(1, 'rgba(255,60,0,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  }, [])
  useFrame((state, dt) => {
    const a = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      let y = a.getY(i) + speeds[i] * dt
      if (y > 4.5) y = -4.5
      a.setY(i, y)
      a.setX(i, a.getX(i) + Math.sin(t * speeds[i] * 2 + i) * 0.002)
    }
    a.needsUpdate = true
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={tex} size={0.09} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function Rig({ pointer }: { pointer: MutableRefObject<{ x: number; y: number }> }) {
  const { camera, size } = useThree()
  useFrame((_, dt) => {
    const narrow = size.width < 768
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.current.x * 0.4 + (narrow ? 0 : -1.2), 2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.current.y * 0.3 + (narrow ? -1.9 : 0), 2, dt)
    camera.position.z = narrow ? 11 : 7.2
    camera.lookAt(narrow ? 0 : -1.2, narrow ? -1.9 : 0, 0)
  })
  return null
}

export default function WagyuScene({ scroll, pointer, active = true }: { scroll: MutableRefObject<number>; pointer: MutableRefObject<{ x: number; y: number }>; active?: boolean }) {
  return (
    <Canvas flat frameloop={active ? "always" : "never"} dpr={[1, 1.8]} camera={{ position: [0, 0, 7.2], fov: 35 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.35} />
      <spotLight position={[-4, 6, 6]} angle={0.5} penumbra={0.9} intensity={38} color="#fff1e6" />
      <pointLight position={[4, -2, 3]} intensity={22} color="#ff6a2a" />
      <directionalLight position={[3, 3, -4]} intensity={2} color="#c8a165" />
      <directionalLight position={[0, 4, 5]} intensity={0.6} color="#ffffff" />
      <Rig pointer={pointer} />
      <Steak scroll={scroll} pointer={pointer} />
      <Embers />
    </Canvas>
  )
}
