// Lightweight client-side AI Chat Bot for simple tracking Q&A
// Uses: fetch to /api/track/:tn and window.TrackAI when available
(function () {
  function createMessageElement(text, fromUser) {
    const el = document.createElement('div');
    el.className = 'chat-message ' + (fromUser ? 'chat-user' : 'chat-bot');
    el.textContent = text;
    return el;
  }

  async function handleUserMessage(text, container) {
    const normalized = text.trim();
    // simple detection of tracking number (SCS + digits/letters)
    const tnMatch = normalized.match(/(SCS[0-9A-Z-]+)/i);
    if (tnMatch) {
      const tn = tnMatch[1].toUpperCase();
      appendBotMessage(container, `Looking up tracking number ${tn}...`);
      try {
        const res = await fetch(`/api/track/${tn}`);
        if (!res.ok) {
          appendBotMessage(container, `I couldn't find any package with tracking number ${tn}. Please check the number.`);
          return;
        }
        const order = await res.json();
        if (window.TrackAI && window.TrackAI.generateDetailedSummary) {
          const info = window.TrackAI.generateDetailedSummary(order);
          appendBotMessage(container, info.summary + `\n\n(Confidence: ${info.confidence}% — ${info.reasoning})`);
        } else {
          // fallback short summary
          appendBotMessage(container, `Package ${tn} status: ${order.status}. Current location: ${order.location}. Estimated delivery: ${order.estimated_delivery}`);
        }
      } catch (e) {
        appendBotMessage(container, `Sorry, I had trouble looking up that tracking number.`);
      }
      return;
    }

    // If no tracking number present, handle general intents
    const lower = normalized.toLowerCase();
    if (lower.includes('eta') || lower.includes('estimate')) {
      appendBotMessage(container, `If you provide a tracking number (e.g. SCS12345) I can give a predicted ETA.`);
      return;
    }
    if (lower.includes('how') && lower.includes('work')) {
      appendBotMessage(container, `This chat bot can look up tracking numbers (SCS...) and give a short summary or ETA. Try "Track SCS12345".`);
      return;
    }

    // Generic fallback
    appendBotMessage(container, `I can help with tracking numbers (e.g. SCS12345) or basic questions about delivery status. What would you like to do?`);
  }

  function appendBotMessage(container, text) {
    const el = createMessageElement(text, false);
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }

  function appendUserMessage(container, text) {
    const el = createMessageElement(text, true);
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }

  function setupChat() {
    const button = document.getElementById('chat-toggle-btn');
    const panel = document.getElementById('chat-panel');
    const messages = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const send = document.getElementById('chat-send');

    if (!button || !panel) return;

    button.addEventListener('click', () => {
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) input.focus();
    });

    function submit() {
      const text = input.value.trim();
      if (!text) return;
      appendUserMessage(messages, text);
      input.value = '';
      handleUserMessage(text, messages);
    }

    send.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });

    // welcome message
    setTimeout(() => appendBotMessage(messages, 'Hi — I can help track parcels. Try: "Track SCS12345"'), 300);
  }

  document.addEventListener('DOMContentLoaded', setupChat);

  window.ChatBot = { setupChat };
})();
