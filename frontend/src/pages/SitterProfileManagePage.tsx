import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSitterById, updateSitterProfile, updateSitterServices, type PetSitter } from '../data/sitterService';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import PhotoUpload from '../components/PhotoUpload';
import './SitterProfileManagePage.css';

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

type ActiveTab = 'profile' | 'services' | 'availability' | 'photos';

/**
 * SitterProfileManagePage Component
 * Comprehensive profile management for pet sitters
 * Combines profile editing, service management, availability calendar, and photo uploads
 */
export default function SitterProfileManagePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [sitter, setSitter] = useState<PetSitter | null>(null);
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

  const availablePetTypes = ['Dogs', 'Cats', 'Birds', 'Reptiles', 'Small Animals', 'Fish'];
  const availableSkills = ['CPR Certified', 'Pet First Aid', 'Grooming', 'Training', 'Medication Administration', 'Special Needs Care'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const sitterData = await getSitterById(DEMO_SITTER_ID);
      setSitter(sitterData);
      
      setProfileData({
        name: sitterData.name,
        phone: sitterData.phone || '',
        bio: sitterData.bio || '',
        address: sitterData.address || '',
        city: sitterData.city || '',
        state: sitterData.state || '',
        zipCode: sitterData.zipCode || '',
        hourlyRate: sitterData.hourlyRate || 0,
        petTypesAccepted: sitterData.petTypesAccepted || [],
        skills: sitterData.skills || []
      });

      if (sitterData.services) {
        setServices(sitterData.services.map(s => ({
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

  const handleTogglePetType = (petType: string) => {
    setProfileData(prev => ({
      ...prev,
      petTypesAccepted: prev.petTypesAccepted.includes(petType)
        ? prev.petTypesAccepted.filter(p => p !== petType)
        : [...prev.petTypesAccepted, petType]
    }));
  };

  const handleAddSkill = (skill: string) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
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
      await updateSitterProfile(DEMO_SITTER_ID, profileData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveServices = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Validation
    for (const service of services) {
      if (!service.name || service.price <= 0) {
        setError('All services must have a name and price greater than 0');
        setSaving(false);
        return;
      }
    }

    try {
      await updateSitterServices(DEMO_SITTER_ID, services);
      setSuccess('Services updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update services');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotosUpdated = (newPhotos: string[]) => {
    if (sitter) {
      setSitter({ ...sitter, photos: newPhotos });
    }
    setSuccess('Photos updated successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  if (loading) {
    return (
      <div className="sitter-profile-manage-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="sitter-profile-manage-page">
      <div className="page-header">
        <h1>Manage Your Profile</h1>
        <button onClick={() => navigate('/profile')} className="btn btn-secondary">
          View Public Profile
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Info
        </button>
        <button
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Services ({services.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`}
          onClick={() => setActiveTab('availability')}
        >
          Availability
        </button>
        <button
          className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
          onClick={() => setActiveTab('photos')}
        >
          Photos ({sitter?.photos.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <section className="form-section">
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
                  onChange={(e) => handleProfileChange('hourlyRate', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </section>

            <section className="form-section">
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

            <section className="form-section">
              <h2>Skills & Certifications</h2>
              
              <select
                onChange={(e) => {
                  handleAddSkill(e.target.value);
                  e.target.value = '';
                }}
                className="form-select"
              >
                <option value="">Select a skill to add...</option>
                {availableSkills
                  .filter(skill => !profileData.skills.includes(skill))
                  .map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
              </select>

              <div className="skills-list">
                {profileData.skills.map(skill => (
                  <div key={skill} className="skill-tag">
                    {skill}
                    <button onClick={() => handleRemoveSkill(skill)} className="skill-remove">×</button>
                  </div>
                ))}
              </div>
            </section>

            <div className="form-actions">
              <button onClick={handleSaveProfile} className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="services-tab">
            <div className="services-header">
              <p>Add and manage the services you offer to pet owners.</p>
              <button onClick={handleAddService} className="btn btn-secondary">
                + Add Service
              </button>
            </div>

            {services.map((service, index) => (
              <div key={index} className="service-form">
                <div className="service-form-header">
                  <h3>Service {index + 1}</h3>
                  <button onClick={() => handleRemoveService(index)} className="btn-danger-sm">
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
                      onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value) || 0)}
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

            {services.length === 0 && (
              <div className="empty-state">
                <p>No services added yet. Click "Add Service" to get started!</p>
              </div>
            )}

            <div className="form-actions">
              <button onClick={handleSaveServices} className="btn btn-primary" disabled={saving || services.length === 0}>
                {saving ? 'Saving...' : 'Save Services'}
              </button>
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="availability-tab">
            <AvailabilityCalendar sitterId={DEMO_SITTER_ID} />
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="photos-tab">
            <PhotoUpload
              sitterId={DEMO_SITTER_ID}
              currentPhotos={sitter?.photos || []}
              onPhotosUpdated={handlePhotosUpdated}
            />
          </div>
        )}
      </div>
    </div>
  );
}
