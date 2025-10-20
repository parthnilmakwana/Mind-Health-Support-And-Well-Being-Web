let breathingActive = false; // Track if breathing session is running

// Breathing Exercise Toggle Function
function toggleBreathing() {
    let breathingContainer = document.getElementById("breathing-container");

    if (!breathingActive) {
        breathingContainer.classList.add("active");
        breathingActive = true;
        startBreathing();
    } else {
        stopBreathing();
    }
}

// Function to stop breathing animation and voice
function stopBreathing() {
    let breathingContainer = document.getElementById("breathing-container");
    let breathingCircle = document.getElementById("breathing-circle");
    let breathingText = document.getElementById("breathing-text");

    // Hide breathing section
    breathingContainer.classList.remove("active");

    // Stop all animations
    breathingCircle.style.animation = "none";
    breathingText.innerText = "";

    // Stop speech synthesis
    speechSynthesis.cancel();

    // Reset the breathing state
    breathingActive = false;
}

// Function to make the assistant speak
function speak(text) {
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.5; // Slow and calming voice
    speechSynthesis.speak(utterance);
}

// Breathing Exercise Logic
function startBreathing() {
    let breathingText = document.getElementById("breathing-text");
    let breathingCircle = document.getElementById("breathing-circle");

    let steps = [
        { text: "Inhale...", animation: "inhale 4s ease-in-out", speech: "Inhale deeply", duration: 4 },
        { text: "Hold...", animation: "none", speech: "Hold your breath", duration: 4 },
        { text: "Exhale...", animation: "exhale 4s ease-in-out", speech: "Now Slowly exhale", duration: 4 }
    ];

    let stepIndex = 0;

    function runStep() {
        if (!breathingActive) return; // Stop if user exits

        let step = steps[stepIndex];

        breathingText.innerText = step.text;
        breathingCircle.style.animation = step.animation;

        // Speak the step instruction
        speak(step.speech);

        stepIndex = (stepIndex + 1) % steps.length;

        setTimeout(runStep, step.duration * 1000);
    }

    runStep();
}
