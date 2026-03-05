
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef, useState } from 'react';
import { MousePointerClick, RotateCcw } from 'lucide-react';

interface CameraControlProps {
  onChange: (promptSuffix: string) => void;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Face {
  vertices: Point3D[];
  color: string;
  id: string; // for identifying face for features
}

const CameraControl: React.FC<CameraControlProps> = ({ onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 }); // Initial Front view
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [angleLabel, setAngleLabel] = useState('Front View');

  // Define Geometry
  const faces: Face[] = [];
  const ORANGE = '#EF4444'; // Red
  const GREY = '#CBD5E0';   // Light Grey
  const DARK_GREY = '#A0AEC0'; // Darker Grey
  const DARK_ORANGE = '#B91C1C'; // Darker Red

  // 1. Body & Head (Inverted Pyramid)
  // Top Square at Y = -1.5, Apex at Y = 0
  const bodyTopY = -1.5;
  const bodyApexY = 0;
  const bodyW = 0.6; // half width
  const bodyD = 0.6; // half depth (Z)

  const vTFL: Point3D = { x: -bodyW, y: bodyTopY, z: bodyD }; // Top Front Left
  const vTFR: Point3D = { x: bodyW, y: bodyTopY, z: bodyD };  // Top Front Right
  const vTBL: Point3D = { x: -bodyW, y: bodyTopY, z: -bodyD };// Top Back Left
  const vTBR: Point3D = { x: bodyW, y: bodyTopY, z: -bodyD }; // Top Back Right
  const vApex: Point3D = { x: 0, y: bodyApexY, z: 0 };

  faces.push(
    { vertices: [vTFL, vTFR, vApex], color: GREY, id: 'face' }, // Front Face (Face here)
    { vertices: [vTFR, vTBR, vApex], color: DARK_GREY, id: 'bodyRight' }, // Right
    { vertices: [vTBR, vTBL, vApex], color: DARK_GREY, id: 'bodyBack' },  // Back
    { vertices: [vTBL, vTFL, vApex], color: GREY, id: 'bodyLeft' },  // Left
    { vertices: [vTFL, vTBL, vTBR, vTFR], color: GREY, id: 'bodyTop' }    // Top
  );

  // 2. Bottom Part (Cylinder)
  // Approximated as an 8-sided prism
  // Y from 0 to 0.5
  const cylTopY = 0;
  const cylBotY = 0.5;
  const cylR = 0.25;
  const segments = 8;
  const cylTopVerts: Point3D[] = [];
  const cylBotVerts: Point3D[] = [];

  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * cylR;
    const z = Math.sin(theta) * cylR;
    cylTopVerts.push({ x, y: cylTopY, z });
    cylBotVerts.push({ x, y: cylBotY, z });
  }

  // Cylinder sides
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    faces.push({
      vertices: [cylTopVerts[i], cylTopVerts[next], cylBotVerts[next], cylBotVerts[i]],
      color: DARK_GREY,
      id: `cylSide${i}`
    });
  }
  // Cylinder bottom cap
  faces.push({ vertices: cylBotVerts.reverse(), color: GREY, id: 'cylBot' });

  // 3. Legs (Orange Pyramids)
  const createPyramidLimb = (baseCenter: Point3D, tip: Point3D, width: number, color: string, shadeColor: string, idPrefix: string) => {
     // Base is a square on XZ plane relative to center?
     // Let's assume base points relative to center
     const w = width / 2;
     const b1: Point3D = { x: baseCenter.x - w, y: baseCenter.y, z: baseCenter.z + w };
     const b2: Point3D = { x: baseCenter.x + w, y: baseCenter.y, z: baseCenter.z + w };
     const b3: Point3D = { x: baseCenter.x + w, y: baseCenter.y, z: baseCenter.z - w };
     const b4: Point3D = { x: baseCenter.x - w, y: baseCenter.y, z: baseCenter.z - w };
     
     return [
        { vertices: [b1, b2, tip], color: color, id: `${idPrefix}Front` },
        { vertices: [b2, b3, tip], color: shadeColor, id: `${idPrefix}Right` },
        { vertices: [b3, b4, tip], color: shadeColor, id: `${idPrefix}Back` },
        { vertices: [b4, b1, tip], color: color, id: `${idPrefix}Left` },
        // Base usually hidden
     ];
  };

  // Left Leg
  faces.push(...createPyramidLimb({ x: -0.2, y: 0.5, z: 0 }, { x: -0.3, y: 1.5, z: 0 }, 0.25, ORANGE, DARK_ORANGE, 'legL'));
  // Right Leg
  faces.push(...createPyramidLimb({ x: 0.2, y: 0.5, z: 0 }, { x: 0.3, y: 1.5, z: 0 }, 0.25, ORANGE, DARK_ORANGE, 'legR'));

  // 4. Hands/Arms (Grey Pyramids)
  // Attached to side of body
  // Left Arm
  faces.push(...createPyramidLimb({ x: -0.5, y: -1.0, z: 0 }, { x: -1.1, y: -0.3, z: 0 }, 0.2, GREY, DARK_GREY, 'armL'));
  // Right Arm
  faces.push(...createPyramidLimb({ x: 0.5, y: -1.0, z: 0 }, { x: 1.1, y: -0.3, z: 0 }, 0.2, GREY, DARK_GREY, 'armR'));

  // 5. Tail (Orange Pyramid)
  // Back of cylinder
  faces.push(...createPyramidLimb({ x: 0, y: 0.4, z: -0.25 }, { x: 0, y: 0.8, z: -1.0 }, 0.15, ORANGE, DARK_ORANGE, 'tail'));


  const presets = [
    { label: 'Front', rot: { x: 0, y: 0 } },
    { label: 'Right', rot: { x: 0, y: 90 } },
    { label: 'Back', rot: { x: 0, y: 180 } },
    { label: 'Left', rot: { x: 0, y: 270 } },
    { label: 'Top', rot: { x: -90, y: 0 } },
    { label: 'Bottom', rot: { x: 90, y: 0 } },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fix for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Config
    const width = rect.width;
    const height = rect.height;
    const cx = width / 2;
    const cy = height / 2;
    // Scale for figure
    const scale = Math.min(width, height) * 0.25;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Rotation math
      const radX = (rotation.x * Math.PI) / 180;
      const radY = (rotation.y * Math.PI) / 180;

      const rotate = (v: Point3D) => {
        // Rotate Y (Yaw)
        let x = v.x * Math.cos(radY) - v.z * Math.sin(radY);
        let z = v.x * Math.sin(radY) + v.z * Math.cos(radY);
        // Rotate X (Pitch)
        let y = v.y * Math.cos(radX) - z * Math.sin(radX);
        z = v.y * Math.sin(radX) + z * Math.cos(radX);
        return { x, y, z };
      };

      const project = (v: Point3D) => {
        const r = rotate(v);
        // Simple perspective:
        // const fov = 5;
        // const p = 1 / (1 + r.z / fov);
        return { x: cx + r.x * scale, y: cy + r.y * scale, z: r.z };
      };

      // 1. Draw Floor Grid
      ctx.strokeStyle = '#CBD5E0'; // Light Grey
      ctx.lineWidth = 1;
      ctx.beginPath();
      const gridSize = 4;
      const gridStep = 0.8;
      const floorY = 1.5; // Feet level

      for (let i = -gridSize; i <= gridSize; i++) {
         let p1 = project({ x: -gridSize * gridStep, y: floorY, z: i * gridStep });
         let p2 = project({ x: gridSize * gridStep, y: floorY, z: i * gridStep });
         ctx.moveTo(p1.x, p1.y);
         ctx.lineTo(p2.x, p2.y);

         p1 = project({ x: i * gridStep, y: floorY, z: -gridSize * gridStep });
         p2 = project({ x: i * gridStep, y: floorY, z: gridSize * gridStep });
         ctx.moveTo(p1.x, p1.y);
         ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();

      // 2. Process Faces for Character
      const projectedFaces = faces.map(face => {
          const projectedVerts = face.vertices.map(v => project(v));
          // Calculate avg Z for painter's algorithm
          const avgZ = projectedVerts.reduce((sum, v) => sum + v.z, 0) / projectedVerts.length;
          return { ...face, projectedVerts, avgZ };
      });

      // Sort by Z (furthest first)
      projectedFaces.sort((a, b) => a.avgZ - b.avgZ);

      // Draw Faces
      projectedFaces.forEach(face => {
          const vs = face.projectedVerts;
          if (vs.length < 3) return;

          ctx.beginPath();
          ctx.moveTo(vs[0].x, vs[0].y);
          for (let i = 1; i < vs.length; i++) {
              ctx.lineTo(vs[i].x, vs[i].y);
          }
          ctx.closePath();

          ctx.fillStyle = face.color;
          ctx.fill();
          
          // Slight stroke to define edges
          ctx.strokeStyle = 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Facial Features
          if (face.id === 'face') {
              // Interpolate points on the face for eyes/mouth
              // Triangle: 0: TopLeft, 1: TopRight, 2: BottomApex
              // We are using rotate() logic for projection, so we need rotated points to place eyes correctly
              // Or just use the projected vertices vs[0], vs[1], vs[2]
              
              // Eye Left: 25% from TopLeft towards Center
              // Eye Right: 25% from TopRight towards Center
              
              const eyeSize = 3; 

              // Top edge center
              const topCX = (vs[0].x + vs[1].x) / 2;
              const topCY = (vs[0].y + vs[1].y) / 2;

              // Eye Left
              const elX = vs[0].x * 0.7 + vs[1].x * 0.2 + vs[2].x * 0.1;
              const elY = vs[0].y * 0.7 + vs[1].y * 0.2 + vs[2].y * 0.1;
              
              // Eye Right
              const erX = vs[0].x * 0.2 + vs[1].x * 0.7 + vs[2].x * 0.1;
              const erY = vs[0].y * 0.2 + vs[1].y * 0.7 + vs[2].y * 0.1;

              // Mouth
              const mX = topCX * 0.6 + vs[2].x * 0.4;
              const mY = topCY * 0.6 + vs[2].y * 0.4;

              ctx.fillStyle = '#4A5568'; // Dark Text Color
              ctx.beginPath();
              ctx.arc(elX, elY, eyeSize, 0, Math.PI * 2);
              ctx.arc(erX, erY, eyeSize, 0, Math.PI * 2);
              ctx.fill();

              ctx.beginPath();
              ctx.arc(mX, mY, 2, 0, Math.PI * 2); // Simple mouth dot
              ctx.fill();
          }
      });
      
    };

    draw();
    updateDescription();

  }, [rotation]);

  const updateDescription = () => {
    let pitch = rotation.x % 360;
    let yaw = rotation.y % 360;
    if (yaw < 0) yaw += 360;
    // Normalize yaw to -180 to 180 for easier logic
    if (yaw > 180) yaw -= 360;

    let heightDesc = "Eye-level";
    if (pitch < -35) heightDesc = "Top-down / Overhead";
    else if (pitch < -10) heightDesc = "High angle";
    else if (pitch > 35) heightDesc = "Worm's eye / Bottom-up";
    else if (pitch > 10) heightDesc = "Low angle";

    let sideDesc = "Front";
    // Thresholds for side description
    if (yaw > 45 && yaw < 135) sideDesc = "Right Profile";
    else if (yaw >= 135 || yaw <= -135) sideDesc = "Back View";
    else if (yaw < -45 && yaw > -135) sideDesc = "Left Profile";
    else if (yaw >= 15 && yaw <= 45) sideDesc = "Front-Right";
    else if (yaw >= -45 && yaw <= -15) sideDesc = "Front-Left";

    const label = `${heightDesc}, ${sideDesc}`;
    setAngleLabel(label);
    
    // Create natural language description
    let prompt = `camera angle: ${heightDesc} view`;
    if (sideDesc !== 'Front') {
        if (sideDesc.includes('Profile')) {
            prompt += ` from the ${sideDesc.replace(' Profile', ' side')}`;
        } else {
             prompt += ` from the ${sideDesc}`;
        }
    }
    onChange(prompt);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setRotation(prev => ({
        y: prev.y + deltaX * 0.5,
        x: Math.max(-90, Math.min(90, prev.x + deltaY * 0.5)) // Clamp pitch
    }));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
      setRotation({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col gap-2 animate-fadeIn w-full">
       <div className="flex justify-between items-end mb-1 px-1">
          <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)]">
             Camera Control
          </label>
          <span className="text-[9px] text-[var(--text-secondary)] italic">Drag to rotate camera</span>
       </div>
       
       <div className="flex gap-4 h-96">
          {/* Main Canvas Area */}
          <div className="relative flex-grow group rounded-3xl overflow-hidden neu-pressed h-full">
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-move touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div className="absolute top-3 left-3 pointer-events-none">
                <div className="neu-flat px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--text-primary)] opacity-80">
                    {angleLabel}
                </div>
              </div>
              
              {!isDragging && (
                <div className="absolute bottom-3 right-3 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                    <MousePointerClick className="w-5 h-5 text-[var(--text-secondary)]" />
                </div>
              )}
          </div>

          {/* Sidebar Controls */}
          <div className="flex flex-col gap-2 w-24 flex-shrink-0 h-full">
             <button 
                type="button" 
                onClick={handleReset}
                className="clay-btn-secondary px-2 py-3 mb-2 text-[10px] flex items-center justify-center gap-1 transition-all hover:-translate-y-0.5"
              >
                <RotateCcw className="w-3 h-3" /> Reset View
             </button>
             
             <div className="flex flex-col gap-2 w-full">
                {presets.map((preset) => (
                   <button
                     key={preset.label}
                     type="button"
                     onClick={() => setRotation(preset.rot)}
                     className="clay-btn-secondary px-3 py-3 text-[10px] text-left pl-3 transition-all hover:-translate-y-0.5"
                   >
                      {preset.label}
                   </button>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default CameraControl;
