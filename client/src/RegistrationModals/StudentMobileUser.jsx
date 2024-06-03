import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './RegisterModal.css';
const StudentMobileUserReg = () => {
    // State variables to store form data
    const [name, setName] = useState('');
    const [studentemail, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [section, setSection] = useState('');
    const [educationLevel, setEducationLevel] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [highSchoolYearLevel, setHighSchoolYearLevel] = useState('');
    const [shsStrand, setShsStrand] = useState('');
    const [collegeCourse, setCollegeCourse] = useState('');
    const [collegeYearLevel, setCollegeYearLevel] = useState('');
    const [subjects, setSubjects] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct the data object to send to the server
        const userData = {
            name,
            studentemail,
            password,
            section,
            educationLevel,
            gradeLevel,
            highSchoolYearLevel,
            shsStrand,
            collegeCourse,
            collegeYearLevel,
            subjects: subjects.split(',').map(subject => subject.trim()),
            profilePicture
        };

        try {
            const response = await axios.post('/register-mobile-user', userData);
            
            // Display success toast
            toast.success('User registered successfully', {
                duration: 4000 
            });
            setName('');
            setEmail('');
            setPassword('');
            setSection('');
            setEducationLevel('');
            setGradeLevel('');
            setHighSchoolYearLevel('');
            setShsStrand('');
            setCollegeCourse('');
            setCollegeYearLevel('');
            setSubjects('');
            setProfilePicture('');
        } catch (error) {
            toast.error(error.response.data.error);
        }
    };

    return (
        <div className="">
            <h2 className='border-b-2 py-1 border-gray-800 text-lg font-semibold'>Student Mobile User Registration</h2>
            <form onSubmit={handleSubmit}>

                <div className="div">

                <div className="flex flex-col text-left m-1">
                <label>
                    Name:
                    <input
                        type="text"
                        className="input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-2xl"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                </div>

                <div className="flex flex-col text-left m-1">
                <label>
                    Email:
                    <input
                        type="email"
                        className="input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-2xl"
                        value={studentemail}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                </div>

                <div className="flex flex-col text-left m-1">
                <label>
                    Password:
                    <input
                        type="password"
                        className="input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-2xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                </div>

                <div className="flex flex-col text-left m-1">
                <label>
                    Section:
                    <input
                        type="text"
                        className="input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-2xl"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                    />
                </label>
                </div>

                </div>



                <div className="flex flex-col text-left m-1">
                <label>
                    Education Level:
                    <select className="select select-accent select-sm w-full max-w-full text-gray-700 bg-white shadow-2xl" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                        <option value="">Select Education Level</option>
                        <option value="Grade School">Grade School</option>
                        <option value="High School">High School</option>
                        <option value="Senior High School">Senior High School</option>
                        <option value="College">College</option>
                    </select>
                </label>
                </div>

                {/* Conditional rendering based on education level */}
                {/* Grade Level input */}
                {educationLevel === "Grade School" && (
                    <div className="flex flex-col text-left m-1">
                    <label>
                        Grade Level:
                        <input
                            type="number"
                            className="input_field"
                            value={gradeLevel}
                            onChange={(e) => setGradeLevel(e.target.value)}
                        />
                    </label>
                    </div>
                )}
                {/* High School Year Level input */}
                {educationLevel === "High School" && (
                    <div className="flex flex-col text-left m-1">
                    <label>
                        High School Year Level:
                        <input
                            type="number"
                            className="input_field"
                            value={highSchoolYearLevel}
                            onChange={(e) => setHighSchoolYearLevel(e.target.value)}
                        />
                    </label>
                    </div>
                )}
                {/* SHS Strand and Senior High School Year Level input */}
                {educationLevel === "Senior High School" && (
                    <div>
                        <div className="flex flex-col text-left m-1">
                        <label>
                            SHS Strand:
                            <input
                                type="text"
                                className="input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-2xl"
                                value={shsStrand}
                                onChange={(e) => setShsStrand(e.target.value)}
                               
                            />
                        </label>
                        </div>

                        <div className="flex flex-col text-left m-1">
                        <label>
                            Senior High School Year Level:
                            <select className="select select-accent select-sm w-full max-w-full text-gray-700 bg-white shadow-2xl" value={highSchoolYearLevel} onChange={(e) => setHighSchoolYearLevel(e.target.value)}>
                                <option value="">Select Year Level</option>
                                <option value="11">Grade 11</option>
                                <option value="12">Grade 12</option>
                            </select>
                        </label>
                        </div>
                    </div>
                )}
                {/* College Course and College Year Level input */}
                {educationLevel === "College" && (
                    <div>

                        <div className="flex flex-col text-left m-1">
                        <label>
                            College Course:
                            <select className="select select-accent select-sm w-full max-w-full text-gray-700 bg-white shadow-2xl       " value={collegeCourse} onChange={(e) => setCollegeCourse(e.target.value)}>
                                <option value="">Select Course</option>
                                <option value="Bachelor of Elementary Education">Bachelor of Elementary Education</option>
                                <option value="Bachelor of Secondary Education Major in English">Bachelor of Secondary Education Major in English</option>
                                <option value="Bachelor of Secondary Education Major in Music">Bachelor of Secondary Education Major in Music</option>
                                <option value="Bachelor of Secondary Education Major in Arts">Bachelor of Secondary Education Major in Arts</option>
                                <option value="Bachelor of Secondary Education Major in Physical Education and Health">Bachelor of Secondary Education Major in Physical Education and Health</option>
                                <option value="Bachelor of Secondary Education Major in Social Studies">Bachelor of Secondary Education Major in Social Studies</option>
                                <option value="Bachelor of Science in Business Administration Major in Marketing Management">Bachelor of Science in Business Administration Major in Marketing Management</option>
                                <option value="Bachelor of Science in Information Technology">Bachelor of Science in Information Technology</option>
                                <option value="Bachelor of Science in Criminology">Bachelor of Science in Criminology</option>
                                <option value="Bachelor of Science in Tourism Management">Bachelor of Science in Tourism Management</option>
                            </select>
                        </label>
                        </div>

                        <div className="flex flex-col text-left m-1">
                        <label>
                            College Year Level:
                            <input
                                type="number"
                                className="input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-2xl"
                                value={collegeYearLevel}
                                onChange={(e) => setCollegeYearLevel(e.target.value)}
                            />
                        </label>
                        </div>
                    </div>
                )}

                <div className="flex flex-col text-left m-1">
                <label>
                    Subjects (comma-separated):
                    <input
                        type="text"
                        className="input input-bordered input-success input-sm w-full text-gray-700 bg-white rounded-md shadow-2xl"
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                    />
                </label>
                </div>

                <div className="flex justify-center">
                    <button type="submit" className='btn btn-success btn-wide btn-sm my-2 '>Register</button>
                </div>
            </form>
        </div>
    );
};

export default StudentMobileUserReg;
