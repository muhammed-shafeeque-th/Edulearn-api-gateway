import { UserData, UserMeta } from '@/domains/service-clients/user/proto/generated/user/types/user_types';
import { InstructorMetadata, User, UserInfo, UserMetadata } from '../types';
import { InstructorMeta } from '@/domains/service-clients/user/proto/generated/user/types/instructor_types';

export class UserResponseMapper {
  public static toUser(user: UserData): User {
    return {
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      role: user.role,

      socials: user.socials
        ? user.socials.map(social => ({
            profileUrl: social.profileUrl,
            provider: social.provider,
            providerUserUrl: social.providerUserUrl,
          }))
        : [],
      status: user.status,
      avatar: user.avatar,
      createdAt: user.createdAt,
      slug: user.slug,
      username: user.username,
      instructorProfile: user.instructorProfile
        ? {
            rating: user.instructorProfile.rating,
            tags: user.instructorProfile.tags,
            totalCourses: user.instructorProfile.totalCourses,
            totalRatings: user.instructorProfile.totalRatings,
            totalStudents: user.instructorProfile.totalStudents,
            bio: user.instructorProfile.bio,
            joinedAt: user.instructorProfile.joinedAt,
            certificate: user.instructorProfile.certificate,
            experience: user.instructorProfile.experience,
            expertise: user.instructorProfile.expertise,
            headline: user.instructorProfile.headline,
          }
        : undefined,
      lastLogin: user.lastLogin,
      lastName: user.lastName,
      profile: user.profile
        ? {
            bio: user.profile.bio,
            city: user.profile.city,
            country: user.profile.country,
            gender: user.profile.gender,
            language: user.profile.language,
            phone: user.profile.phone,
            website: user.profile.website,
          }
        : undefined,
      updatedAt: user.updatedAt,
    };
  }
  public static toUserInfo(user: UserData | UserMeta): UserInfo {
    return {
      email: user.email,
      name: user.firstName + ' ' + user.lastName,
      id: user.id,
      role: user.role as any,
      avatar: user.avatar,
    };
  }
  public static toUserMetadata(user: UserMeta): UserMetadata {
    return {
      email: user.email,
      createdAt: user.createdAt,
      firstName: user.firstName,
      lastLogin: user.lastLogin,
      lastName: user.lastName,
      bio: user.bio,
      city: user.city,
      country: user.country,
      gender: user.gender,
      phone: user.phone,
      status: user.status,
      updatedAt: user.updatedAt,
      id: user.id,
      role: user.role as any,
      avatar: user.avatar,
    };
  }
  public static toInstructorMetadata(user: InstructorMeta): InstructorMetadata {
    return {
      email: user.email,
      bio: user.bio,
      createdAt: user.createdAt,
      education: user.education,
      experience: user.experience,
      expertise: user.expertise,
      headline: user.headline,
      joinedAt: user.joinedAt,
      language: user.language,
      lastLogin: user.lastLogin,
      rating: user.rating,
      slug: user.slug,
      status: user.status,
      tags: user.tags,
      totalCourses: user.totalCourses,
      totalRatings: user.totalRatings,
      totalStudents: user.totalStudents,
      updatedAt: user.updatedAt,
      username: user.username,
      website: user.website,
      id: user.id,
      role: user.role,
      avatar: user.avatar,
    };
  }


}
