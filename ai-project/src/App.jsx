import { useState, useEffect, useRef } from "react";
import { API_KEY, URL } from "./constants";
import { Answer } from "./components/Answer";
import { FiTrash2, FiSend, FiClock, FiX } from "react-icons/fi";

function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Clean response text by removing asterisks and formatting
  const cleanResponse = (text) => {
    if (!text) return text;
    
    return text
      .replace(/\*\*/g, '')  // Remove double asterisks (bold)
      .replace(/\*/g, '')    // Remove single asterisks
      .replace(/\s+\./g, '.') // Fix spacing before periods
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple blank lines
      .trim();
  };

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("history")) || [];
    setRecentHistory(savedHistory);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [result]);

  const clearHistory = () => {
    localStorage.removeItem("history");
    setRecentHistory([]);
  };

  const clearChat = () => {
    setResult([]);
  };

  async function handleAsk() {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    const currentQuestion = question;

    const payload = {
      contents: [
        {
          parts: [{ text: currentQuestion }],
        },
      ],
    };

    try {
      const updatedHistory = [
        currentQuestion,
        ...recentHistory.filter((item) => item !== currentQuestion),
      ].slice(0, 10);
      localStorage.setItem("history", JSON.stringify(updatedHistory));
      setRecentHistory(updatedHistory);

      setResult((prev) => [
        ...prev,
        { type: "q", text: currentQuestion, timestamp: new Date().toLocaleTimeString() },
      ]);

      let response = await fetch(URL + API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = await response.json();
      let dataString =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response found.";

      // ✅ Clean the response before displaying
      dataString = cleanResponse(dataString);

      setResult((prev) => [
        ...prev,
        { type: "a", text: dataString, timestamp: new Date().toLocaleTimeString() },
      ]);

      setQuestion("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error fetching answer:", error);
      setResult((prev) => [
        ...prev,
        { type: "a", text: "⚠️ Something went wrong. Try again later.", timestamp: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const clearInput = () => {
    setQuestion("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <div className="w-72 bg-gray-900/60 backdrop-blur-lg border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Whisper
          </h1>
          <p className="text-gray-400 text-xs mt-2">AI-powered conversations</p>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-sm font-semibold flex items-center space-x-2">
              <FiClock className="text-gray-400" /> <span>Recent</span>
            </h2>
            {recentHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1 transition-colors"
              >
                <FiTrash2 size={14} /> <span>Clear</span>
              </button>
            )}
          </div>

          <div className="overflow-y-auto h-full pb-4 px-4">
            {recentHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent questions</p>
            ) : (
              <ul className="space-y-2">
                {recentHistory.map((item, index) => (
                  <li
                    key={index}
                    className="p-3 bg-gray-800/40 rounded-lg cursor-pointer hover:bg-gray-700/60 transition-all duration-200 text-sm line-clamp-2 hover:scale-[1.02]"
                    onClick={() => {
                      setQuestion(item);
                      inputRef.current?.focus();
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-800 p-4 flex justify-between items-center bg-gray-900/60 backdrop-blur-lg">
          <div>
            <h2 className="text-lg font-semibold">Chat</h2>
            <p className="text-gray-400 text-xs mt-1">{result.length} messages</p>
          </div>
          {result.length > 0 && (
            <button
              onClick={clearChat}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors flex items-center space-x-2"
            >
              <FiTrash2 size={14} /> <span>Clear Chat</span>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800">
          {result.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Welcome to Whisper</h3>
              <p className="text-center max-w-md text-sm">Start chatting by asking a question or choose one from your history.</p>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto w-full">
              {result.map((item, index) => (
                <div
                  key={index}
                  className={`flex transition-all duration-300 ${
                    item.type === "q" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 shadow-lg transition-transform duration-200 hover:scale-[1.01] ${
                      item.type === "q"
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                        : "bg-gray-800/70 border border-gray-700"
                    }`}
                  >
                    <Answer ans={item.text} type={item.type} totalResult={result.length} index={index} />
                    <div
                      className={`text-xs mt-2 flex justify-end ${
                        item.type === "q" ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {item.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/70 rounded-2xl p-4 max-w-[60%]">
                    <div className="flex space-x-2 items-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-gray-400 text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 p-4 bg-gray-900/70 backdrop-blur-lg">
          <div className="max-w-3xl mx-auto">
            <div className="flex space-x-3 items-center relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              
              {question && (
                <button
                  onClick={clearInput}
                  className="absolute right-16 text-gray-400 hover:text-gray-300 transition-colors p-1"
                >
                  <FiX size={18} />
                </button>
              )}
              
              <button
                onClick={handleAsk}
                disabled={!question.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
                title="Send message"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiSend className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <p className="text-center text-gray-500 text-xs mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


export default App;