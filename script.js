import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const db = window.firebaseDB;

let recognition;
let isListening = false;

let userName = localStorage.getItem("jarvisName");

const chatDiv = document.getElementById("chat");

// Add message to chat UI
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = sender === "You" ? "user-msg" : "ai-msg";
  msg.innerText = text;
  chatDiv.appendChild(msg);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

// Speak function (ResponsiveVoice)
function speak(text) {
  addMessage("Jarvis", text);

  const hindiPattern = /[\u0900-\u097F]/;
  const voiceName = hindiPattern.test(text) ? "Hindi Female" : "UK English Female";

  if (responsiveVoice.voiceSupport()) {
    responsiveVoice.speak(text, voiceName, { rate: 1 });
  } else {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = hindiPattern.test(text) ? "hi-IN" : "en-GB";
    window.speechSynthesis.speak(utterance);
  }
}

// Stop voice
function stopSpeaking() {
  responsiveVoice.cancel();
  window.speechSynthesis.cancel();
}

// Save username in Firebase + localStorage
function saveUserName(name) {
  userName = name;
  localStorage.setItem("jarvisName", name);
  set(ref(db, 'users/' + name), {
    joined: new Date().toISOString()
  });
}

// Check user on load
window.onload = function() {
  if (!userName) {
    const name = prompt("Hello! What is your name?");
    saveUserName(name);
    speak(`Nice to meet you, ${name}`);
  } else {
    speak(`Welcome back, ${userName}`);
  }
};

// Send text
function sendText() {
  const input = document.getElementById("textInput");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  processCommand(text);
}

// Process commands
async function processCommand(text) {
  addMessage("You", text);

  // Open websites
  if (text.toLowerCase().includes("open youtube")) {
    window.open("https://youtube.com", "_blank");
    speak("Opening YouTube");
    return;
  }
  if (text.toLowerCase().includes("open google")) {
    window.open("https://google.com", "_blank");
    speak("Opening Google");
    return;
  }

  // Change name
  if (text.toLowerCase().includes("change my name")) {
    localStorage.removeItem("jarvisName");
    userName = null;
    speak("Okay, tell me your new name");
    return;
  }

  // Default AI reply (placeholder)
  const reply = `You said: ${text}`;
  speak(reply);
}

// Mic / Speech Recognition
function startListening() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = false;
  recognition.lang = "en-US";

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    processCommand(transcript);
  };

  recognition.start();
  isListening = true;
}

function stopListening() {
  if (recognition && isListening) {
    recognition.stop();
    isListening = false;
  }
    }
