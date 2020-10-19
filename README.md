# YUE

Personal WebGPU based 3D renderer.

API Example:

````ts

(async() => {

  const renderer = await new YUE.Renderer({canvas}).create();

  const camera = new YUE.SphericalCamera();
  camera.attachControl(renderer.getCanvas());

  const scene = new YUE.Scene({
    clearColor: [0.925, 0.925, 0.925, 1.0]
  });
  scene.attachCamera(camera);

  const stage = new YUE.Container();
  scene.addChild(stage);

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
  stage.addChild(mesh);

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
