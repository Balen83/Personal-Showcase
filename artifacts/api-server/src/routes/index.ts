import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import ordersRouter from "./orders";
import conversationsRouter from "./conversations";
import wishlistRouter from "./wishlist";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(conversationsRouter);
router.use(wishlistRouter);

export default router;
