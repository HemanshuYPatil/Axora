"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { MessageCircle, X, Send, Bot, User, ShoppingBag, Watch } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Axora Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10 text-sm">
                <Bot className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p>Hello! I can help you find products like watches or home appliances.</p>
              </div>
            ) : null}

            {messages.map((m) => (
              <div key={m.id}>
                {/* Standard Message */}
                <div
                  className={`flex items-start gap-2 ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full flex-shrink-0 ${
                      m.role === "user" ? "bg-black text-white" : "bg-gray-200 text-black"
                    }`}
                  >
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-black text-white rounded-tr-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>

                {/* Tool Invocations */}
                {m.toolInvocations?.map((toolInvocation) => {
                  if (toolInvocation.toolName === "showProduct" && toolInvocation.state === "result") {
                    const { result } = toolInvocation;
                    return (
                      <div key={toolInvocation.toolCallId} className="mt-2 ml-10 max-w-[80%]">
                        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                          <div className="flex items-center gap-2 mb-2 text-black">
                            {result.category === "watches" ? <Watch className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                            <span className="font-semibold text-sm">{result.productName}</span>
                          </div>
                          {result.image && (
                            <div className="w-full h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-xs text-gray-400 overflow-hidden">
                                <img src={result.image} alt={result.productName} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <p className="text-xs text-gray-600 mb-2">{result.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-black">${result.price}</span>
                            <button className="px-3 py-1 bg-black text-white text-xs rounded-full hover:bg-gray-800 transition">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-full bg-gray-200 flex-shrink-0">
                  <Bot className="w-4 h-4 text-black" />
                </div>
                <div className="px-4 py-2 rounded-2xl bg-white border border-gray-200 text-gray-500 text-sm flex items-center gap-1 rounded-tl-none">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 bg-gray-100 rounded-full pr-2 pl-4 py-1"
            >
              <input
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-500"
                value={input}
                placeholder="Ask about watches..."
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black hover:bg-gray-800 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
