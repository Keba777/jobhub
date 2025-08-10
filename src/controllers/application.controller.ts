import { NextFunction, Response } from "express";
import Application from "../models/Application.model";
import ErrorResponse from "../utils/error-response.utils";
import { AuthRequest } from "../middlewares/auth.middleware";
import { uploadToCloudinary } from "../utils/cloudinary.utils";
import Job from "../models/Job.model";
import sendEmail from "../utils/email.utils";
import User from "../models/User.model";
import { Op } from "sequelize";

export const applyJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { coverLetter } = req.body;
        const jobId = req.params.id;
        const file = req.file;

        if (!file) {
            return next(new ErrorResponse("Resume required", 400));
        }

        if (coverLetter && coverLetter.length > 200) {
            return next(new ErrorResponse("Cover letter too long", 400));
        }

        const job = await Job.findByPk(jobId);
        if (!job) {
            return next(new ErrorResponse("Job not found", 404));
        }

        const existingApp = await Application.findOne({ where: { applicantId: req.user!.id, jobId } });
        if (existingApp) {
            return next(new ErrorResponse("Already applied", 400));
        }

        const resumeLink = await uploadToCloudinary(file) as string;

        const application = await Application.create({
            applicantId: req.user!.id,
            jobId,
            resumeLink,
            coverLetter,
            status: "Applied",
        });

        // Send email to company
        const company = await User.findByPk(job.createdBy);
        if (company) {
            await sendEmail(
                company.email,
                "New Application Received",
                `A new applicant has applied to your job posting titled "${job.title}".`
            );
        }

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            object: application,
            errors: null,
        });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse("Server error", 500));
    }
};

export const getMyApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { page = "1", pageSize = "10", companyName, jobStatus, applicationStatus, sortBy = "createdAt", sortOrder = "DESC" } = req.query;

        const pageNum = parseInt(page as string, 10);
        const size = parseInt(pageSize as string, 10);

        // Filters for application status
        const applicationWhere: any = { applicantId: req.user!.id };
        if (applicationStatus) {
            applicationWhere.status = applicationStatus;
        }

        // Build includes for Job and User with filters
        const jobWhere: any = {};
        const userWhere: any = {};

        if (jobStatus) jobWhere.status = jobStatus;
        if (companyName) userWhere.name = { [Op.iLike]: `%${companyName}%` };

        const { count, rows: applications } = await Application.findAndCountAll({
            where: applicationWhere,
            include: [{
                model: Job,
                where: jobWhere,
                include: [{
                    model: User,
                    as: "user",
                    where: userWhere,
                    attributes: ["id", "name", "email"]
                }],
                attributes: ["id", "title", "status"]
            }],
            order: [[sortBy as string, sortOrder as string]],
            offset: (pageNum - 1) * size,
            limit: size,
        });

        res.status(200).json({
            success: true,
            message: "Applications fetched",
            object: applications,
            pageNumber: pageNum,
            pageSize: size,
            totalSize: count,
            errors: null,
        });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse("Server error", 500));
    }
};

export const getApplicationsForJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { jobId } = req.params;
        const { page = "1", pageSize = "10", status, sortBy = "createdAt", sortOrder = "DESC" } = req.query;

        const pageNum = parseInt(page as string, 10);
        const size = parseInt(pageSize as string, 10);

        const job = await Job.findByPk(jobId);
        if (!job) {
            return next(new ErrorResponse("Job not found", 404));
        }

        if (job.createdBy !== req.user!.id) {
            return next(new ErrorResponse("Unauthorized access", 403));
        }

        const whereConditions: any = { jobId };
        if (status) {
            whereConditions.status = status;
        }

        const { count, rows: applications } = await Application.findAndCountAll({
            where: whereConditions,
            include: [{
                model: User,
                as: "applicant",
                attributes: ["id", "name", "email"]
            }],
            order: [[sortBy as string, sortOrder as string]],
            offset: (pageNum - 1) * size,
            limit: size,
        });

        res.status(200).json({
            success: true,
            message: "Applications fetched",
            object: applications,
            pageNumber: pageNum,
            pageSize: size,
            totalSize: count,
            errors: null,
        });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse("Server error", 500));
    }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["Applied", "Reviewed", "Interview", "Rejected", "Hired"];
        if (!validStatuses.includes(status)) {
            return next(new ErrorResponse("Invalid status", 400));
        }

        const application = await Application.findByPk(id, {
            include: [{ model: Job }]
        });

        if (!application) {
            return next(new ErrorResponse("Application not found", 404));
        }

        const job = application.job;
        if (!job || job.createdBy !== req.user!.id) {
            return next(new ErrorResponse("Unauthorized", 403));
        }

        application.status = status;
        await application.save();

        // Send notification emails for certain statuses
        if (["Interview", "Rejected", "Hired"].includes(status)) {
            const applicant = await User.findByPk(application.applicantId);
            if (applicant) {
                let message = "";
                switch (status) {
                    case "Interview":
                        message = `You have been selected for an interview for the job "${job.title}".`;
                        break;
                    case "Rejected":
                        message = `We regret to inform you that you were not selected for the job "${job.title}".`;
                        break;
                    case "Hired":
                        message = `Congratulations! You have been hired for the job "${job.title}".`;
                        break;
                }
                await sendEmail(applicant.email, `Application Status: ${status}`, message);
            }
        }

        res.status(200).json({
            success: true,
            message: "Application status updated",
            object: application,
            errors: null,
        });
    } catch (error) {
        console.error(error);
        next(new ErrorResponse("Server error", 500));
    }
};
