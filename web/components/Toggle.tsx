type Props = { label: string; checked: boolean; onChange: (v:boolean)=>void };
export default function Toggle({ label, checked, onChange }: Props) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="label">{label}</span>
      <div className="switch" data-on={checked} onClick={()=>onChange(!checked)}>
        <div className="dot"/>
      </div>
    </div>
  );
}
