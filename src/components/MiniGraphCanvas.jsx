import React, { useEffect, useRef, useState } from 'react';

export default function MiniGraphCanvas({ fn, inputX }) {
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const contextRef = useRef(null);

  // Setup intersection observer to draw only when visible
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '100px' }
    );

    observer.observe(canvas);
    return () => {
      if (canvas) observer.unobserve(canvas);
    };
  }, []);

  // Drawing logic
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = contextRef.current;
    if (!ctx) {
      ctx = canvas.getContext('2d');
      contextRef.current = ctx;
    }

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || canvas.width / 2;
    const h = rect.height || canvas.height / 2;

    const targetW = Math.round(w * dpr);
    const targetH = Math.round(h * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const padding = { top: 8, bottom: 8, left: 8, right: 8 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    const xMin = -5, xMax = 5;
    let yMin = -2, yMax = 2;

    // Sample to find actual range
    const SAMPLES = 100;
    let sMin = Infinity, sMax = -Infinity;
    let sampleCount = 0;
    for (let i = 0; i <= SAMPLES; i++) {
      const x = xMin + (xMax - xMin) * (i / SAMPLES);
      const y = fn.compute(x);
      if (isFinite(y)) {
        if (y < sMin) sMin = y;
        if (y > sMax) sMax = y;
        sampleCount++;
      }
    }
    if (sampleCount > 0) {
      const sRange = sMax - sMin || 1;
      yMin = sMin - sRange * 0.15;
      yMax = sMax + sRange * 0.15;
    }

    const toCanvasX = (x) => padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const toCanvasY = (y) => padding.top + ((yMax - y) / (yMax - yMin)) * plotH;

    // Subtle Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;

    // Horizontal zero line
    if (yMin <= 0 && yMax >= 0) {
      const zeroY = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(padding.left, zeroY);
      ctx.lineTo(w - padding.right, zeroY);
      ctx.stroke();
    }

    // Vertical zero line
    const zeroX = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(zeroX, padding.top);
    ctx.lineTo(zeroX, h - padding.bottom);
    ctx.stroke();

    // Function curve
    ctx.beginPath();
    ctx.strokeStyle = fn.accentColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    let started = false;
    for (let i = 0; i <= SAMPLES; i++) {
      const x = xMin + (xMax - xMin) * (i / SAMPLES);
      const y = fn.compute(x);
      if (!isFinite(y)) continue;
      const cx = toCanvasX(x);
      const cy = toCanvasY(y);
      if (!started) {
        ctx.moveTo(cx, cy);
        started = true;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();

    // Gradient fill under curve
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, fn.accentColor + '18');
    gradient.addColorStop(1, fn.accentColor + '02');

    ctx.beginPath();
    started = false;
    let firstCx = 0;
    for (let i = 0; i <= SAMPLES; i++) {
      const x = xMin + (xMax - xMin) * (i / SAMPLES);
      const y = fn.compute(x);
      if (!isFinite(y)) continue;
      const cx = toCanvasX(x);
      const cy = toCanvasY(y);
      if (!started) {
        firstCx = cx;
        ctx.moveTo(cx, cy);
        started = true;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    const baselineY = toCanvasY(0);
    ctx.lineTo(toCanvasX(xMax), baselineY);
    ctx.lineTo(firstCx, baselineY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Current input point
    const outputY = fn.compute(inputX);
    if (isFinite(outputY)) {
      const px = toCanvasX(inputX);
      const py = toCanvasY(outputY);

      // Glow
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = fn.accentColor + '30';
      ctx.fill();

      // Outer ring
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = fn.accentColor + '60';
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Vertical dashed line from point to x-axis
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, baselineY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  useEffect(() => {
    if (isVisible) {
      draw();
    }
  }, [isVisible, inputX, fn]);

  return <canvas ref={canvasRef} className="card-graph" width="600" height="200"></canvas>;
}
