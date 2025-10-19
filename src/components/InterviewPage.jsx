import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import interviewImage from "../assets/image-cda33c84-753c-4d65-8f5e-4bdf09a5bc0f.png";

const InterviewPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const recognitionRef = useRef(null);
  const localVideoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const rootContainerRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [examMode, setExamMode] = useState(false);
  const [cameraDebug, setCameraDebug] = useState('');
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [interviewerTranscript, setInterviewerTranscript] = useState([]); // array of strings
  const [userTranscriptLive, setUserTranscriptLive] = useState('');
  const [userTranscript, setUserTranscript] = useState([]); // array of strings
  // Coding editor states for technical questions
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const [editorCode, setEditorCode] = useState('');
  const [runOutput, setRunOutput] = useState('');
  const navigate = useNavigate();
  const activeStreamRef = useRef(null);

  useEffect(() => {
    // Load questions from localStorage and append one coding question as Q6
    const storedQuestions = localStorage.getItem('interviewQuestions');
    if (storedQuestions) {
      try {
        const arr = JSON.parse(storedQuestions) || [];
        // Ensure we have at least 5 original questions; append coding as the 6th
        if (arr.length < 6) {
          arr.push({
            type: 'technical',
            text: 'Two Sum: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Assume exactly one solution and you may not use the same element twice.'
          });
        }
        setQuestions(arr);
      } catch (_) {
        navigate('/');
      }
    } else {
      // If no questions found, redirect to landing page
      navigate('/');
    }
  }, [navigate]);

  // Initialize Web Speech API (speech-to-text)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSttSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interim = '';
        let finals = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) finals += chunk + ' ';
          else interim += chunk + ' ';
        }
        if (finals.trim()) {
          setUserTranscript((logs) => [...logs, finals.trim()]);
          setCurrentAnswer((prev) => {
            if (!prev) return finals.trim();
            return `${prev.replace(/\s+$/, '')} ${finals.trim()}`.trim();
          });
        }
        setUserTranscriptLive(interim.trim());
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      const fs = document.fullscreenElement || document.webkitFullscreenElement;
      // Stay in exam mode UI even if fullscreen exits, so layout doesn’t disappear
      setExamMode(prev => prev || Boolean(fs));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  const enterFullscreen = async () => {
    // Fullscreen the whole assessment UI (video + transcripts), not just the video
    const el = rootContainerRef.current || document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      setExamMode(true);
    } catch (_) {
      // ignore; some browsers block without gesture
    }
  };

  const handleStartExam = async () => {
    // Enter exam mode immediately so UI shows even if fullscreen is blocked
    setExamMode(true);
    await requestCamera();
    await enterFullscreen();
  };

  // Auto-start/stop speech recognition in exam mode
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (examMode && sttSupported && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (_) {}
    }
    return () => {
      if (recognition && isListening) {
        try { recognition.stop(); } catch (_) {}
      }
    };
  }, [examMode, sttSupported]);

  // Start user camera preview
  useEffect(() => {
    let canceled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera not supported in this browser');
        return;
      }
      // Try silently to attach camera; if it fails, the overlay button remains visible
      try {
        await requestCamera();
      } catch (_) {
        if (!canceled) setCameraReady(false);
      }
    })();
    return () => { canceled = true; };
  }, []);

  const requestCamera = async (deviceId) => {
    console.log('🎥 requestCamera called with deviceId:', deviceId);
    setCameraError('');
    setCameraDebug('Requesting camera access...');
    
    // Stop any active stream first
    try {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(t => t.stop());
        activeStreamRef.current = null;
      }
    } catch (e) {
      console.error('Error stopping active stream:', e);
    }

    try {
      let stream;
      
      // If specific device requested, use it
      if (deviceId) {
        console.log('Requesting specific device:', deviceId);
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { deviceId: { exact: deviceId } }, 
          audio: false 
        });
      } else {
        // Otherwise, request any camera with basic constraints
        console.log('Requesting any available camera');
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
          }, 
          audio: false 
        });
      }

      console.log('✅ Camera stream obtained:', stream);
      activeStreamRef.current = stream;

      // Attach to video element
      const video = localVideoRef.current;
      if (!video) {
        console.error('❌ Video element not found');
        setCameraError('Video element not available');
        return;
      }

      console.log('Attaching stream to video element');
      // Ensure inline playback on iOS/Safari
      try { video.setAttribute('playsinline', ''); } catch (_) {}
      try { video.setAttribute('webkit-playsinline', ''); } catch (_) {}
      video.muted = true;
      video.controls = false;
      video.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        if (video.readyState >= 2) {
          resolve();
        } else {
          const onLoaded = () => {
            console.log('Video metadata loaded');
            cleanup();
            resolve();
          };
          const onCanPlay = () => {
            console.log('Video canplay');
            cleanup();
            resolve();
          };
          const cleanup = () => {
            try { video.removeEventListener('loadedmetadata', onLoaded); } catch (_) {}
            try { video.removeEventListener('canplay', onCanPlay); } catch (_) {}
          };
          video.addEventListener('loadedmetadata', onLoaded);
          video.addEventListener('canplay', onCanPlay);
        }
      });

      // Play the video
      try {
        await video.play();
        console.log('✅ Video playing');
      } catch (playError) {
        console.error('Play error:', playError);
      }

      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');
      console.log('Available cameras:', cameras);
      setAvailableCameras(cameras);

      // Get active track info
      const [track] = stream.getVideoTracks();
      const trackLabel = track?.label || 'Unknown camera';
      console.log('Active camera:', trackLabel);
      
      // Confirm frames are actually flowing
      const confirmReady = () => {
        const hasDims = (video.videoWidth || 0) > 0 && (video.videoHeight || 0) > 0;
        setCameraReady(Boolean(hasDims));
        if (!hasDims) {
          console.warn('Video dimensions not ready yet, retrying...');
          setTimeout(confirmReady, 150);
        }
      };
      confirmReady();
      setCameraDebug(`✓ Camera active: ${trackLabel}`);
      
    } catch (error) {
      console.error('❌ Camera error:', error);
      setCameraReady(false);
      
      let errorMessage = 'Unable to access camera. ';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Permission denied. Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found. Please connect a camera.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      setCameraError(errorMessage);
      setCameraDebug(`Error: ${error.name || 'Unknown'}`);
      
      // Still try to enumerate devices for the dropdown
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(d => d.kind === 'videoinput');
        setAvailableCameras(cameras);
      } catch (_) {}
    }
  };

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      if (userTranscriptLive.trim()) {
        setUserTranscript((logs) => [...logs, userTranscriptLive.trim()]);
        setUserTranscriptLive('');
      }
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (_e) {
        setIsListening(true);
      }
    }
  };

  const speakQuestion = () => {
    if (!currentQuestion?.text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
    setInterviewerTranscript((logs) => [...logs, currentQuestion.text]);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleAnswerChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  // Minimal starter template when switching to a technical question
  useEffect(() => {
    if (!currentQuestion) return;
    if (currentQuestion.type === 'technical' && editorCode.trim() === '') {
      if (editorLanguage === 'javascript') {
        setEditorCode(`// Write your solution in JavaScript\n// Define your function and test below\nfunction solve() {\n  // TODO: implement\n}\n\n// Example usage:\nsolve();`);
      } else if (editorLanguage === 'python') {
        setEditorCode(`# Write your solution in Python\n# Define your function and test below\n\n# def solve():\n#     pass\n\n# Example:\n# solve()`);
      }
    }
  }, [currentQuestion, editorLanguage]);

  const handleRunCode = () => {
    setRunOutput('');
    try {
      if (editorLanguage !== 'javascript') {
        setRunOutput('Run supported only for JavaScript in the browser.');
        return;
      }
      const logs = [];
      const originalLog = console.log;
      try {
        console.log = (...args) => {
          logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        };
        // eslint-disable-next-line no-new-func
        const fn = new Function(editorCode);
        const result = fn();
        if (typeof result !== 'undefined') logs.push(String(result));
      } finally {
        console.log = originalLog;
      }
      setRunOutput(logs.join('\n'));
    } catch (err) {
      setRunOutput(`Error: ${err.message}`);
    }
  };

  const handleResetCode = () => {
    setEditorCode('');
    setRunOutput('');
  };

  const handleNext = () => {
    // Save current answer
    const updatedAnswers = {
      ...answers,
      [currentQuestionIndex]: {
        question: currentQuestion.text,
        answer: currentAnswer,
        type: currentQuestion.type
      }
    };
    setAnswers(updatedAnswers);

    if (isLastQuestion) {
      // Submit all answers
      handleSubmit(updatedAnswers);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer(answers[currentQuestionIndex + 1]?.answer || '');
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      // Save current answer
      const updatedAnswers = {
        ...answers,
        [currentQuestionIndex]: {
          question: currentQuestion.text,
          answer: currentAnswer,
          type: currentQuestion.type
        }
      };
      setAnswers(updatedAnswers);

      // Move to previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(answers[currentQuestionIndex - 1]?.answer || '');
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setIsSubmitting(true);
    
    try {
      // Store answers in localStorage for the report page
      localStorage.setItem('interviewAnswers', JSON.stringify(finalAnswers));
      
      // Attempt to submit to backend if configured; otherwise fallback
      try {
        const API_BASE = import.meta.env?.VITE_API_BASE_URL;
        if (API_BASE) {
          await fetch(`${API_BASE}/api/submit-answers/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalAnswers)
          });
        } else {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (_) {
        // ignore network errors in MVP
      }
      
      // Navigate to report page
      navigate('/report');
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert('Failed to submit answers. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen academic-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-academic-gold mx-auto mb-4"></div>
          <p className="text-academic-cream">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootContainerRef} className="min-h-screen academic-dark" style={{height: '100vh', overflow: 'hidden'}}>
      {!examMode && (
        <div style={{position: 'fixed', inset: 0, background: '#0b0b0b', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: '#1c1c1c', border: '1px solid #4b3832', borderRadius: '12px', padding: '32px', width: '400px', textAlign: 'center'}}>
            <h2 style={{color: '#d4af37', fontSize: '1.8rem', marginBottom: '24px'}}>Start Proctored Assessment</h2>
            <button className="custom-button" onClick={handleStartExam} style={{padding: '14px 28px', fontSize: '1.1rem', width: '100%'}}>Start Assessment</button>
            {cameraError && <p style={{color: '#e0d5c5', marginTop: '12px', fontSize: '14px'}}>{cameraError}</p>}
          </div>
        </div>
      )}
      {/* Navigation */}
      <div className="navbar" style={{display: 'none'}}>
        <div className="nav-logo" style={{display: 'flex', alignItems: 'center', position: 'absolute', left: '10%'}}>
          <span className="logo-text" style={{fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: '700', color: '#d4af37', textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>AI Interview Coach</span>
        </div>
        <ul className="nav-right" style={{display: 'none'}}></ul>
      </div>

      {/* Question Header - always visible */}
      <section id="home" style={{padding: '20px 24px', backgroundColor: '#1c1c1c', borderBottom: '2px solid #4b3832'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
            <span style={{
              padding: '6px 16px',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: currentQuestion?.type === 'behavioral' ? '#2a4a2a' : '#2a2a4a',
              color: '#e0d5c5'
            }}>
              {currentQuestion?.type === 'behavioral' ? 'Behavioral' : 'Technical'}
            </span>
            <span style={{color: '#e0d5c5', fontSize: '15px'}}>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
          <h2 style={{color: '#d4af37', fontSize: '1.6rem', lineHeight: '1.5', margin: 0, fontWeight: '600'}}>
            {currentQuestion?.text}
          </h2>
        </div>
      </section>

      {/* Progress removed to avoid scroll */}

      {/* Question Section - behavioral for first 5; coding split for Q6 */}
      <section id="question" style={{padding: '16px 16px 80px 16px', backgroundColor: '#1c1c1c'}}>
        {currentQuestionIndex >= 5 ? (
          <div style={{display: 'grid', gridTemplateColumns: 'minmax(420px, 46%) minmax(0, 1fr)', gap: '12px', height: 'calc(100vh - 160px)'}}>
            <div className="glass-panel" style={{backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '16px', overflowY: 'auto', boxShadow: '0 0 0 2px #4b3832 inset'}}>
              <h3 style={{color: '#d4af37', marginBottom: '10px'}}>Problem</h3>
              <div style={{color: '#e0d5c5', lineHeight: 1.5, whiteSpace: 'pre-wrap'}}>{currentQuestion?.text}</div>
            </div>
            <div style={{display: 'grid', gridTemplateRows: 'auto 1fr auto', backgroundColor: '#2a2a2a', borderRadius: '12px', boxShadow: '0 0 0 2px #4b3832 inset'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #4b3832'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <label style={{color: '#e0d5c5'}}>Language</label>
                  <select value={editorLanguage} onChange={(e) => setEditorLanguage(e.target.value)} style={{backgroundColor: '#1c1c1c', color: '#e0d5c5', border: '1px solid #4b3832', borderRadius: '8px', padding: '6px 8px'}}>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python (editor only)</option>
                  </select>
                </div>
                <div style={{display: 'flex', gap: '8px'}}>
                  <button className="custom-button" onClick={handleRunCode}>Run</button>
                  <button className="custom-button" onClick={handleResetCode} style={{backgroundColor: '#2a2a2a'}}>Reset</button>
                </div>
              </div>
              <div style={{padding: '10px'}}>
                <textarea value={editorCode} onChange={(e) => setEditorCode(e.target.value)} style={{width: '100%', height: '100%', minHeight: '320px', backgroundColor: '#1c1c1c', color: '#e0d5c5', border: '1px solid #4b3832', borderRadius: '8px', padding: '12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace', fontSize: '14px', lineHeight: 1.5}} placeholder={`// Start coding in ${editorLanguage}...`} />
              </div>
              <div style={{borderTop: '1px solid #4b3832', padding: '10px 12px', backgroundColor: '#1c1c1c', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px'}}>
                <div style={{color: '#d4af37', marginBottom: '6px'}}>Output</div>
                <pre style={{margin: 0, color: '#e0d5c5', whiteSpace: 'pre-wrap'}}>{runOutput}</pre>
              </div>
            </div>
          </div>
        ) : (
          <div style={{width: '100vw', margin: '0'}}>
            <div className="interview-card" style={{margin: '0', maxWidth: '100vw', padding: 0, backgroundColor: 'transparent', boxShadow: 'none'}}>
              <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '12px', alignItems: 'stretch', marginBottom: '10px', height: 'calc(100vh - 160px)'}}>
                <div ref={videoContainerRef} style={{position: 'relative', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', height: '100%', boxShadow: '0 0 0 2px #4b3832 inset'}}>
                  <div style={{position: 'absolute', top: '70px', left: '16px', display: 'flex', gap: '8px', zIndex: 2}}>
                    <button onClick={speakQuestion} className="custom-button" style={{padding: '6px 10px', fontSize: '12px', backgroundColor: '#2a2a2a'}}>Play Question</button>
                    {sttSupported ? (
                      <button onClick={toggleListening} className="custom-button" style={{padding: '6px 10px', fontSize: '12px', backgroundColor: isListening ? '#4b3832' : '#2a2a2a'}}>{isListening ? 'Stop Mic' : 'Start Mic'}</button>
                    ) : (
                      <span style={{color: '#e0d5c5', fontSize: '12px'}}>Speech-to-text unsupported</span>
                    )}
                    <button onClick={() => navigator.mediaDevices?.getUserMedia && navigator.mediaDevices.getUserMedia({audio:true}).then(s=>s.getTracks().forEach(t=>t.stop())).catch(()=>{})} className="custom-button" style={{padding: '6px 10px', fontSize: '12px', backgroundColor: '#2a2a2a'}}>Enable Mic</button>
                  </div>
                  <video ref={localVideoRef} autoPlay playsInline muted style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000', transform: 'scaleX(-1)', display: 'block'}}></video>
                  <div style={{position: 'absolute', top: '12px', left: '12px', padding: '6px 12px', backgroundColor: cameraReady ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)', borderRadius: '6px', fontSize: '12px', color: 'white', fontWeight: 'bold', zIndex: 5}}>
                    {cameraReady ? '● Camera Active' : '● Camera Inactive'}
                    <br />
                    <span style={{fontSize: '10px'}}>Stream: {activeStreamRef.current ? 'Yes' : 'No'} |  Video: {localVideoRef.current?.srcObject ? 'Attached' : 'Not attached'}</span>
                  </div>
                  {!cameraReady && (
                    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.85)', zIndex: 4}}>
                      <p style={{color: '#e0d5c5', fontSize: '16px', fontWeight: 'bold'}}>{cameraError || 'Camera not started'}</p>
                      <button className="custom-button" onClick={() => requestCamera()} style={{padding: '12px 24px', fontSize: '16px'}}>Enable Camera</button>
                      {cameraDebug && <p style={{color: '#9aa0a6', fontSize: '12px', marginTop: '8px'}}>{cameraDebug}</p>}
                    </div>
                  )}
                  <div style={{position: 'absolute', top: '12px', right: '12px', width: '160px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #4b3832', backgroundColor: '#1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e0d5c5', fontSize: '12px', zIndex: 3}}>Interviewer Video</div>
                </div>
                <aside style={{width: '320px', height: '100%', backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '12px', overflowY: 'auto', boxShadow: '0 0 0 2px #4b3832 inset'}}>
                  <h3 style={{color: '#d4af37', marginBottom: '10px', textAlign: 'center'}}>Live Transcript</h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <div>
                      <h4 style={{color: '#e0d5c5', marginBottom: '6px'}}>Interviewer</h4>
                      {interviewerTranscript.length === 0 ? (
                        <p style={{color: '#9aa0a6', fontSize: '14px'}}>No messages yet.</p>
                      ) : (
                        interviewerTranscript.map((t, i) => (<p key={`int-${i}`} style={{color: '#e0d5c5', margin: '0 0 6px 0', lineHeight: '1.4'}}>{t}</p>))
                      )}
                    </div>
                    <div>
                      <h4 style={{color: '#e0d5c5', marginBottom: '6px'}}>You</h4>
                      {userTranscript.map((t, i) => (<p key={`usr-${i}`} style={{color: '#e0d5c5', margin: '0 0 6px 0', lineHeight: '1.4'}}>{t}</p>))}
                      {isListening && (<p style={{color: '#d4af37', margin: '0', lineHeight: '1.4'}}>{userTranscriptLive}</p>)}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Navigation Section - sticky bottom bar */}
      <section id="navigation" style={{padding: '10px 20px', backgroundColor: 'rgba(28,28,28,0.85)', position: 'fixed', bottom: 0, left: 0, right: 0, backdropFilter: 'blur(4px)'}}>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <button
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="custom-button"
              style={{
                backgroundColor: isFirstQuestion ? '#2a2a2a' : '#4b3832',
                cursor: isFirstQuestion ? 'not-allowed' : 'pointer',
                opacity: isFirstQuestion ? 0.5 : 1
              }}
            >
              ← Previous Question
            </button>

            {!isLastQuestion && (
              <button
                onClick={handleNext}
                disabled={false}
                className="custom-button"
                style={{
                  backgroundColor: '#4b3832'
                }}
              >
                Next Question →
              </button>
            )}
            
            {isLastQuestion && (
              <button
                onClick={() => handleNext()}
                disabled={isSubmitting}
                className="custom-button"
                style={{
                  backgroundColor: isSubmitting ? '#2a2a2a' : '#d4af37',
                  color: isSubmitting ? '#e0d5c5' : '#1c1c1c'
                }}
              >
                {isSubmitting ? (
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{width: '20px', height: '20px', border: '2px solid #1c1c1c', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '10px'}}></div>
                    Submitting Assessment...
                  </div>
                ) : (
                  'Complete Assessment & Generate Report'
                )}
              </button>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default InterviewPage;
