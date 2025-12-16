"use client";
import React, { useState, useEffect } from "react";
import {
  createAddress,
  deleteAddress,
  updateAddress,
} from "@/services/addressService";
import AlertModal from "@/components/shared/AlertModal";
import useModal from "../../../../hooks/useModal";

const ShipTo = ({
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  onAddressChange,
}) => {
  const { isOpen, modalContent, showModal, hideModal, handleConfirm } =
    useModal();

  const [isAdding, setIsAdding] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "Vietnam",
    isDefault: false,
    latitude: undefined,
    longitude: undefined,
    province: null,
    district: null,
    ward: null,
  });

  // Load provinces on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
        const data = await res.json();
        if (!cancelled)
          setProvinces(
            (data || []).map((p) => ({ code: p.code, name: p.name }))
          );
      } catch (e) {
        console.error("Failed to load provinces:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // When editing (isAdding true) and formData has province/district, hydrate dependent lists
  useEffect(() => {
    let cancelled = false;
    async function hydrateAdminLists() {
      if (!isAdding) return;
      try {
        const provinceCode = formData?.province?.code;
        if (provinceCode) {
          const r = await fetch(
            `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
          );
          const pdata = await r.json();
          if (cancelled) return;
          const ds = (pdata.districts || []).map((d) => ({
            code: d.code,
            name: d.name,
          }));
          setDistricts(ds);
        }
        const districtCode = formData?.district?.code;
        if (districtCode) {
          const r2 = await fetch(
            `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
          );
          const ddata = await r2.json();
          if (cancelled) return;
          const ws = (ddata.wards || []).map((w) => ({
            code: w.code,
            name: w.name,
          }));
          setWards(ws);
        }
      } catch (e) {
        console.error("Failed to hydrate admin lists:", e);
      }
    }
    hydrateAdminLists();
    return () => {
      cancelled = true;
    };
  }, [isAdding, formData?.province?.code, formData?.district?.code]);

  const handleProvinceChange = async (provCode) => {
    const prov = provinces.find((p) => String(p.code) === String(provCode));
    setFormData({
      ...formData,
      province: prov ? { code: prov.code, name: prov.name } : null,
      district: null,
      ward: null,
    });
    setDistricts([]);
    setWards([]);
    if (!prov) return;
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${prov.code}?depth=2`
      );
      const data = await res.json();
      const ds = (data.districts || []).map((d) => ({
        code: d.code,
        name: d.name,
      }));
      setDistricts(ds);
    } catch (e) {
      console.error("Failed to load districts:", e);
    }
  };

  const handleDistrictChange = async (distCode) => {
    const dist = districts.find((d) => String(d.code) === String(distCode));
    setFormData({
      ...formData,
      district: dist ? { code: dist.code, name: dist.name } : null,
      ward: null,
    });
    setWards([]);
    if (!dist) return;
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${dist.code}?depth=2`
      );
      const data = await res.json();
      const ws = (data.wards || []).map((w) => ({
        code: w.code,
        name: w.name,
      }));
      setWards(ws);
    } catch (e) {
      console.error("Failed to load wards:", e);
    }
  };

  // Helper function to remove Vietnamese diacritics for better matching
  const removeDiacritics = (str) => {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replaceAll("đ", "d")
      .replaceAll("Đ", "D");
  };

  // Ward selected -> forward geocode to get lat/lon and optional street suggestion
  const handleWardChange = async (wardCode) => {
    const ward = wards.find((w) => String(w.code) === String(wardCode));
    setFormData({
      ...formData,
      ward: ward ? { code: ward.code, name: ward.name } : null,
    });
    if (!ward) return;
    const provCode = formData.province?.code;
    const distCode = formData.district?.code;
    const provName =
      provinces.find((p) => String(p.code) === String(provCode))?.name ||
      formData.province?.name ||
      "";
    const distName =
      districts.find((d) => String(d.code) === String(distCode))?.name ||
      formData.district?.name ||
      "";

    // Try multiple query strategies with various formats
    const queries = [
      // Full address with Vietnam
      `${ward.name}, ${distName}, ${provName}, Vietnam`,
      `${ward.name}, ${distName}, ${provName}`,
      // Without ward name
      `${distName}, ${provName}, Vietnam`,
      `${distName}, ${provName}`,
      // With province only
      `${ward.name}, ${provName}, Vietnam`,
      `${provName}, Vietnam`,
      // Try with district center
      `${distName} district, ${provName}, Vietnam`,
      // Try without commas
      `${ward.name} ${distName} ${provName} Vietnam`,
      // Try with normalized names (no diacritics)
      `${removeDiacritics(ward.name)}, ${removeDiacritics(
        distName
      )}, ${removeDiacritics(provName)}, Vietnam`,
    ];

    try {
      showModal({
        title: "Geocoding",
        message: "Resolving coordinates...",
        type: "info",
      });

      let results = null;
      let usedQuery = "";

      // Try each query until we find results
      for (const query of queries) {
        try {
          // Add delay to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 200));

          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=3&q=${encodeURIComponent(
              query
            )}`,
            {
              headers: {
                "Accept-Language": "vi-VN,vi;q=0.9,en-US,en;q=0.8",
                "User-Agent": "Mozilla/5.0",
              },
            }
          );
          const data = await res.json();
          if (data && data.length > 0) {
            // Prefer results that contain ward or district name
            const bestMatch =
              data.find((r) => {
                const display = (r.display_name || "").toLowerCase();
                const wardLower = ward.name.toLowerCase();
                const distLower = distName.toLowerCase();
                return (
                  display.includes(wardLower) || display.includes(distLower)
                );
              }) || data[0];

            results = [bestMatch];
            usedQuery = query;
            break;
          }
        } catch (e) {
          console.warn(`Geocoding query failed for: ${query}`, e);
          continue;
        }
      }

      if (results && results.length > 0) {
        const r = results[0];
        const lat = Number.parseFloat(r.lat);
        const lon = Number.parseFloat(r.lon);
        const streetFromResult = r.display_name
          ? String(r.display_name).split(",")[0]
          : "";
        setFormData((fd) => ({
          ...fd,
          latitude: Math.round(lat * 10000) / 10000,
          longitude: Math.round(lon * 10000) / 10000,
          street: fd.street || streetFromResult,
        }));
        showModal({
          title: "Success",
          message: `Coordinates set from selection.\nLat: ${lat.toFixed(
            4
          )}\nLon: ${lon.toFixed(4)}\n\nFound: ${r.display_name || usedQuery}`,
          type: "success",
        });
      } else {
        // If not found, try to get approximate coordinates from district center
        try {
          const distRes = await fetch(
            `https://provinces.open-api.vn/api/d/${distCode}?depth=2`
          );
          const distData = await distRes.json();

          // Try geocoding with district center
          if (distData && distData.name) {
            const distQuery = `${distData.name}, ${provName}, Vietnam`;
            const distGeoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
                distQuery
              )}`,
              { headers: { "Accept-Language": "vi-VN,vi;q=0.9" } }
            );
            const distGeoData = await distGeoRes.json();

            if (distGeoData && distGeoData.length > 0) {
              const r = distGeoData[0];
              const lat = parseFloat(r.lat);
              const lon = parseFloat(r.lon);
              setFormData((fd) => ({
                ...fd,
                latitude: Math.round(lat * 10000) / 10000,
                longitude: Math.round(lon * 10000) / 10000,
              }));
              showModal({
                title: "Approximate Coordinates",
                message: `Using district center coordinates.\nLat: ${lat.toFixed(
                  4
                )}\nLon: ${lon.toFixed(
                  4
                )}\n\nNote: These are approximate coordinates. You can manually adjust if needed.`,
                type: "success",
              });
              return;
            }
          }
        } catch (fallbackError) {
          console.error("Fallback geocoding error:", fallbackError);
        }

        // Final fallback: show warning but allow manual entry
        showModal({
          title: "Coordinates Not Found",
          message: `Could not automatically determine coordinates for "${ward.name}, ${distName}, ${provName}".\n\nYou can manually enter latitude and longitude in the fields below.\n\nSuggested: Search on Google Maps and copy coordinates.`,
          type: "warning",
        });
      }
    } catch (e) {
      console.error("Geocoding error:", e);
      showModal({
        title: "Error",
        message: `Failed to resolve coordinates. You can manually enter latitude and longitude in the fields below.`,
        type: "error",
      });
    }
  };

  const handleAdd = () => {
    setFormData({
      fullname: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      country: "Vietnam",
      isDefault: false,
      latitude: undefined,
      longitude: undefined,
      province: null,
      district: null,
      ward: null,
    });
    setIsAdding(true);
  };

  const handleSelect = (id) => {
    setSelectedAddressId(id);
  };

  const handleEdit = (id) => {
    const addr = addresses.find((a) => a._id === id);
    if (!addr) return;
    const fd = {
      _id: addr._id,
      fullname: addr.fullname || addr.name || "",
      phone: addr.phone || "",
      street: addr.street || addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      country: addr.country || "Vietnam",
      isDefault: !!addr.isDefault,
      latitude:
        addr.latitude ??
        addr.lat ??
        (addr.coords && addr.coords.lat) ??
        undefined,
      longitude:
        addr.longitude ??
        addr.lng ??
        (addr.coords && addr.coords.lon) ??
        undefined,
      // Handle province/district/ward from backend (object with code and name)
      province:
        addr.province && addr.province.code
          ? { code: addr.province.code, name: addr.province.name || "" }
          : null,
      district:
        addr.district && addr.district.code
          ? { code: addr.district.code, name: addr.district.name || "" }
          : null,
      ward:
        addr.ward && addr.ward.code
          ? { code: addr.ward.code, name: addr.ward.name || "" }
          : null,
    };
    setFormData(fd);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    showModal({
      title: "Delete Address",
      message: "Are you sure you want to delete this address?",
      type: "confirm",
      onConfirm: async () => {
        try {
          await deleteAddress(id);
          showModal({
            title: "Success",
            message: "Address deleted successfully!",
            type: "success",
          });
          onAddressChange();
          if (selectedAddressId === id) setSelectedAddressId(null);
        } catch (error) {
          console.error("Error deleting address:", error);
          showModal({
            title: "Error",
            message: "Failed to delete address.",
            type: "error",
          });
        }
      },
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await updateAddress(formData._id, formData);
        showModal({
          title: "Success",
          message: "Address updated successfully!",
          type: "success",
        });
      } else {
        await createAddress(formData);
        showModal({
          title: "Success",
          message: "Address added successfully!",
          type: "success",
        });
      }
      onAddressChange();
      setIsAdding(false);
      if (formData.isDefault) setFormData({});
    } catch (error) {
      console.error("Error saving address:", error);
      showModal({
        title: "Error",
        message: `Failed to save address: ${error.message}`,
        type: "error",
      });
    }
  };

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
            className="border border-gray-300 rounded-lg p-5 mb-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Full name
              </label>
              <input
                required
                type="text"
                value={formData.fullname}
                onChange={(e) =>
                  setFormData({ ...formData, fullname: e.target.value })
                }
                className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:ring-2 focus:ring-[#3665f3]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Street Address
              </label>
              <input
                required
                type="text"
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
                className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:ring-2 focus:ring-[#3665f3]"
              />
            </div>

            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <div className="text-sm text-gray-600">
                  Please select Province → District → Ward
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Province / Tỉnh
                  </label>
                  <select
                    value={formData.province?.code ?? ""}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                  >
                    <option value="">Select province</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    District / Quận/Huyện
                  </label>
                  <select
                    value={formData.district?.code ?? ""}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                    disabled={!districts.length}
                  >
                    <option value="">Select district</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ward / Phường/Xã
                  </label>
                  <select
                    value={formData.ward?.code ?? ""}
                    onChange={(e) => handleWardChange(e.target.value)}
                    className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                    disabled={!wards.length}
                  >
                    <option value="">Select ward</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Latitude (optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitude: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:ring-2 focus:ring-[#3665f3]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Longitude (optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitude: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:ring-2 focus:ring-[#3665f3]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:ring-2 focus:ring-[#3665f3]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  required
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:ring-2 focus:ring-[#3665f3]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
                className="w-4 h-4 accent-[#3665f3]"
              />
              <label htmlFor="isDefault" className="text-sm font-medium">
                Set as default shipping address
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-5 py-2 border border-[#3665f3] rounded-full text-[#3665f3] text-sm font-medium hover:bg-blue-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#3665f3] rounded-full text-white text-sm font-medium hover:bg-[#2953c6]"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-6">
              {addresses.length === 0 ? (
                <p className="text-gray-500 italic">
                  No shipping addresses found. Please add one.
                </p>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`border border-gray-300 rounded-lg p-5 ${
                      selectedAddressId === addr._id ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <div className="flex gap-2 mb-2">
                      {selectedAddressId === addr._id && (
                        <span className="text-xs px-3 py-0.5 bg-[#3665f3] text-white rounded-full font-semibold">
                          SELECTED
                        </span>
                      )}
                      {addr.isDefault && (
                        <span className="text-xs px-3 py-0.5 bg-gray-200 text-gray-800 rounded-full font-semibold">
                          PRIMARY ADDRESS
                        </span>
                      )}
                    </div>
                    <p className="font-medium">{addr.fullname}</p>
                    <p>{addr.street}</p>
                    <p>
                      {addr.city} {addr.state && `, ${addr.state}`}
                    </p>
                    <p>{addr.country}</p>
                    <p>{addr.phone}</p>
                    <div className="flex gap-2 mt-2 text-sm">
                      {selectedAddressId !== addr._id && (
                        <button
                          onClick={() => handleSelect(addr._id)}
                          className="text-[#3665f3] hover:underline"
                        >
                          Select
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(addr._id)}
                        className="text-[#3665f3] hover:underline"
                      >
                        Edit
                      </button>
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleDelete(addr._id)}
                          className="text-[#d93025] hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAdd}
                className="px-5 py-2 border border-[#3665f3] rounded-full text-[#3665f3] text-sm font-medium hover:bg-blue-50"
              >
                Add a new address
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-5 py-2 border border-[#3665f3] rounded-full text-[#3665f3] text-sm font-medium hover:bg-blue-50"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default ShipTo;
