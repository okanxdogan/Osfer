"use client";
import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { useGlobalStore } from '@/lib/store/GlobalStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, Check, Map as MapIcon, X } from 'lucide-react';
import { 
  ReactFlow, 
  Background, 
  BackgroundVariant,
  Controls, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge, 
  NodeChange, 
  EdgeChange, 
  Connection, 
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { RoadmapNode } from '@/components/modules/roadmap/RoadmapNode';
import { AnimatedCheckbox } from '@/components/shared/AnimatedCheckbox';

const nodeTypes = {
  custom: RoadmapNode,
};

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center text-muted-foreground/50">Loading roadmaps...</div>}>
      <ReactFlowProvider>
        <RoadmapContent />
      </ReactFlowProvider>
    </Suspense>
  );
}

function RoadmapContent() {
  const { roadmaps, addRoadmap, deleteRoadmap, updateRoadmapNodes, updateRoadmapEdges } = useGlobalStore();
  const { screenToFlowPosition } = useReactFlow();
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id');
  const [activeId, setActiveId] = useState<string>(urlId || roadmaps[0]?.id || '');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showSelector, setShowSelector] = useState(false);

  // Node editing modal
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeTasks, setNodeTasks] = useState<{id: string, title: string, completed: boolean}[]>([]);
  const [newNodeTaskTitle, setNewNodeTaskTitle] = useState('');

  const activeRoadmap = roadmaps.find(r => r.id === activeId);

  // XYFlow requires local state for smooth interaction
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(activeRoadmap?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(activeRoadmap?.edges || []);

  // Sync active roadmap to local state when activeId changes
  useEffect(() => {
    if (activeRoadmap) {
      setNodes(activeRoadmap.nodes || []);
      setEdges(activeRoadmap.edges || []);
    }
  }, [activeId, setNodes, setEdges]);

  useEffect(() => {
    if (urlId && roadmaps.find(r => r.id === urlId)) {
      setActiveId(urlId);
    } else if (!activeId && roadmaps.length > 0) {
      setActiveId(roadmaps[0].id);
    }
  }, [urlId, roadmaps, activeId]);

  useEffect(() => {
    if (roadmaps.length > 0 && !roadmaps.find(r => r.id === activeId)) {
      setActiveId(roadmaps[roadmaps.length - 1].id);
    }
  }, [roadmaps, activeId]);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    addRoadmap(newTitle.trim());
    setNewTitle('');
    setShowCreateDialog(false);
  };

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      if (!activeRoadmap) return;
      // We apply changes locally to get the next state to sync to global store
      const nextNodes = applyNodeChanges(changes, nodes);
      updateRoadmapNodes(activeRoadmap.id, nextNodes as any);
    },
    [onNodesChange, nodes, activeRoadmap, updateRoadmapNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      if (!activeRoadmap) return;
      const nextEdges = applyEdgeChanges(changes, edges);
      updateRoadmapEdges(activeRoadmap.id, nextEdges as any);
    },
    [onEdgesChange, edges, activeRoadmap, updateRoadmapEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!activeRoadmap) return;
      const newEdge = { ...connection, animated: true, style: { stroke: '#475569', strokeWidth: 2 } };
      setEdges((eds) => addEdge(newEdge, eds));
      updateRoadmapEdges(activeRoadmap.id, addEdge(newEdge, edges) as any);
    },
    [setEdges, edges, activeRoadmap, updateRoadmapEdges]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      if (!activeRoadmap) return;
      const updatedEdges = edges.filter((e) => e.id !== edge.id);
      setEdges(updatedEdges);
      updateRoadmapEdges(activeRoadmap.id, updatedEdges as any);
    },
    [edges, activeRoadmap, setEdges, updateRoadmapEdges]
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      if (!activeRoadmap) return;
      
      // Get position
      let position = { x: 100, y: 100 };
      try {
        position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      } catch (e) {
        console.error("Failed to map coordinates", e);
      }
      
      const currentNodes = activeRoadmap.nodes || [];
      const newNodeId = Math.random().toString(36).substring(2, 9);
      const indexStr = nodes.length.toString().padStart(2, '0');
      const newNode = {
        id: newNodeId,
        type: 'custom',
        position,
        data: { label: 'NEW TOPIC', index: indexStr, tasks: [] }
      } as Node;
      
      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      updateRoadmapNodes(activeRoadmap.id, newNodes as any);
    },
    [activeRoadmap, screenToFlowPosition, nodes, setNodes, updateRoadmapNodes]
  );

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setEditingNodeId(node.id);
    setNodeLabel(node.data.label as string);
    setNodeTasks((node.data.tasks as { id: string; title: string; completed: boolean }[]) || []);
    setNewNodeTaskTitle('');
  };

  const saveNodeEdit = () => {
    if (!activeRoadmap || !editingNodeId) return;
    const updatedNodes = nodes.map(n => {
      if (n.id === editingNodeId) {
        return {
          ...n,
          data: { ...n.data, label: nodeLabel, tasks: nodeTasks }
        };
      }
      return n;
    });
    setNodes(updatedNodes);
    updateRoadmapNodes(activeRoadmap.id, updatedNodes as any);
    setEditingNodeId(null);
  };

  const deleteNode = () => {
    if (!activeRoadmap || !editingNodeId) return;
    const updatedNodes = nodes.filter(n => n.id !== editingNodeId);
    const updatedEdges = edges.filter(e => e.source !== editingNodeId && e.target !== editingNodeId);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    updateRoadmapNodes(activeRoadmap.id, updatedNodes as any);
    updateRoadmapEdges(activeRoadmap.id, updatedEdges as any);
    setEditingNodeId(null);
  };

  const toggleNodeTask = (taskId: string) => {
    setNodeTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };
  const deleteNodeTask = (taskId: string) => {
    setNodeTasks(prev => prev.filter(t => t.id !== taskId));
  };
  const updateNodeTaskTitle = (taskId: string, title: string) => {
    setNodeTasks(prev => prev.map(t => t.id === taskId ? { ...t, title } : t));
  };
  const handleAddNodeTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeTaskTitle.trim()) return;
    setNodeTasks(prev => [...prev, { id: Math.random().toString(36).substring(2, 9), title: newNodeTaskTitle.trim(), completed: false }]);
    setNewNodeTaskTitle('');
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10 relative">
      <PageHeader title="Roadmap" description="Build interactive learning and project dependency graphs." />

      {/* Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        {roadmaps.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/40 rounded-xl text-sm font-semibold hover:bg-card/80 transition-colors"
            >
              <motion.span whileHover={{ scale: 1.05 }} className="origin-left flex items-center gap-2">
                {activeRoadmap?.title || 'Select roadmap'} <ChevronDown size={14} className="text-muted-foreground" />
              </motion.span>
            </button>
            {showSelector && (
              <div className="absolute left-0 top-12 z-20 bg-card border border-border/50 rounded-xl shadow-xl py-1.5 min-w-[220px]">
                {roadmaps.map(r => (
                  <div key={r.id} onClick={() => { setActiveId(r.id); setShowSelector(false); }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium hover:bg-muted/30 transition-colors cursor-pointer ${r.id === activeId ? 'text-primary' : ''}`}>
                    <span className="truncate">{r.title}</span>
                    <button onClick={e => { e.stopPropagation(); deleteRoadmap(r.id); setShowSelector(false); }}
                      className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors">
          <Plus size={15} /> <motion.span whileHover={{ scale: 1.1 }}>New Roadmap</motion.span>
        </button>

        {activeRoadmap && (
          <div className="ml-auto flex items-center gap-4">
            <span className="text-xs font-semibold text-muted-foreground/60 hidden sm:inline-block">
              Click anywhere on grid to add node
            </span>
            <button onClick={() => {
                if (!activeRoadmap) return;
                const newNodeId = Math.random().toString(36).substring(2, 9);
                const indexStr = nodes.length.toString().padStart(2, '0');
                const newNode = {
                  id: newNodeId,
                  type: 'custom',
                  position: { x: 0, y: 0 },
                  data: { label: 'NEW TOPIC', index: indexStr, tasks: [] }
                } as Node;
                const newNodes = [...nodes, newNode];
                setNodes(newNodes);
                updateRoadmapNodes(activeRoadmap.id, newNodes as any);
            }} className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all">
              <Plus size={15} /> Add Node
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {roadmaps.length === 0 && (
        <GlassCard className="flex-1 min-h-[460px]">
          <div className="flex flex-col items-center justify-center text-center p-12 h-full w-full">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
              <MapIcon size={32} strokeWidth={1.5} className="text-primary" />
            </div>
            <motion.h2 whileHover={{ scale: 1.05 }} className="text-3xl font-bold mb-6 tracking-tight origin-center cursor-default">Create Your First Roadmap</motion.h2>
            <button onClick={() => setShowCreateDialog(true)} className="px-8 py-4 bg-primary text-primary-foreground text-[15px] font-bold rounded-2xl hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 mb-8">
              New Roadmap
            </button>
            <motion.p whileHover={{ scale: 1.02 }} className="text-sm text-muted-foreground/50 max-w-sm leading-relaxed font-medium mx-auto cursor-default">
              Visualize your learning paths, project steps, or any node-based dependency graph.
            </motion.p>
          </div>
        </GlassCard>
      )}

      {/* React Flow Area */}
      {activeRoadmap && (
        <div style={{ width: '100%', height: '70vh', minHeight: '500px' }} className="border border-border/40 rounded-2xl overflow-hidden relative shadow-lg">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onPaneClick={onPaneClick}
            onPaneContextMenu={onPaneClick}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
            onEdgeClick={onEdgeClick}
            fitView
            className="bg-[#0f1115]"
          >
            <Background color="rgba(255, 255, 255, 0.1)" variant={BackgroundVariant.Lines} gap={30} size={1} />
            <Controls className="!bg-[#0f172a] !border-slate-800 shadow-xl rounded-lg overflow-hidden [&_button]:!bg-[#0f172a] [&_button]:!border-slate-800 [&_button]:!fill-slate-400 hover:[&_button]:!bg-slate-800 hover:[&_button]:!fill-white" />
          </ReactFlow>
        </div>
      )}

      {/* Edit Node Modal */}
      <AnimatePresence>
        {editingNodeId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingNodeId(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-card border border-border/50 rounded-2xl p-7 max-w-sm w-full shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold">Edit Node</h3>
                <button onClick={() => setEditingNodeId(null)} className="p-1.5 hover:bg-muted/40 rounded-lg"><X size={16} /></button>
              </div>
              
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold mb-1 block">Title</label>
                  <input autoFocus type="text" value={nodeLabel} onChange={e => setNodeLabel(e.target.value)}
                    className="w-full bg-muted/20 border border-border/40 rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 text-sm font-medium" />
                </div>
                
                <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1 -mr-1">
                  <label className="text-xs text-muted-foreground font-semibold block">Tasks</label>
                  {nodeTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2 bg-muted/10 rounded-lg border border-border/40 group">
                      <AnimatedCheckbox checked={task.completed} onChange={() => toggleNodeTask(task.id)} />
                      <input 
                        type="text" 
                        value={task.title} 
                        onChange={e => updateNodeTaskTitle(task.id, e.target.value)} 
                        className={`bg-transparent border-none outline-none text-sm flex-1 font-medium transition-colors ${task.completed ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}
                      />
                      <button onClick={() => deleteNodeTask(task.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <form onSubmit={handleAddNodeTask} className="flex items-center gap-2 mt-1">
                     <input 
                       type="text"
                       placeholder="Add a new task..."
                       value={newNodeTaskTitle}
                       onChange={e => setNewNodeTaskTitle(e.target.value)}
                       className="flex-1 bg-muted/20 border border-border/40 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
                     />
                     <button type="submit" disabled={!newNodeTaskTitle.trim()} className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 transition-colors">
                       <Plus size={16} />
                     </button>
                  </form>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={deleteNode} className="px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
                  Delete
                </button>
                <button onClick={saveNodeEdit} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                  <Check size={16} /> Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreateDialog(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-card border border-border/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-2">Create a New Roadmap</h3>
              <p className="text-sm text-muted-foreground mb-6">Build a dependency graph to track learning or projects.</p>
              <input autoFocus type="text" placeholder="Roadmap name (e.g. AI Mastery)" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="w-full bg-muted/20 border border-border/40 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-sm font-medium mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setShowCreateDialog(false)} className="flex-1 py-2.5 rounded-xl border border-border/40 text-sm font-medium hover:bg-muted/20 transition-colors">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
