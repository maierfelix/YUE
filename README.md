# YUE

Personal WebGPU based 3D renderer.

### Installation:
````
npm install yue.js
````

### Demo:

<a href="https://i.imgur.com/HK85gTQ.mp4">
  <img src="https://i.imgur.com/HK85gTQ.gif" width="50%">
</a>

### API Example:

````ts
import * as YUE from "yue";

(async() => {

  const renderer = await new YUE.Renderer({canvas}).create();

  const camera = new YUE.SphericalCamera();
  camera.attachControl(renderer.getCanvas());

  const frame = new YUE.Frame({
    clearColor: [0.925, 0.925, 0.925, 1.0]
  });
  frame.attachCamera(camera);

  const scene = new YUE.Container();
  frame.addChild(scene);

  const vertexShaderCode = await fetchText("./shaders/grid.vert");
  const fragmentShaderCode = await fetchText("./shaders/grid.frag");

  const vertexShader = new YUE.Shader({stage: YUE.SHADER_STAGE.VERTEX, code: vertexShaderCode});
  const fragmentShader = new YUE.Shader({stage: YUE.SHADER_STAGE.FRAGMENT, code: fragmentShaderCode});

  const material = new YUE.Material({
    attributes: YUE.Plane.AttributeLayout,
    vertexShader: {
      shader: vertexShader,
      uniforms: [
        {name: "Camera", id: 0, type: YUE.SHADER_UNIFORM.UNIFORM_BUFFER, isShared: true, byteLength: 64},
        {name: "Object", id: 1, type: YUE.SHADER_UNIFORM.UNIFORM_BUFFER, byteLength: 64}
      ]
    },
    fragmentShader: {
      shader: fragmentShader,
      uniforms: []
    },
    cullMode: YUE.MATERIAL_CULL_MODE.NONE,
    blendMode: YUE.MATERIAL_BLEND_MODE.NONE
  });

  const mesh = new YUE.Mesh({
    material: material,
    indices: YUE.Plane.Indices,
    scale: new Float32Array([1, 1, 1]),
    translation: new Float32Array([0, 0, 0]),
    attributes: YUE.Plane.Attributes
  });
  scene.addChild(mesh);

  // Simple ray cast from screen center
  const ray = new YUE.Ray({camera}).fromCameraCenter();
  // Contains intersection point in world-space
  const doesIntersect = ray.intersectsAABB(mesh.getBoundings()) && mesh.intersectRay(ray);

  // Check if the scene is inside the camera's frustum
  const isInsideFrustum = camera.intersectsAABB(scene.getBoundings());

  requestAnimationFrame(function drawLoop(time: number) {
    (async function() {
      await renderer.render(scene);
      requestAnimationFrame(drawLoop);
      // Update model matrix
      mesh.updateUniform("Object", mesh.getModelMatrix());
      // Update camera matrix for material
      // This update affects all objects using this material since 'Camera' is shared
      material.updateUniform("Camera", camera.getViewProjectionMatrix());
    })();
  });

})();
````
