import express from "express";
import { getAllProducts, getProductById, getProductsByCategoryId} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/category/:categoryId", getProductsByCategoryId);
router.get("/:id", getProductById);

export default router;
