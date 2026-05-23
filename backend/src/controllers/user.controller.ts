import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import config from "../config";
import { Server as SocketIOServer } from "socket.io";
import bcrypt from "bcryptjs";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password, role, organisation } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If admin has an organisation, new users inherit it (unless super admin)
    let userOrganisation = organisation;
    if (req.user!.organisation && !organisation) {
      userOrganisation = req.user!.organisation;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || config.roles.VIEWER,
      organisation: userOrganisation,
      isActive: true,
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organisation: user.organisation,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: { user: userResponse },
    });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string | undefined;
    const organisation = req.query.organisation as string | undefined;

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (organisation) filter.organisation = organisation;

    // Multi-tenant: Admin sees users in their own organisation
    // If admin has no organisation, they see all users (super admin)
    if (req.user!.organisation) {
      filter.organisation = req.user!.organisation;
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { role } = req.body;

    // Prevent self-demotion
    if (req.params.id === req.user!.id.toString()) {
      res.status(400).json({
        success: false,
        message: "Cannot change your own role.",
      });
      return;
    }

    // Build filter for multi-tenant support
    const userFilter: Record<string, unknown> = { _id: req.params.id };
    if (req.user!.organisation) {
      userFilter.organisation = req.user!.organisation;
    }

    const user = await User.findOneAndUpdate(
      userFilter,
      { role },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found in your organisation.",
      });
      return;
    }

    // Notify the affected user in real-time via Socket.IO
    const io: SocketIOServer = req.app.get("io");
    if (io) {
      io.to(`user:${user._id.toString()}`).emit("role:updated", {
        role: user.role,
        name: user.name,
        email: user.email,
        _id: user._id,
        isActive: user.isActive,
        organisation: user.organisation,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}.`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.params.id === req.user!.id.toString()) {
      res.status(400).json({
        success: false,
        message: "Cannot deactivate your own account.",
      });
      return;
    }

    // Build filter for multi-tenant support
    const userFilter: Record<string, unknown> = { _id: req.params.id };
    if (req.user!.organisation) {
      userFilter.organisation = req.user!.organisation;
    }

    const user = await User.findOne(userFilter);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found in your organisation.",
      });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}.`,
      data: {
        user: { id: user._id, name: user.name, isActive: user.isActive },
      },
    });
  } catch (error) {
    next(error);
  }
};
