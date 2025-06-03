import express from "express"
import { login, register, forgotPassword, resetPassword, refreshToken, logout } from "../controllers/auth.controller"

const router = express.Router()

router.post("/login", login)
router.post("/register", register)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.post("/refresh-token", refreshToken)
router.post("/logout", logout)

export default router
