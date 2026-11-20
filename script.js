/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Replace this with the class-hosted Cloudflare Worker URL.
const workerUrl = "https://loreal-chatbot.your-subdomain.workers.dev/";

// Keep the conversation in the format required by OpenAI.
const messages = [];

// Set the initial message and keep it in the chat window.
chatWindow.textContent = "";
const welcomeMessage = document.createElement("div");
welcomeMessage.className = "msg ai";
welcomeMessage.textContent = "👋 Hello! How can I help you today?";
chatWindow.appendChild(welcomeMessage);

// Add a message to the chat window.
function displayMessage(role, text) {
  const message = document.createElement("div");
  message.className = `msg ${role}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Read and trim the text entered by the user.
  const text = userInput.value.trim();
  if (!text) return;

  // Show the user's message and clear the input.
  displayMessage("user", text);
  userInput.value = "";

  // Add the message to the conversation sent to the Worker.
  messages.push({ role: "user", content: text });

  try {
    // Send the conversation to the Cloudflare Worker.
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error("The chatbot server returned an error.");
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // Save and display the assistant's reply.
    messages.push({ role: "assistant", content: reply });
    displayMessage("ai", reply);
  } catch (error) {
    displayMessage("ai", "Sorry, I couldn't reach the chatbot. Please try again.");
  }
});
