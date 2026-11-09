/**
 * AI Support Chatbot - Floating Widget
 * Drop this script into any .NET 4.8 Web Application (MVC 5 / WebForms / Razor).
 */
(function () {
  "use strict";

  // 1. Identify current script element to extract configuration attributes
  const scriptTag = document.currentScript || (function () {
    const scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  const API_URL = scriptTag?.getAttribute("data-api-url") || "http://localhost:8000/api/v1/chat";
  const API_KEY = scriptTag?.getAttribute("data-api-key") || "";
  const BOT_TITLE = scriptTag?.getAttribute("data-bot-title") || "AI Support Assistant";
  const WELCOME_MSG = scriptTag?.getAttribute("data-welcome") || "Hello! How can I help you today?";

  // Retrieve or create persistent user ID
  let userId = scriptTag?.getAttribute("data-user-id") || localStorage.getItem("ai_chat_user_id");
  if (!userId) {
    userId = "usr_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("ai_chat_user_id", userId);
  }

  // 2. Inject Widget CSS
  const styles = `
    #ai-chatbot-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s;
    }
    #ai-chatbot-launcher:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 28px rgba(37, 99, 235, 0.45);
    }
    #ai-chatbot-launcher svg {
      width: 28px;
      height: 28px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #ai-chatbot-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 540px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    #ai-chatbot-window.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .ai-chat-header {
      background: linear-gradient(135deg, #1e40af, #2563eb);
      color: #ffffff;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ai-chat-header-title {
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ai-status-dot {
      width: 8px;
      height: 8px;
      background: #4ade80;
      border-radius: 50%;
      box-shadow: 0 0 6px #4ade80;
    }

    .ai-chat-close-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      font-size: 20px;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.15s, color 0.15s;
    }
    .ai-chat-close-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.15);
    }

    .ai-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8fafc;
    }

    .ai-msg {
      max-width: 82%;
      padding: 10px 14px;
      font-size: 13.5px;
      line-height: 1.45;
      word-break: break-word;
      border-radius: 14px;
    }

    .ai-msg-bot {
      align-self: flex-start;
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .ai-msg-user {
      align-self: flex-end;
      background: #2563eb;
      color: #ffffff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }

    .ai-typing-indicator {
      display: none;
      align-self: flex-start;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 10px 14px;
      border-radius: 14px;
      border-bottom-left-radius: 4px;
      gap: 4px;
      align-items: center;
    }
    .ai-typing-indicator span {
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      animation: ai-pulse 1.2s infinite ease-in-out;
    }
    .ai-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .ai-typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes ai-pulse {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
      40% { transform: scale(1.1); opacity: 1; }
    }

    .ai-chat-input-area {
      padding: 12px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ai-chat-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 9px 14px;
      font-size: 13.5px;
      outline: none;
      transition: border-color 0.15s;
    }
    .ai-chat-input:focus {
      border-color: #2563eb;
    }

    .ai-chat-send-btn {
      background: #2563eb;
      color: #ffffff;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .ai-chat-send-btn:hover {
      background: #1d4ed8;
    }
    .ai-chat-send-btn:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // 3. Inject Widget DOM
  const widgetContainer = document.createElement("div");
  widgetContainer.id = "ai-chatbot-root";
  widgetContainer.innerHTML = `
    <button id="ai-chatbot-launcher" title="Open Chat" aria-label="Open Chat">
      <svg viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>

    <div id="ai-chatbot-window">
      <div class="ai-chat-header">
        <div class="ai-chat-header-title">
          <span class="ai-status-dot"></span>
          <span>${BOT_TITLE}</span>
        </div>
        <button class="ai-chat-close-btn" id="ai-chatbot-close" title="Close">&times;</button>
      </div>
      <div class="ai-chat-messages" id="ai-chat-msg-list">
        <div class="ai-msg ai-msg-bot">${WELCOME_MSG}</div>
        <div class="ai-typing-indicator" id="ai-typing-loader">
          <span></span><span></span><span></span>
        </div>
      </div>
      <form class="ai-chat-input-area" id="ai-chat-form">
        <input type="text" class="ai-chat-input" id="ai-chat-text-input" placeholder="Type your message..." autocomplete="off" />
        <button type="submit" class="ai-chat-send-btn" id="ai-chat-send-btn" title="Send message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // 4. Element references
  const launcher = document.getElementById("ai-chatbot-launcher");
  const chatWindow = document.getElementById("ai-chatbot-window");
  const closeBtn = document.getElementById("ai-chatbot-close");
  const chatForm = document.getElementById("ai-chat-form");
  const textInput = document.getElementById("ai-chat-text-input");
  const sendBtn = document.getElementById("ai-chat-send-btn");
  const msgList = document.getElementById("ai-chat-msg-list");
  const typingLoader = document.getElementById("ai-typing-loader");

  // Toggle open/close
  function toggleChat(isOpen) {
    if (isOpen) {
      chatWindow.classList.add("open");
      textInput.focus();
    } else {
      chatWindow.classList.remove("open");
    }
  }

  launcher.addEventListener("click", () => toggleChat(!chatWindow.classList.contains("open")));
  closeBtn.addEventListener("click", () => toggleChat(false));

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
  }

  function appendMessage(text, isUser = false) {
    const msg = document.createElement("div");
    msg.className = "ai-msg " + (isUser ? "ai-msg-user" : "ai-msg-bot");
    msg.innerHTML = escapeHtml(text).replace(/\n/g, "<br>");
    msgList.insertBefore(msg, typingLoader);
    msgList.scrollTop = msgList.scrollHeight;
  }

  function setTyping(isTyping) {
    typingLoader.style.display = isTyping ? "flex" : "none";
    sendBtn.disabled = isTyping;
    msgList.scrollTop = msgList.scrollHeight;
  }

  // Handle send message
  chatForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const query = textInput.value.trim();
    if (!query) return;

    appendMessage(query, true);
    textInput.value = "";
    setTyping(true);

    try {
      const headers = {
        "Content-Type": "application/json"
      };
      if (API_KEY) {
        headers["X-API-KEY"] = API_KEY;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          message: query,
          user_id: userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        appendMessage(data.detail || "Sorry, an error occurred while connecting to the assistant.");
      } else {
        appendMessage(data.message || "No response received.");
      }
    } catch (err) {
      appendMessage("Unable to reach the chatbot service. Please ensure the backend is running.");
    } finally {
      setTyping(false);
      textInput.focus();
    }
  });
})();
