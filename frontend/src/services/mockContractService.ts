import { VerificationResult } from './aiVerificationService';

// Mock data for schools
let schools: any[] = [];
let schoolIdCounter = 0;

// Mock data for students
let students: any[] = [];
let studentIdCounter = 0;

export const registerSchool = async (
  _contract: any,
  name: string,
  location: string,
  isAccredited: boolean,
  verificationResult: VerificationResult
): Promise<number> => {
  try {
    if (!verificationResult.isVerified) {
      throw new Error('School verification failed. Cannot register unverified school.');
    }

    console.log('Mock: Registering school with params:', { name, location, isAccredited });

    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Increment counter and create new school
    schoolIdCounter++;
    const newSchoolId = schoolIdCounter;

    schools.push({
      id: newSchoolId,
      name,
      location,
      isAccredited,
      registrationTime: Date.now(),
      exists: true
    });

    console.log(`Mock: School registered successfully with ID: ${newSchoolId}`);
    return newSchoolId;
  } catch (error: any) {
    console.error('Error registering school:', error);
    throw error;
  }
};

export const registerStudent = async (
  _contract: any,
  name: string,
  email: string,
  schoolId: number,
  verificationResult: VerificationResult
): Promise<number> => {
  try {
    if (!verificationResult.isVerified) {
      throw new Error('Student verification failed. Cannot register unverified student.');
    }

    // Check if school exists
    const schoolExists = schools.some(school => school.id === schoolId);
    if (!schoolExists) {
      throw new Error(`School with ID ${schoolId} does not exist`);
    }

    console.log('Mock: Registering student with params:', { name, email, schoolId });

    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Increment counter and create new student
    studentIdCounter++;
    const newStudentId = studentIdCounter;

    students.push({
      id: newStudentId,
      name,
      email,
      schoolId,
      isEnrolled: true,
      registrationTime: Date.now(),
      exists: true
    });

    console.log(`Mock: Student registered successfully with ID: ${newStudentId}`);
    return newStudentId;
  } catch (error: any) {
    console.error('Error registering student:', error);
    throw error;
  }
};

export const getSchoolCount = async (): Promise<number> => {
  return schools.length;
};

export const getStudentCount = async (): Promise<number> => {
  return students.length;
};

export const getAllSchools = async (): Promise<any[]> => {
  return [...schools];
};

export const getAllStudents = async (): Promise<any[]> => {
  return [...students];
};

export const getSchool = async (schoolId: number): Promise<any> => {
  const school = schools.find(s => s.id === schoolId);
  if (!school) {
    throw new Error(`School with ID ${schoolId} not found`);
  }
  return school;
};

export const getStudent = async (studentId: number, _contract?: any): Promise<any> => {
  const student = students.find(s => s.id === studentId);
  if (!student) {
    console.warn(`Student with ID ${studentId} not found, returning mock data`);
    return {
      id: studentId,
      name: `Student ${studentId}`,
      email: `student${studentId}@example.com`,
      schoolId: 1,
      isEnrolled: true,
      registrationTime: Date.now(),
      exists: true
    };
  }
  return student;
};

export const getStudentsBySchool = async (schoolId: number): Promise<any[]> => {
  return students.filter(student => student.schoolId === schoolId);
};

// Initialize with some mock data
schools.push({
  id: ++schoolIdCounter,
  name: 'University of Technology',
  location: 'New York',
  isAccredited: true,
  registrationTime: Date.now() - 86400000, // 1 day ago
  exists: true
});

schools.push({
  id: ++schoolIdCounter,
  name: 'Global Science Academy',
  location: 'London',
  isAccredited: true,
  registrationTime: Date.now() - 43200000, // 12 hours ago
  exists: true
});

students.push({
  id: ++studentIdCounter,
  name: 'John Doe',
  email: 'john.doe@example.com',
  schoolId: 1,
  isEnrolled: true,
  registrationTime: Date.now() - 3600000, // 1 hour ago
  exists: true
});

students.push({
  id: ++studentIdCounter,
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  schoolId: 2,
  isEnrolled: true,
  registrationTime: Date.now() - 1800000, // 30 minutes ago
  exists: true
});
