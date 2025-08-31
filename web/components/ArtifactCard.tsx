type Props = { 
  name: string; 
  href: string; 
  isMainOutput?: boolean;
};

export default function ArtifactCard({ name, href, isMainOutput = false }: Props) {
  const icon = name.endsWith('.pdf') ? '📄' : name.endsWith('.html') ? '📃' : '🧾';
  
  return (
    <a href={href} target="_blank" rel="noreferrer"
       className={`card p-4 hover:shadow-xl transition block ${
         isMainOutput ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' : ''
       }`}>
      <div className="flex items-center gap-3">
        <div style={{fontSize:24}}>{icon}</div>
        <div className="flex-1">
          <div className="font-semibold flex items-center gap-2">
            {name}
            {isMainOutput && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                MAIN OUTPUT
              </span>
            )}
          </div>
          <div className="label text-sm">{href}</div>
          {isMainOutput && (
            <div className="text-blue-600 text-sm mt-1">
              ✨ This is your reconstructed PDF - click to download!
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
