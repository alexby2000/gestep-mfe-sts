import React, { useState, useMemo } from 'react';
import { Clock, Users, Target, Container } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './WeeklyStats.module.css';

export const WeeklyStats = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // TODO: Obtener datos reales de la base de datos
  const statsData = {
    hoursUsed: 24.5,
    studentsEvaluated: 12,
    exercisesCompleted: 47,
    ammunitionConsumed: 1240
  };

  // Datos de tendencia semanal para los mini gráficos
  const weeklyTrend = [
    { day: 'L', hours: 6, students: 4, exercises: 22, ammo: 180 },
    { day: 'M', hours: 8, students: 6, exercises: 28, ammo: 240 },
    { day: 'X', hours: 7, students: 5, exercises: 25, ammo: 210 },
    { day: 'J', hours: 9, students: 7, exercises: 32, ammo: 280 },
    { day: 'V', hours: 12, students: 6, exercises: 49, ammo: 330 },
    { day: 'S', hours: 3, students: 2, exercises: 12, ammo: 95 },
    { day: 'D', hours: 0, students: 0, exercises: 0, ammo: 0 },
  ];

  const stats = [
    {
      id: 'hours',
      title: 'Horas de Uso',
      subtitle: 'Esta semana',
      value: statsData.hoursUsed,
      unit: 'hrs',
      icon: Clock,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      progress: 70,
      change: '+12%',
      changeType: 'positive',
      chartType: 'area',
      dataKey: 'hours'
    },
    {
      id: 'students',
      title: 'Alumnos Evaluados',
      subtitle: 'Esta semana',
      value: statsData.studentsEvaluated,
      unit: 'alumnos',
      icon: Users,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      progress: 60,
      change: '+8',
      changeType: 'positive',
      chartType: 'bar',
      dataKey: 'students'
    },
    {
      id: 'exercises',
      title: 'Ejercicios Realizados',
      subtitle: 'Esta semana',
      value: statsData.exercisesCompleted,
      unit: 'ejercicios',
      icon: Target,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      progress: 85,
      change: '+15',
      changeType: 'positive',
      chartType: 'line',
      dataKey: 'exercises'
    },
    {
      id: 'ammunition',
      title: 'Munición Consumida',
      subtitle: 'Esta semana',
      value: statsData.ammunitionConsumed,
      unit: 'disparos',
      icon: Container,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      progress: 45,
      change: '+234',
      changeType: 'positive',
      chartType: 'bar',
      dataKey: 'ammo'
    }
  ];

  // Renderiza el mini gráfico según el tipo
  const renderMiniChart = (stat) => {
    const isHovered = hoveredCard === stat.id;
    const chartProps = {
      data: weeklyTrend,
      margin: { top: 5, right: 5, left: 5, bottom: 5 }
    };

    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <div className={styles.chartTooltip}>
            <p className={styles.tooltipValue}>{payload[0].value}</p>
          </div>
        );
      }
      return null;
    };

    switch (stat.chartType) {
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <defs>
              <linearGradient id={`gradient-${stat.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stat.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={stat.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey={stat.dataKey} 
              stroke={stat.color} 
              strokeWidth={2}
              fill={`url(#gradient-${stat.id})`}
              animationDuration={1000}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <Bar 
              dataKey={stat.dataKey} 
              fill={stat.color} 
              radius={[3, 3, 0, 0]}
              animationDuration={1000}
              opacity={0.8}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart {...chartProps}>
            <Line 
              type="monotone" 
              dataKey={stat.dataKey} 
              stroke={stat.color} 
              strokeWidth={2.5}
              dot={false}
              animationDuration={1000}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
          </LineChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Resumen de la Semana</h2>

      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isHovered = hoveredCard === stat.id;
          
          return (
            <div 
              key={stat.id} 
              className={styles.statCard}
              onMouseEnter={() => setHoveredCard(stat.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Header con icono */}
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper} style={{ background: stat.gradient }}>
                  <Icon className={styles.icon} />
                </div>
                <div className={styles.change} style={{ 
                  color: stat.changeType === 'positive' ? '#10b981' : '#ef4444' 
                }}>
                  {stat.change}
                  <span className={styles.changeTrend}>
                    {stat.changeType === 'positive' ? '↑' : '↓'}
                  </span>
                </div>
              </div>

              {/* Valor principal */}
              <div className={styles.valueSection}>
                <div className={styles.value}>
                  {stat.value}
                  <span className={styles.unit}>{stat.unit}</span>
                </div>
                <div className={styles.statTitle}>{stat.title}</div>
                <div className={styles.statSubtitle}>{stat.subtitle}</div>
              </div>

              {/* Mini gráfico de tendencia */}
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={60}>
                  {renderMiniChart(stat)}
                </ResponsiveContainer>
                
                {/* Eje de días personalizado */}
                <div className={`${styles.customAxis} ${isHovered ? styles.customAxisVisible : ''}`}>
                  {weeklyTrend.map((item, index) => (
                    <span 
                      key={index} 
                      className={styles.axisLabel}
                      style={{ 
                        color: stat.color,
                        transitionDelay: `${index * 30}ms`
                      }}
                    >
                      {item.day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Barra de progreso */}
              <div className={styles.progressSection}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ 
                      width: `${stat.progress}%`,
                      background: stat.gradient
                    }}
                  >
                    <div className={styles.progressGlow}></div>
                  </div>
                </div>
                <div className={styles.progressLabel}>{stat.progress}% del objetivo</div>
              </div>

              {/* Decoración de fondo */}
              <div className={styles.cardDecoration} style={{ 
                background: `radial-gradient(circle at 100% 0%, ${stat.color}15 0%, transparent 50%)`
              }}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
