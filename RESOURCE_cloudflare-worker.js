// Copy this code into your Cloudflare Worker script

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const userInput = await request.json();
    const allowedRoles = ['user', 'assistant'];

    // Only accept chat messages so visitors cannot replace the assistant instructions.
    if (
      !Array.isArray(userInput.messages) ||
      userInput.messages.some(
        (message) =>
          !message ||
          !allowedRoles.includes(message.role) ||
          typeof message.content !== 'string'
      )
    ) {
      return new Response(
        JSON.stringify({ error: 'messages must contain user or assistant text messages' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = env.OPENAI_API_KEY; // Make sure to name your secret OPENAI_API_KEY in the Cloudflare Workers dashboard
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const requestBody = {
      model: 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful and knowledgeable L’Oréal beauty assistant. Your role is to answer questions exclusively about L’Oréal products, skincare, haircare, makeup, beauty routines, and personalized product recommendations. Provide clear, friendly, and accurate responses based on the user’s needs, preferences, and concerns. Do not invent product details or make unsupported claims. If a user asks a question unrelated to L’Oréal, politely redirect them by saying, "I\'m here to help with L’Oréal products and beauty recommendations. How can I assist you?"'
        },
        ...userInput.messages
      ],
      max_completion_tokens: 300,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), { headers: corsHeaders });
  }
};
