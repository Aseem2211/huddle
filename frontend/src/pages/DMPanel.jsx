import { useEffect, useState } from "react";
import useDM from "../hooks/useDM";

export default function DMPanel({ socket, currentUser }) {
  const {
    conversations,
    activeConversation,
    messages,
    loadConversations,
    openConversation,
    sendMessage,
  } = useDM(socket, currentUser);

  const [input, setInput] = useState("");

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="dm-panel">
      <div className="dm-list">
        {conversations.map((c) => (
          <div
            key={c.conversation_id}
            className="dm-list-item"
            onClick={() => openConversation(c.other_user_id)}
          >
            {c.other_user_name}
          </div>
        ))}
      </div>

      <div className="dm-window">
        {activeConversation ? (
          <>
            <div className="dm-messages">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={m.sender_id === currentUser.id ? "dm-msg-mine" : "dm-msg-theirs"}
                >
                  {m.content}
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="dm-input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="dm-empty">Select a conversation</div>
        )}
      </div>
    </div>
  );
}