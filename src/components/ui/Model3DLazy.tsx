import dynamic from 'next/dynamic';
import { Model3DProps } from './Model3D';

// Lazy load the 3D model component for better performance
const Model3D = dynamic(() => import('./Model3D'), {
  loading: () => (
    <div className="relative w-full overflow-hidden bg-gray-100 animate-pulse rounded-lg">
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading 3D model...</div>
      </div>
    </div>
  ),
  ssr: false, // Disable SSR for 3D components
});

export default function Model3DLazy(props: Model3DProps) {
  return <Model3D {...props} />;
}
