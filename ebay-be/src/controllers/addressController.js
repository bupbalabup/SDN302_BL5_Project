import Address from "../models/Address.js";

/**
 * GET /api/addresses
 */
export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.find({ userId });
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
    const addresses = await Address.find({ userId });
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
      street,
      city,
      state,
      country,
      isDefault,
      latitude,
      longitude,
      province,
      district,
      ward,
    } = req.body;

    // Nếu isDefault = true => đặt tất cả địa chỉ khác của user là false
    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const address = await Address.create({
      userId,
      fullname,
      phone,
      street,
      city,
      state,
      country,
      latitude,
      longitude,
      isDefault: !!isDefault,
      province:
        province && province.code
          ? { code: province.code, name: province.name || "" }
          : undefined,
      district:
        district && district.code
          ? { code: district.code, name: district.name || "" }
          : undefined,
      ward:
        ward && ward.code
          ? { code: ward.code, name: ward.name || "" }
          : undefined,
    });

    return res.status(201).json({ success: true, address });
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
      street,
      city,
      state,
      country,
      isDefault,
      latitude,
      longitude,
      province,
      district,
      ward,
    } = req.body;

    const address = await Address.findOne({ _id: id, userId });
    if (!address)
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });

    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
      address.isDefault = true;
    }

    if (fullname !== undefined) address.fullname = fullname;
    if (phone !== undefined) address.phone = phone;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (country !== undefined) address.country = country;
    if (latitude !== undefined) address.latitude = latitude;
    if (longitude !== undefined) address.longitude = longitude;

    // Update province/district/ward
    if (province !== undefined) {
      address.province =
        province && province.code
          ? { code: province.code, name: province.name || "" }
          : undefined;
    }
    if (district !== undefined) {
      address.district =
        district && district.code
          ? { code: district.code, name: district.name || "" }
          : undefined;
    }
    if (ward !== undefined) {
      address.ward =
        ward && ward.code
          ? { code: ward.code, name: ward.name || "" }
          : undefined;
    }

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
