import { useState, useEffect, useRef } from "react";

const ChatPanel = ({ messages, onSend, currentUserId, onClose }) => {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(text);
    setText("");
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-zinc-900 text-white flex flex-col shadow-lg z-50">
      <div className="flex justify-between items-center p-3 border-b border-zinc-700">
        <h3 className="font-semibold">In-call chat</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[75%] p-2 rounded-lg text-sm ${
              m.senderId === currentUserId
                ? "bg-blue-600 ml-auto"
                : "bg-zinc-700"
            }`}
          >
            <p className="text-xs text-zinc-300 mb-0.5">{m.senderName}</p>
            <p>{m.message}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-700 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-zinc-800 rounded px-3 py-2 text-sm outline-none"
        />
        <button type="submit" className="bg-blue-600 px-3 py-2 rounded text-sm">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;