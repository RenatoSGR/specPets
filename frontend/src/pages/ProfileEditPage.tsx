import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSitterById, updateSitterProfile, updateSitterServices, type PetSitter, type Service } from '../data/sitterService';
import './ProfileEditPage.css';

const DEMO_SITTER_ID = 1; // For demo purposes

interface ProfileFormData {
  name: string;
  phone: string;
  bio: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  hourlyRate: number;
  petTypesAccepted: string[];
  skills: string[];
}

interface ServiceFormData {
  id?: number;
  name: string;
  description: string;
  price: number;
  priceUnit: string;
  petTypesSupported: string[];
}

/**
 * ProfileEditPage Component
 * Allows sitters to edit their profile information
 */
export default function ProfileEditPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    phone: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    hourlyRate: 0,
    petTypesAccepted: [],
    skills: []
  });

  const [services, setServices] = useState<ServiceFormData[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newPetType, setNewPetType] = useState('');

  const availablePetTypes = ['Dogs', 'Cats', 'Birds', 'Reptiles', 'Small Animals', 'Fish'];
  const availableSkills = ['CPR Certified', 'Pet First Aid', 'Grooming', 'Training', 'Medication Administration', 'Special Needs Care'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const sitter = await getSitterById(DEMO_SITTER_ID);
      
      setProfileData({
        name: sitter.name,
        phone: sitter.phone || '',
        bio: sitter.bio || '',
        address: sitter.address || '',
        city: sitter.city || '',
        state: sitter.state || '',
        zipCode: sitter.zipCode || '',
        hourlyRate: sitter.hourlyRate || 0,
        petTypesAccepted: sitter.petTypesAccepted || [],
        skills: sitter.skills || []
      });

      if (sitter.services) {
        setServices(sitter.services.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          price: s.price,
          priceUnit: s.priceUnit,
          petTypesSupported: s.petTypesSupported || []
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: keyof ProfileFormData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill && !profileData.skills.includes(newSkill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleTogglePetType = (petType: string) => {
    setProfileData(prev => ({
      ...prev,
      petTypesAccepted: prev.petTypesAccepted.includes(petType)
        ? prev.petTypesAccepted.filter(p => p !== petType)
        : [...prev.petTypesAccepted, petType]
    }));
  };

  const handleServiceChange = (index: number, field: keyof ServiceFormData, value: any) => {
    setServices(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddService = () => {
    setServices(prev => [...prev, {
      name: '',
      description: '',
      price: 0,
      priceUnit: 'per hour',
      petTypesSupported: []
    }]);
  };

  const handleRemoveService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (profileData.bio && profileData.bio.length < 50) {
      setError('Bio must be at least 50 characters long');
      setSaving(false);
      return;
    }

    if (!profileData.name || !profileData.city || !profileData.state) {
      setError('Name, city, and state are required');
      setSaving(false);
      return;
    }

    try {
      // Update profile
      await updateSitterProfile(DEMO_SITTER_ID, profileData);

      // Update services
      if (services.length > 0) {
        await updateSitterServices(DEMO_SITTER_ID, services);
      }

      setSuccess('Profile updated successfully!');
      
      // Reload to show updated data
      setTimeout(() => {
        loadProfile();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-edit-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-edit-page">
      <div className="profile-edit-header">
        <h1>Edit Profile</h1>
        <button onClick={() => navigate('/profile')} className="btn btn-secondary">
          Cancel
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Basic Information */}
      <section className="profile-section">
        <h2>Basic Information</h2>
        
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => handleProfileChange('name', e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleProfileChange('phone', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Bio (minimum 50 characters)</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleProfileChange('bio', e.target.value)}
            className="form-textarea"
            rows={6}
            placeholder="Tell pet owners about yourself, your experience with pets, and why you're passionate about pet sitting..."
          />
          <small className="form-hint">
            {profileData.bio.length} / 50 characters minimum
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => handleProfileChange('address', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              value={profileData.city}
              onChange={(e) => handleProfileChange('city', e.target.value)}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              value={profileData.state}
              onChange={(e) => handleProfileChange('state', e.target.value)}
              className="form-input"
              maxLength={2}
              required
            />
          </div>

          <div className="form-group">
            <label>Zip Code</label>
            <input
              type="text"
              value={profileData.zipCode}
              onChange={(e) => handleProfileChange('zipCode', e.target.value)}
              className="form-input"
              maxLength={5}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Hourly Rate ($)</label>
          <input
            type="number"
            value={profileData.hourlyRate}
            onChange={(e) => handleProfileChange('hourlyRate', parseFloat(e.target.value))}
            className="form-input"
            min="0"
            step="0.01"
          />
        </div>
      </section>

      {/* Pet Types */}
      <section className="profile-section">
        <h2>Pet Types Accepted</h2>
        <div className="checkbox-group">
          {availablePetTypes.map(petType => (
            <label key={petType} className="checkbox-label">
              <input
                type="checkbox"
                checked={profileData.petTypesAccepted.includes(petType)}
                onChange={() => handleTogglePetType(petType)}
              />
              {petType}
            </label>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="profile-section">
        <h2>Skills & Certifications</h2>
        
        <div className="skills-input">
          <select
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="form-select"
          >
            <option value="">Select a skill...</option>
            {availableSkills
              .filter(skill => !profileData.skills.includes(skill))
              .map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
          </select>
          <button onClick={handleAddSkill} className="btn btn-secondary" disabled={!newSkill}>
            Add Skill
          </button>
        </div>

        <div className="skills-list">
          {profileData.skills.map(skill => (
            <div key={skill} className="skill-tag">
              {skill}
              <button onClick={() => handleRemoveSkill(skill)} className="skill-remove">×</button>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="profile-section">
        <h2>Services Offered</h2>
        
        {services.map((service, index) => (
          <div key={index} className="service-form">
            <div className="service-form-header">
              <h3>Service {index + 1}</h3>
              <button onClick={() => handleRemoveService(index)} className="btn btn-danger-sm">
                Remove
              </button>
            </div>

            <div className="form-group">
              <label>Service Name *</label>
              <input
                type="text"
                value={service.name}
                onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                className="form-input"
                placeholder="e.g., Dog Walking, Overnight Care"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={service.description}
                onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                className="form-textarea"
                rows={3}
                placeholder="Describe what this service includes..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
                  className="form-input"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price Unit *</label>
                <select
                  value={service.priceUnit}
                  onChange={(e) => handleServiceChange(index, 'priceUnit', e.target.value)}
                  className="form-select"
                >
                  <option value="per hour">per hour</option>
                  <option value="per day">per day</option>
                  <option value="per visit">per visit</option>
                  <option value="per night">per night</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Supported Pet Types</label>
              <div className="checkbox-group">
                {availablePetTypes.map(petType => (
                  <label key={petType} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={service.petTypesSupported.includes(petType)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...service.petTypesSupported, petType]
                          : service.petTypesSupported.filter(p => p !== petType);
                        handleServiceChange(index, 'petTypesSupported', updated);
                      }}
                    />
                    {petType}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}

        <button onClick={handleAddService} className="btn btn-secondary">
          + Add Service
        </button>
      </section>

      {/* Save Button */}
      <div className="profile-actions">
        <button 
          onClick={handleSaveProfile} 
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
