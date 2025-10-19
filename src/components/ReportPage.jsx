import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportPage = () => {
  const [answers, setAnswers] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load answers from localStorage
    const storedAnswers = localStorage.getItem('interviewAnswers');
    if (storedAnswers) {
      setAnswers(JSON.parse(storedAnswers));
      generateAnalysis(JSON.parse(storedAnswers));
    } else {
      // If no answers found, redirect to landing page
      navigate('/');
    }
  }, [navigate]);

  const generateAnalysis = async (answersData) => {
    try {
      // Try backend if configured, fallback to mock
      const API_BASE = import.meta.env?.VITE_API_BASE_URL;
      if (API_BASE) {
        const res = await fetch(`${API_BASE}/api/analyze/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: answersData })
        });
        if (res.ok) {
          const data = await res.json();
          setAnalysis(data);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1200));
          setAnalysis(generateMockAnalysis(answersData));
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1200));
        setAnalysis(generateMockAnalysis(answersData));
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      alert('Failed to generate analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalysis = (answersData) => {
    const results = Object.values(answersData).map((answer, index) => {
      const answerLength = answer.answer.length;
      const hasStructure = answer.answer.toLowerCase().includes('situation') || 
                          answer.answer.toLowerCase().includes('task') ||
                          answer.answer.toLowerCase().includes('action') ||
                          answer.answer.toLowerCase().includes('result');
      
      // Generate scores based on answer quality
      let verbalScore = Math.min(10, Math.max(1, Math.floor(answerLength / 50) + (hasStructure ? 2 : 0)));
      let designScore = null;
      let feedback = '';

      if (answer.type === 'behavioral') {
        if (verbalScore >= 8) {
          feedback = 'Excellent use of the STAR method. Your response is well-structured and provides specific examples.';
        } else if (verbalScore >= 6) {
          feedback = 'Good response with clear examples. Consider using the STAR method more consistently for better structure.';
        } else {
          feedback = 'Your response needs more structure. Try using the STAR method (Situation, Task, Action, Result) to organize your thoughts.';
        }
      } else {
        // Technical question
        designScore = Math.min(10, Math.max(1, Math.floor(answerLength / 100) + (answer.answer.toLowerCase().includes('scalability') ? 2 : 0)));
        if (designScore >= 8) {
          feedback = 'Outstanding technical approach! You considered scalability, performance, and trade-offs effectively.';
        } else if (designScore >= 6) {
          feedback = 'Good technical thinking. Consider discussing more about scalability and edge cases.';
        } else {
          feedback = 'Your technical approach needs more depth. Consider discussing scalability, performance, and potential trade-offs.';
        }
      }

      return {
        question: answer.question,
        verbal_score: verbalScore,
        design_score: designScore,
        feedback: feedback,
        type: answer.type
      };
    });

    // Calculate overall scores
    const verbalScores = results.map(r => r.verbal_score).filter(s => s !== null);
    const designScores = results.map(r => r.design_score).filter(s => s !== null);
    
    const overallVerbalScore = verbalScores.length > 0 
      ? Math.round(verbalScores.reduce((a, b) => a + b, 0) / verbalScores.length * 10) / 10
      : 0;
    
    const overallDesignScore = designScores.length > 0 
      ? Math.round(designScores.reduce((a, b) => a + b, 0) / designScores.length * 10) / 10
      : 0;

    return {
      results,
      overall_scores: {
        verbal: overallVerbalScore,
        design: overallDesignScore
      }
    };
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen academic-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-academic-gold mx-auto mb-6"></div>
          <h2 style={{fontSize: '2rem', marginBottom: '20px', color: '#d4af37'}}>Generating Assessment Report</h2>
          <p style={{color: '#e0d5c5', fontSize: '1.1rem'}}>AI is conducting comprehensive analysis of your responses...</p>
        </div>
      </div>
    );
  }

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
          <li><button className="custom-button" style={{backgroundColor: '#4b3832', border: '1px solid #4b3832'}} onClick={() => navigate('/login')}>Login</button></li>
        </ul>
      </div>

      {/* Header Section */}
      <section id="home">
        <header className="header-container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: '#1c1c1c', color: '#e0d5c5', padding: '40px 20px'}}>
          <h1 style={{fontSize: '3rem', marginBottom: '10px', color: '#d4af37'}}>Assessment Report</h1>
          <h2 style={{fontSize: '1.5rem', marginBottom: '30px', color: '#e0d5c5'}}>Comprehensive Analysis of Your Performance</h2>
        </header>
      </section>

      {/* Executive Summary Section */}
      <section id="summary" style={{padding: '40px', backgroundColor: '#1c1c1c'}}>
        <div style={{maxWidth: '1400px', margin: '0 auto'}}>
          <div className="interview-card" style={{margin: '0 auto', maxWidth: '1280px', textAlign: 'center', width: '100%'}}>
            <h2 style={{color: '#d4af37', fontSize: '2rem', marginBottom: '30px'}}>Performance Summary</h2>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(420px, 1fr))', gap: '28px', marginBottom: '24px', justifyItems: 'center'}}>
              <div style={{padding: '16px', border: '1px solid #4b3832', borderRadius: '10px', boxSizing: 'border-box', wordBreak: 'break-word', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%'}}>
                <h3 style={{color: '#d4af37', fontSize: '1.2rem', marginBottom: '10px'}}>Communication Excellence</h3>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px'}}>
                  <div style={{
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold',
                    backgroundColor: analysis.overall_scores.verbal >= 8 ? '#2a4a2a' : analysis.overall_scores.verbal >= 6 ? '#4a4a2a' : '#4a2a2a',
                    color: '#e0d5c5'
                  }}>
                    {analysis.overall_scores.verbal}
                  </div>
                </div>
                <p style={{color: '#e0d5c5', fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '4px'}}>out of 10</p>
                <p style={{color: '#d4af37', fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '8px'}}>{getScoreLabel(analysis.overall_scores.verbal)}</p>
                <p style={{color: '#e0d5c5', fontSize: '0.9rem', lineHeight: '1.4', textAlign: 'center'}}>
                  Your ability to articulate thoughts clearly and structure responses effectively
                </p>
              </div>

              <div style={{padding: '16px', border: '1px solid #4b3832', borderRadius: '10px', boxSizing: 'border-box', wordBreak: 'word-break', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%'}}>
                <h3 style={{color: '#d4af37', fontSize: '1.2rem', marginBottom: '10px'}}>Technical Proficiency</h3>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px'}}>
                  <div style={{
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold',
                    backgroundColor: analysis.overall_scores.design >= 8 ? '#2a4a2a' : analysis.overall_scores.design >= 6 ? '#4a4a2a' : '#4a2a2a',
                    color: '#e0d5c5'
                  }}>
                    {analysis.overall_scores.design}
                  </div>
                </div>
                <p style={{color: '#e0d5c5', fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '4px'}}>out of 10</p>
                <p style={{color: '#d4af37', fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '8px'}}>{getScoreLabel(analysis.overall_scores.design)}</p>
                <p style={{color: '#e0d5c5', fontSize: '0.9rem', lineHeight: '1.4', textAlign: 'center'}}>
                  Your technical problem-solving and system design capabilities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Results Section */}
      <section id="results" style={{padding: '40px', backgroundColor: '#1c1c1c'}}>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <h2 style={{textAlign: 'center', color: '#d4af37', marginBottom: '30px', fontSize: '2rem'}}>Detailed Performance Analysis</h2>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center'}}>
            {analysis.results.map((result, index) => (
              <div key={index} className="interview-card" style={{margin: '0 auto', maxWidth: '800px', textAlign: 'center', width: '100%'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', gap: '12px'}}>
                  <div style={{width: '40px', height: '40px', backgroundColor: '#4b3832', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0'}}>
                    <span style={{color: '#f5e6ca', fontWeight: 'bold', fontSize: '16px'}}>{index + 1}</span>
                  </div>
                  <div style={{flex: '0 1 auto'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px'}}>
                      <span style={{
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        backgroundColor: result.type === 'behavioral' ? '#2a4a2a' : '#2a2a4a',
                        color: '#e0d5c5',
                        marginRight: '0'
                      }}>
                        {result.type === 'behavioral' ? 'Behavioral' : 'Technical'}
                      </span>
                    </div>
                    <h3 style={{color: '#d4af37', fontSize: '1.2rem', marginBottom: '15px', lineHeight: '1.4'}}>
                      {result.question}
                    </h3>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: result.design_score ? 'repeat(2, 1fr)' : '1fr',
                  gap: '20px',
                  marginBottom: '20px',
                  justifyItems: 'center'
                }}>
                  <div style={{padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px', textAlign: 'center'}}>
                    <h4 style={{color: '#d4af37', fontSize: '1rem', marginBottom: '10px'}}>Communication Score</h4>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px'}}>
                      <div style={{
                        width: '50px', 
                        height: '50px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        backgroundColor: result.verbal_score >= 8 ? '#2a4a2a' : result.verbal_score >= 6 ? '#4a4a2a' : '#4a2a2a',
                        color: '#e0d5c5'
                      }}>
                        {result.verbal_score}
                      </div>
                    </div>
                    <p style={{color: '#e0d5c5', fontSize: '0.9rem', marginBottom: '5px'}}>out of 10</p>
                    <p style={{color: '#d4af37', fontSize: '0.9rem', fontWeight: 'bold'}}>{getScoreLabel(result.verbal_score)}</p>
                  </div>
                  
                  {result.design_score && (
                    <div style={{padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px', textAlign: 'center'}}>
                      <h4 style={{color: '#d4af37', fontSize: '1rem', marginBottom: '10px'}}>Technical Score</h4>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px'}}>
                        <div style={{
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '1.2rem', 
                          fontWeight: 'bold',
                          backgroundColor: result.design_score >= 8 ? '#2a4a2a' : result.design_score >= 6 ? '#4a4a2a' : '#4a2a2a',
                          color: '#e0d5c5'
                        }}>
                          {result.design_score}
                        </div>
                      </div>
                      <p style={{color: '#e0d5c5', fontSize: '0.9rem', marginBottom: '5px'}}>out of 10</p>
                      <p style={{color: '#d4af37', fontSize: '0.9rem', fontWeight: 'bold'}}>{getScoreLabel(result.design_score)}</p>
                    </div>
                  )}
                </div>

                <div style={{backgroundColor: '#4b3832', padding: '20px', borderRadius: '8px'}}>
                  <h4 style={{color: '#d4af37', fontSize: '1.1rem', marginBottom: '10px', fontWeight: 'bold'}}>Feedback</h4>
                  <p style={{color: '#e0d5c5', lineHeight: '1.5'}}>{result.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendations Section */}
      <section id="recommendations" style={{padding: '40px', backgroundColor: '#1c1c1c'}}>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <h2 style={{textAlign: 'center', color: '#d4af37', marginBottom: '30px', fontSize: '2rem'}}>Development Recommendations</h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', marginBottom: '30px'}}>
            <div className="interview-card" style={{margin: '0 auto', maxWidth: '350px'}}>
              <h3 style={{color: '#d4af37', fontSize: '1.3rem', marginBottom: '20px'}}>Communication Excellence</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <div style={{display: 'flex', alignItems: 'flex-start'}}>
                  <div style={{width: '20px', height: '20px', backgroundColor: '#4b3832', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', marginTop: '2px', flexShrink: '0'}}>
                    <span style={{color: '#f5e6ca', fontSize: '12px', fontWeight: 'bold'}}>1</span>
                  </div>
                  <div>
                    <p style={{color: '#d4af37', fontWeight: 'bold', marginBottom: '5px'}}>Master the STAR Method</p>
                    <p style={{color: '#e0d5c5', fontSize: '0.9rem', lineHeight: '1.4'}}>Structure responses with Situation, Task, Action, and Result for maximum impact</p>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'flex-start'}}>
                  <div style={{width: '20px', height: '20px', backgroundColor: '#4b3832', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', marginTop: '2px', flexShrink: '0'}}>
                    <span style={{color: '#f5e6ca', fontSize: '12px', fontWeight: 'bold'}}>2</span>
                  </div>
                  <div>
                    <p style={{color: '#d4af37', fontWeight: 'bold', marginBottom: '5px'}}>Quantify Your Achievements</p>
                    <p style={{color: '#e0d5c5', fontSize: '0.9rem', lineHeight: '1.4'}}>Use specific metrics and measurable outcomes to demonstrate value</p>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'flex-start'}}>
                  <div style={{width: '20px', height: '20px', backgroundColor: '#4b3832', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', marginTop: '2px', flexShrink: '0'}}>
                    <span style={{color: '#f5e6ca', fontSize: '12px', fontWeight: 'bold'}}>3</span>
                  </div>
                  <div>
                    <p style={{color: '#d4af37', fontWeight: 'bold', marginBottom: '5px'}}>Practice Executive Presence</p>
                    <p style={{color: '#e0d5c5', fontSize: '0.9rem', lineHeight: '1.4'}}>Develop confident, clear communication that commands attention</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="interview-card" style={{margin: '0 auto', maxWidth: '350px'}}>
              <h3 style={{color: '#d4af37', fontSize: '1.3rem', marginBottom: '20px'}}>Technical Leadership</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <div style={{display: 'flex', alignItems: 'flex-start'}}>
                  <div style={{width: '20px', height: '20px', backgroundColor: '#4b3832', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', marginTop: '2px', flexShrink: '0'}}>
                    <span style={{color: '#f5e6ca', fontSize: '12px', fontWeight: 'bold'}}>1</span>
                  </div>
                  <div>
                    <p style={{color: '#d4af37', fontWeight: 'bold', marginBottom: '5px'}}>Think at Scale</p>
                    <p style={{color: '#e0d5c5', fontSize: '0.9rem', lineHeight: '1.4'}}>Always consider scalability, performance, and enterprise-level requirements</p>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'flex-start'}}>
                  <div style={{width: '20px', height: '20px', backgroundColor: '#4b3832', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', marginTop: '2px', flexShrink: '0'}}>
                    <span style={{color: '#f5e6ca', fontSize: '12px', fontWeight: 'bold'}}>2</span>
                  </div>
                  <div>
                    <p style={{color: '#d4af37', fontWeight: 'bold', marginBottom: '5px'}}>Discuss Trade-offs</p>
                    <p style={{color: '#e0d5c5', fontSize: '0.9rem', lineHeight: '1.4'}}>Demonstrate strategic thinking by weighing alternatives and consequences</p>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'flex-start'}}>
                  <div style={{width: '20px', height: '20px', backgroundColor: '#4b3832', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', marginTop: '2px', flexShrink: '0'}}>
                    <span style={{color: '#f5e6ca', fontSize: '12px', fontWeight: 'bold'}}>3</span>
                  </div>
                  <div>
                    <p style={{color: '#d4af37', fontWeight: 'bold', marginBottom: '5px'}}>Visualize Solutions</p>
                    <p style={{color: '#e0d5c5', fontSize: '0.9rem', lineHeight: '1.4'}}>Use diagrams and visual aids to communicate complex technical concepts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Center Section */}
      <section id="actions" style={{padding: '40px', backgroundColor: '#1c1c1c'}}>
        <div style={{maxWidth: '600px', margin: '0 auto'}}>
          <div className="interview-card" style={{margin: '0 auto', maxWidth: '500px', textAlign: 'center'}}>
            <h2 style={{color: '#d4af37', fontSize: '1.5rem', marginBottom: '20px'}}>Ready for Your Next Career Move?</h2>
            <p style={{color: '#e0d5c5', lineHeight: '1.5', marginBottom: '30px'}}>
              Continue your professional development journey with additional assessments and personalized coaching sessions.
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <button
                onClick={() => navigate('/')}
                className="custom-button"
                style={{width: '100%'}}
              >
                Start New Assessment
              </button>
              <button
                onClick={() => window.print()}
                className="custom-button"
                style={{width: '100%', backgroundColor: '#d4af37', color: '#1c1c1c'}}
              >
                Download Report
              </button>
            </div>
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

export default ReportPage;
