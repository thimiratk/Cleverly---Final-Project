import { Request, Response, NextFunction } from "express";
import { ValidationError, AuthError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";

// Create a new moderator
export const createModerator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password, name, assignedCategories, permissions } = req.body;
        
        // Validate required fields
        if (!username || !email || !password) {
            throw new ValidationError("Username, email, and password are required");
        }

        // Check if moderator already exists
        const existingModerator = await prisma.moderators.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingModerator) {
            throw new ValidationError("Moderator with this email or username already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Validate categories exist
        if (assignedCategories && assignedCategories.length > 0) {
            const existingCategories = await prisma.categories.findMany({
                where: {
                    id: { in: assignedCategories }
                }
            });

            if (existingCategories.length !== assignedCategories.length) {
                throw new ValidationError("One or more assigned categories do not exist");
            }
        }

        // Create moderator
        const moderator = await prisma.moderators.create({
            data: {
                username,
                email,
                password: hashedPassword,
                name: name || username,
                assignedCategories: assignedCategories || [],
                permissions: permissions || ["MODERATE_REVIEWS", "MANAGE_COMMENTS", "BAN_USERS"],
                createdBy: (req.user as any)?.id // Admin who created this moderator
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                assignedCategories: true,
                permissions: true,
                isActive: true,
                createdAt: true
            }
        });

        res.status(201).json({
            success: true,
            message: "Moderator created successfully",
            moderator
        });
    } catch (error) {
        next(error);
    }
};

// Get all moderators
export const getModerators = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10, isActive, categoryId } = req.query;
        
        const skip = (Number(page) - 1) * Number(limit);
        
        const where: any = {};
        
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }
        
        if (categoryId) {
            where.assignedCategories = {
                has: categoryId as string
            };
        }

        const [moderators, total] = await Promise.all([
            prisma.moderators.findMany({
                where,
                skip,
                take: Number(limit),
                select: {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    assignedCategories: true,
                    categories: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    permissions: true,
                    isActive: true,
                    lastLogin: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.moderators.count({ where })
        ]);

        res.json({
            success: true,
            moderators,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get moderator by ID
export const getModeratorById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const moderator = await prisma.moderators.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                assignedCategories: true,
                categories: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                permissions: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!moderator) {
            throw new ValidationError("Moderator not found");
        }

        res.json({
            success: true,
            moderator
        });
    } catch (error) {
        next(error);
    }
};

// Update moderator
export const updateModerator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, assignedCategories, permissions, isActive } = req.body;

        // Check if moderator exists
        const existingModerator = await prisma.moderators.findUnique({
            where: { id }
        });

        if (!existingModerator) {
            throw new ValidationError("Moderator not found");
        }

        // Validate categories if provided
        if (assignedCategories && assignedCategories.length > 0) {
            const existingCategories = await prisma.categories.findMany({
                where: {
                    id: { in: assignedCategories }
                }
            });

            if (existingCategories.length !== assignedCategories.length) {
                throw new ValidationError("One or more assigned categories do not exist");
            }
        }

        const updateData: any = {};
        
        if (name !== undefined) updateData.name = name;
        if (assignedCategories !== undefined) updateData.assignedCategories = assignedCategories;
        if (permissions !== undefined) updateData.permissions = permissions;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedModerator = await prisma.moderators.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                assignedCategories: true,
                categories: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                permissions: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json({
            success: true,
            message: "Moderator updated successfully",
            moderator: updatedModerator
        });
    } catch (error) {
        next(error);
    }
};

// Delete moderator
export const deleteModerator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const existingModerator = await prisma.moderators.findUnique({
            where: { id }
        });

        if (!existingModerator) {
            throw new ValidationError("Moderator not found");
        }

        await prisma.moderators.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: "Moderator deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Moderator login
export const moderatorLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            throw new ValidationError("Username and password are required");
        }

        const moderator = await prisma.moderators.findFirst({
            where: {
                OR: [
                    { username },
                    { email: username }
                ],
                isActive: true
            }
        });

        if (!moderator) {
            throw new ValidationError("Invalid credentials or account is inactive");
        }

        const isPasswordValid = await bcrypt.compare(password, moderator.password);
        if (!isPasswordValid) {
            throw new ValidationError("Invalid credentials");
        }

        // Update last login
        await prisma.moderators.update({
            where: { id: moderator.id },
            data: { lastLogin: new Date() }
        });

        // Generate JWT tokens
        const accessToken = jwt.sign(
            { id: moderator.id, role: "moderator", username: moderator.username },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '8h' }
        );

        const refreshToken = jwt.sign(
            { id: moderator.id, role: "moderator", username: moderator.username },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '7d' }
        );

        setCookie(res, 'refreshToken', refreshToken);
        setCookie(res, 'accessToken', accessToken);

        res.status(200).json({
            success: true,
            message: "Login successful",
            moderator: {
                id: moderator.id,
                username: moderator.username,
                email: moderator.email,
                name: moderator.name,
                assignedCategories: moderator.assignedCategories,
                permissions: moderator.permissions
            },
            accessToken
        });
    } catch (error) {
        next(error);
    }
};

// Get moderator dashboard stats
export const getModeratorStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [totalModerators, activeModerators, totalCategories] = await Promise.all([
            prisma.moderators.count(),
            prisma.moderators.count({ where: { isActive: true } }),
            prisma.categories.count()
        ]);

        res.json({
            success: true,
            stats: {
                totalModerators,
                activeModerators,
                inactiveModerators: totalModerators - activeModerators,
                totalCategories
            }
        });
    } catch (error) {
        next(error);
    }
};