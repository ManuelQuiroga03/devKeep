using DevKeep.Api.Data;
using DevKeep.Api.DTOs;
using DevKeep.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevKeep.Api.Services;

public class CourseService : ICourseService
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public CourseService(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    public async Task<IEnumerable<Course>> GetAllCoursesAsync()
    {
        return await _context.Courses
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<Course?> GetCourseByIdAsync(Guid id)
    {
        return await _context.Courses
            .Include(c => c.Notes.OrderByDescending(n => n.CreatedAt))
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Course> CreateCourseAsync(CreateCourseDto dto)
    {
        var course = new Course
        {
            Title = dto.Title.Trim(),
            Platform = dto.Platform,
            Instructor = string.IsNullOrWhiteSpace(dto.Instructor) ? null : dto.Instructor.Trim(),
            CourseUrl = string.IsNullOrWhiteSpace(dto.CourseUrl) ? null : dto.CourseUrl.Trim(),
            TotalChapters = dto.TotalChapters,
            CurrentChapter = dto.CurrentChapter,
            TotalLessons = dto.TotalLessons,
            CompletedLessons = dto.CompletedLessons,
            Status = dto.Status,
            CertificateUrl = string.IsNullOrWhiteSpace(dto.CertificateUrl) ? null : dto.CertificateUrl.Trim()
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();
        return course;
    }

    public async Task<Course?> UpdateCourseAsync(Guid id, UpdateCourseDto dto)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return null;

        course.Title = dto.Title.Trim();
        course.Platform = dto.Platform;
        course.Instructor = string.IsNullOrWhiteSpace(dto.Instructor) ? null : dto.Instructor.Trim();
        course.CourseUrl = string.IsNullOrWhiteSpace(dto.CourseUrl) ? null : dto.CourseUrl.Trim();
        course.TotalChapters = dto.TotalChapters;
        course.CurrentChapter = dto.CurrentChapter;
        course.TotalLessons = dto.TotalLessons;
        course.CompletedLessons = dto.CompletedLessons;
        course.Status = dto.Status;
        course.CertificateUrl = string.IsNullOrWhiteSpace(dto.CertificateUrl) ? null : dto.CertificateUrl.Trim();

        await _context.SaveChangesAsync();
        return course;
    }

    public async Task<bool> DeleteCourseAsync(Guid id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return false;

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<string?> UploadCertificateAsync(Guid id, IFormFile file)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return null;

        var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "certificates");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{course.Id}_{DateTime.UtcNow.Ticks}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var relativeUrl = $"/uploads/certificates/{fileName}";
        course.CertificateUrl = relativeUrl;
        course.Status = "Completed";
        course.CompletedLessons = course.TotalLessons > 0 ? course.TotalLessons : course.CompletedLessons;

        await _context.SaveChangesAsync();
        return relativeUrl;
    }
}
