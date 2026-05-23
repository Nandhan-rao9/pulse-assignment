import { Router } from "express";
import { z } from "zod";
import {
  createUser,
  listUsers,
  updateUserRole,
  toggleUserStatus,
} from "../controllers/user.controller";
import { auth, adminOnly, validate } from "../middleware";
import config from "../config";

const router = Router();

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z
    .enum(
      [config.roles.VIEWER, config.roles.EDITOR, config.roles.ADMIN] as [
        string,
        ...string[],
      ],
      { error: "Invalid role" },
    )
    .optional(),
  organisation: z.string().optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(
    [config.roles.VIEWER, config.roles.EDITOR, config.roles.ADMIN] as [
      string,
      ...string[],
    ],
    { error: "Invalid role" },
  ),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

router.use(auth, adminOnly);

router.post("/", validate(createUserSchema), createUser);

router.get("/", listUsers);

router.put("/:id/role", validate(updateRoleSchema), updateUserRole);

router.patch("/:id/status", toggleUserStatus);

export default router;
