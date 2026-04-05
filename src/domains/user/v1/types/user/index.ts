export interface UserProfile {
  bio?: string;
  phone?: string;
  country?: string;
  city?: string;
  gender?: string;
  preference?: string;
  language?: string;
  website?: string;
}

export interface UserMetadata {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  avatar: string;
  status: string;
  lastLogin: string;
  updatedAt: string;
  createdAt: string;
  city?: string | undefined;
  phone?: string | undefined;
  country?: string | undefined;
  bio?: string | undefined;
  gender?: string | undefined;
  roleStatus?: Record<string, string>;
}

export interface InstructorMetadata {
  id: string;
  email: string;
  role: string;
  username: string;
  slug: string;
  avatar: string;
  status: string;
  headline: string;
  expertise: string;
  tags: string[];
  rating: number;
  totalRatings: number;
  totalCourses: number;
  totalStudents: number;
  lastLogin: string;
  updatedAt: string;
  createdAt: string;
  language: string;
  website: string;
  bio: string;
  joinedAt: string;
  education: string;
  experience: string;
  roleStatus?: Record<string, string>;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'instructor';
}

export interface UserSocials {
  provider: string;
  profileUrl: string;
  providerUserUrl?: string;
}

export interface InstructorProfile {
  bio?: string;
  headline?: string;
  experience?: string;
  certificate?: string;
  joinedAt?: string;
  tags: string[];
  expertise?: string;
  rating: number;
  totalRatings: number;
  totalCourses: number;
  totalStudents: number;
}

/** Common User Information */
export interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  status: string;
  slug?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
  lastLogin?: string;
  profile?: UserProfile;
  instructorProfile?: InstructorProfile;
  socials: UserSocials[];
  updatedAt?: string;
  createdAt?: string;
  roleStatus?: Record<string, string>;
}
