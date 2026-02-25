(function () {
  const defaultConfig = {
    app_title: 'BOMIS AI',
    app_subtitle: 'AI Assistant for Class 9 - Science | Humanities | Languages',
    footer_text: 'Classroom se Innovation tak - Designed and Developed by Aniket Thakur',
    background_color: '#3799db',
    primary_color: '#5b7ddb',
    secondary_color: '#11486d',
    text_color: '#5982ba',
    accent_color: '#8dc7e1',
    font_family: 'Plus Jakarta Sans',
    font_size: 14
  };

  // Updated with an array of chapters for each subject
  const subjectData = {
    physics: { title: 'Physics AI Assistant', chapters: ['Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy', 'Sound'] },
    chemistry: { title: 'Chemistry AI Assistant', chapters: ['Matter in Our Surroundings', 'Is Matter Around Us Pure', 'Atoms and Molecules', 'Structure of the Atom'] },
    biology: { title: 'Biology AI Assistant', chapters: ['The Fundamental Unit of Life', 'Tissues', 'Improvement in Food Resources'] },
    mathematics: { title: 'Mathematics AI Assistant', chapters: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations in Two Variables', 'Lines and Angles', 'Triangles', 'Quadrilaterals', 'Circles', 'Heron\'s Formula', 'Surface Areas and Volumes', 'Statistics'] },
    history: { title: 'History AI Assistant', chapters: ['The French Revolution', 'Socialism in Europe and the Russian Revolution', 'Nazism and the Rise of Hitler', 'Forest Society and Colonialism', 'Pastoralists in the Modern World'] },
    ai: { title: 'AI Assistant', chapters: ['Introduction to AI', 'AI Project Cycle', 'Neural Networks', 'Data Science', 'Computer Vision', 'Natural Language Processing'] },
    hindi: { title: 'Hindi AI Assistant', chapters: ['Do Bailon Ki Katha', 'Lhasa ki aur', 'Upbhoktavad ki Sanskriti', 'Sawle Sapno ki Yaad', 'Premchand ke Phate Jute', 'Mere Bachpan ke Din'] },
    geography: { title: 'Geography AI Assistant', chapters: ['India - Size and Location', 'Physical Features of India', 'Drainage', 'Climate', 'Natural Vegetation and Wildlife', 'Population'] },
    economics: { title: 'Economics AI Assistant', chapters: ['The Story of Village Palampur', 'People as Resource', 'Poverty as a Challenge', 'Food Security in India'] },
    civics: { title: 'Civics AI Assistant', chapters: ['What is Democracy? Why Democracy?', 'Constitutional Design', 'Electoral Politics', 'Working of Institutions', 'Democratic Rights'] },
    english: { title: 'English AI Assistant', chapters: ['The Fun They Had', 'The Sound of Music', 'The Little Girl', 'A Truly Beautiful Mind', 'The Snake and the Mirror', 'My Childhood', 'Reach for the Top', 'Kathmandu', 'If I Were You'] },
    sanskrit: { title: 'Sanskrit AI Assistant', chapters: ['Bharativasantagiti', 'Swarnkakah', 'Godohanam', 'Kalpataruh', 'Suktimouktikam', 'Bhranto Balah', 'Sikatasethu', 'Jatayoh Shauriyam', 'Paryavaranam', 'Vangmanahpranaswarupam'] }
  };

  let lastAnswer = '';
  let currentAudio = null;
  let isAsking = false;
  let isSpeaking = false;

  window.currentSubject = 'chemistry';

  function el(id) {
    return document.getElementById(id);
  }

  function getAskButton() {
    return document.querySelector("button[onclick='askQuestion()']");
  }

  function getPlayButton() {
    return document.querySelector("button[onclick='playVoice()']");
  }

  function setResponse(text) {
    const responseText = el('ai-response');
    const responseArea = el('response-area');
    if (responseText) {
      responseText.textContent = text;
    }
    if (responseArea) {
      responseArea.classList.remove('hidden');
    }
  }

  function setAskLoading(loading) {
    isAsking = loading;
    const askButton = getAskButton();
    if (!askButton) {
      return;
    }

    askButton.disabled = loading;
    askButton.classList.toggle('opacity-70', loading);
    askButton.classList.toggle('cursor-not-allowed', loading);

    askButton.innerHTML = loading
      ? "<span class='animate-pulse'>Thinking...</span>"
      : "<svg class='w-4 h-4' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' d='M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z'></path></svg> Ask AI Assistant";
  }

  function setPlayIconSpeaking(speaking) {
    const playBtn = el('play-btn');
    if (!playBtn) {
      return;
    }

    playBtn.innerHTML = speaking
      ? "<svg class='w-4 h-4 animate-pulse' fill='currentColor' viewBox='0 0 24 24'><rect x='6' y='4' width='4' height='16'></rect><rect x='14' y='4' width='4' height='16'></rect></svg>"
      : "<svg class='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'><path d='M8 5v14l11-7z'></path></svg>";
  }

  function resetPlayState() {
    isSpeaking = false;
    const playButton = getPlayButton();
    if (playButton) {
      playButton.classList.remove('opacity-80');
    }
    setPlayIconSpeaking(false);
  }

  function stopAudioIfPlaying() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    resetPlayState();
  }

  function showSubjectUI(subject) {
    const data = subjectData[subject] || subjectData.chemistry;
    window.currentSubject = subject;

    if (el('subject-title')) {
      el('subject-title').textContent = data.title;
    }
    
    // Inject dynamic chapters into the dropdown
    const chapterSelect = el('chapter-select');
    if (chapterSelect) {
      chapterSelect.innerHTML = ''; // Clear previous options
      if (data.chapters && data.chapters.length > 0) {
        data.chapters.forEach(function(chapter) {
          const option = document.createElement('option');
          option.value = chapter;
          option.textContent = chapter;
          chapterSelect.appendChild(option);
        });
      }
    }

    if (el('home-screen')) {
      el('home-screen').classList.add('hidden');
    }

    if (el('subject-screen')) {
      el('subject-screen').classList.remove('hidden');
      el('subject-screen').classList.add('flex');
    }

    if (el('response-area')) {
      el('response-area').classList.add('hidden');
    }

    if (el('question-input')) {
      el('question-input').value = '';
    }

    lastAnswer = '';
    stopAudioIfPlaying();
  }

  function showHomeUI() {
    if (el('subject-screen')) {
      el('subject-screen').classList.add('hidden');
      el('subject-screen').classList.remove('flex');
    }
    if (el('home-screen')) {
      el('home-screen').classList.remove('hidden');
    }
  }

  async function askBackend(subject, chapter, question) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(function () {
      controller.abort();
    }, 20000);

    try {
      const response = await fetch('https://birla-ai.app.n8n.cloud/webhook/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, chapter, question }),
        signal: controller.signal
      });

      const data = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(data.error || 'AI request failed.');
      }

      const answer = String(data.answer || '').trim();
      if (!answer) {
        throw new Error('No answer returned by AI.');
      }

      return answer;
    } catch (error) {
      if (error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  function speakWithBrowser(text) {
    if (!('speechSynthesis' in window)) {
      throw new Error('Browser speech is not available.');
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = function () {
      resetPlayState();
    };
    utterance.onerror = function () {
      resetPlayState();
    };
    window.speechSynthesis.speak(utterance);
  }

  window.showSubject = function showSubject(subject) {
    showSubjectUI(subject);
  };

  window.showHome = function showHome() {
    showHomeUI();
  };

  window.askQuestion = async function askQuestion() {
    if (isAsking) {
      return;
    }

    if (window.location.protocol === 'file:') {
      setResponse('Open this app via http://localhost:3000 (not file://) to use the chatbot.');
      return;
    }

    const questionInput = el('question-input');
    const question = questionInput ? String(questionInput.value || '').trim() : '';

    if (!question) {
      setResponse('Please type a question first.');
      return;
    }

    setAskLoading(true);
    setResponse('Thinking...');

    try {
      // Get the value from the newly created dropdown
      const chapterSelect = el('chapter-select');
      const chapter = chapterSelect ? chapterSelect.value : '';
      
      const answer = await askBackend(window.currentSubject, chapter, question);
      lastAnswer = answer;
      setResponse(answer);
    } catch (error) {
      const message = error && error.message ? error.message : 'Could not reach AI server.';
      setResponse('Could not get AI response. ' + message);
    } finally {
      setAskLoading(false);
    }
  };

  window.playVoice = async function playVoice() {
    if (!lastAnswer) {
      setResponse('Ask a question first, then play the voice explanation.');
      return;
    }

    if (isSpeaking && currentAudio) {
      stopAudioIfPlaying();
      return;
    }

    isSpeaking = true;
    const playButton = getPlayButton();
    if (playButton) {
      playButton.classList.add('opacity-80');
    }
    setPlayIconSpeaking(true);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: lastAnswer })
      });

      if (!response.ok) {
        throw new Error('TTS request failed.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      currentAudio = new Audio(url);

      currentAudio.addEventListener('ended', function () {
        URL.revokeObjectURL(url);
        currentAudio = null;
        resetPlayState();
      });

      currentAudio.addEventListener('error', function () {
        URL.revokeObjectURL(url);
        currentAudio = null;
        resetPlayState();
      });

      await currentAudio.play();
    } catch (_error) {
      currentAudio = null;
      try {
        speakWithBrowser(lastAnswer);
      } catch (voiceError) {
        resetPlayState();
        setResponse('Could not play voice. ' + (voiceError.message || 'Please try again.'));
      }
    }
  };

  async function onConfigChange(config) {
    const appTitle = el('app-title');
    const appSubtitle = el('app-subtitle');
    const footerText = el('footer-text');

    if (appTitle) {
      appTitle.textContent = config.app_title || defaultConfig.app_title;
    }
    if (appSubtitle) {
      appSubtitle.textContent = config.app_subtitle || defaultConfig.app_subtitle;
    }
    if (footerText) {
      footerText.textContent = config.footer_text || defaultConfig.footer_text;
    }

    const fontFamily = config.font_family || defaultConfig.font_family;
    document.body.style.fontFamily = "'" + fontFamily + "', sans-serif";

    const baseSize = config.font_size || defaultConfig.font_size;
    document.documentElement.style.fontSize = baseSize + 'px';
  }

  if (window.elementSdk) {
    window.elementSdk.init({
      defaultConfig: defaultConfig,
      onConfigChange: onConfigChange,
      mapToCapabilities: function (config) {
        return {
          recolorables: [
            {
              get: function () {
                return config.background_color || defaultConfig.background_color;
              },
              set: function (value) {
                config.background_color = value;
                window.elementSdk.setConfig({ background_color: value });
              }
            }
          ],
          borderables: [],
          fontEditable: {
            get: function () {
              return config.font_family || defaultConfig.font_family;
            },
            set: function (value) {
              config.font_family = value;
              window.elementSdk.setConfig({ font_family: value });
            }
          },
          fontSizeable: {
            get: function () {
              return config.font_size || defaultConfig.font_size;
            },
            set: function (value) {
              config.font_size = value;
              window.elementSdk.setConfig({ font_size: value });
            }
          }
        };
      },
      mapToEditPanelValues: function (config) {
        return new Map([
          ['app_title', config.app_title || defaultConfig.app_title],
          ['app_subtitle', config.app_subtitle || defaultConfig.app_subtitle],
          ['footer_text', config.footer_text || defaultConfig.footer_text]
        ]);
      }
    });
  }

  const questionInput = el('question-input');
  if (questionInput) {
    questionInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        window.askQuestion();
      }
    });
  }
})();