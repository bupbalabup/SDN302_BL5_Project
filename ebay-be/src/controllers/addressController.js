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
 * POST /api/addresses
 */
export const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullname, phone, street, city, state, country, isDefault } =
      req.body;

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
      isDefault: !!isDefault,
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
    const { fullname, phone, street, city, state, country, isDefault } =
      req.body;

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
