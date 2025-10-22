import React from 'react';
import { Link } from 'react-router-dom';

const polarToCartesian = (cx, cy, r, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(angleInRadians)),
    y: cy + (r * Math.sin(angleInRadians))
  };
};

const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  const d = [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
  return d;
};

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#eab308'];

const GenrePie = ({ genres }) => {
  if (!genres || genres.length === 0) return null;

  const radius = 90;
  const center = 100;
  const total = genres.length;
  const slice = 360 / total;

  let currentAngle = 0;

  return (
    <div className="genre-pie">
      <svg viewBox="0 0 200 200" width="220" height="220">
        <circle cx={center} cy={center} r={radius} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" />
        {genres.map((g, idx) => {
          const start = currentAngle;
          const end = currentAngle + slice;
          currentAngle = end;
          const mid = start + slice / 2;
          const textPoint = polarToCartesian(center, center, radius - 20, mid);
          const arcPath = describeArc(center, center, radius, start, end);
          const color = COLORS[idx % COLORS.length];
          return (
            <g key={g.id}>
              <Link to={`/?genreId=${g.id}&genre=${encodeURIComponent(g.name)}`}>
                <path d={arcPath} stroke={color} strokeWidth={18} fill="none" opacity="0.9" />
              </Link>
              <text x={textPoint.x} y={textPoint.y} fill="#fff" fontSize="9" textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: 'none' }}>
                {g.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default GenrePie;


