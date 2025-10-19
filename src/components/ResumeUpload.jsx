import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const demoId = searchParams.get('demo_id');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file (.png, .jpg, .jpeg)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('demo_id', demoId);

      // Mock API call - in real app, this would call POST /api/upload-resume/
      // For now, we'll simulate the API call and generate mock questions
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Mock questions based on demo type
      const mockQuestions = getMockQuestions(demoId);
      
      // Store questions in localStorage for the interview page
      localStorage.setItem('interviewQuestions', JSON.stringify(mockQuestions));
      localStorage.setItem('demoId', demoId);
      
      // Navigate to interview page
      navigate('/interview');
    } catch (err) {
      setError('Failed to upload resume. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const getMockQuestions = (demoId) => {
    const questionSets = {
      '1': [ // Software Engineering
        { type: 'behavioral', text: 'Tell me about a time you had to debug a complex issue in production.' },
        { type: 'behavioral', text: 'Describe a situation where you had to work with a difficult team member.' },
        { type: 'behavioral', text: 'Tell me about a project where you had to learn a new technology quickly.' },
        { type: 'technical', text: 'How would you design a URL shortener service like bit.ly?' },
        { type: 'technical', text: 'Explain how you would implement a caching layer for a web application.' }
      ],
      '2': [ // Product Manager
        { type: 'behavioral', text: 'Tell me about a time you had to prioritize features with limited resources.' },
        { type: 'behavioral', text: 'Describe a situation where you had to convince stakeholders of a product decision.' },
        { type: 'behavioral', text: 'Tell me about a product launch that didn\'t go as planned.' },
        { type: 'technical', text: 'How would you design a recommendation system for an e-commerce platform?' },
        { type: 'technical', text: 'Explain your approach to A/B testing a new feature.' }
      ],
      '3': [ // Data Science
        { type: 'behavioral', text: 'Tell me about a time you had to explain complex data insights to non-technical stakeholders.' },
        { type: 'behavioral', text: 'Describe a project where you had to work with messy or incomplete data.' },
        { type: 'behavioral', text: 'Tell me about a time you had to validate the accuracy of a machine learning model.' },
        { type: 'technical', text: 'How would you design a real-time fraud detection system?' },
        { type: 'technical', text: 'Explain your approach to feature engineering for a classification problem.' }
      ]
    };
    
    return questionSets[demoId] || questionSets['1'];
  };

  return (
    <div className="min-h-screen academic-dark">
      {/* Navigation */}
      <div className="navbar" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 30px', backgroundColor: '#1e1e1e', color: 'white', position: 'relative'}}>
        <div className="nav-logo" style={{display: 'flex', alignItems: 'center', position: 'absolute', left: '10%', cursor: 'pointer'}} onClick={() => navigate('/?section=home')}>
          <span className="logo-text" style={{fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: '700', color: '#d4af37', textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>Mock Me?!</span>
        </div>
        
        <ul className="nav-right" style={{display: 'flex', listStyle: 'none', gap: '20px', marginLeft: 'auto'}}>
          <li><button className="custom-button" style={{backgroundColor: 'transparent', border: '1px solid #4b3832'}} onClick={() => navigate('/?section=about')}>About</button></li>
          <li><button className="custom-button" style={{backgroundColor: 'transparent', border: '1px solid #4b3832'}} onClick={() => navigate('/?section=programs')}>Jobs</button></li>
          <li><button className="custom-button" style={{backgroundColor: 'transparent', border: '1px solid #4b3832'}} onClick={() => navigate('/?section=resources')}>Resources</button></li>
        </ul>
      </div>

      {/* Header Section */}
      <section id="home">
        <header className="header-container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: '#1c1c1c', color: '#e0d5c5', padding: '40px 20px'}}>
          <h1 style={{fontSize: '3rem', marginBottom: '10px', color: '#d4af37'}}>Resume Analysis</h1>
          <h2 style={{fontSize: '1.5rem', marginBottom: '30px', color: '#e0d5c5'}}>Upload Your Resume to Get Started</h2>
        </header>
      </section>

      {/* About Section */}
      <section id="about" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', padding: '40px', backgroundColor: '#1c1c1c'}}>
        <div style={{maxWidth: '600px'}}>
          <h2 style={{color: '#d4af37', marginBottom: '20px'}}>Document Submission Guidelines</h2>
          <p style={{color: '#e0d5c5', lineHeight: '1.6', marginBottom: '15px'}}>
            Please upload a clear, high-resolution image of your resume. Our AI system will analyze your 
            professional background, skills, and experience to generate personalized interview questions 
            tailored to your career level and industry.
          </p>
          <p style={{color: '#e0d5c5', lineHeight: '1.6'}}>
            Ensure your document is well-lit, clearly readable, and in a supported format for the best results.
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" style={{padding: '40px', backgroundColor: '#1c1c1c'}}>
        <div style={{maxWidth: '600px', margin: '0 auto'}}>
          <h2 style={{textAlign: 'center', color: '#d4af37', marginBottom: '30px', fontSize: '2rem'}}>Upload Your Resume</h2>
          
          <div className="interview-card" style={{margin: '0 auto', maxWidth: '500px'}}>
            <div style={{border: '2px dashed #4b3832', borderRadius: '12px', padding: '40px', textAlign: 'center', marginBottom: '20px'}}>
              <div style={{width: '60px', height: '60px', backgroundColor: '#4b3832', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
                <svg style={{width: '30px', height: '30px', color: '#f5e6ca'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <label htmlFor="file-upload" style={{cursor: 'pointer', display: 'block'}}>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#d4af37', display: 'block', marginBottom: '10px'}}>Select Document</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  style={{display: 'none'}}
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
              <p style={{color: '#e0d5c5', marginBottom: '5px'}}>Click to browse or drag and drop your resume</p>
              <p style={{color: '#e0d5c5', fontSize: '0.9rem'}}>Supported formats: PNG, JPG, JPEG (Max 10MB)</p>
            </div>

            {file && (
              <div style={{backgroundColor: '#2a4a2a', border: '1px solid #4a6a4a', borderRadius: '8px', padding: '15px', marginBottom: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <div style={{width: '20px', height: '20px', backgroundColor: '#4a6a4a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px'}}>
                    <span style={{color: '#e0d5c5', fontSize: '12px'}}>✓</span>
                  </div>
                  <div>
                    <p style={{fontWeight: 'bold', color: '#e0d5c5', margin: '0'}}>Document Selected: {file.name}</p>
                    <p style={{color: '#e0d5c5', fontSize: '0.9rem', margin: '0'}}>File size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{backgroundColor: '#4a2a2a', border: '1px solid #6a4a4a', borderRadius: '8px', padding: '15px', marginBottom: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <div style={{width: '20px', height: '20px', backgroundColor: '#6a4a4a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px'}}>
                    <span style={{color: '#e0d5c5', fontSize: '12px'}}>✗</span>
                  </div>
                  <p style={{fontWeight: 'bold', color: '#e0d5c5', margin: '0'}}>{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="custom-button"
              style={{width: '100%', fontSize: '16px', padding: '12px'}}
            >
              {uploading ? (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{width: '20px', height: '20px', border: '2px solid #f5e6ca', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '10px'}}></div>
                  Processing Document...
                </div>
              ) : (
                'Analyze Resume & Generate Questions'
              )}
            </button>
          </div>

          <div style={{textAlign: 'center', marginTop: '20px'}}>
            <button 
              className="custom-button" 
              onClick={() => navigate('/?section=programs')}
              style={{backgroundColor: '#2a2a2a', border: '1px solid #4b3832'}}
            >
              ← Return to Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{position: 'fixed', bottom: '0', left: '0', width: '100%', backgroundColor: '#4b3832', color: '#f5e6ca', textAlign: 'center', padding: '10px'}}>
        © 2025 Mock Me?!. Professional Interview Preparation Platform
      </footer>
    </div>
  );
};

export default ResumeUpload;
