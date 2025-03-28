//create a service that will be used to interact with the gen ai api
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GenAIService {
  constructor(private http: HttpClient) {}

    
   async formatExplanation(textToFormat: string) : Promise<string> {
    //create a system prompt
    const systemPrompt = `
You are a skilled text formatter specializing in converting plain text into well-structured and visually appealing Markdown. 
Your task is to enhance readability and structure without altering the meaning of the content. Use headings, subheadings, lists, quotes, code blocks, or other Markdown elements where applicable.
Ensure the output is clean, easy to read, and remains true to the input language.
`;
const userPrompt = `
Please format the following text into clean Markdown without modifying the original content or its language. 

### Instructions:
- Do not change the text and only add markdown formatting while enhancing its structure using appropriate Markdown elements.
- Use **headings** for titles, **subheadings** for sections, and **lists** for items where applicable.
- Add **blockquotes** for quotes, **code blocks** for any code snippets, and **bold/italic** emphasis for important terms if needed.
- Break text into logical **paragraphs** to improve readability.
- Ensure the output matches the language of the input text.


### Input Text:
${textToFormat}

### Desired Output:
The explanation should be formatted into clean and understandable Markdown, making it easy to follow while preserving its original meaning.
`;

    //create a request body
    const requestBody = {
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      max_tokens: 3000,
      temperature: 0.7
    };

    //send a post request to the api
    const response = await this.http.post('http://localhost:1234/v1/chat/completions', requestBody).toPromise();

    //return the formatted explanation as a string from the response
    if (response) {
      const responseData = response as any;
      console.log("responseData", responseData);
      return responseData['choices'][0]['message']['content'];
    }
    throw new Error('Failed to format explanation');
   }     

async generateDescription(title: string) : Promise<string> {
  //create a system prompt
const systemPrompt = ` You are a skilled content creator
who generates engaging and AI Friendly descriptions for content which can be further used by AI to create more structured content.`;    

const userPrompt = `
Generate a description for the following content title:
${title}
Ensure the description is engaging and AI Friendly.`;
    
const requestBody = {
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    max_tokens: 3000,
    temperature: 0.7
  };

  //send a post request to the api
  const response = await this.http.post('http://localhost:1234/v1/chat/completions', requestBody).toPromise();

  //return the description as a string from the response
  if (response) {
    const responseData = response as any;
    return responseData['choices'][0]['message']['content'];
  }
  throw new Error('Failed to generate description');

}

async generateMetadata(data: {
  title: string;
  description: string;
  language: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  console.log("data", data);
  const requestBody = {
    messages: [
      { role: 'system', content: data.systemPrompt },
      { role: 'user', content:data.userPrompt }
    ],
    max_tokens: 3000,
    temperature: 0.3
  };

  const response = await this.http.post('http://localhost:1234/v1/chat/completions', requestBody).toPromise();
  console.log("response", response);
  if (response) {
    const responseData = response as any;
    return responseData['choices'][0]['message']['content'];
  }
  throw new Error('Failed to generate metadata');
}

private formatPrompt(template: string, data: any): string {
  return template
    .replace(/\{\{title\}\}/g, data.title)
    .replace(/\{\{description\}\}/g, data.description)
    .replace(/\{\{language\}\}/g, data.language);
}


async generatePart(data: {
  title: string; 
  description: string;
  context: string;
  language: string;
  sectionCount: number;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {       

  const requestBody = {
    messages: [{ role: 'system', content: data.systemPrompt }, { role: 'user', content: data.userPrompt }],
    max_tokens: 3000,
    temperature: 0.3
  };

  const response = await this.http.post('http://localhost:1234/v1/chat/completions', requestBody).toPromise();
  console.log("response", response);
  if (response) {
    const responseData = response as any;
    return responseData['choices'][0]['message']['content'];
  }
  throw new Error('Failed to generate part');
}


async generateSection(data: {
  title: string; 
  description: string;
  context: string;
  language: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {

    const requestBody = {
      messages: [{ role: 'system', content: data.systemPrompt }, { role: 'user', content: data.userPrompt }],
      max_tokens: 3000,
      temperature: 0.3
    };

    const response = await this.http.post('http://localhost:1234/v1/chat/completions', requestBody).toPromise();
    console.log("response", response);
    if (response) {
      const responseData = response as any;
      return responseData['choices'][0]['message']['content'];
    }
    throw new Error('Failed to generate section');


}   

}
