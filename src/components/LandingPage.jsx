import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import interviewImage from '../assets/android-chrome-512x512.png';
import sfJobsImage from '../assets/Screenshot 2025-10-19 at 12.14.21 am.png';
import pmJobsImage from '../assets/Screenshot 2025-10-19 at 12.22.52 am.png';
import dsJobsImage from '../assets/Screenshot 2025-10-19 at 12.38.48 am.png';

const LandingPage = () => {
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Mock data for demos - in real app, this would fetch from /api/demos/
    const mockDemos = [
      {
        id: 1,
        title: "Software Engineering Jobs",
        description: "Practice coding and system design questions for software engineering roles"
      },
      {
        id: 2,
        title: "Product Manager Jobs",
        description: "Behavioral and product strategy questions for PM positions"
      },
      {
        id: 3,
        title: "Data Science Jobs",
        description: "Technical and analytical questions for data science roles"
      }
    ];
    
    // If an API base is configured, try fetching real demos; fall back to mock data on failure
    const tryFetch = async () => {
      try {
        const API_BASE = import.meta.env?.VITE_API_BASE_URL;
        if (!API_BASE) throw new Error('no api');
        const res = await fetch(`${API_BASE}/api/demos/`);
        if (!res.ok) throw new Error('bad status');
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          setDemos(data);
          return;
        }
        setDemos(mockDemos);
      } catch (_) {
        setDemos(mockDemos);
      } finally {
        setLoading(false);
      }
    };

    tryFetch();
  }, []);

  const handleStartInterview = (demoId) => {
    navigate(`/resume-upload?demo_id=${demoId}`);
  };

  // Sync active section with ?section= query param (supports deep-linking from other pages)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    const allowed = ['home', 'about', 'programs', 'resources'];
    if (section && allowed.includes(section)) {
      setActiveSection(section);
    }
  }, [location.search]);

  // Helper to navigate and update URL consistently
  const handleNav = (section) => {
    setActiveSection(section);
    navigate(`/?section=${section}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen academic-dark">
      {/* Navigation */}
      <div className="navbar" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 30px', backgroundColor: '#1e1e1e', color: 'white', position: 'relative', zIndex: 50}}>
        <div className="nav-logo" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => handleNav('home')}>
          <span className="logo-text" style={{fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: '700', color: '#d4af37', textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>Mock Me?!</span>
        </div>
        
        <ul className="nav-right" style={{display: 'flex', listStyle: 'none', gap: '20px', marginLeft: 'auto'}}>
          <li><button className="custom-button" style={{backgroundColor: 'transparent', border: '1px solid #4b3832'}} onClick={() => handleNav('about')}>About</button></li>
          <li><button className="custom-button" style={{backgroundColor: 'transparent', border: '1px solid #4b3832'}} onClick={() => handleNav('programs')}>Jobs</button></li>
          <li><button className="custom-button" style={{backgroundColor: 'transparent', border: '1px solid #4b3832'}} onClick={() => handleNav('resources')}>Resources</button></li>
          <li><button className="custom-button" style={{backgroundColor: '#4b3832', border: '1px solid #4b3832'}} onClick={() => navigate('/login')}>Login</button></li>
        </ul>
      </div>

      {/* Header Section */}
      {activeSection === 'home' && (
      <section id="home">
        <header className="header-container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: '#1c1c1c', color: '#e0d5c5', padding: '40px 20px'}}>
          {/* Logo - image only, no outer box */}
          <img 
            src={interviewImage}  
            alt="Professional Interview Scene" 
            style={{
              width: '160px',
              height: '160px',
              objectFit: 'contain',
              marginBottom: '20px'
            }}
          />
          
          <div style={{textAlign: 'center'}}>
            <h1 style={{fontSize: '3rem', marginBottom: '10px', color: '#d4af37'}}>Mock Me?!</h1>
            <p style={{fontSize: '1.1rem', margin: '6px 0 20px', color: '#e0d5c5'}}>Yes! Mock interview me please.</p>
            <h2 style={{fontSize: '1.5rem', marginBottom: '30px', color: '#e0d5c5'}}>Master Your Interview Skills, One Question at a Time!</h2>
          </div>
        
              <div className="header-item" style={{display: 'flex', gap: '20px', justifyContent: 'center'}}>
                <button className="custom-button" onClick={() => handleStartInterview(1)}>Start Practice</button>
                <button className="custom-button" onClick={() => setActiveSection('programs')}>Explore Jobs</button>
              </div>
        </header>

        <div style={{padding: '10px 20px 30px'}}>
          <div className="gold-ornament"></div>
          <div style={{maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(240px, 1fr))', gap: '18px'}}>
            <div className="interview-card" style={{padding: '18px'}}>
              <h3 style={{color: '#d4af37', marginBottom: '8px'}}>Real interview flow</h3>
              <p style={{color: '#e0d5c5'}}>AI asks you questions, transcribes answers, and creates a detailed report.</p>
            </div>
            <div className="interview-card" style={{padding: '18px'}}>
              <h3 style={{color: '#d4af37', marginBottom: '8px'}}>Role‑specific practice</h3>
              <p style={{color: '#e0d5c5'}}>Software, Product, and Data tracks with curated, realistic prompts.</p>
            </div>
            <div className="interview-card" style={{padding: '18px'}}>
              <h3 style={{color: '#d4af37', marginBottom: '8px'}}>Actionable feedback</h3>
              <p style={{color: '#e0d5c5'}}>Strengths, gaps, and next steps—no fluff, just what to improve.</p>
            </div>
          </div>
        </div>

        {/* How it works section removed per request */}

        {/* CTA strip removed per request */}
      </section>
      )}

      {/* About Section */}
      {activeSection === 'about' && (
      <section id="about" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', padding: '40px', backgroundColor: '#1c1c1c'}}>
        <div style={{maxWidth: '600px'}}>
          <h2 style={{color: '#d4af37', marginBottom: '20px'}}>About Our Platform</h2>
          <p style={{color: '#e0d5c5', lineHeight: '1.6', marginBottom: '15px'}}>
            AI Interview Coach brings together cutting-edge artificial intelligence and proven interview techniques to create the ultimate career preparation platform. Our system analyzes your resume and generates personalized questions tailored to your experience level and industry.
          </p>
          <p style={{color: '#e0d5c5', lineHeight: '1.6'}}>
            Whether you're preparing for your first job interview or aiming for executive positions, our platform provides comprehensive practice sessions with instant feedback to help you succeed.
          </p>
          <h2 style={{color: '#d4af37', marginTop: '30px', marginBottom: '10px'}}>What to Expect</h2>
          <h4 style={{color: '#e0d5c5', marginBottom: '20px'}}>Experience the Future of Interview Preparation</h4>
          <ul style={{marginTop: '0', paddingLeft: '20px', color: '#e0d5c5'}}>
            <li style={{marginBottom: '10px'}}><strong>Personalized Questions:</strong> AI-generated questions based on your resume and target role.</li>
            <li style={{marginBottom: '10px'}}><strong>Real-time Feedback:</strong> Instant analysis of your responses with actionable insights.</li>
            <li style={{marginBottom: '10px'}}><strong>Comprehensive Reports:</strong> Detailed performance analytics to track your progress.</li>
          </ul>
        </div>
      </section>
      )}

      {/* What to Expect content moved inside About */}

      {/* Jobs Section */}
      {activeSection === 'programs' && (
      <section id="programs">
        <h2 style={{textAlign: 'center', color: '#d4af37', marginBottom: '40px', fontSize: '2rem'}}>Jobs</h2>
        <div className="event-grid" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', margin: '40px auto', maxWidth: '1000px', padding: '0 20px'}}>
          {demos.map((demo) => (
            <div key={demo.id} className="interview-card">
              <div style={{width: '100%', height: '180px', backgroundColor: '#4b3832', borderRadius: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                {demo.title === 'Software Engineering Jobs' ? (
                  <img src={sfJobsImage} alt="Software Engineering Job Postings" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : demo.title === 'Product Manager Jobs' ? (
                  <img src={pmJobsImage} alt="Product Manager Job Postings" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : demo.title === 'Data Science Jobs' ? (
                  <img src={dsJobsImage} alt="Data Science Job Postings" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <span style={{color: '#f5e6ca', fontSize: '14px'}}>Program Image</span>
                )}
              </div>
              <h3 style={{color: '#d4af37', marginBottom: '10px'}}>{demo.title}</h3>
              <p style={{color: '#e0d5c5', lineHeight: '1.5', marginBottom: '15px'}}>{demo.description}</p>
              <button 
                className="custom-button" 
                onClick={() => handleStartInterview(demo.id)}
                style={{width: '100%'}}
              >
                Search Postings
              </button>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Useful Resources Section */}
      {activeSection === 'resources' && (
      <section id="resources" style={{padding: '40px', backgroundColor: '#1c1c1c'}}>
        <h2 style={{color: '#d4af37', marginBottom: '30px', textAlign: 'center'}}>Useful Resources</h2>
        
        <a className="resource-link" href="https://www.indeed.com/career-advice/interviewing" target="_blank" rel="noopener noreferrer">
          <article>
            <h3>Indeed Career Guide: Interview Tips and Strategies</h3>
            <p>Comprehensive interview preparation guide covering common questions, body language, and follow-up strategies from one of the world's leading job sites.</p>
          </article>
        </a>
        
        <a className="resource-link" href="https://www.glassdoor.com/blog/interview-questions/" target="_blank" rel="noopener noreferrer">
          <article>
            <h3>Glassdoor: Company-Specific Interview Questions</h3>
            <p>Access real interview questions from specific companies and roles, along with insider tips from employees who've been through the process.</p>
          </article>
        </a>

        <a className="resource-link" href="https://www.linkedin.com/learning/paths/develop-your-interviewing-skills" target="_blank" rel="noopener noreferrer">
          <article>
            <h3>LinkedIn Learning: Interview Skills Development</h3>
            <p>Professional courses on interview techniques, including behavioral questions, technical interviews, and executive-level preparation strategies.</p>
          </article>
        </a>

        <a className="resource-link" href="https://www.monster.com/career-advice/article/100-potential-interview-questions" target="_blank" rel="noopener noreferrer">
          <article>
            <h3>Monster: 100 Potential Interview Questions</h3>
            <p>Extensive list of interview questions across different categories, with sample answers and preparation tips for various industries.</p>
          </article>
        </a>

        <a className="resource-link" href="https://www.themuse.com/advice/star-interview-method" target="_blank" rel="noopener noreferrer">
          <article>
            <h3>The Muse: STAR Method for Behavioral Questions</h3>
            <p>Master the STAR method (Situation, Task, Action, Result) for answering behavioral interview questions with compelling, structured responses.</p>
          </article>
        </a>
      </section>
      )}

      {/* Footer */}
      <footer style={{position: 'fixed', bottom: '0', left: '0', width: '100%', backgroundColor: '#4b3832', color: '#f5e6ca', textAlign: 'center', padding: '10px'}}>
        © 2025 Mock Me?!. Professional Interview Preparation Platform
      </footer>
    </div>
  );
};

export default LandingPage;
