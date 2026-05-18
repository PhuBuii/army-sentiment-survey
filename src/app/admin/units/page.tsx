"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUnits, saveUnits } from "@/app/actions/admin-actions";
import { toast } from "react-toastify";
import { Loader2, Plus, Trash2, Building2, Save } from "lucide-react";

export default function UnitsManagementPage() {
  const [units, setUnits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newUnit, setNewUnit] = useState("");

  const fetchUnits = async () => {
    try {
      const { units } = await getUnits();
      setUnits(units || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleAddUnit = () => {
    const trimmed = newUnit.trim();
    if (!trimmed) return;
    if (units.includes(trimmed)) {
      toast.warning("Đơn vị này đã tồn tại!");
      return;
    }
    setUnits([...units, trimmed]);
    setNewUnit("");
  };

  const handleRemoveUnit = (index: number) => {
    const newUnits = [...units];
    newUnits.splice(index, 1);
    setUnits(newUnits);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveUnits(units);
    setSaving(false);
    if (res.error) {
      toast.error("Lỗi: " + res.error);
    } else {
      toast.success("Đã lưu danh sách đơn vị thành công!");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="text-blue-500 w-6 h-6" /> Quản Lý Đơn Vị
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Thiết lập danh sách các đơn vị để lựa chọn khi thêm chiến sĩ mới, đảm
          bảo tính đồng nhất dữ liệu.
        </p>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-white/8 bg-white dark:bg-[#161b22]">
        <CardHeader className="bg-slate-50/50 dark:bg-white/2 border-b border-slate-100 dark:border-white/8">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Danh sách đơn vị hiện có
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập tên đơn vị mới (VD: Đại đội 1)..."
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddUnit()}
              className="flex-1 h-10 rounded-xl"
            />
            <Button
              onClick={handleAddUnit}
              className="h-10 rounded-xl gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4" /> Thêm
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
              {units.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Chưa có đơn vị nào. Hãy thêm đơn vị đầu tiên!
                </div>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-white/10 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {units.map((unit, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 px-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="font-medium text-sm text-slate-700 dark:text-slate-200">
                        {unit}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveUnit(index)}
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="h-10 rounded-xl gap-1.5 min-w-32 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
