import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Link as LinkIcon, Edit, Tag, Upload, Download } from 'lucide-react';

const CreateProblem = () => {
    const [formData, setFormData] = useState({
        title: '',
        contentType: 'text', // 'text' or 'link'
        content: '',
        externalLink: '',
        platform: '', // codeforces, codechef, leetcode, etc.
        tags: '',
        difficulty: 'Easy',
        sampleInput: '',
        sampleOutput: '',
        timeLimit: '1000', // in milliseconds
        memoryLimit: '256' // in MB
    });
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const platforms = [
        { value: 'codeforces', label: 'Codeforces', color: '#1F8ACB' },
        { value: 'codechef', label: 'CodeChef', color: '#5B4638' },
        { value: 'leetcode', label: 'LeetCode', color: '#FFA116' },
        { value: 'hackerrank', label: 'HackerRank', color: '#1BA94C' },
        { value: 'atcoder', label: 'AtCoder', color: '#000000' },
        { value: 'spoj', label: 'SPOJ', color: '#315192' },
        { value: 'geeksforgeeks', label: 'GeeksforGeeks', color: '#0F9D58' },
        { value: 'other', label: 'Other', color: '#666666' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContentTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            contentType: type,
            content: type === 'link' ? '' : prev.content,
            externalLink: type === 'text' ? '' : prev.externalLink
        }));
    };

    const importFromLink = async () => {
        if (!formData.externalLink.trim()) {
            toast.error('Please enter a valid link');
            return;
        }

        // Basic link validation and platform detection
        const url = formData.externalLink.toLowerCase();
        let detectedPlatform = '';
        
        if (url.includes('codeforces.com')) detectedPlatform = 'codeforces';
        else if (url.includes('codechef.com')) detectedPlatform = 'codechef';
        else if (url.includes('leetcode.com')) detectedPlatform = 'leetcode';
        else if (url.includes('hackerrank.com')) detectedPlatform = 'hackerrank';
        else if (url.includes('atcoder.jp')) detectedPlatform = 'atcoder';
        else if (url.includes('spoj.com')) detectedPlatform = 'spoj';
        else if (url.includes('geeksforgeeks.org')) detectedPlatform = 'geeksforgeeks';

        setFormData(prev => ({
            ...prev,
            platform: detectedPlatform
        }));

        toast.success('Platform detected! Please fill in the problem details manually.');
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
        toast.error('Please login to create a problem');
        navigate('/login');
        return;
    }

    if (!formData.title.trim()) {
        toast.error('Problem title is required');
        return;
    }

    if (formData.contentType === 'text' && !formData.content.trim()) {
        toast.error('Problem content is required');
        return;
    }

    setLoading(true);

    try {
        const problemData = {
            title: formData.title.trim(),
            description: formData.content.trim() || `Simple problem: ${formData.title}`,
            difficulty: formData.difficulty,
            category: formData.category?.trim() || 'General', // Provide default
            tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            
            // Always provide these as arrays/objects (even if empty)
            examples: formData.sampleInput?.trim() && formData.sampleOutput?.trim() ? [{
                input: formData.sampleInput.trim(),
                output: formData.sampleOutput.trim(),
                explanation: 'Sample test case'
            }] : [],
            
            constraints: [],
            starterCode: {},
            testCases: [],
            
            // New fields
            externalLink: formData.contentType === 'link' ? formData.externalLink : undefined,
            platform: formData.platform || undefined,
            isImported: formData.contentType === 'link',
            source: formData.contentType === 'link' ? (formData.platform || 'external') : 'original',
            limits: {
                timeLimit: parseInt(formData.timeLimit) || 1000,
                memoryLimit: parseInt(formData.memoryLimit) || 256
            }
        };

        console.log('Sending problem data:', problemData); // DEBUG

        const response = await api.post('/problems', problemData);
        toast.success('Problem created successfully!');
        navigate('/problems');
    } catch (error) {
        console.error('Create problem error:', error);
        console.error('Error details:', error.response?.data); // DEBUG
        
        if (error.response?.data?.errors) {
            // Show specific validation errors
            const errorMessages = error.response.data.errors.map(err => 
                `${err.field}: ${err.message}`
            ).join('\n');
            toast.error(`Validation errors:\n${errorMessages}`);
        } else {
            toast.error(error.response?.data?.message || 'Failed to create problem');
        }
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="create-problem-page">
            <div className="page-header">
                <button onClick={() => navigate('/problems')} className="back-button">
                    <ArrowLeft size={20} />
                    Back to Problems
                </button>
                <h1>Import Problem</h1>
                <p>Add problems from external coding platforms</p>
            </div>

            <div className="import-problem-container">
                <form onSubmit={handleSubmit} className="import-problem-form">
                    
                    {/* Problem Title */}
                    <div className="form-group">
                        <label htmlFor="title">
                            <Edit size={16} />
                            Problem Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., Two Sum, Maximum Subarray, Binary Search"
                            maxLength={100}
                        />
                    </div>

                    {/* Content Type Selection */}
                    <div className="form-group">
                        <label>Content Type</label>
                        <div className="content-type-tabs">
                            <button
                                type="button"
                                className={`tab-btn ${formData.contentType === 'text' ? 'active' : ''}`}
                                onClick={() => handleContentTypeChange('text')}
                            >
                                <Edit size={16} />
                                Write Content
                            </button>
                            <button
                                type="button"
                                className={`tab-btn ${formData.contentType === 'link' ? 'active' : ''}`}
                                onClick={() => handleContentTypeChange('link')}
                            >
                                <LinkIcon size={16} />
                                External Link
                            </button>
                        </div>
                    </div>

                    {/* Content Input */}
                    {formData.contentType === 'text' ? (
                        <div className="form-group">
                            <label htmlFor="content">Problem Content *</label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                placeholder="Paste or write the problem statement here..."
                                rows={8}
                                required={formData.contentType === 'text'}
                            />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label htmlFor="externalLink">External Link *</label>
                            <div className="link-input-group">
                                <input
                                    type="url"
                                    id="externalLink"
                                    name="externalLink"
                                    value={formData.externalLink}
                                    onChange={handleInputChange}
                                    placeholder="https://codeforces.com/problem/1/A"
                                    required={formData.contentType === 'link'}
                                />
                                <button
                                    type="button"
                                    onClick={importFromLink}
                                    className="import-btn"
                                >
                                    <Download size={16} />
                                    Detect Platform
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Platform Selection */}
                    <div className="form-group">
                        <label htmlFor="platform">
                            <Upload size={16} />
                            Source Platform
                        </label>
                        <select
                            id="platform"
                            name="platform"
                            value={formData.platform}
                            onChange={handleInputChange}
                            className="platform-select"
                        >
                            <option value="">Select Platform</option>
                            {platforms.map(platform => (
                                <option key={platform.value} value={platform.value}>
                                    {platform.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Problem Details */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="difficulty">Difficulty</label>
                            <select
                                id="difficulty"
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleInputChange}
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="tags">
                                <Tag size={16} />
                                Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="array, math, greedy, dp"
                            />
                        </div>
                    </div>

                    {/* Sample Input/Output */}
                    <div className="sample-io-section">
                        <h3>Sample Test Case</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="sampleInput">Sample Input</label>
                                <textarea
                                    id="sampleInput"
                                    name="sampleInput"
                                    value={formData.sampleInput}
                                    onChange={handleInputChange}
                                    placeholder="3 5
1 2 3"
                                    rows={4}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="sampleOutput">Sample Output</label>
                                <textarea
                                    id="sampleOutput"
                                    name="sampleOutput"
                                    value={formData.sampleOutput}
                                    onChange={handleInputChange}
                                    placeholder="6"
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Limits */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="timeLimit">Time Limit (ms)</label>
                            <input
                                type="number"
                                id="timeLimit"
                                name="timeLimit"
                                value={formData.timeLimit}
                                onChange={handleInputChange}
                                min="100"
                                max="10000"
                                step="100"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="memoryLimit">Memory Limit (MB)</label>
                            <input
                                type="number"
                                id="memoryLimit"
                                name="memoryLimit"
                                value={formData.memoryLimit}
                                onChange={handleInputChange}
                                min="64"
                                max="1024"
                                step="64"
                            />
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => navigate('/problems')} 
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || !formData.title.trim()} 
                            className="btn btn-primary"
                        >
                            {loading ? 'Importing...' : 'Import Problem'}
                        </button>
                    </div>
                </form>

                {/* Preview Card */}
                <div className="problem-preview">
                    <h3>Preview</h3>
                    <div className="problem-card preview">
                        <div className="problem-header">
                            <h4>{formData.title || 'Problem Title'}</h4>
                            <span className={`difficulty-badge ${formData.difficulty.toLowerCase()}`}>
                                {formData.difficulty}
                            </span>
                            {formData.platform && (
                                <span className="platform-badge">
                                    {platforms.find(p => p.value === formData.platform)?.label || formData.platform}
                                </span>
                            )}
                        </div>
                        
                        <div className="problem-content">
                            {formData.contentType === 'link' && formData.externalLink && (
                                <p className="external-link">
                                    <LinkIcon size={14} />
                                    <a href={formData.externalLink} target="_blank" rel="noopener noreferrer">
                                        View Original Problem
                                    </a>
                                </p>
                            )}
                            
                            {formData.tags && (
                                <div className="problem-tags">
                                    {formData.tags.split(',').map((tag, index) => 
                                        tag.trim() && (
                                            <span key={index} className="tag">
                                                {tag.trim()}
                                            </span>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProblem;
