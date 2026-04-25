import { CourseService } from "./course.service.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class CourseController {
    static async createCourse(req, res, next) {
        try {
            if (req.user.role !== "tutor" && req.user.role !== "admin") {
                throw new ApiError(403, "Only tutors and admins can create courses");
            }
            const course = await CourseService.createCourse(req.user._id, req.body);
            res.status(201).json({ success: true, data: course });
        } catch (error) {
            next(error);
        }
    }

    static async enroll(req, res, next) {
        try {
            const { courseId } = req.params;
            const course = await CourseService.enrollStudent(courseId, req.user._id);
            res.json({ success: true, message: "Enrolled successfully", data: course });
        } catch (error) {
            next(error);
        }
    }

    static async getCourse(req, res, next) {
        try {
            const course = await CourseService.getCourseDetails(req.params.courseId);
            if (!course) throw new ApiError(404, "Course not found");
            res.json({ success: true, data: course });
        } catch (error) {
            next(error);
        }
    }
}
