const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
require('dotenv').config();
const { OpenAI } = require('openai'); // Import the OpenAI library
const readlineSync = require("readline-sync"); 

const app = express();
//const port = 3000;
const port = process.env.PORT || 3000;

//app.use(express.static('public')); // Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); // Parse JSON bodies

// Path to the configuration file
const configPath = path.join(__dirname, 'config.json');
//console.log('configPath:', configPath);

// Read and parse the JSON configuration file
// Read and parse the JSON configuration file
let config = {};
try {
  if (fs.existsSync(configPath)) {
    const configFile = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configFile);
  }
} catch (err) {
  console.warn('Warning: Could not read config.json, relying on environment variables.');
}


// Extract the OpenAI API key from the configuration or environment variables
const openaiApiKey = process.env.OPENAI_API_KEY || config.OPENAI_API_KEY;

if (!openaiApiKey) {
    console.error('Error: OPENAI_API_KEY is not set in environment variables or config.json');
    process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
    //apiKey: process.env.OPENAI_SECRET_KEY, // Use environment variable for API key
	apiKey: openaiApiKey, // Use environment variable for API key
});



const chatHistory = []; 
let user_input = "";

user_input += "I have a degree in biology and have previous experience working in a lab \n";
user_input += "// Biology Research Scientist: A biology research scientist conducts research in a labratory on a specific field of biology. These jobs are open for nearly all fields of biology \n";
user_input += "// Biotechnician: Biotechnicians help scientists and researchers in various locations. They do things like make sure the equipment is running correctly or manning the equipment so the scientist can proceed with their research. This job is suggested for people with a bachelors or associates in biology as well as expereince as a technician or engineer.\n";
user_input += "// Biomedical Research: Biomedical Researchers conduct top-of-the-line research based on biology and medicine.This job is suggested for people who are interested in biology and medicine. Suggested for people who have a PhD or masters in biology and experience in medicine as well.\n";
user_input += "I have worked in construction before but didn't go to college \n";
user_input += "// Construction Manager: A construction manager supervises a group of contruction workers when they are working on buildings. This job is recommended if you are able to communicate well with others as well as have leadership skills.\n";
user_input += "// Carpenter: A carpenter constructs and installs frameworks made from wood into existing buildings. This is a good recommendation for people who work well with wood and are competent in mathematics and design.\n";
user_input += "// Construction Inspector: A construction inspector inspects buildings and roads to make sure that they all follow the construction requirements. This job is recommended for people who have a high school diploma as well as experience within construction.\n";
user_input += "I have a phd in pharmaceutical science but I have a felony charge for a controlled substance violation, so I can't go back into that field. I don't know what I want to do next, could you pklease provide a few ideas that are easy for me to transition into?";
user_input += "// Medical Manufacturing: This job is in the same industry as pharmaceutical science, but you'll get tested less for drugs than before.";
user_input += "// Customer Service in Health Insurance: Answer calls from customers in health insurance. This is a good transition because a lot of the skills are transferrable and the terms and experiences are similar";
user_input += " I am a stay-home mom with experience in secretarial science, but I received that degree 20 years ago and haven't worked since. What are some jobs that I could work in?";
user_input += "// Customer Service: ";
user_input += "// Office Manager: ";
user_input += "// Scheduler: ";


prompt_input = "// Please provide job or career related information back based on the user information provided. And please send response back in the bullet format."

//prompt_input = "// Please send response back in the bullet format."
	
	
app.post('/api/process', async (req, res) => {
//app.post('/api/submit', async (req, res) => {	
    //const userInput = req.body.input;
	const userInput = req.body.text;

	//console.log('Received user input:', userInput); // Log the input for debugging
	
    //if (!userInput) {
    //    return res.status(400).json({ error: 'No input provided' });
    //}
	
	user_input += userInput;
	//user_input = userInput;
	
	user_input += prompt_input;

    try {
		
		const messageList = chatHistory.map(([input_text, completion_text]) => ({ 
			role: "user" === input_text ? "ChatGPT" : "user", 
			content: input_text 
		})); 
		messageList.push({ role: "user", content: user_input });
		
		//console.log('messageList:', messageList); // Log the messageList for debugging				
		
        // Use the OpenAI client library to create a chat completion
        const chatCompletion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Use the model you need
            messages: [{ role: 'user', content: user_input }], // Create the message format required
			//messages: messageList,
        });
		const output_text = chatCompletion.choices[0].message.content; 
		//console.log('output_text:', output_text); // Log the output for debugging		
		
		chatHistory.push([user_input, output_text]); 
		
        const data = chatCompletion.choices[0].message.content.trim();
		//console.log('data:', data); // Log the output for debugging			
		res.json({response: data});
        //res.json({ data });
		//res.json(data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred' });
    }
	
	user_input = "";
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

