import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Styles
const styles = `
.mood-pie-modern {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #23234a 0%, #18182a 100%);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  border: 2px solid #764ba2;
  box-shadow: 0 0 40px #764ba280;
  position: relative;
  overflow: hidden;
}

.mood-pie-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
}

.pie-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mood-pie-svg {
  filter: drop-shadow(0 8px 20px #764ba280);
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: linear-gradient(135deg, #667eea20, #f093fb10);
  padding: 1rem 1.5rem;
  border-radius: 20px;
  backdrop-filter: blur(15px);
  border: 2px solid #f093fb;
  box-shadow: 0 8px 25px #f093fb40;
}

.total-reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.total-number {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #f093fb 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.total-label {
  font-size: 0.8rem;
  color: #f093fb;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.mood-legend-modern {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
}

.legend-item-modern {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea10, #f093fb10);
  border: 2px solid #764ba2;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  color: #f093fb;
}

.legend-item-modern::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: transparent;
  transition: all 0.3s ease;
}

.legend-item-modern:hover,
.legend-item-modern.active {
  background: linear-gradient(135deg, #f093fb40, #667eea40);
  border-color: #f093fb;
  transform: translateX(5px);
  color: #fff;
}

.legend-item-modern.active::before {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.legend-indicator {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 60px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  box-shadow: 0 0 12px #f093fb80;
  position: relative;
  border: 2px solid #f093fb;
}

.legend-color::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: inherit;
  opacity: 0.3;
  filter: blur(4px);
  z-index: -1;
}

.legend-emoji {
  font-size: 1.4rem;
  filter: drop-shadow(0 2px 8px #764ba280);
}

.legend-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.legend-label {
  font-weight: 700;
  color: #f093fb;
  font-size: 1rem;
  text-shadow: 0 2px 8px #764ba280;
}

.legend-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.legend-count {
  font-size: 0.85rem;
  color: #f093fb;
  font-weight: 500;
}

.legend-percentage {
  font-size: 0.9rem;
  color: #fff;
  font-weight: 700;
  background: #764ba2;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  border: 2px solid #f093fb;
}

.mood-pie-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #23234a 0%, #18182a 100%);
  border-radius: 20px;
  border: 2px dashed #764ba2;
}

.empty-circle {
  text-align: center;
  color: #f093fb80;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-circle p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #f093fb80;
}

.legend-item-modern:hover .legend-color {
  transform: scale(1.2);
  box-shadow: 0 0 20px #f093fb;
}

.legend-item-modern:hover .legend-emoji {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 12px #f093fb80);
}

@media (max-width: 768px) {
  .mood-pie-modern {
    padding: 1rem;
    gap: 1.5rem;
  }
  
  .mood-pie-svg {
    width: 180px;
    height: 100px;
  }
  
  .pie-center {
    padding: 0.8rem 1.2rem;
  }
}
`;

const MoodPieHalf = ({ moodData }) => {
  const [animatedData, setAnimatedData] = useState([]);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  
  const total = moodData.reduce((sum, mood) => sum + mood.count, 0);
  
  useEffect(() => {
    if (total > 0) {
      let cumulativePercentage = 0;
      const processedData = moodData.map((mood, index) => {
        const percentage = (mood.count / total) * 100;
        const startAngle = cumulativePercentage * 1.8; // 180 degrees total
        const endAngle = (cumulativePercentage + percentage) * 1.8;
        cumulativePercentage += percentage;
        
        return {
          ...mood,
          percentage: percentage,
          startAngle,
          endAngle,
          index
        };
      }).filter(mood => mood.count > 0);
      
      setAnimatedData(processedData);
    }
  }, [moodData, total]);

  if (!total || animatedData.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="mood-pie-empty">
          <div className="empty-circle">
            <div className="empty-icon">📊</div>
            <p>No mood data available</p>
          </div>
        </div>
      </>
    );
  }

  const radius = 80;
  const strokeWidth = 25;
  const center = 100;
  
  // Create arc path
  const createArcPath = (startAngle, endAngle, radius, strokeWidth) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <motion.div 
      className="mood-pie-modern"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="pie-container">
        <svg width="200" height="120" viewBox="0 0 200 120" className="mood-pie-svg">
          {/* Background arc */}
          <path
            d={createArcPath(0, 180, radius, strokeWidth)}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Animated mood arcs */}
          {animatedData.map((mood, index) => (
            <motion.g key={mood.id}>
              <motion.path
                d={createArcPath(mood.startAngle, mood.endAngle, radius, strokeWidth)}
                fill="none"
                stroke={mood.color}
                strokeWidth={hoveredSlice === index ? strokeWidth + 4 : strokeWidth}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.9 }}
                transition={{ 
                  duration: 1.2, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                onMouseEnter={() => setHoveredSlice(index)}
                onMouseLeave={() => setHoveredSlice(null)}
                style={{
                  filter: hoveredSlice === index ? `drop-shadow(0 0 10px ${mood.color})` : 'none',
                  cursor: 'pointer'
                }}
              />
              
              {/* Percentage labels */}
              {mood.percentage > 5 && (
                <motion.text
                  x={polarToCartesian(center, center, radius, (mood.startAngle + mood.endAngle) / 2).x}
                  y={polarToCartesian(center, center, radius, (mood.startAngle + mood.endAngle) / 2).y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#fff"
                  fontSize="11"
                  fontWeight="600"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 + 0.8 }}
                  style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    pointerEvents: 'none'
                  }}
                >
                  {Math.round(mood.percentage)}%
                </motion.text>
              )}
            </motion.g>
          ))}
        </svg>
        
        {/* Center content */}
        <motion.div 
          className="pie-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="total-reviews">
            <span className="total-number">{total}</span>
            <span className="total-label">Reviews</span>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Legend */}
      <motion.div 
        className="mood-legend-modern"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {animatedData.map((mood, index) => (
          <motion.div
            key={mood.id}
            className={`legend-item-modern ${hoveredSlice === index ? 'active' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 1 }}
            onMouseEnter={() => setHoveredSlice(index)}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div className="legend-indicator">
              <div 
                className="legend-color"
                style={{ backgroundColor: mood.color }}
              />
              <span className="legend-emoji">{mood.emoji}</span>
            </div>
            <div className="legend-content">
              <span className="legend-label">{mood.label}</span>
              <div className="legend-stats">
                <span className="legend-count">{mood.count} reviews</span>
                <span className="legend-percentage">{Math.round(mood.percentage)}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default MoodPieHalf;