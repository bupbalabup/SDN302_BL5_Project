export const handleServerError = (res, error) => {
  console.error("Error:", error.message);
  return res
    .status(500)
    .json({ succes: false, message: "Server error", error: error.message });
};
