import React, { useRef, Suspense, Fragment, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Text, Loader, OrbitControls, Stats } from "@react-three/drei";
import { useControl, ControlsProvider } from "react-three-gui";
import { Fonts } from "./fonts";
import vertexShader from './shader/vertexShader';
import fragmentShader from './shader/fragmentShader';

// Based on the tutorial from codrops: https://tympanus.net/codrops/2020/06/02/kinetic-typography-with-three-js/

// const glsl = (a: TemplateStringsArray): string => a.toString();

function Font({ fontRef, text }) {
  const fontSize = useControl("fontSize", {
    type: "number",
    value: 33,
    min: 1,
    max: 100
  });
  const fontWidth = useControl("fontWidth", {
    type: "number",
    value: 0.2,
    min: 0,
    max: 1
  });

  const font = useControl("Fonts", {
    type: "select",
    items: Object.keys(Fonts),
    value: "Orbitron"
  });

  return (
    <Text
      ref={fontRef}
      scale={[fontWidth, 1, 1]}
      color="#fff"
      font={Fonts[font]}
      fontSize={fontSize}
    >
      {text}
    </Text>
  );
}


const TorusKnot = ({ rt }) => {
  const shaderOpts = {
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: rt.texture }
    }
  };
  const shaderMaterial = useRef<THREE.ShaderMaterial | null>(null);

  useFrame(({ clock }) => {
    if (!shaderMaterial.current) return;
    shaderMaterial.current.uniforms.uTime.value = clock.getElapsedTime();
  }, 1);

  return (
    <mesh>
      <torusKnotBufferGeometry args={[9, 3, 768, 3, 4, 3]} />
      <shaderMaterial ref={shaderMaterial} args={[shaderOpts]} />
    </mesh>
  );
};

const Content = () => {
  const { gl, scene, camera } = useThree();
  const font = useResource();

  const cameraZ = useControl("RT Camera Z", {
    type: "number",
    value: 50,
    min: 1,
    max: 100
  });

  const [rt, rtScene, rtCamera] = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );

    const rtCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

    const rtScene = new THREE.Scene();
    rtScene.background = new THREE.Color("#000");

    return [rt, rtScene, rtCamera];
  }, []);

  useEffect(() => {
    rtScene.add(font.current);
  }, [rtScene, font]);

  useFrame(() => {
    rtCamera.position.z = cameraZ;

    gl.setRenderTarget(rt);
    gl.render(rtScene, rtCamera);
    gl.setRenderTarget(null);
    gl.render(scene, camera);
  }, 1);

  return (
    <>
      <TorusKnot rt={rt} />
      <Font fontRef={font} text="ENDLESS" />
    </>
  );
};

export const App = () => (
  <Fragment>
    <ControlsProvider>
      <Canvas
        style={{ background: "#000" }}
        pixelRatio={[1, 2]}
        camera={{
          fov: 45,
          aspect: window.innerWidth / window.innerHeight,
          position: [0, 0, 60],
          near: 1,
          far: 1000
        }}
      >
        <Suspense fallback={null}>
          <Content />
        </Suspense>
        {/* <OrbitControls /> */}
      </Canvas>
      <Stats />
      {/* <Controls /> */}
      <Loader />
    </ControlsProvider>
  </Fragment>
);


