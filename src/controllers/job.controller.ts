import { Request, Response, NextFunction } from "express";
import ErrorResponse from "../utils/error-response.utils";
import Job from "../models/Job.model";

// Create a new job (company only)
export const createJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Ensure createdBy is the logged-in user (assumed req.user set by middleware)
        const createdBy = (req as any).user?.id;
        if (!createdBy) {
            return next(new ErrorResponse("Unauthorized", 401));
        }

        // Validate required fields (title, description, status optional, location optional)
        const { title, description, location, status } = req.body;

        if (!title || typeof title !== "string" || title.length > 100) {
            return next(new ErrorResponse("Invalid or missing title", 400));
        }

        if (!description || typeof description !== "string" || description.length < 20 || description.length > 2000) {
            return next(new ErrorResponse("Invalid or missing description", 400));
        }

        // Validate status if provided
        const validStatuses = ["Draft", "Open", "Closed"];
        if (status && !validStatuses.includes(status)) {
            return next(new ErrorResponse("Invalid status value", 400));
        }

        const job = await Job.create({
            title,
            description,
            location,
            status: status || "Draft",
            createdBy,
        });

        res.status(201).json({ success: true, message: "Job created", object: job, errors: null });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse("Server error", 500));
    }
};

// Get paginated jobs for applicants (browse jobs)
export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // TODO: add filters, pagination as per user stories (simplified here)
        const jobs = await Job.findAll();

        res.status(200).json({ success: true, message: "Jobs fetched", object: jobs, errors: null });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse("Server error", 500));
    }
};

// Get jobs created by current company (pagination can be added)
export const getMyJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return next(new ErrorResponse("Unauthorized", 401));
        }

        const jobs = await Job.findAll({ where: { createdBy: userId } });

        res.status(200).json({ success: true, message: "My jobs fetched", object: jobs, errors: null });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse("Server error", 500));
    }
};

// Get job by ID - accessible by all authenticated users
export const getJobById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) {
            return next(new ErrorResponse("Job not found", 404));
        }
        res.status(200).json({ success: true, message: "Job fetched", object: job, errors: null });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse("Server error", 500));
    }
};

// Update a job - only company owner can update, forward-only status flow enforced
export const updateJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) {
            return next(new ErrorResponse("Job not found", 404));
        }

        const userId = (req as any).user?.id;
        if (job.createdBy !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized access", object: null, errors: null });
        }

        const { title, description, location, status } = req.body;

        if (title && (typeof title !== "string" || title.length > 100)) {
            return next(new ErrorResponse("Invalid title", 400));
        }

        if (description && (typeof description !== "string" || description.length < 20 || description.length > 2000)) {
            return next(new ErrorResponse("Invalid description", 400));
        }

        const validStatuses = ["Draft", "Open", "Closed"] as const; // 'as const' makes tuple of literals

        if (status) {
            if (!validStatuses.includes(status as any)) {
                return next(new ErrorResponse("Invalid status value", 400));
            }

            const typedStatus = status as typeof validStatuses[number];

            const statusOrder: Record<typeof typedStatus, number> = { Draft: 0, Open: 1, Closed: 2 };

            if (statusOrder[typedStatus] < statusOrder[job.status]) {
                return next(new ErrorResponse("Status cannot be reverted to a previous state", 400));
            }
        }

        const updatedJob = await job.update({ title, description, location, status });

        res.status(200).json({ success: true, message: "Job updated", object: updatedJob, errors: null });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse("Server error", 500));
    }
};

// Delete a job - only company owner can delete
export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) {
            return next(new ErrorResponse("Job not found", 404));
        }

        const userId = (req as any).user?.id;
        if (job.createdBy !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized access", object: null, errors: null });
        }

        await job.destroy();

        res.status(200).json({ success: true, message: "Successfully deleted", errors: null });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse("Server error", 500));
    }
};
