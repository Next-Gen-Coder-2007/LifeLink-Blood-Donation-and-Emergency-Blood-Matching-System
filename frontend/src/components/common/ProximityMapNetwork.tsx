import { useState } from "react";
import { Building2, Droplet, Zap } from "lucide-react";

interface NodePoint {
  id: string;
  type: "hospital" | "donor";
  name: string;
  group?: string;
  x: number; // Percentage 0 - 100
  y: number; // Percentage 0 - 100
  status?: string;
  urgent?: boolean;
}

const NODES: NodePoint[] = [
  { id: "h1", type: "hospital", name: "Metro General Hospital", x: 48, y: 46, status: "Critical Emergency (O-)", urgent: true },
  { id: "h2", type: "hospital", name: "St. Jude Trauma Center", x: 75, y: 28, status: "Urgent Need (A+)", urgent: false },
  { id: "h3", type: "hospital", name: "City Children's Hospital", x: 22, y: 72, status: "Inventory Normal", urgent: false },
  { id: "d1", type: "donor", name: "Active Donor (John)", group: "O-", x: 42, y: 38, status: "Available • 2.4 km away" },
  { id: "d2", type: "donor", name: "Active Donor (Sarah)", group: "A+", x: 62, y: 52, status: "Available • 3.8 km away" },
  { id: "d3", type: "donor", name: "Active Donor (Alex)", group: "O+", x: 80, y: 40, status: "Available • 1.9 km away" },
  { id: "d4", type: "donor", name: "Active Donor (Elena)", group: "AB+", x: 30, y: 58, status: "Available • 4.1 km away" },
  { id: "d5", type: "donor", name: "Active Donor (Marcus)", group: "B+", x: 18, y: 35, status: "Available • 5.3 km away" },
];

export function ProximityMapNetwork() {
  const [selectedNode, setSelectedNode] = useState<NodePoint>(NODES[0]);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-0.5 text-xs font-semibold text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            Live Geospatial Dispatch Radar
          </div>
          <h3 className="mt-2 text-xl font-bold text-slate-900 tracking-tight">Real-Time Hospital & Donor Mesh Network</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic Haversine proximity computation connecting emergency broadcasts to volunteer donors in real time.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-600 shadow-2xs" />
            <span className="text-slate-700">Hospitals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500 shadow-2xs" />
            <span className="text-slate-700">Donors</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative h-80 sm:h-96 w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shadow-inner">
        {/* Radar grid backdrop */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, #475569 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Concentric radar rings */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full border border-red-500/20 animate-ping duration-1000" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full border border-blue-500/30" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full border border-slate-700/40" />

        {/* SVG Network Arcs */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          {/* Connecting lines from Metro General (x:48, y:46) to nearby donors */}
          <line x1="48%" y1="46%" x2="42%" y2="38%" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
          <line x1="48%" y1="46%" x2="62%" y2="52%" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <line x1="48%" y1="46%" x2="30%" y2="58%" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
          <line x1="75%" y1="28%" x2="80%" y2="40%" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
          <line x1="22%" y1="72%" x2="18%" y2="35%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        </svg>

        {/* Render Node Pins */}
        {NODES.map((node) => {
          const isSelected = selectedNode.id === node.id;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedNode(node)}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none transition-transform hover:scale-125 z-10"
              title={node.name}
            >
              {node.type === "hospital" ? (
                <div className="relative">
                  {node.urgent && (
                    <span className="absolute -inset-1.5 rounded-full bg-red-500 opacity-75 animate-ping" />
                  )}
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white shadow-lg ${
                    isSelected ? "bg-amber-400 ring-4 ring-amber-400/40" : "bg-blue-600"
                  }`}>
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-extrabold text-white text-[11px] shadow-lg ${
                    isSelected ? "bg-amber-400 ring-4 ring-amber-400/40" : "bg-red-500"
                  }`}>
                    {node.group}
                  </div>
                </div>
              )}
            </button>
          );
        })}

        {/* Floating Telemetry Box */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs rounded-xl bg-slate-900/90 backdrop-blur-md p-3 border border-slate-800 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedNode.type === "hospital" ? (
                <Building2 className="h-4 w-4 text-blue-400" />
              ) : (
                <Droplet className="h-4 w-4 text-red-400" />
              )}
              <p className="text-xs font-bold truncate">{selectedNode.name}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              selectedNode.type === "hospital" ? "bg-blue-500/20 text-blue-300" : "bg-red-500/20 text-red-300"
            }`}>
              {selectedNode.type === "hospital" ? "Hospital Node" : `Donor (${selectedNode.group})`}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" />
            {selectedNode.status}
          </p>
        </div>
      </div>

      {/* Telemetry Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70">
          <p className="text-[11px] font-semibold text-slate-500">Haversine Accuracy</p>
          <p className="text-base font-bold text-slate-900 mt-0.5">± 15 meters</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70">
          <p className="text-[11px] font-semibold text-slate-500">Avg. Response Radius</p>
          <p className="text-base font-bold text-red-600 mt-0.5">3.2 km</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70">
          <p className="text-[11px] font-semibold text-slate-500">Dispatch Latency</p>
          <p className="text-base font-bold text-emerald-600 mt-0.5">&lt; 250 ms</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70">
          <p className="text-[11px] font-semibold text-slate-500">Coordinate Schema</p>
          <p className="text-base font-bold text-blue-600 mt-0.5">WGS84 EPSG:4326</p>
        </div>
      </div>
    </div>
  );
}
