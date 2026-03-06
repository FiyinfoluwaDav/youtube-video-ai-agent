import dagre from 'dagre'
import { Maximize2 } from 'lucide-react'
import React, { useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  Panel,
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
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
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

    // Add some styling defaults
    const styledNodes = layoutedNodes.map((n, i) => ({
      ...n,
      style: {
        background: i === 0 ? '#8b5cf6' : '#fff', // Purple for root, white for branches
        color: i === 0 ? '#fff' : '#1e293b',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '10px 15px',
        fontSize: '14px',
        fontWeight: i === 0 ? 'bold' : 'normal',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        width: 150,
      },
      className:
        'transition-all hover:shadow-lg dark:bg-slate-800 dark:text-gray-100 dark:border-slate-700',
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
