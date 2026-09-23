// Pure SVG Vector Charting Engine for Nexgenesis Dashboard

export class ChartEngine {
  static createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }
    return el;
  }

  // Smooth bezier spline calculation
  static getCurvedPath(points) {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }

  // Render Main Revenue Area Chart
  static renderAreaChart(container, data, formatCurrency) {
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 260;
    const padding = { top: 20, right: 24, bottom: 35, left: 60 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const svg = this.createSVGElement('svg', {
      viewBox: `0 0 ${width} ${height}`,
      class: 'svg-chart'
    });

    // Defs & Gradients
    const defs = this.createSVGElement('defs');
    const gradId = 'revenue-grad-' + Math.random().toString(36).substring(2, 8);
    const grad = this.createSVGElement('linearGradient', {
      id: gradId,
      x1: '0', y1: '0', x2: '0', y2: '1'
    });

    const stop1 = this.createSVGElement('stop', { offset: '0%', 'stop-color': '#6366f1', 'stop-opacity': '0.45' });
    const stop2 = this.createSVGElement('stop', { offset: '95%', 'stop-color': '#6366f1', 'stop-opacity': '0.0' });
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    const values = data.revenue;
    const labels = data.labels;
    const maxVal = Math.max(...values) * 1.15 || 10000;
    const minVal = 0;

    // Gridlines & Y-Axis values
    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
      const y = padding.top + (chartH / gridRows) * i;
      const val = maxVal - (maxVal / gridRows) * i;

      // Line
      const line = this.createSVGElement('line', {
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        class: 'chart-gridline'
      });
      svg.appendChild(line);

      // Y Text
      const text = this.createSVGElement('text', {
        x: padding.left - 10,
        y: y + 4,
        'text-anchor': 'end',
        class: 'chart-axis-text'
      });
      text.textContent = formatCurrency(Math.round(val));
      svg.appendChild(text);
    }

    // Points calculation
    const points = values.map((val, idx) => {
      const x = padding.left + (chartW / (values.length - 1)) * idx;
      const y = padding.top + chartH - (val / maxVal) * chartH;
      return { x, y, val, label: labels[idx], orders: data.orders ? data.orders[idx] : null };
    });

    // Area Path
    const spline = this.getCurvedPath(points);
    const areaPathStr = `${spline} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    const area = this.createSVGElement('path', {
      d: areaPathStr,
      fill: `url(#${gradId})`,
      class: 'chart-area'
    });
    svg.appendChild(area);

    // Stroke Line
    const strokeLine = this.createSVGElement('path', {
      d: spline,
      stroke: '#6366f1',
      'stroke-width': '3',
      class: 'chart-line'
    });
    svg.appendChild(strokeLine);

    // X-Axis Labels & Points
    points.forEach((pt) => {
      const xText = this.createSVGElement('text', {
        x: pt.x,
        y: height - 10,
        'text-anchor': 'middle',
        class: 'chart-axis-text'
      });
      xText.textContent = pt.label;
      svg.appendChild(xText);

      // Point circle
      const dot = this.createSVGElement('circle', {
        cx: pt.x,
        cy: pt.y,
        r: '4',
        stroke: '#6366f1',
        class: 'chart-point'
      });
      svg.appendChild(dot);
    });

    // Crosshair line
    const crosshair = this.createSVGElement('line', {
      x1: 0,
      y1: padding.top,
      x2: 0,
      y2: padding.top + chartH,
      class: 'chart-crosshair'
    });
    svg.appendChild(crosshair);

    container.appendChild(svg);

    // Tooltip
    let tooltip = container.querySelector('.chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      container.appendChild(tooltip);
    }

    // Mouse Interaction
    container.onmousemove = (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      if (mouseX < padding.left || mouseX > width - padding.right) {
        crosshair.classList.remove('active');
        tooltip.classList.remove('active');
        return;
      }

      // Find closest point
      let closestPt = points[0];
      let minDiff = Infinity;
      points.forEach(pt => {
        const diff = Math.abs(pt.x - mouseX);
        if (diff < minDiff) {
          minDiff = diff;
          closestPt = pt;
        }
      });

      crosshair.setAttribute('x1', closestPt.x);
      crosshair.setAttribute('x2', closestPt.x);
      crosshair.classList.add('active');

      tooltip.innerHTML = `
        <span class="chart-tooltip-title">${closestPt.label}</span>
        <span class="chart-tooltip-val">${formatCurrency(closestPt.val)}</span>
        ${closestPt.orders ? `<span style="color:var(--text-muted);font-size:0.7rem;">${closestPt.orders} Orders</span>` : ''}
      `;
      tooltip.style.left = `${closestPt.x}px`;
      tooltip.style.top = `${closestPt.y}px`;
      tooltip.classList.add('active');
    };

    container.onmouseleave = () => {
      crosshair.classList.remove('active');
      tooltip.classList.remove('active');
    };
  }

  // Render Donut Chart for Categories
  static renderDonutChart(container, categories, products, formatCurrency) {
    if (!container) return;
    container.innerHTML = '';

    // Calculate revenue per category
    const catMap = {};
    categories.forEach(c => {
      catMap[c.id] = { name: c.name, color: c.color, revenue: 0, count: 0 };
    });

    let totalRev = 0;
    products.forEach(p => {
      if (catMap[p.category]) {
        const rev = p.revenue || (p.price * (p.salesCount || 1));
        catMap[p.category].revenue += rev;
        catMap[p.category].count++;
        totalRev += rev;
      }
    });

    const segments = Object.values(catMap).filter(c => c.revenue > 0);
    if (totalRev === 0) totalRev = 1;

    // Layout
    const layout = document.createElement('div');
    layout.className = 'donut-layout';

    const svgWrapper = document.createElement('div');
    svgWrapper.className = 'donut-svg-wrapper';

    const size = 200;
    const center = size / 2;
    const radius = 80;
    const innerRadius = 55;

    const svg = this.createSVGElement('svg', {
      viewBox: `0 0 ${size} ${size}`,
      width: size,
      height: size
    });

    let cumulativeAngle = -Math.PI / 2;

    segments.forEach((seg, idx) => {
      const sliceAngle = (seg.revenue / totalRev) * (Math.PI * 2);
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle = endAngle;

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const x3 = center + innerRadius * Math.cos(endAngle);
      const y3 = center + innerRadius * Math.sin(endAngle);
      const x4 = center + innerRadius * Math.cos(startAngle);
      const y4 = center + innerRadius * Math.sin(startAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const pathData = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
        Z
      `;

      const path = this.createSVGElement('path', {
        d: pathData,
        fill: seg.color,
        stroke: 'var(--bg-card)',
        'stroke-width': '2',
        class: 'donut-slice'
      });

      path.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
      path.onmouseenter = () => {
        path.style.opacity = '0.85';
        centerVal.textContent = `${((seg.revenue / totalRev) * 100).toFixed(0)}%`;
        centerLabel.textContent = seg.name;
      };
      path.onmouseleave = () => {
        path.style.opacity = '1';
        centerVal.textContent = formatCurrency(totalRev);
        centerLabel.textContent = 'Total Revenue';
      };

      svg.appendChild(path);
    });

    // Center Text
    const centerText = document.createElement('div');
    centerText.className = 'donut-center-text';
    const centerVal = document.createElement('div');
    centerVal.className = 'donut-center-val';
    centerVal.textContent = formatCurrency(totalRev);
    const centerLabel = document.createElement('div');
    centerLabel.className = 'donut-center-label';
    centerLabel.textContent = 'Total Revenue';

    centerText.appendChild(centerVal);
    centerText.appendChild(centerLabel);

    svgWrapper.appendChild(svg);
    svgWrapper.appendChild(centerText);
    layout.appendChild(svgWrapper);

    // Legend
    const legend = document.createElement('div');
    legend.className = 'donut-legend';

    segments.forEach(seg => {
      const pct = ((seg.revenue / totalRev) * 100).toFixed(1);
      const item = document.createElement('div');
      item.className = 'donut-legend-item';
      item.innerHTML = `
        <div class="donut-legend-left">
          <div class="donut-legend-color" style="background:${seg.color}"></div>
          <span class="donut-legend-name">${seg.name}</span>
        </div>
        <span class="donut-legend-val">${pct}%</span>
      `;
      legend.appendChild(item);
    });

    layout.appendChild(legend);
    container.appendChild(layout);
  }

  // Mini Sparkline Generator for KPI cards
  static renderSparkline(svgElement, points, color = '#6366f1') {
    if (!svgElement) return;
    svgElement.innerHTML = '';

    const width = 100;
    const height = 36;
    const min = Math.min(...points);
    const max = Math.max(...points) || 1;
    const range = max - min || 1;

    const coords = points.map((val, idx) => ({
      x: (width / (points.length - 1)) * idx,
      y: height - 4 - ((val - min) / range) * (height - 8)
    }));

    const pathD = this.getCurvedPath(coords);
    const path = this.createSVGElement('path', {
      d: pathD,
      fill: 'none',
      stroke: color,
      'stroke-width': '2.2',
      'stroke-linecap': 'round'
    });

    svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svgElement.appendChild(path);
  }
}
