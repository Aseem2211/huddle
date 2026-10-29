export default function HostControls({ accessMode, changeMode, requests, respond }) {
  return (
    <div className="p-4 space-y-4 bg-[#101A2E] text-white">
      <div>
        <p className="text-sm text-slate-400 mb-1">Who can join</p>
        <select
          value={accessMode}
          onChange={(e) => changeMode(e.target.value)}
          className="w-full p-2 bg-[#0A1224] border border-slate-700"
        >
          <option value="open">Anyone with the link</option>
          <option value="approval">I must approve each person</option>
          <option value="locked">Locked (no new people)</option>
        </select>
      </div>

      {requests.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-400">Waiting to join</p>
          {requests.map((r) => (
            <div key={r.userId} className="flex items-center justify-between">
              <span>{r.name}</span>
              <div className="flex gap-2">
                <button onClick={() => respond(r, true)} className="px-3 py-1 bg-blue-600">Admit</button>
                <button onClick={() => respond(r, false)} className="px-3 py-1 bg-slate-700">Deny</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}