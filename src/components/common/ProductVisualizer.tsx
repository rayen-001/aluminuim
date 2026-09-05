import React, { useState } from 'react';
import { DevisItemState } from '../../utils/devisCalculator';
import { FAMILIES, getProductTypesForFamily, REMPLISSAGES, MOTIFS } from '../../data/productCatalog';
import { Maximize2, X, Sparkles, Layers } from 'lucide-react';

interface ProductVisualizerProps {
  item: DevisItemState;
  className?: string;
  width?: number;
  height?: number;
  showDimensions?: boolean;
  interactive?: boolean;
}

export const ProductVisualizer: React.FC<ProductVisualizerProps> = ({
  item,
  className = '',
  width = 180,
  height = 140,
  showDimensions = true,
  interactive = true
}) => {
  const [showModal, setShowModal] = useState(false);

  const largeur = parseFloat(String(item.largeur)) || 100;
  const hauteur = parseFloat(String(item.hauteur)) || 100;
  const couleur = item.couleur || 'blanc';

  const fam = FAMILIES.find(f => f.id === item.family_id);
  const types = getProductTypesForFamily(item.family_id);
  const typeDef = types.find(t => t.id === item.product_type_id);
  const typeName = (typeDef?.name || item.manual_nom || '').toLowerCase();
  const category = typeDef?.category || (item.is_manual ? 'manual' : fam?.drawType || 'fenetre');

  // Detect number of vantaux
  let nbVantaux = 1;
  if (typeName.includes('4 vantaux') || typeName.includes('4vtx') || typeName.includes('4 v')) {
    nbVantaux = 4;
  } else if (typeName.includes('3 vantaux') || typeName.includes('3vtx') || typeName.includes('3 v')) {
    nbVantaux = 3;
  } else if (typeName.includes('2 vantaux') || typeName.includes('2vtx') || typeName.includes('2 v') || typeName.includes('2') || fam?.drawType === 'coulissante' || category === 'coulissant') {
    nbVantaux = 2;
  } else if (typeName.includes('1 vantail') || typeName.includes('1vtx') || typeName.includes('1 v') || typeName.includes('soufflet') || category === 'chassi_fix') {
    nbVantaux = 1;
  }

  const isPorte = category === 'porte' || typeName.includes('porte');
  const isCoulissant = category === 'coulissant' || fam?.drawType === 'coulissante' || typeName.includes('couliss');
  const isGardeCorps = category === 'garde_corps' || fam?.drawType === 'garde_corps' || typeName.includes('garde');
  const isStore = category === 'standalone_store' || fam?.drawType === 'store' || typeName.includes('store');
  const isMousti = category === 'standalone_mousti' || fam?.drawType === 'mousti' || typeName.includes('mousti');
  const isFixe = category === 'chassi_fix' || fam?.drawType === 'fixe' || typeName.includes('fixe');

  // Glass / Filling detection
  const remplissage = REMPLISSAGES.find(r => r.id === item.remplissage_id);
  const rempLabel = (remplissage?.label || '').toLowerCase();
  
  let glassFillId = 'glass_standard';
  if (rempLabel.includes('bronze') || rempLabel.includes('solarit bronze')) {
    glassFillId = 'glass_bronze';
  } else if (rempLabel.includes('bleu') || rempLabel.includes('tenta sol bleu')) {
    glassFillId = 'glass_bleu';
  } else if (rempLabel.includes('stop sol') || rempLabel.includes('silver')) {
    glassFillId = 'glass_stopsol';
  } else if (rempLabel.includes('pvc') || rempLabel.includes('planche') || rempLabel.includes('mdf')) {
    glassFillId = 'panel_pvc';
  }

  // Frame colors
  const strokeColorMap: Record<string, string> = {
    blanc: '#94a3b8',
    gris: '#334155',
    noir: '#09090b',
    couleur_mat: '#78350f',
    couleur_givre: '#0f766e'
  };
  const strokeColor = strokeColorMap[couleur] || '#64748b';

  // SVG Dimension Calculations
  const svgW = 260;
  const svgH = 200;
  
  // Calculate bounding box preserving window aspect ratio
  const maxW = 180;
  const maxH = 135;
  const aspect = largeur / (hauteur || 1);
  
  let drawW = maxW;
  let drawH = maxW / aspect;
  if (drawH > maxH) {
    drawH = maxH;
    drawW = maxH * aspect;
  }
  // Clamp minimum size for visibility
  drawW = Math.max(60, Math.min(200, drawW));
  drawH = Math.max(60, Math.min(150, drawH));

  const startX = (svgW - drawW) / 2;
  const startY = (svgH - drawH) / 2 + (item.store_enabled ? 8 : 0);

  // Frame thickness
  const frameThick = Math.min(Math.max(drawW, drawH) * 0.07, 10);
  const innerX = startX + frameThick;
  const innerY = startY + frameThick;
  const innerW = drawW - 2 * frameThick;
  const innerH = drawH - 2 * frameThick;

  const renderSVGContent = () => {
    if (item.is_manual) {
      return (
        <g transform={`translate(${svgW / 2 - 35}, ${svgH / 2 - 35})`}>
          <rect x="0" y="0" width="70" height="70" rx="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M20 35 L35 22 L50 35 L35 48 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.2" />
          <path d="M20 35 L35 48 L35 56 L20 43 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
          <path d="M50 35 L35 48 L35 56 L50 43 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="1.2" />
          <text x="35" y="66" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#475569">ARTICLE</text>
        </g>
      );
    }

    if (isGardeCorps) {
      const postCount = 4;
      const barCount = 3;
      const handrailH = 8;
      const postW = 6;
      return (
        <g filter="url(#drop-shadow)">
          {/* Handrail (Main courante) */}
          <rect x={startX - 4} y={startY} width={drawW + 8} height={handrailH} rx="4" fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="1.2" />
          
          {/* Vertical Posts */}
          {Array.from({ length: postCount }).map((_, i) => {
            const px = startX + (i / (postCount - 1)) * (drawW - postW);
            return (
              <g key={i}>
                <rect x={px} y={startY + handrailH} width={postW} height={drawH - handrailH} fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="1" />
                {/* Post Base Plate */}
                <rect x={px - 2} y={startY + drawH - 4} width={postW + 4} height="4" rx="1" fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="1" />
              </g>
            );
          })}

          {/* Horizontal Lisses */}
          {Array.from({ length: barCount }).map((_, i) => {
            const by = startY + handrailH + 12 + (i / barCount) * (drawH - handrailH - 24);
            return (
              <rect key={i} x={startX} y={by} width={drawW} height="4" rx="2" fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="0.8" />
            );
          })}

          {/* Ground Line */}
          <line x1={startX - 10} y1={startY + drawH} x2={startX + drawW + 10} y2={startY + drawH} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
        </g>
      );
    }

    if (isStore) {
      const coffreH = 24;
      const railW = 8;
      const nLames = 9;
      return (
        <g filter="url(#drop-shadow)">
          {/* Coffre Store */}
          <rect x={startX - 2} y={startY} width={drawW + 4} height={coffreH} rx="3" fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="1.2" />
          <line x1={startX - 2} y1={startY + coffreH * 0.65} x2={startX + drawW + 2} y2={startY + coffreH * 0.65} stroke={strokeColor} strokeWidth="0.7" opacity="0.6" />
          <circle cx={startX + 6} cy={startY + coffreH / 2} r="2" fill={strokeColor} opacity="0.5" />
          
          {/* Side Rails */}
          <rect x={startX} y={startY + coffreH} width={railW} height={drawH - coffreH} fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="1" />
          <rect x={startX + drawW - railW} y={startY + coffreH} width={railW} height={drawH - coffreH} fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="1" />

          {/* Lames */}
          {Array.from({ length: nLames }).map((_, i) => {
            const ly = startY + coffreH + i * ((drawH - coffreH - 8) / nLames);
            const lh = (drawH - coffreH - 8) / nLames;
            return (
              <g key={i}>
                <rect x={startX + railW} y={ly} width={drawW - 2 * railW} height={lh} fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="0.6" />
                <line x1={startX + railW + 2} y1={ly + 1} x2={startX + drawW - railW - 2} y2={ly + 1} stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
              </g>
            );
          })}
          {/* Lame finale */}
          <rect x={startX + railW} y={startY + drawH - 8} width={drawW - 2 * railW} height="8" rx="1" fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="1.2" />
        </g>
      );
    }

    if (isMousti) {
      return (
        <g filter="url(#drop-shadow)">
          <rect x={startX} y={startY} width={drawW} height={drawH} rx="2" fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="1.4" />
          <rect x={innerX} y={innerY} width={innerW} height={innerH} fill="#f1f5f9" stroke={strokeColor} strokeWidth="0.8" />
          {/* Mesh Grid Pattern */}
          <rect x={innerX} y={innerY} width={innerW} height={innerH} fill="url(#meshPattern)" opacity="0.8" />
          <text x={startX + drawW / 2} y={startY + drawH / 2 + 3} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748b" opacity="0.7">MOUSTIQUAIRE</text>
        </g>
      );
    }

    // Standard Windows & Doors
    const sashThick = frameThick * 0.9;
    const vW = innerW / nbVantaux;

    return (
      <g filter="url(#drop-shadow)">
        {/* Optional Integrated Roller Shutter Box on top */}
        {item.store_enabled && (
          <g>
            <rect x={startX - 2} y={startY - 18} width={drawW + 4} height="18" rx="2" fill={`url(#alu_${item.store_couleur || couleur})`} stroke={strokeColor} strokeWidth="1.2" />
            <line x1={startX} y1={startY - 6} x2={startX + drawW} y2={startY - 6} stroke={strokeColor} strokeWidth="0.6" opacity="0.5" />
            <rect x={startX + 3} y={startY - 15} width="8" height="6" rx="1" fill="#cbd5e1" opacity="0.8" />
            <text x={startX + drawW / 2} y={startY - 7} textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#475569" opacity="0.8">STORE RIDEAU</text>
          </g>
        )}

        {/* Outer Dormant Frame */}
        <rect x={startX} y={startY} width={drawW} height={drawH} rx="2" fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="1.4" />
        
        {/* Mitre corner lines */}
        <line x1={startX} y1={startY} x2={innerX} y2={innerY} stroke={strokeColor} strokeWidth="0.8" opacity="0.6" />
        <line x1={startX + drawW} y1={startY} x2={innerX + innerW} y2={innerY} stroke={strokeColor} strokeWidth="0.8" opacity="0.6" />
        <line x1={startX} y1={startY + drawH} x2={innerX} y2={innerY + innerH} stroke={strokeColor} strokeWidth="0.8" opacity="0.6" />
        <line x1={startX + drawW} y1={startY + drawH} x2={innerX + innerW} y2={innerY + innerH} stroke={strokeColor} strokeWidth="0.8" opacity="0.6" />

        {/* Fixed Châssis (No Ouvrant) */}
        {isFixe ? (
          <g>
            <rect x={innerX} y={innerY} width={innerW} height={innerH} fill={`url(#${glassFillId})`} stroke={strokeColor} strokeWidth="1" />
            {/* Glass glossy reflection */}
            <polygon points={`${innerX},${innerY} ${innerX + innerW * 0.4},${innerY} ${innerX},${innerY + innerH * 0.6}`} fill="url(#glassReflect)" />
            <polygon points={`${innerX + innerW * 0.3},${innerY} ${innerX + innerW * 0.7},${innerY} ${innerX},${innerY + innerH}`} fill="url(#glassReflect)" opacity="0.6" />
          </g>
        ) : (
          /* Sashes (Ouvrants) */
          Array.from({ length: nbVantaux }).map((_, idx) => {
            let sx = innerX + idx * vW;
            let sw = vW;
            let sy = innerY;
            let sh = innerH;

            // Coulissant slight overlap effect
            if (isCoulissant && nbVantaux > 1) {
              const overlap = sashThick * 0.6;
              sw = (innerW + (nbVantaux - 1) * overlap) / nbVantaux;
              sx = innerX + idx * (sw - overlap);
            }

            const gx = sx + sashThick;
            const gy = sy + sashThick;
            const gw = sw - 2 * sashThick;
            const gh = sh - 2 * sashThick;

            // Door bottom panel (soubassement)
            const hasSoubassement = isPorte && gh > 40;
            const panelH = hasSoubassement ? gh * 0.38 : 0;
            const glassH = hasSoubassement ? gh - panelH - sashThick : gh;

            const handleX = isCoulissant 
              ? (idx === 0 ? sx + sashThick * 0.5 : sx + sw - sashThick * 0.5)
              : (idx === 0 && nbVantaux > 1 ? sx + sw - sashThick * 0.5 : sx + sashThick * 0.5);
            const handleY = sy + sh * 0.52;

            return (
              <g key={idx}>
                {/* Sash Frame (Ouvrant) */}
                <rect x={sx} y={sy} width={sw} height={sh} rx="1.5" fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="1.2" />

                {/* Glass Pane */}
                <rect x={gx} y={gy} width={gw} height={glassH} fill={`url(#${glassFillId})`} stroke={strokeColor} strokeWidth="0.8" />

                {/* Glass High-End Diagonal Reflection */}
                <polygon points={`${gx},${gy} ${gx + gw * 0.5},${gy} ${gx},${gy + glassH * 0.7}`} fill="url(#glassReflect)" />
                <polygon points={`${gx + gw * 0.3},${gy} ${gx + gw * 0.8},${gy} ${gx},${gy + glassH}`} fill="url(#glassReflect)" opacity="0.6" />

                {/* Door Soubassement (Panel) */}
                {hasSoubassement && (
                  <g>
                    {/* Intermediate Crossbar */}
                    <rect x={sx} y={gy + glassH} width={sw} height={sashThick} fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="1" />
                    {/* Bottom Panel */}
                    <rect x={gx} y={gy + glassH + sashThick} width={gw} height={panelH} fill={`url(#alu_${couleur})`} stroke={strokeColor} strokeWidth="0.8" />
                    <rect x={gx + 3} y={gy + glassH + sashThick + 3} width={gw - 6} height={panelH - 6} fill="none" stroke={strokeColor} strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
                  </g>
                )}

                {/* Opening Direction Lines (Française) */}
                {!isCoulissant && !isPorte && (
                  <g opacity="0.4" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="4,3">
                    {idx === 0 ? (
                      <>
                        <line x1={gx} y1={gy} x2={gx + gw} y2={gy + glassH / 2} />
                        <line x1={gx} y1={gy + glassH} x2={gx + gw} y2={gy + glassH / 2} />
                      </>
                    ) : (
                      <>
                        <line x1={gx + gw} y1={gy} x2={gx} y2={gy + glassH / 2} />
                        <line x1={gx + gw} y1={gy} x2={gx} y2={gy + glassH / 2} />
                      </>
                    )}
                  </g>
                )}

                {/* Sliding Direction Arrows (Coulissante) */}
                {isCoulissant && (
                  <g opacity="0.5" fill={strokeColor} stroke={strokeColor}>
                    {idx === 0 ? (
                      <path d={`M${gx + gw / 2 - 8} ${gy + glassH / 2} L${gx + gw / 2 + 4} ${gy + glassH / 2 - 4} L${gx + gw / 2 + 4} ${gy + glassH / 2 + 4} Z`} />
                    ) : (
                      <path d={`M${gx + gw / 2 + 8} ${gy + glassH / 2} L${gx + gw / 2 - 4} ${gy + glassH / 2 - 4} L${gx + gw / 2 - 4} ${gy + glassH / 2 + 4} Z`} />
                    )}
                  </g>
                )}

                {/* Handles */}
                {isCoulissant ? (
                  /* Sliding Finger Pull / Handle */
                  <rect x={handleX - 1.5} y={handleY - 9} width="3" height="18" rx="1.5" fill="#1e293b" stroke="#ffffff" strokeWidth="0.5" />
                ) : (
                  /* Casement / Door Lever Handle */
                  (nbVantaux === 1 || idx === 0) && (
                    <g>
                      <rect x={handleX - 2.5} y={handleY - 7} width="5" height="14" rx="1.5" fill="#334155" stroke="#ffffff" strokeWidth="0.6" />
                      <rect x={handleX - 10} y={handleY - 2.5} width="10" height="4" rx="2" fill="#1e293b" stroke="#ffffff" strokeWidth="0.6" />
                      <circle cx={handleX} cy={handleY} r="1.8" fill="#cbd5e1" />
                    </g>
                  )
                )}

                {/* Hinges (Paumelles) for Française */}
                {!isCoulissant && (
                  <g>
                    <rect x={idx === 0 ? sx - 1.5 : sx + sw - 1.5} y={sy + sh * 0.18} width="3" height="10" rx="1" fill="#475569" stroke="#ffffff" strokeWidth="0.4" />
                    <rect x={idx === 0 ? sx - 1.5 : sx + sw - 1.5} y={sy + sh * 0.78} width="3" height="10" rx="1" fill="#475569" stroke="#ffffff" strokeWidth="0.4" />
                    {isPorte && (
                      <rect x={idx === 0 ? sx - 1.5 : sx + sw - 1.5} y={sy + sh * 0.48} width="3" height="10" rx="1" fill="#475569" stroke="#ffffff" strokeWidth="0.4" />
                    )}
                  </g>
                )}
              </g>
            );
          })
        )}
      </g>
    );
  };

  return (
    <>
      <div 
        className={`relative group bg-gradient-to-b from-slate-50 to-slate-100/90 rounded-xl border border-slate-200/90 p-2 shadow-2xs hover:shadow-xs hover:border-blue-400 transition flex flex-col items-center justify-center overflow-hidden select-none ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Vector SVG View */}
        <svg 
          viewBox={`0 0 ${svgW} ${svgH}`} 
          className="w-full h-full max-h-full drop-shadow-2xs"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Soft Shadow */}
            <filter id="drop-shadow" x="-8%" y="-8%" width="116%" height="116%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.16" />
            </filter>

            {/* Mesh Pattern for Moustiquaire */}
            <pattern id="meshPattern" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M 0 0 L 4 0 M 0 0 L 0 4" fill="none" stroke="#64748b" strokeWidth="0.3" opacity="0.4" />
            </pattern>

            {/* Glass Reflection Shimmer */}
            <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="65%" stopColor="#ffffff" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
            </linearGradient>

            {/* Frame Metallic Gradients */}
            <linearGradient id="alu_blanc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>

            <linearGradient id="alu_gris" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <linearGradient id="alu_noir" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3f3f46" />
              <stop offset="50%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>

            <linearGradient id="alu_couleur_mat" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            <linearGradient id="alu_couleur_givre" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="50%" stopColor="#115e59" />
              <stop offset="100%" stopColor="#134e4a" />
            </linearGradient>

            {/* Glass Tints */}
            <linearGradient id="glass_standard" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="glass_bronze" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#fde68a" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="glass_bleu" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="glass_stopsol" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="panel_pvc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
          </defs>

          {/* Background Blueprint Grid Lines */}
          <g opacity="0.18">
            <line x1="20" y1="50" x2="240" y2="50" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="20" y1="100" x2="240" y2="100" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="20" y1="150" x2="240" y2="150" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="80" y1="20" x2="80" y2="180" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="180" y1="20" x2="180" y2="180" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,2" />
          </g>

          {/* Render Actual Geometry */}
          {renderSVGContent()}
        </svg>

        {/* Crisp Dimension Tag Bar */}
        {showDimensions && item.largeur && item.hauteur && (
          <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-mono font-bold bg-white/90 text-gray-800 px-1.5 py-0.5 rounded shadow-2xs border border-gray-200 backdrop-blur-xs">
              {item.largeur}×{item.hauteur}
            </span>
            <span className="text-[9px] font-semibold bg-blue-600/90 text-white px-1.5 py-0.5 rounded shadow-2xs backdrop-blur-xs">
              {item.quantity} {item.quantity > 1 ? 'pcs' : 'pc'}
            </span>
          </div>
        )}

        {/* Hover Zoom Button */}
        {interactive && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            title="Agrandir l'aperçu 3D/technique"
            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-blue-600 hover:text-white text-gray-700 p-1 rounded-md shadow-xs transition border border-gray-200"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Full Size Modal Preview */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">
                  {item.is_manual ? item.manual_nom : (typeDef?.name || 'Aperçu Menuiserie')}
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Big Preview */}
            <div className="bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6 flex items-center justify-center min-h-[260px]">
              <svg 
                viewBox={`0 0 ${svgW} ${svgH}`} 
                className="w-full max-w-sm h-64 drop-shadow-md"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <filter id="drop-shadow-lg" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.2" />
                  </filter>
                  {/* Reuse gradients */}
                  <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="35%" stopColor="#ffffff" stopOpacity="0.15" />
                    <stop offset="65%" stopColor="#ffffff" stopOpacity="0.02" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
                  </linearGradient>
                  <linearGradient id="alu_blanc" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="45%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                  <linearGradient id="alu_gris" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#64748b" />
                    <stop offset="50%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                  <linearGradient id="alu_noir" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3f3f46" />
                    <stop offset="50%" stopColor="#27272a" />
                    <stop offset="100%" stopColor="#18181b" />
                  </linearGradient>
                  <linearGradient id="alu_couleur_mat" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="50%" stopColor="#b45309" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                  <linearGradient id="alu_couleur_givre" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="50%" stopColor="#115e59" />
                    <stop offset="100%" stopColor="#134e4a" />
                  </linearGradient>
                  <linearGradient id="glass_standard" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="glass_bronze" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#fde68a" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="glass_bleu" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="glass_stopsol" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="panel_pvc" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f1f5f9" />
                  </linearGradient>
                </defs>
                {renderSVGContent()}
              </svg>
            </div>

            {/* Details Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-medium">Dimensions :</span>
                <p className="font-mono font-bold text-gray-900">{item.largeur} cm × {item.hauteur} cm</p>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-medium">Couleur profil :</span>
                <p className="font-bold text-gray-900 capitalize">{couleur.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
