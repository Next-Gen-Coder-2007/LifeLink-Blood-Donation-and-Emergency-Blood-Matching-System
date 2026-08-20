import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { BloodMatrixGrid } from "@/components/hospital/BloodMatrixGrid";

interface BloodStock {
  blood_group: string;
  units: number;
}

export function HospitalBloodBank() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [hospitalId, setHospitalId] = useState("");
  const [stock, setStock] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [updatingGroup, setUpdatingGroup] = useState<string | null>(null);

  useEffect(() => {
    if (!session || session.user.role !== "hospital") {
      navigate("/login");
      return;
    }

    const loadInventory = async () => {
      try {
        const hospitals = await api.get<{ id: string; user_id: string }[]>("/hospitals");
        const current = hospitals.find((h) => String(h.user_id) === String(session.user.id));
        if (current) {
          setHospitalId(current.id);
          const res = await api.get<BloodStock[]>(`/hospitals/${current.id}/blood-bank`);
          const map: Record<string, number> = {};
          res.forEach((item) => {
            map[item.blood_group] = item.units;
          });
          setStock(map);
        }
      } catch {
        showToast("Failed to load inventory", "error");
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [session, navigate]);

  const updateUnits = async (group: string, newCount: number) => {
    if (newCount < 0 || !hospitalId) return;
    setUpdatingGroup(group);
    try {
      await api.put(`/hospitals/${hospitalId}/blood-bank`, {
        blood_group: group,
        units: newCount,
      });
      setStock((prev) => ({ ...prev, [group]: newCount }));
      showToast(`${group} updated to ${newCount} units`);
    } catch {
      showToast(`Failed to update ${group}`, "error");
    } finally {
      setUpdatingGroup(null);
    }
  };

  const totalUnits = Object.values(stock).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/hospital/dashboard"
        title="Hospital Blood Bank Stock"
        description="Live 8-group refrigeration matrix with real-time syncing"
        action={
          <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
            Total Inventory: {totalUnits} Units
          </span>
        }
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Refrigeration Stock Inventory</CardTitle>
            <CardDescription>Adjust available blood units in stock</CardDescription>
          </div>
        </CardHeader>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Loading stock data...</div>
        ) : (
          <div className="pt-4">
            <BloodMatrixGrid
              stock={stock}
              onUpdate={updateUnits}
              updatingGroup={updatingGroup}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
