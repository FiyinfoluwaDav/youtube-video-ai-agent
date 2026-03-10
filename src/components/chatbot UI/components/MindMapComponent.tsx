import dagre from 'dagre'
import { ChevronDown, ChevronUp, Maximize2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Handle,
  Node,
  NodeProps,
  Panel,
  Position,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import 'reactflow/dist/style.css'

const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeWidth = 172
const nodeHeight = 36

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'LR',
) => {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

const CustomMindMapNode = ({
  data,
  targetPosition,
  sourcePosition,
}: NodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isRoot = data.isRoot

  return (
    <div
      className={`relative px-4 flex items-center h-[36px] w-[172px] cursor-pointer rounded-lg border shadow-sm transition-all hover:shadow-md ${
        isRoot
          ? 'bg-purple-500 border-purple-500 text-white'
          : 'bg-white border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100'
      }`}
      onClick={(e) => {
        e.stopPropagation()
        setIsExpanded(!isExpanded)
      }}
    >
      <Handle
        type="target"
        position={targetPosition as Position}
        className="bg-slate-400! border-none! w-2! h-2!"
      />
      <div className="flex items-center justify-between w-full gap-2">
        <span
          className={`text-[13px] font-medium leading-tight truncate ${isRoot ? 'font-bold' : ''}`}
        >
          {data.label}
        </span>
        {data.description &&
          (isExpanded ? (
            <ChevronUp className="w-4 h-4 shrink-0 opacity-80" />
          ) : (
            <ChevronDown className="w-4 h-4 shrink-0 opacity-80" />
          ))}
      </div>

      {isExpanded && data.description && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 text-xs text-slate-700 dark:text-slate-300 text-left min-w-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          {data.description}
        </div>
      )}
      <Handle
        type="source"
        position={sourcePosition as Position}
        className="bg-slate-400! border-none! w-2! h-2!"
      />
    </div>
  )
}

const nodeTypes = {
  custom: CustomMindMapNode,
}

interface MindMapProps {
  initialNodes: Node[]
  initialEdges: Edge[]
  onClose?: () => void
  onNodeClick?: (event: React.MouseEvent, node: Node) => void
}

const MindMapComponent: React.FC<MindMapProps> = ({
  initialNodes,
  initialEdges,
  onClose,
  onNodeClick,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      'LR', // Left to Right layout
    )

    const styledNodes = layoutedNodes.map((n, i) => ({
      ...n,
      type: 'custom',
      data: {
        ...n.data,
        isRoot: i === 0,
      },
    }))

    const styledEdges = layoutedEdges.map((e) => ({
      ...e,
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    }))

    setNodes(styledNodes)
    setEdges(styledEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-[#0a0a0a] rounded-xl overflow-hidden relative border border-gray-200 dark:border-white/10 shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.1}
      >
        <Background gap={16} size={1} color="#cbd5e1" />
        <Controls
          showInteractive={false}
          className="dark:bg-slate-800 dark:border-slate-700 dark:fill-white"
        />

        {onClose && (
          <Panel position="top-right">
            <button
              onClick={onClose}
              className="p-2 bg-white dark:bg-slate-800 shadow-md rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}

export default MindMapComponent
