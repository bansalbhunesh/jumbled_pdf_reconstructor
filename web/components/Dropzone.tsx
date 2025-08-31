import React from 'react';

type Props = { onFile: (f: File) => void };

export default function Dropzone({ onFile }: Props) {
  const [active, setActive] = React.useState(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };
  return (
    <div
      onDragOver={(e)=>{e.preventDefault(); setActive(true);}}
      onDragLeave={()=>setActive(false)}
      onDrop={onDrop}
      className={"card p-8 border-dashed " + (active ? "ring-2 ring-blue-400" : "border")}
      style={{textAlign:'center'}}
    >
      <div style={{fontSize:48, lineHeight:1}}>📄</div>
      <h3 className="text-lg font-bold mb-1">Drag & drop your PDF</h3>
      <p className="text-sm label">…or click the button below</p>
    </div>
  );
}
