import express from 'express'
import authMiddleware from './helpers/authMiddleware.js'
import { upload } from './helpers/cloudinary.js'

// Controllers
import * as authController from './controllers/auth.controller.js'
import * as customerController from './controllers/customer.controller.js'
import * as strutturaController from './controllers/struttura.controller.js'
import * as reviewsController from './controllers/reviewsController.js'
import * as BookingController from './controllers/booking.controller.js'

// Google OAuth Routes
import googleAuthRoutes from './routes/auth.js'

const router = express.Router()

// --- AUTENTICAZIONE ---
router.post("/register", upload.single('profileImg'), authController.register)
router.post("/login", authController.login)

// --- PROFILO UTENTE ---
router.get("/me", authMiddleware, customerController.readAuthCustomer)
router.patch("/me", authMiddleware, customerController.editAuthCustomer)
router.delete("/me", authMiddleware, customerController.destroyAuthCustomer)
router.patch("/me/image", authMiddleware, ...customerController.editAuthCustomerImage)


// --- GOOGLE AUTH ---
router.use(googleAuthRoutes)

// --- STRUTTURE ---
router.post("/struttura", authMiddleware, upload.array('images', 10), strutturaController.create)
router.get("/struttura/mie", authMiddleware, strutturaController.getUserStrutture)
router.get("/struttura", strutturaController.getAll)
router.get("/struttura/:id", strutturaController.getById)
router.put("/struttura/:strutturaId", authMiddleware, upload.single("image"), strutturaController.updateStruttura) 
router.delete("/struttura/:strutturaId", authMiddleware, strutturaController.deleteStruttura)

// --- RECENSIONI ---
router.post("/struttura/:strutturaId/reviews", authMiddleware, reviewsController.create)
router.get("/struttura/:strutturaId/reviews", reviewsController.getByStruttura)
router.delete("/reviews/:id", authMiddleware, reviewsController.destroy)
router.put("/reviews/:id", authMiddleware, reviewsController.update)

// --- PRENOTAZIONI ---
router.post("/struttura/:strutturaId/book", authMiddleware, BookingController.createBooking)
router.get("/bookings/me", authMiddleware, BookingController.getMyBookings)
router.get("/struttura/:strutturaId/bookings", authMiddleware, BookingController.getStrutturaBookings)
router.delete("/bookings/:id", authMiddleware, BookingController.deleteBooking)

export default router
