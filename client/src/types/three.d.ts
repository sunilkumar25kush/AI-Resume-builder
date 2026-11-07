declare module 'three' {
  export const DoubleSide: number;
  export const SRGBColorSpace: string;
  export const NeutralToneMapping: number;
  export const RepeatWrapping: number;
  export const ClampToEdgeWrapping: number;
  export const LinearFilter: number;
  export const LinearMipmapLinearFilter: number;

  export class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    set(x: number, y: number): this;
  }

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    clone(): Vector3;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    subVectors(a: Vector3, b: Vector3): this;
    addScaledVector(v: Vector3, s: number): this;
    multiplyScalar(s: number): this;
    divideScalar(s: number): this;
    cross(v: Vector3): this;
    crossVectors(a: Vector3, b: Vector3): this;
    dot(v: Vector3): number;
    length(): number;
    lengthSq(): number;
    setLength(l: number): this;
    normalize(): this;
    negate(): this;
    distanceTo(v: Vector3): number;
    lerpVectors(v1: Vector3, v2: Vector3, alpha: number): this;
    applyQuaternion(q: Quaternion): this;
    transformDirection(m: Matrix4): this;
  }

  export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x: number, y: number, z: number, w: number): this;
    identity(): this;
    copy(q: Quaternion): this;
    clone(): Quaternion;
    invert(): this;
    normalize(): this;
    multiply(q: Quaternion): this;
    premultiply(q: Quaternion): this;
    setFromAxisAngle(axis: Vector3, angle: number): this;
    setFromRotationMatrix(m: Matrix4): this;
  }

  export class Matrix4 {
    makeBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): this;
  }

  export class Color {
    constructor(r?: number | string, g?: number, b?: number);
    set(value: string | number): this;
    setRGB(r: number, g: number, b: number, colorSpace?: string): this;
  }

  export class Path {
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this;
  }

  export class Shape extends Path {
    holes: Path[];
  }

  export class BufferAttribute {
    count: number;
    needsUpdate: boolean;
    constructor(array: Float32Array, itemSize: number);
    getX(index: number): number;
    getY(index: number): number;
    setXY(index: number, x: number, y: number): this;
    setXYZ(index: number, x: number, y: number, z: number): this;
  }

  export class BufferGeometry {
    setAttribute(name: string, attribute: BufferAttribute): this;
    getAttribute(name: string): BufferAttribute;
    setIndex(index: number[]): this;
    translate(x: number, y: number, z: number): this;
    clone(): BufferGeometry;
    dispose(): void;
  }

  export class ExtrudeGeometry extends BufferGeometry {
    constructor(shapes?: Shape | Shape[], options?: Record<string, unknown>);
  }

  export class ShapeGeometry extends BufferGeometry {
    constructor(shapes?: Shape | Shape[], curveSegments?: number);
  }

  export class PlaneGeometry extends BufferGeometry {
    constructor(width?: number, height?: number);
  }

  export class TorusGeometry extends BufferGeometry {
    constructor(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number);
  }

  export class Texture {
    colorSpace: string;
    anisotropy: number;
    wrapS: number;
    wrapT: number;
    repeat: Vector2;
    magFilter: number;
    minFilter: number;
    generateMipmaps: boolean;
    needsUpdate: boolean;
    dispose(): void;
  }

  export class CanvasTexture extends Texture {
    constructor(canvas: HTMLCanvasElement);
  }

  export class DataTexture extends Texture {
    constructor(data: Uint8Array, width: number, height: number);
  }

  export interface WebGLProgramParametersWithUniforms {
    uniforms: Record<string, { value: unknown }>;
    vertexShader: string;
    fragmentShader: string;
  }

  export class Material {
    roughness: number;
    metalness: number;
    clearcoat: number;
    clearcoatRoughness: number;
    anisotropy: number;
    color: Color;
    onBeforeCompile: (shader: WebGLProgramParametersWithUniforms) => void;
    dispose(): void;
  }

  export class MeshBasicMaterial extends Material {
    constructor(parameters?: Record<string, unknown>);
  }

  export class MeshStandardMaterial extends Material {
    constructor(parameters?: Record<string, unknown>);
  }

  export class MeshPhysicalMaterial extends Material {
    constructor(parameters?: Record<string, unknown>);
  }

  export class Object3D {
    position: Vector3;
    rotation: { x: number; y: number; z: number };
    quaternion: Quaternion;
    scale: Vector3;
    frustumCulled: boolean;
    matrixWorldInverse: Matrix4;
    add(...object: Object3D[]): this;
    lookAt(x: number, y: number, z: number): void;
    rotateZ(angle: number): this;
    updateMatrixWorld(force?: boolean): void;
  }

  export class Group extends Object3D {}

  export class Mesh extends Object3D {
    geometry: BufferGeometry;
    material: Material;
    constructor(geometry?: BufferGeometry, material?: Material);
  }

  export class Scene extends Object3D {
    background: Color | null;
    environment: Texture | null;
  }

  export class PerspectiveCamera extends Object3D {
    aspect: number;
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    updateProjectionMatrix(): void;
  }

  export class DirectionalLight extends Object3D {
    constructor(color?: number, intensity?: number);
  }

  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    outputColorSpace: string;
    toneMapping: number;
    toneMappingExposure: number;
    capabilities: { getMaxAnisotropy(): number };
    constructor(parameters?: Record<string, unknown>);
    setClearColor(color: number, alpha?: number): void;
    setPixelRatio(value: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
  }

  export class PMREMGenerator {
    constructor(renderer: WebGLRenderer);
    fromScene(scene: Scene, sigma?: number): { texture: Texture; dispose(): void };
    dispose(): void;
  }

  export class CatmullRomCurve3 {
    constructor(points?: Vector3[], closed?: boolean, curveType?: string);
    updateArcLengths(): void;
    getPointAt(u: number, optionalTarget?: Vector3): Vector3;
    getLength(): number;
  }

  export class Raycaster {
    ray: { at(t: number, target: Vector3): Vector3 };
    setFromCamera(coords: Vector2, camera: PerspectiveCamera): void;
    intersectObjects(objects: Object3D[], recursive?: boolean): Array<{ point: Vector3; distance: number }>;
  }
}
