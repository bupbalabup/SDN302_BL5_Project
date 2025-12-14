import express from "express";
import { placeBid, getBidHistory, updateAutoBid, getUserAutoBid } from "../controllers/bidController.js"
const router = express.Router();

// POST /api/auction/:productId/bid
router.post("/:productId/bid", placeBid);
router.get("/:productId/historyBid", getBidHistory)
router.put("/:productId/autoBid", updateAutoBid);
router.get("/:productId/autobid", getUserAutoBid);



export default router;
