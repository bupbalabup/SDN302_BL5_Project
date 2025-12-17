import Address from "../models/Address.js";

/**
 * GET /api/addresses
 */
export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.find({ userId })
  .sort({ isDefault: -1, createdAt: -1 });
    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("Get addresses error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/addresses/user/:userId
 * Public: get addresses of any user (used to fetch seller addresses)
 */
export const getAddressesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "userId required" });
    const addresses = await Address.find({ userId })
  .sort({ isDefault: -1, createdAt: -1 });
    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("Get addresses by user error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/addresses
 */
export const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      fullname,
      phone,
      address,
      country,
      isDefault,
      provinceId,
      districtId,
      wardCode,
    } = req.body;

    if (!fullname || !phone || !address) {
      return res.status(400).json({
        message: "Missing required address fields",
      });
    }

    if (!provinceId || !districtId || !wardCode) {
      return res.status(400).json({
        message: "Missing location fields",
      });
    }

    if (isDefault) {
      await Address.updateMany(
        { userId },
        { $set: { isDefault: false } }
      );
    }

    const newAddress = await Address.create({
      userId,
      fullname,
      phone,
      address,
      country,
      isDefault: !!isDefault,
      provinceId,
      districtId,
      wardCode,
    });

    return res.status(201).json({
      success: true,
      address: newAddress,
    });
  } catch (error) {
    console.error("Create address error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/addresses/:id
 */
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const {
      fullname,
      phone,
      address: detailAddress,
      country,
      isDefault,
      provinceId,
      districtId,
      wardCode,
    } = req.body;

    const address = await Address.findOne({ _id: id, userId });
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    if (isDefault) {
      await Address.updateMany(
        { userId },
        { $set: { isDefault: false } }
      );
      address.isDefault = true;
    }

    if (fullname !== undefined) address.fullname = fullname;
    if (phone !== undefined) address.phone = phone;
    if (detailAddress !== undefined) address.address = detailAddress;
    if (country !== undefined) address.country = country;
    if (provinceId !== undefined) address.provinceId = provinceId;
    if (districtId !== undefined) address.districtId = districtId;
    if (wardCode !== undefined) address.wardCode = wardCode;

    await address.save();

    return res.status(200).json({ success: true, address });
  } catch (error) {
    console.error("Update address error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/addresses/:id
 */
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await Address.findOneAndDelete({ _id: id, userId });
    if (!address)
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });

    return res.status(200).json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error("Delete address error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
