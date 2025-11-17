import { Scene3D } from '@/components/planner/Scene3D';
import { Sidebar } from '@/components/planner/Sidebar';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';

const Index = () => {
  //  Initialize global keyboard shortcuts (movement, rotate, delete, etc.)
  useKeyboardControls();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
       {/* Sidebar: tools, furniture list, and property editor */}
      <Sidebar  />
      
      <main className="flex-1 relative">
          {/* Main 3D scene canvas */}
        <Scene3D />
      </main>
    </div>
  );
};

export default Index;