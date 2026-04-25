import Course from "./course.model.js";
import LiveSession from "./live.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class CourseService {
    static async createCourse(tutorId, courseData) {
        return await Course.create({
            ...courseData,
            tutorId
        });
    }

    static async enrollStudent(courseId, studentId) {
        const course = await Course.findById(courseId);
        if (!course) throw new ApiError(404, "Course not found");

        if (course.students.includes(studentId)) {
            throw new ApiError(400, "Student already enrolled in this course");
        }

        course.students.push(studentId);
        await course.save();
        return course;
    }

    static async getCourseDetails(courseId) {
        return await Course.findById(courseId).populate("tutorId", "fullName email profilePic").populate("students", "fullName");
    }

    static async createLiveSession(courseId, sessionData) {
        return await LiveSession.create({
            ...sessionData,
            courseId
        });
    }
}
