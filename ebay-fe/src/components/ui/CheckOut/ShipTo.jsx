"use client";

import React, { useEffect, useState } from "react";
import {
  createAddress,
  deleteAddress,
  updateAddress,
} from "@/services/addressService";
import {
  getGHNProvinces,
  getGHNDistricts,
  getGHNWards,
} from "@/services/shippingService";
import AlertModal from "@/components/shared/AlertModal";
import useModal from "../../../../hooks/useModal";


const ShipTo = ({
  addresses = [],
  selectedAddressId,
  setSelectedAddressId,
  onAddressChange,
}) => {
  const { isOpen, modalContent, showModal, hideModal, handleConfirm } =
    useModal();

  const [isAdding, setIsAdding] = useState(false);

  // ===== GHN DATA =====
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // ===== FORM =====
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    address: "",
    provinceId: null,
    districtId: null,
    wardCode: null,
    country: "Vietnam",
    isDefault: false,
  });

  const getProvinceName = (id) =>
    provinces?.find(p => p.ProvinceID === id)?.ProvinceName || id;

  const getDistrictName = (id) =>
    districts?.find(d => d.DistrictID === id)?.DistrictName || id;

  const getWardName = (code) =>
    wards?.find(w => w.WardCode === code)?.WardName || code;

  // ===== LOAD PROVINCES =====
  useEffect(() => {
    (async () => {
      try {
        const data = await getGHNProvinces();
        setProvinces(data || []);
      } catch (err) {
        console.error("Load GHN provinces failed:", err);
      }
    })();
  }, []);

  // ===== HANDLERS =====
  const handleProvinceChange = async (provinceId) => {
    setFormData({
      ...formData,
      provinceId,
      districtId: null,
      wardCode: null,
    });
    setDistricts([]);
    setWards([]);

    if (!provinceId) return;

    try {
      const data = await getGHNDistricts(provinceId);
      setDistricts(data || []);
    } catch (err) {
      console.error("Load GHN districts failed:", err);
    }
  };

  const handleDistrictChange = async (districtId) => {
    setFormData({
      ...formData,
      districtId,
      wardCode: null,
    });
    setWards([]);

    if (!districtId) return;

    try {
      const data = await getGHNWards(districtId);
      setWards(data || []);
    } catch (err) {
      console.error("Load GHN wards failed:", err);
    }
  };

  const handleAdd = () => {
    setFormData({
      fullname: "",
      phone: "",
      address: "",
      provinceId: null,
      districtId: null,
      wardCode: null,
      country: "Vietnam",
      isDefault: false,
    });
    setDistricts([]);
    setWards([]);
    setIsAdding(true);
  };

  useEffect(() => {
    if (addresses.length === 0) {
      setIsAdding(true);
    } else {
      setIsAdding(false);
    }
  }, [addresses]);

  const handleSelect = (id) => {
    setSelectedAddressId(id);
  };

  const handleEdit = async (id) => {
    const addr = addresses.find((a) => a._id === id);
    if (!addr) return;

    setFormData({
      _id: addr._id,
      fullname: addr.fullname,
      phone: addr.phone,
      address: addr.address,
      provinceId: addr.provinceId,
      districtId: addr.districtId,
      wardCode: addr.wardCode,
      country: addr.country || "Vietnam",
      isDefault: !!addr.isDefault,
    });

    setIsAdding(true);

    if (addr.provinceId) {
      const d = await getGHNDistricts(addr.provinceId);
      setDistricts(d || []);
    }

    if (addr.districtId) {
      const w = await getGHNWards(addr.districtId);
      setWards(w || []);
    }
  };

  const handleDelete = async (id) => {
    showModal({
      title: "Delete Address",
      message: "Are you sure you want to delete this address?",
      type: "confirm",
      onConfirm: async () => {
        await deleteAddress(id);
        if (selectedAddressId === id) setSelectedAddressId(null);
        onAddressChange?.();
      },
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.provinceId || !formData.districtId || !formData.wardCode) {
      showModal({
        title: "Missing information",
        message: "Please select province, district and ward.",
        type: "warning",
      });
      return;
    }

    try {
      let savedAddress;

      if (formData._id) {
        const res = await updateAddress(formData._id, formData);
        savedAddress = res;
      } else {
        savedAddress = await createAddress(formData);
      }

      // 🔥 QUAN TRỌNG
      setSelectedAddressId(savedAddress._id);

      // ❌ KHÔNG để checkout preview chạy trước khi address tồn tại
      onAddressChange?.(savedAddress._id);

      setIsAdding(false);
    } catch (err) {
      console.error("Save address error:", err);
      showModal({
        title: "Error",
        message: "Failed to save address.",
        type: "error",
      });
    }
  };

  // ===== UI =====
  return (
    <>
      <AlertModal
        open={isOpen}
        onClose={hideModal}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
        onConfirm={handleConfirm}
      />

      <section className="border-t border-gray-200 pt-6">
        <h2 className="text-[20px] font-semibold mb-4">Ship to</h2>

        {isAdding ? (
          <form
            onSubmit={handleSave}
            className="border border-gray-300 rounded-lg p-5 space-y-4"
          >
            <input
              required
              placeholder="Full name"
              value={formData.fullname}
              onChange={(e) =>
                setFormData({ ...formData, fullname: e.target.value })
              }
              className="border rounded-md px-3 py-2 w-full"
            />

            <input
              required
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="border rounded-md px-3 py-2 w-full"
            />

            <input
              required
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="border rounded-md px-3 py-2 w-full"
            />

            <select
              value={formData.provinceId ?? ""}
              onChange={(e) =>
                handleProvinceChange(Number(e.target.value))
              }
              className="border rounded-md px-3 py-2 w-full"
            >
              <option value="">Select province</option>
              {provinces.map((p) => (
                <option key={p.ProvinceID} value={p.ProvinceID}>
                  {p.ProvinceName}
                </option>
              ))}
            </select>

            <select
              value={formData.districtId ?? ""}
              onChange={(e) =>
                handleDistrictChange(Number(e.target.value))
              }
              disabled={!districts.length}
              className="border rounded-md px-3 py-2 w-full"
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID}>
                  {d.DistrictName}
                </option>
              ))}
            </select>

            <select
              value={formData.wardCode ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, wardCode: e.target.value })
              }
              disabled={!wards.length}
              className="border rounded-md px-3 py-2 w-full"
            >
              <option value="">Select ward</option>
              {wards.map((w) => (
                <option key={w.WardCode} value={w.WardCode}>
                  {w.WardName}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#3665f3] text-white rounded-full"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <>
            {addresses.map((a) => (
              <div
                key={a._id}
                className={`border p-4 rounded-lg mb-3 ${selectedAddressId === a._id ? "bg-blue-50" : ""
                  }`}
              >
                <p className="font-medium">{a.fullname}</p>
                <p>
                  {a.address},{" "}
                  {getWardName(a.wardCode)},{" "}
                  {getDistrictName(a.districtId)},{" "}
                  {getProvinceName(a.provinceId)}
                </p>
                <p>{a.phone}</p>
                <div className="text-sm flex gap-4 mt-2">
                  <button onClick={() => handleSelect(a._id)}>Select</button>
                  <button onClick={() => handleEdit(a._id)}>Edit</button>
                  <button onClick={() => handleDelete(a._id)}>Delete</button>
                </div>
              </div>
            ))}

            <button
              onClick={handleAdd}
              className="mt-4 px-4 py-2 border rounded-full"
            >
              Add new address
            </button>
          </>
        )}
      </section>
    </>
  );
};

export default ShipTo;
