// Minimal Cloudflare Worker API for Mock Me?!
// Endpoints:
//  - GET   /api/demos/
//  - POST  /api/upload-resume/
//  - POST  /api/submit-answers/
//  - POST  /api/analyze/

const json = (data, init = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : init.status || 200,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      ...extraHeaders,
    },
  });

const notFound = () => json({ error: 'Not found' }, 404);

const MOCK_DEMOS = [
  { id: 1, title: 'Software Engineering Jobs', description: 'Practice coding and system design questions for software engineering roles' },
  { id: 2, title: 'Product Manager Jobs', description: 'Behavioral and product strategy questions for PM positions' },
  { id: 3, title: 'Data Science Jobs', description: 'Technical and analytical questions for data science roles' },
];

async function handleUploadResume(request) {
  // For MVP we accept either multipart/form-data or JSON and return mock questions
  let demoId = '1';
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      demoId = form.get('demo_id') || '1';
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      demoId = String(body.demo_id || '1');
    }
  } catch {}

  const byDemo = {
    '1': [
      { type: 'behavioral', text: 'Tell me about a time you had to debug a complex issue in production.' },
      { type: 'behavioral', text: 'Describe a situation where you had to work with a difficult team member.' },
      { type: 'behavioral', text: 'Tell me about a project where you had to learn a new technology quickly.' },
      { type: 'technical', text: 'How would you design a URL shortener service like bit.ly?' },
      { type: 'technical', text: 'Explain how you would implement a caching layer for a web application.' },
    ],
    '2': [
      { type: 'behavioral', text: 'Tell me about a time you had to prioritize features with limited resources.' },
      { type: 'behavioral', text: 'Describe a situation where you had to convince stakeholders of a product decision.' },
      { type: 'behavioral', text: 'Tell me about a product launch that did not go as planned.' },
      { type: 'technical', text: 'How would you design a recommendation system for an e-commerce platform?' },
      { type: 'technical', text: 'Explain your approach to A/B testing a new feature.' },
    ],
    '3': [
      { type: 'behavioral', text: 'Tell me about a time you had to explain complex data insights to non-technical stakeholders.' },
      { type: 'behavioral', text: 'Describe a project where you had to work with messy or incomplete data.' },
      { type: 'behavioral', text: 'Tell me about a time you had to validate the accuracy of a machine learning model.' },
      { type: 'technical', text: 'How would you design a real-time fraud detection system?' },
      { type: 'technical', text: 'Explain your approach to feature engineering for a classification problem.' },
    ],
  };

  return json({ questions: byDemo[demoId] || byDemo['1'] });
}

async function handleSubmitAnswers(request) {
  // Echo minimal ack for MVP
  return json({ ok: true });
}

async function handleAnalyze(request) {
  try {
    const body = await request.json();
    const answers = body.answers || {};
    const results = Object.values(answers).map((entry) => {
      const answer = String(entry.answer || '');
      const type = entry.type || 'behavioral';
      const hasSTAR = /situation|task|action|result/i.test(answer);
      const verbal = Math.min(10, Math.max(1, Math.floor(answer.length / 50) + (hasSTAR ? 2 : 0)));
      let design = null;
      if (type === 'technical') {
        design = Math.min(10, Math.max(1, Math.floor(answer.length / 100) + (/scalability/i.test(answer) ? 2 : 0)));
      }
      return {
        question: entry.question,
        verbal_score: verbal,
        design_score: design,
        feedback: type === 'technical'
          ? (design >= 8 ? 'Outstanding technical approach.' : design >= 6 ? 'Good technical thinking.' : 'Add depth on scalability, performance, and trade-offs.')
          : (verbal >= 8 ? 'Excellent STAR structure.' : verbal >= 6 ? 'Good; use STAR more consistently.' : 'Add structure using STAR.'),
        type,
      };
    });

    const verbalScores = results.map(r => r.verbal_score).filter(Boolean);
    const designScores = results.map(r => r.design_score).filter(Boolean);
    const overall = {
      verbal: verbalScores.length ? Math.round((verbalScores.reduce((a,b)=>a+b,0)/verbalScores.length)*10)/10 : 0,
      design: designScores.length ? Math.round((designScores.reduce((a,b)=>a+b,0)/designScores.length)*10)/10 : 0,
    };

    return json({ results, overall_scores: overall });
  } catch (e) {
    return json({ error: 'Bad request' }, 400);
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': 'content-type',
          'access-control-allow-methods': 'GET,POST,OPTIONS',
        },
      });
    }

    if (url.pathname === '/api/demos/' && request.method === 'GET') return json(MOCK_DEMOS);
    if (url.pathname === '/api/upload-resume/' && request.method === 'POST') return handleUploadResume(request);
    if (url.pathname === '/api/submit-answers/' && request.method === 'POST') return handleSubmitAnswers(request);
    if (url.pathname === '/api/analyze/' && request.method === 'POST') return handleAnalyze(request);
    // Auth (MVP demo-grade; replace with D1/real OAuth in production)
    if (url.pathname === '/auth/signup' && request.method === 'POST') {
      // In a real app, store hashed password in D1. Here we just echo ok.
      return json({ ok: true });
    }
    if (url.pathname === '/auth/login' && request.method === 'POST') {
      // Issue a signed session cookie (demo: unsigned). Replace with HMAC/JWT in production.
      const user = { id: 'u_demo', email: 'demo@example.com' };
      const cookie = `mm_session=${btoa(JSON.stringify(user))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`;
      const csrf = cryptoRandom(24);
      const headers = { 'set-cookie': [cookie, `mm_csrf=${csrf}; Secure; SameSite=Lax; Path=/; Max-Age=3600`] };
      return json({ ok: true, user }, 200, headers);
    }
    if (url.pathname === '/auth/logout' && request.method === 'POST') {
      const headers = { 'set-cookie': [
        'mm_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
        'mm_csrf=; Secure; SameSite=Lax; Path=/; Max-Age=0'] };
      return json({ ok: true }, 200, headers);
    }
    if (url.pathname === '/auth/me' && request.method === 'GET') {
      const cookies = parseCookies(request.headers.get('cookie') || '');
      const raw = cookies['mm_session'];
      if (!raw) return json({ user: null });
      try { return json({ user: JSON.parse(atob(raw)) }); } catch { return json({ user: null }); }
    }
    return notFound();
  },
};

function parseCookies(str) {
  return str.split(';').reduce((acc, cur) => {
    const idx = cur.indexOf('=');
    if (idx > -1) {
      const k = cur.slice(0, idx).trim();
      const v = cur.slice(idx + 1).trim();
      acc[k] = v;
    }
    return acc;
  }, {});
}

function cryptoRandom(len) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}


