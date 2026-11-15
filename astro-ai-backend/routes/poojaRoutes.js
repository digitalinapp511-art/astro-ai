import express from "express";
import {
  getAllPoojas,
  createPooja,
  updatePooja,
  deletePooja,
  bookAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from "../controllers/poojaController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: View available Poojas catalog
router.get("/", getAllPoojas);

// Public: Book a Pooja appointment
router.post("/book", bookAppointment);

// Admin Only: Pooja Catalog Management
router.post("/", requireAdmin, createPooja);
router.put("/:id", requireAdmin, updatePooja);
router.delete("/:id", requireAdmin, deletePooja);

// Admin Only: Appointment Management & PII Access
router.get("/appointments", requireAdmin, getAllAppointments);
router.patch("/appointments/:id/status", requireAdmin, updateAppointmentStatus);
router.delete("/appointments/:id", requireAdmin, deleteAppointment);

export default router;
