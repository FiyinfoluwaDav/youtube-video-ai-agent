import { OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

function GlobeDots() {
  const points = useRef<THREE.Points>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const [positions, setPositions] = useState<Float32Array | null>(null)

  useEffect(() => {
    fetch('/globe-points.json')
      .then((res) => res.json())
      .then((data: number[]) => {
        setPositions(new Float32Array(data))
      })
  }, [])

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#FF5E00') },
      uAlpha: { value: 0.0 },
    }),
    [],
  )

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05
      points.current.rotation.x = 0.2
    }
    if (materialRef.current) {
      if (materialRef.current.uniforms.uAlpha.value < 1.0) {
        materialRef.current.uniforms.uAlpha.value = Math.min(
          1.0,
          materialRef.current.uniforms.uAlpha.value + 0.02,
        )
      }
    }
  })

  if (!positions) return null

  return (
    <points ref={points} renderOrder={2} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={`
          varying vec3 vNormal;
          void main() {
            vNormal = normalMatrix * normalize(position);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 3.5 * (10.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uAlpha;
          varying vec3 vNormal;
          
          void main() {
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            float r = dot(cxy, cxy);
            if (r > 1.0) discard;
            
            float alpha = 1.0 - smoothstep(0.8, 1.0, r);
            float facing = max(0.0, dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
            alpha *= smoothstep(0.0, 0.4, facing);
            
            vec3 finalColor = mix(uColor * 0.5, uColor * 2.0, pow(facing, 2.0));
            
            gl_FragColor = vec4(finalColor, alpha * uAlpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </points>
  )
}

function GlobeCore() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05
      meshRef.current.rotation.x = 0.2
    }
  })

  return (
    <mesh ref={meshRef} renderOrder={1}>
      <sphereGeometry args={[1.98, 64, 64]} />
      <meshStandardMaterial
        color="#0a0503"
        roughness={0.8}
        metalness={0.2}
        transparent
        opacity={0.95}
      />
    </mesh>
  )
}

function AtmosphereGlow() {
  return (
    <mesh>
      <sphereGeometry args={[2.15, 32, 32]} />
      <meshStandardMaterial
        color="#F29B88"
        transparent
        opacity={0.06}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

export default function Globe() {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#FF5E00" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#D9169D"
        />

        <Stars
          radius={80}
          depth={50}
          count={3000}
          factor={3}
          saturation={0}
          fade
          speed={0.5}
        />

        <GlobeCore />
        <GlobeDots />
        <AtmosphereGlow />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          rotateSpeed={0.4}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 4}
        />
      </Canvas>
    </div>
  )
}
