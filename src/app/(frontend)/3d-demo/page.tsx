import { Model3D } from '@/components/ui';

export default function Model3DDemo() {
  return (
    <div className="min-h-screen p-8">
      <Model3D
        modelPath="/3d/house.glb"
        autoRotate={true}
        autoRotateSpeed={0.3}
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        className=""
      />
    </div>
  );
}
