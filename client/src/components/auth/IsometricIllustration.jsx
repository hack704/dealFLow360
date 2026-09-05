import React from 'react';

/**
 * Isometric technological illustration matching the user's reference screenshot:
 * - Stepped circuit platform with dense radiating bus traces and solder pads
 * - 3D stacked modular cube cluster (data pipelines / CPQ engines)
 * - Amber/Orange top tier cubes (#ff9f0a)
 * - Mint/Emerald cube on the left (#30d158)
 * - Floating Ruby/Magenta cube on the right (#ff2d55) with isometric drop shadow
 * - Floating wireframe outline cubes
 * - Responsive auto-scaling with viewport constraints
 * - Dark mode & Light mode responsive strokes and fills
 */
export const IsometricIllustration = ({ className = '' }) => {
  const w = 30; // half-width
  const h = 17.32; // half-height (w * tan(30°))
  const d = 32; // cube vertical depth

  // Base origin for the central 3x3 grid
  const ox = 310;
  const oy = 250;

  // Render a single isometric cube at screen coordinate (x, y)
  const renderCube = ({
    x,
    y,
    key,
    topColor = '#ffffff',
    leftColor = '#f0f0f2',
    rightColor = '#dcdce0',
    strokeColor = '#1d1d1f',
    strokeWidth = 1.4,
    isWireframe = false,
    opacity = 1
  }) => {
    if (isWireframe) {
      return (
        <g key={key} opacity={opacity} className="transition-all duration-300">
          {/* Top Face Wireframe */}
          <polygon
            points={`${x},${y - d} ${x + w},${y - h - d} ${x},${y - 2 * h - d} ${x - w},${y - h - d}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            className="text-[#1d1d1f] dark:text-[#f5f5f7]"
          />
          {/* Left Vertical */}
          <line
            x1={x - w}
            y1={y - h - d}
            x2={x - w}
            y2={y - h}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-[#1d1d1f] dark:text-[#f5f5f7]"
          />
          {/* Center Vertical */}
          <line
            x1={x}
            y1={y - d}
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-[#1d1d1f] dark:text-[#f5f5f7]"
          />
          {/* Right Vertical */}
          <line
            x1={x + w}
            y1={y - h - d}
            x2={x + w}
            y2={y - h}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-[#1d1d1f] dark:text-[#f5f5f7]"
          />
          {/* Bottom Left */}
          <line
            x1={x - w}
            y1={y - h}
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-[#1d1d1f] dark:text-[#f5f5f7]"
          />
          {/* Bottom Right */}
          <line
            x1={x}
            y1={y}
            x2={x + w}
            y2={y - h}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-[#1d1d1f] dark:text-[#f5f5f7]"
          />
        </g>
      );
    }

    return (
      <g key={key} opacity={opacity} className="transition-all duration-300">
        {/* Left Face */}
        <polygon
          points={`${x - w},${y - h - d} ${x},${y - d} ${x},${y} ${x - w},${y - h}`}
          fill={leftColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Right Face */}
        <polygon
          points={`${x},${y - d} ${x + w},${y - h - d} ${x + w},${y - h} ${x},${y}`}
          fill={rightColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Top Face */}
        <polygon
          points={`${x},${y - d} ${x + w},${y - h - d} ${x},${y - 2 * h - d} ${x - w},${y - h - d}`}
          fill={topColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </g>
    );
  };

  // Convert grid coords (i, j, k) to screen coords (x, y)
  const gridToScreen = (i, j, k) => ({
    x: ox + (i - j) * w,
    y: oy + (i + j) * h - k * d
  });

  // Cube definitions with exact color themes
  const cubes = [
    // --- Ground Tier (k = 0) ---
    { i: 0, j: 0, k: 0, type: 'white' },
    { i: 1, j: 0, k: 0, type: 'white' },
    { i: 2, j: 0, k: 0, type: 'white' },
    { i: 0, j: 1, k: 0, type: 'white' },
    { i: 1, j: 1, k: 0, type: 'white' },
    { i: 2, j: 1, k: 0, type: 'white' },
    { i: 0, j: 2, k: 0, type: 'white' },
    { i: 1, j: 2, k: 0, type: 'white' },
    { i: 2, j: 2, k: 0, type: 'white' },

    // --- Middle Tier (k = 1) ---
    { i: 0, j: 0, k: 1, type: 'white' },
    { i: 1, j: 0, k: 1, type: 'amber' },
    { i: 2, j: 0, k: 1, type: 'amber' },
    { i: 0, j: 1, k: 1, type: 'gray' },
    { i: 1, j: 1, k: 1, type: 'white' },
    { i: 2, j: 1, k: 1, type: 'amber' },
    { i: 0, j: 2, k: 1, type: 'white' },
    { i: 1, j: 2, k: 1, type: 'gray' },
    { i: 2, j: 2, k: 1, type: 'white' },

    // --- Top Tier (k = 2) - Golden/Amber Focus ---
    { i: 0, j: 0, k: 2, type: 'amber' },
    { i: 1, j: 0, k: 2, type: 'amber' },
    { i: 2, j: 0, k: 2, type: 'amber' },
    { i: 2, j: 1, k: 2, type: 'amber' }
  ];

  // Sort cubes from back to front using Painter's algorithm
  const sortedCubes = [...cubes].sort((a, b) => {
    if (a.i + a.j !== b.i + b.j) {
      return a.i + a.j - (b.i + b.j);
    }
    return a.k - b.k;
  });

  return (
    <div className={`relative w-full select-none flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes subtleWireFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .anim-float-ruby {
          animation: subtleFloat 3.8s ease-in-out infinite;
        }
        .anim-float-wire {
          animation: subtleWireFloat 4.6s ease-in-out infinite;
        }
      `}</style>
      <svg
        viewBox="0 0 620 540"
        className="w-full h-auto max-h-[38vh] sm:max-h-[46vh] md:max-h-[55vh] lg:max-h-[68vh] drop-shadow-sm overflow-visible object-contain"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="floatShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#000000" floodOpacity="0.18" />
          </filter>
          <filter id="rubyGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#ff2d55" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ========================================================================= */}
        {/* 1. Plinth Base & Dense Circuit Traces (Ribbon Pins matching reference) */}
        {/* ========================================================================= */}
        <g className="circuit-traces stroke-[#1d1d1f] dark:stroke-[#8e8e93]" strokeWidth="1.2">
          {/* Left Ribbon Bus Traces */}
          <path d="M 215 315 L 185 332 L 155 350 L 155 385" strokeLinecap="round" />
          <circle cx="155" cy="385" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 230 324 L 200 341 L 172 358 L 172 400" strokeLinecap="round" />
          <circle cx="172" cy="400" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 245 333 L 215 350 L 190 365 L 190 412" strokeLinecap="round" />
          <circle cx="190" cy="412" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 260 342 L 230 359 L 208 372 L 208 425" strokeLinecap="round" />
          <circle cx="208" cy="425" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 275 351 L 245 368 L 225 380 L 225 435" strokeLinecap="round" />
          <circle cx="225" cy="435" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 290 360 L 260 377 L 242 388 L 242 445" strokeLinecap="round" />
          <circle cx="242" cy="445" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 305 369 L 275 386 L 260 395 L 260 452" strokeLinecap="round" />
          <circle cx="260" cy="452" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          {/* Right Ribbon Bus Traces */}
          <path d="M 320 378 L 350 395 L 370 405 L 370 458" strokeLinecap="round" />
          <circle cx="370" cy="458" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 335 369 L 365 386 L 388 398 L 388 448" strokeLinecap="round" />
          <circle cx="388" cy="448" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 350 360 L 380 377 L 405 390 L 405 438" strokeLinecap="round" />
          <circle cx="405" cy="438" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 365 351 L 395 368 L 422 382 L 422 425" strokeLinecap="round" />
          <circle cx="422" cy="425" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 380 342 L 410 359 L 438 374 L 438 410" strokeLinecap="round" />
          <circle cx="438" cy="410" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 395 333 L 425 350 L 452 365 L 452 395" strokeLinecap="round" />
          <circle cx="452" cy="395" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          {/* Extended front chip pins matching screenshot */}
          <path d="M 310 380 L 310 420 L 310 460" strokeLinecap="round" />
          <circle cx="310" cy="460" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 295 372 L 295 408 L 295 450" strokeLinecap="round" />
          <circle cx="295" cy="450" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          <path d="M 325 372 L 325 408 L 325 450" strokeLinecap="round" />
          <circle cx="325" cy="450" r="2.5" fill="#1d1d1f" className="dark:fill-[#8e8e93]" />

          {/* Connected bus line to the ruby cube */}
          <path d="M 430 315 L 485 345 L 515 330" strokeLinecap="round" strokeDasharray="3 3" />
        </g>

        {/* Stepped Circuit Base Plinth */}
        {/* Bottom Bevel / Floor Step */}
        <polygon
          points="310,215 440,290 310,365 180,290"
          fill="#fafafc"
          className="dark:fill-[#1e1e22]"
          stroke="#1d1d1f"
          strokeWidth="1.5"
        />
        {/* Plinth Front Left Bevel */}
        <polygon
          points="180,290 310,365 310,380 180,305"
          fill="#e4e4e7"
          className="dark:fill-[#161618]"
          stroke="#1d1d1f"
          strokeWidth="1.5"
        />
        {/* Plinth Front Right Bevel */}
        <polygon
          points="310,365 440,290 440,305 310,380"
          fill="#d4d4d8"
          className="dark:fill-[#101012]"
          stroke="#1d1d1f"
          strokeWidth="1.5"
        />

        {/* Upper Step of Plinth */}
        <polygon
          points="310,223 425,289 310,355 195,289"
          fill="#ffffff"
          className="dark:fill-[#242429]"
          stroke="#1d1d1f"
          strokeWidth="1.2"
        />
        {/* Upper Step Bevels */}
        <polygon
          points="195,289 310,355 310,362 195,296"
          fill="#ececee"
          className="dark:fill-[#1c1c20]"
          stroke="#1d1d1f"
          strokeWidth="1.2"
        />
        <polygon
          points="310,355 425,289 425,296 310,362"
          fill="#dcdce0"
          className="dark:fill-[#141416]"
          stroke="#1d1d1f"
          strokeWidth="1.2"
        />

        {/* ========================================================================= */}
        {/* 2. Main Central Cube Stack (Painters Algorithm) */}
        {/* ========================================================================= */}
        {sortedCubes.map((c, idx) => {
          const { x, y } = gridToScreen(c.i, c.j, c.k);
          let colors = {
            topColor: '#ffffff',
            leftColor: '#f2f2f5',
            rightColor: '#dcdcde',
            strokeColor: '#1d1d1f'
          };

          if (c.type === 'amber') {
            colors = {
              topColor: '#ffc043',
              leftColor: '#ff9f0a',
              rightColor: '#db7b00',
              strokeColor: '#1d1d1f'
            };
          } else if (c.type === 'gray') {
            colors = {
              topColor: '#d6d6da',
              leftColor: '#b8b8be',
              rightColor: '#9c9ca3',
              strokeColor: '#1d1d1f'
            };
          }

          return renderCube({
            x,
            y,
            key: `cube-${c.i}-${c.j}-${c.k}-${idx}`,
            ...colors
          });
        })}

        {/* Floating Wireframe Cube above top center (just like reference) */}
        <g className="anim-float-wire">
          {renderCube({
            x: 275,
            y: 185,
            key: 'wireframe-float-top',
            isWireframe: true,
            strokeWidth: 1.4,
            opacity: 0.95
          })}
        </g>

        {/* ========================================================================= */}
        {/* 3. Left Hand Cluster (White bases + Teal/Mint Hero Cube + Floating Wireframe) */}
        {/* ========================================================================= */}
        {/* White Cube 1 (Back) */}
        {renderCube({
          x: 160,
          y: 380,
          key: 'left-white-1',
          topColor: '#ffffff',
          leftColor: '#f2f2f5',
          rightColor: '#dcdcde',
          strokeColor: '#1d1d1f'
        })}
        {/* White Cube 2 (Right) */}
        {renderCube({
          x: 190,
          y: 397,
          key: 'left-white-2',
          topColor: '#ffffff',
          leftColor: '#f2f2f5',
          rightColor: '#dcdcde',
          strokeColor: '#1d1d1f'
        })}
        {/* White Cube 3 (Front Left) */}
        {renderCube({
          x: 130,
          y: 397,
          key: 'left-white-3',
          topColor: '#ffffff',
          leftColor: '#f2f2f5',
          rightColor: '#dcdcde',
          strokeColor: '#1d1d1f'
        })}
        {/* White Cube 4 (Center Foreground) */}
        {renderCube({
          x: 160,
          y: 414,
          key: 'left-white-4',
          topColor: '#ffffff',
          leftColor: '#f2f2f5',
          rightColor: '#dcdcde',
          strokeColor: '#1d1d1f'
        })}

        {/* HERO GREEN / MINT CUBE (Stacked on top of left-white-1) */}
        {renderCube({
          x: 145,
          y: 350,
          key: 'left-emerald-hero',
          topColor: '#4cd964',
          leftColor: '#30d158',
          rightColor: '#248a3d',
          strokeColor: '#1d1d1f'
        })}

        {/* Floating Wireframe Cube above the left cluster */}
        <g className="anim-float-wire">
          {renderCube({
            x: 190,
            y: 260,
            key: 'wireframe-float-left',
            isWireframe: true,
            strokeWidth: 1.4,
            opacity: 0.95
          })}
        </g>

        {/* ========================================================================= */}
        {/* 4. Right Hand Floating Magenta / Ruby Hero Cube */}
        {/* ========================================================================= */}
        {/* Isometric shadow on the floor beneath the floating ruby cube */}
        <polygon
          points="515,350 545,332 515,315 485,332"
          fill="#000000"
          opacity="0.12"
          className="dark:fill-[#ff2d55] dark:opacity-25"
        />

        {/* Floating Ruby Cube with subtle animation */}
        <g className="anim-float-ruby" filter="url(#rubyGlow)">
          {renderCube({
            x: 515,
            y: 320,
            key: 'ruby-hero-floating',
            topColor: '#ff375f',
            leftColor: '#e0244d',
            rightColor: '#b51a3c',
            strokeColor: '#1d1d1f',
            strokeWidth: 1.5
          })}
        </g>
      </svg>
    </div>
  );
};

export default IsometricIllustration;
