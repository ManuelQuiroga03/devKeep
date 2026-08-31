using DevKeep.Api.DTOs;
using DevKeep.Api.Models;

namespace DevKeep.Api.Services;

public interface ICourseService
{
    Task<IEnumerable<Course>> GetAllCoursesAsync();
    Task<Course?> GetCourseByIdAsync(Guid id);
    Task<Course> CreateCourseAsync(CreateCourseDto dto);
    Task<Course?> UpdateCourseAsync(Guid id, UpdateCourseDto dto);
    Task<bool> DeleteCourseAsync(Guid id);
    Task<string?> UploadCertificateAsync(Guid id, IFormFile file);
    Task<Course?> IncrementChapterAsync(Guid id);
    Task<Course?> IncrementLessonAsync(Guid id);
}
