import { useState } from "react";
export default function ShareRoom({ roomId }) {
    const [copied, setCopied] = useState(false);
    const link = `${window.location.origin}/room/${roomId}`;
    const text = `Join my huddle meeting. Room code:${roomId}\n${link}`;
    const share = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: "Join my Huddle meeting", text, url: link });

            } catch (e) { }

        }
    };
    const whatsapp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");

    };
    const telegram = () => {
        window.open(
            `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Join my Huddle meeting.Room code:" + roomId)}`,
            "_blank"
        );
    };
    const copy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="flex flex-wrap gap-2">
            {navigator.share && (
                <button onClick={share} className="px-3 py-2 bg-blue-600 text-white">
                    Share
                </button>
            )}
            <button onClick={whatsapp} className="px-3 py-2 bg-green-600 text-white">
                WhatsApp
            </button>
            <button onClick={telegram} className="px-3 py-2 bg-sky-600 text-white">
                Telegram
            </button>
            <button onClick={copy} className="px-3 py-2 bg-slate-700 text-white">
                {copied ? "Copied" : "Copy link"}
            </button>
        </div>
    );
}

