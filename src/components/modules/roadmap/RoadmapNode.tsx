import React from 'react';
import { Handle, Position } from '@xyflow/react';

export function RoadmapNode({ data }: { data: any }) {
  const tasks = data.tasks || [];
  const total = tasks.length > 0 ? tasks.length : (data.total || 0);
  const completed = tasks.length > 0 ? tasks.filter((t: any) => t.completed).length : (data.completed || 0);
  const isCompleted = completed === total && total > 0;
  
  return (
    <div className={`px-4 py-3 rounded-lg border shadow-lg bg-[#0f172a]/90 backdrop-blur-md min-w-[200px] transition-all
      ${isCompleted ? 'border-emerald-400/50' : 'border-slate-700'}`}
      style={{
        borderTop: isCompleted ? '3px solid #34d399' : '3px solid #334155'
      }}
    >
      <Handle type="target" position={Position.Top} id="top-target" className="w-2 h-2 !bg-slate-500 border-none" />
      <Handle type="source" position={Position.Top} id="top-source" className="w-2 h-2 !bg-slate-500 border-none opacity-0" />
      
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="w-2 h-2 !bg-slate-500 border-none opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="w-2 h-2 !bg-slate-500 border-none" />

      <Handle type="target" position={Position.Left} id="left-target" className="w-2 h-2 !bg-slate-500 border-none" />
      <Handle type="source" position={Position.Left} id="left-source" className="w-2 h-2 !bg-slate-500 border-none opacity-0" />
      
      <Handle type="target" position={Position.Right} id="right-target" className="w-2 h-2 !bg-slate-500 border-none opacity-0" />
      <Handle type="source" position={Position.Right} id="right-source" className="w-2 h-2 !bg-slate-500 border-none" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-mono text-xs font-bold">{data.index}</span>
          <span className="text-slate-200 font-bold text-xs tracking-wider uppercase">{data.label}</span>
        </div>
        
        <div className="text-right mt-1">
          <span className="text-slate-400 text-[10px] font-mono">
            {completed}/{total}
          </span>
        </div>
      </div>
    </div>
  );
}
