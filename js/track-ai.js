// Client-side lightweight AI helpers for the tracking page
// Exposes:
//  - window.TrackAI.generateDetailedSummary(order) => { summary, confidence, reasoning }
//  - window.TrackAI.predictETA(order) => string
//  - window.TrackAI.regenerate(order) => same as generateDetailedSummary but varies phrasing
(function () {
  function safeString(v) {
    return (v === undefined || v === null) ? '' : String(v);
  }

  function confidenceScore(order) {
    // Basic heuristic scoring: presence of estimated_delivery, coordinates, recent history
    let score = 50;
    try {
      if (order.estimated_delivery) score += 15;
      if (order.latitude && order.longitude) score += 15;
      if (order.history && order.history.length >= 2) score += 10;
      const status = (order.status || '').toLowerCase();
      if (status.includes('delivered')) score = 95;
      if (status.includes('out for delivery')) score = Math.max(score, 85);
    } catch (e) {
      // keep defaults
    }
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  function formatReasoning(order) {
    const reasons = [];
    if (order.estimated_delivery) reasons.push('has an estimated delivery date');
    if (order.latitude && order.longitude) reasons.push('includes GPS coordinates');
    if (order.history && order.history.length) reasons.push(`${order.history.length} history events`);
    if (order.status) reasons.push(`current status: ${order.status}`);
    if (!reasons.length) return 'Not enough data to provide detailed reasoning.';
    return 'Confidence based on: ' + reasons.join(', ') + '.';
  }

  function generateDetailedSummary(order, opts) {
    opts = opts || {};
    if (!order) return { summary: 'No order data available.', confidence: 0, reasoning: 'No data' };

    const parcel = safeString(order.parcel_description || order.parcel || 'Your parcel');
    const status = safeString(order.status) || 'status unknown';
    const loc = safeString(order.location) || 'location unknown';
    const last = (order.history && order.history.length) ? order.history[order.history.length - 1] : null;
    const lastText = last ? `${safeString(last.status)} at ${safeString(last.location)} on ${safeString(last.date)}${last.time ? ' ' + safeString(last.time) : ''}` : 'no recent updates';

    const eta = predictETA(order);
    const confidence = confidenceScore(order);
    const reasoning = formatReasoning(order);

    // Friendly multi-sentence summary
    const sentences = [];
    sentences.push(`${parcel} is currently ${status}.`);
    sentences.push(`Last recorded update: ${lastText}.`);
    sentences.push(`Current location reported as ${loc}.`);
    sentences.push(`Estimated delivery: ${eta}.`);

    // Optionally add a short recommendation
    if (confidence < 50) {
      sentences.push('Recommendation: contact support for precise details.');
    } else if (confidence < 80) {
      sentences.push('Recommendation: monitor for further updates.');
    } else {
      sentences.push('Recommendation: no action needed at this time.');
    }

    // Slight phrasing variation if regenerate requested
    let summary = sentences.join(' ');
    if (opts.variant && opts.variant === 'short') {
      summary = `${parcel} — ${status}. ETA: ${eta}.`;
    }

    return { summary, confidence, reasoning };
  }

  function predictETA(order) {
    if (!order) return 'ETA unavailable';
    const status = (order.status || '').toLowerCase();
    if (status.includes('delivered')) return 'Delivered';
    if (status.includes('out for delivery') || status.includes('out for')) return 'Today (out for delivery)';

    // If estimated_delivery is a parsable date, return a friendly delta
    try {
      const ed = new Date(order.estimated_delivery);
      if (!isNaN(ed.getTime())) {
        const now = new Date();
        const diffDays = Math.ceil((ed - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return `By ${ed.toLocaleDateString()} (today)`;
        if (diffDays === 1) return `Tomorrow (${ed.toLocaleDateString()})`;
        return `In ${diffDays} day(s) (by ${ed.toLocaleDateString()})`;
      }
    } catch (e) {
      // fall through
    }

    if (status.includes('in transit') || status.includes('processing')) return 'Likely within a few days';
    return 'ETA unavailable';
  }

  function regenerate(order) {
    // Provide a variant phrasing for a regenerated summary
    return generateDetailedSummary(order, { variant: 'short' });
  }

  window.TrackAI = {
    generateDetailedSummary,
    predictETA,
    regenerate
  };
})();
