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
  // Do an initial resize to fit the screen
  camera.resize(window.innerWidth, window.innerHeight);

  const depthAttachment = new YUE.Texture({
    width: window.innerWidth,
    height: window.innerHeight,
    isRenderable: true,
    format: YUE.TEXTURE_FORMAT.DEPTH32_FLOAT
  });

  const frame = new YUE.Frame({
    depthAttachment: {
      attachment: depthAttachment,
      readCommand: YUE.FRAME_COMMAND.CLEAR,
      writeCommand: YUE.FRAME_COMMAND.WRITE
    },
    colorAttachments: [
      {
        // Render into swapchain texture
        attachment: renderer.getSwapchainTexture(),
        clearColor: [1, 1, 1, 1],
        readCommand: YUE.FRAME_COMMAND.CLEAR,
        writeCommand: YUE.FRAME_COMMAND.WRITE
      }
    ]
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
    depthOutput: {
      format: YUE.TEXTURE_FORMAT.DEPTH32_FLOAT
    },
    colorOutputs: [
      {format: renderer.getSwapchainFormat()},
    ],
    cullMode: YUE.MATERIAL_CULL_MODE.NONE
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
  // Indicates if the scene is inside the camera's frustum
  const isInsideFrustum = camera.intersectsAABB(scene.getBoundings());

  // Update loop
  setTimeout(function updateLoop() {
    (async function() {
      await frame.update(renderer);
      setTimeout(updateLoop);
    })();
  });

  // Draw loop
  requestAnimationFrame(function drawLoop(time: number) {
    requestAnimationFrame(drawLoop);
    // Render frames
    renderer.render(frame);
    // Update model matrix of the mesh
    mesh.updateUniform("Object", mesh.getModelMatrix());
    // Update camera matrix of the material
    // This update affects all objects using this material since the uniform 'Camera' is shared
    material.updateUniform("Camera", camera.getViewProjectionMatrix());
  });

})();
````
