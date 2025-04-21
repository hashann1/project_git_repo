import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { IoMdAdd } from "react-icons/io";
import GoogalLogo from './img/glogo.png';
import './user.css';

function UserRegister() {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        phone: '',
        skills: [],
        bio: '', // Added bio field
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // State for previewing the selected image
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [userEnteredCode, setUserEnteredCode] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleAddSkill = () => {
        if (skillInput.trim()) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput] });
            setSkillInput('');
        }
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('profilePictureInput').click();
    };

    const sendVerificationCode = async (email) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('verificationCode', code);
        try {
            await fetch('http://localhost:8080/sendVerificationCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
        } catch (error) {
            console.error('Error sending verification code:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = true;

        if (!formData.email) {
            alert("Email is required");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            alert("Email is invalid");
            isValid = false;
        }

        if (!profilePicture) {
            alert("Profile picture is required");
            isValid = false;
        }
        if (formData.skills.length < 2) {
            alert("Please add at least two skills.");
            isValid = false;
        }
        if (!isValid) {
            return; // Stop execution if validation fails
        }

        try {
            // Step 1: Create the user
            const response = await fetch('http://localhost:8080/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullname: formData.fullname,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    skills: formData.skills,
                    bio: formData.bio, // Include bio in the request
                }),
            });

            if (response.ok) {
                const userId = (await response.json()).id; // Get the user ID from the response

                // Step 2: Upload the profile picture
                if (profilePicture) {
                    const profileFormData = new FormData();
                    profileFormData.append('file', profilePicture);
                    await fetch(`http://localhost:8080/user/${userId}/uploadProfilePicture`, {
                        method: 'PUT',
                        body: profileFormData,
                    });
                }

                sendVerificationCode(formData.email); // Send verification code
                setIsVerificationModalOpen(true); // Open verification modal
            } else if (response.status === 409) {
                alert('Email already exists!');
            } else {
                alert('Failed to register user.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleVerifyCode = () => {
        const savedCode = localStorage.getItem('verificationCode');
        if (userEnteredCode === savedCode) {
            alert('Verification successful!');
            localStorage.removeItem('verificationCode');
            window.location.href = '/';
        } else {
            alert('Invalid verification code. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-left">
                    <div className="auth-overlay">
                        <h1>Create Account</h1>
                        <p>Join our community today</p>
                    </div>
                </div>
                <div className="auth-right">
                    <div className="auth-box">
                        <h2>Sign Up</h2>
                        <p className="auth-subtitle">Please fill in your details</p>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label>Profile Picture</label>
                                <div className="profile-upload" onClick={triggerFileInput}>
                                    {previewImage ? (
                                        <img 
                                            src={previewImage} 
                                            alt="Selected Profile" 
                                            className="preview-image" 
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <FaUserCircle 
                                            className="profile-icon" 
                                            style={{ width: '100px', height: '100px' }}
                                        />
                                    )}
                                </div>
                                <input
                                    id="profilePictureInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullname"
                                    className="form-control"
                                    placeholder="Enter your full name"
                                    value={formData.fullname}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className="form-control"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const re = /^[0-9\b]{0,10}$/;
                                        if (re.test(e.target.value)) {
                                            handleInputChange(e);
                                        }
                                    }}
                                    maxLength="10"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Skills</label>
                                <div className="skills-container">
                                    <div className="skills-input">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Add a skill"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                        />
                                        <IoMdAdd onClick={handleAddSkill} className="add-skill-btn" />
                                    </div>
                                    <div className="skills-list">
                                        {formData.skills.map((skill, index) => (
                                            <span key={index} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    className="form-control"
                                    placeholder="Tell us about yourself"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={3}
                                    required
                                />
                            </div>

                            <button type="submit" className="auth-button">
                                Sign Up
                            </button>

                            <div className="auth-divider">
                                <span>or continue with</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                                className="google-button"
                            >
                                <img src={GoogalLogo} alt="Google" className="google-icon" />
                                Google
                            </button>

                            <p className="auth-footer">
                                Already have an account?{' '}
                                <span onClick={() => window.location.href = '/'} className="auth-link">
                                    Sign in
                                </span>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            {isVerificationModalOpen && (
                <div className="verification-modal">
                    <div className="modal-content">
                        <h3>Verify Your Email</h3>
                        <p>Please enter the verification code sent to your email.</p>
                        <input
                            type="text"
                            value={userEnteredCode}
                            onChange={(e) => setUserEnteredCode(e.target.value)}
                            placeholder="Enter verification code"
                            className="form-control"
                        />
                        <button onClick={handleVerifyCode} className="auth-button">
                            Verify
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserRegister;
