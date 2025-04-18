// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title School and Student Registration Contract
 * @author 
 * @notice This contract allows an admin to register schools and allows students to register themselves under a school.
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SchoolStudentRegistry is Ownable {
    using Counters for Counters.Counter;

    // School structure
    struct School {
        string name;
        string location;
        bool isAccredited;
        uint256 registrationTime;
        bool exists;
    }

    // Student structure
    struct Student {
        string name;
        string email;
        uint256 schoolId;
        bool isEnrolled;
        uint256 registrationTime;
        bool exists;
    }

    // Mappings
    mapping(uint256 => School) private schools;
    mapping(uint256 => Student) private students;

    // ID counters
    Counters.Counter private schoolIdCounter;
    Counters.Counter private studentIdCounter;

    // Events
    event SchoolRegistered(uint256 indexed schoolId, string name, string location, bool isAccredited);
    event StudentRegistered(uint256 indexed studentId, string name, string email, uint256 schoolId);
    event StudentEnrolled(uint256 indexed studentId, uint256 schoolId);
    event StudentUnenrolled(uint256 indexed studentId);

    // Constructor
    constructor() Ownable() {}

    // ========== SCHOOL FUNCTIONS ==========

    /**
     * @notice Registers a new school. Only callable by the owner (admin).
     * @param _name Name of the school.
     * @param _location Physical address of the school.
     * @param _isAccredited Accreditation status.
     */
    function registerSchool(
        string calldata _name,
        string calldata _location,
        bool _isAccredited
    ) external onlyOwner returns (uint256) {
        require(bytes(_name).length > 0, "School name required");
        require(bytes(_location).length > 0, "Location required");

        schoolIdCounter.increment();
        uint256 newSchoolId = schoolIdCounter.current();

        schools[newSchoolId] = School({
            name: _name,
            location: _location,
            isAccredited: _isAccredited,
            registrationTime: block.timestamp,
            exists: true
        });

        emit SchoolRegistered(newSchoolId, _name, _location, _isAccredited);
        return newSchoolId;
    }

    /**
     * @notice Fetch details of a registered school.
     * @param _schoolId ID of the school.
     */
    function getSchool(uint256 _schoolId) external view returns (School memory) {
        require(schools[_schoolId].exists, "School does not exist");
        return schools[_schoolId];
    }

    // ========== STUDENT FUNCTIONS ==========

    /**
     * @notice Register a new student.
     * @param _name Name of the student.
     * @param _email Email address.
     * @param _schoolId School ID where the student is enrolling.
     */
    function registerStudent(
        string calldata _name,
        string calldata _email,
        uint256 _schoolId
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Student name required");
        require(bytes(_email).length > 0, "Student email required");
        require(schools[_schoolId].exists, "School does not exist");

        studentIdCounter.increment();
        uint256 newStudentId = studentIdCounter.current();

        students[newStudentId] = Student({
            name: _name,
            email: _email,
            schoolId: _schoolId,
            isEnrolled: true,
            registrationTime: block.timestamp,
            exists: true
        });

        emit StudentRegistered(newStudentId, _name, _email, _schoolId);
        return newStudentId;
    }

    /**
     * @notice Enroll an existing student to another school.
     * @param _studentId ID of the student.
     * @param _newSchoolId New school ID.
     */
    function enrollStudent(uint256 _studentId, uint256 _newSchoolId) external onlyOwner {
        require(students[_studentId].exists, "Student does not exist");
        require(schools[_newSchoolId].exists, "School does not exist");

        students[_studentId].schoolId = _newSchoolId;
        students[_studentId].isEnrolled = true;

        emit StudentEnrolled(_studentId, _newSchoolId);
    }

    /**
     * @notice Unenroll a student from their current school.
     * @param _studentId ID of the student.
     */
    function unenrollStudent(uint256 _studentId) external onlyOwner {
        require(students[_studentId].exists, "Student does not exist");
        require(students[_studentId].isEnrolled, "Student is not enrolled");

        students[_studentId].isEnrolled = false;

        emit StudentUnenrolled(_studentId);
    }

    /**
     * @notice Fetch details of a registered student.
     * @param _studentId ID of the student.
     */
    function getStudent(uint256 _studentId) external view returns (Student memory) {
        require(students[_studentId].exists, "Student does not exist");
        return students[_studentId];
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Total number of registered schools.
     */
    function totalSchools() external view returns (uint256) {
        return schoolIdCounter.current();
    }

    /**
     * @notice Total number of registered students.
     */
    function totalStudents() external view returns (uint256) {
        return studentIdCounter.current();
    }
}
