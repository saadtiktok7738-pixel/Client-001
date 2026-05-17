import { Router } from "express";

import healthRouter from "./health.js";
import sendOrderRouter from "./send-order.js";
import authRouter from "./auth.js";
import productsRouter from "./products.js";
import categoriesRouter from "./categories.js";
import bannersRouter from "./banners.js";
import ordersRouter from "./orders.js";
import usersRouter from "./users.js";
import cartRouter from "./cart.js";
import wishlistRouter from "./wishlist.js";
import shippingRouter from "./shipping.js";
import presenceRouter from "./presence.js";
import uploadRouter from "./upload.js";

const router = Router();

router.use(healthRouter);
router.use(sendOrderRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(bannersRouter);
router.use(ordersRouter);
router.use(usersRouter);
router.use(cartRouter);
router.use(wishlistRouter);
router.use(shippingRouter);
router.use(presenceRouter);
router.use(uploadRouter);

export default router;