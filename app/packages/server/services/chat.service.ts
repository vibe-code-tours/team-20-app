import fs from 'fs';
import path from 'path';
// import OpenAI from 'openai';
import { conversationRepository } from '../repositories/conversation.repository';
import { llmClient } from '../llm/client';

// __dirname compatibility: works in ESM (tsx) and CJS (Netlify esbuild bundle)
const __dirname = path.dirname(
   typeof import.meta?.url !== 'undefined'
      ? new URL(import.meta.url).pathname
      : typeof __filename !== 'undefined'
        ? __filename
        : path.join(process.cwd(), 'packages/server')
);

// implementation details // keep private
// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Read .txt prompt files via fs (Bun can import .txt directly, Node.js cannot)
const template = fs.readFileSync(
   path.join(__dirname, '..', 'prompts', 'chatbot.txt'),
   'utf-8'
);

const extractionTemplate = fs.readFileSync(
   path.join(__dirname, '..', 'prompts', 'order_extraction.txt'),
   'utf-8'
);

const info = fs.readFileSync(
   path.join(__dirname, '..', 'prompts', '20June26Event.md'),
   'utf-8'
);

const instructions = template.replace('{{Info}}', info);

type chatResponse = { id: string; message: string };

type ExtractOrderResult = {
   items: {
      name: string;
      quantity: number;
      action: 'add' | 'set' | 'remove';
   }[];

   note: string;
};

// publish the interface of the chat service
export const chatService = {
   async sendMessage(
      prompt: string,
      conversationId: string
   ): Promise<chatResponse> {
      const response = await llmClient.generateText({
         model: 'gpt-4o-mini',
         instructions,
         prompt,
         temperature: 0.2,
         maxOutputToken: 300,
         previousResponseId:
            conversationRepository.getLastResponseId(conversationId),
      });

      conversationRepository.setLastResponseId(conversationId, response.id);

      return {
         id: response.id,
         message: response.text,
      };
   },
   async extractOrder(
      userText: string,
      menuItems: string[]
   ): Promise<ExtractOrderResult> {
      const menuContext = `Available menu:\n${menuItems.map((n, i) => `${i + 1}. ${n}`).join('\n')}`;

      const response = await llmClient.generateText({
         model: 'gpt-4o-mini',
         instructions: `${extractionTemplate}\n\n${menuContext}`,
         prompt: userText,
         temperature: 0,
         maxOutputToken: 300,
      });

      const raw = response.text?.trim() ?? '{"items":[],"note":""}';
      const cleaned = raw
         .replace(/^```json\s*/i, '')
         .replace(/```$/i, '')
         .trim();

      // const parsed = JSON.parse(raw);
      let parsed: any;
      try {
         parsed = JSON.parse(cleaned);
      } catch {
         return { items: [], note: '' };
      }

      return {
         items: Array.isArray(parsed.items)
            ? parsed.items
                 .map((i: any) => ({
                    name: String(i.name ?? '').trim(),
                    quantity: Number(i.quantity ?? 1),
                    action: ['add', 'set', 'remove'].includes(
                       String(i.action).toLowerCase()
                    )
                       ? String(i.action).toLowerCase()
                       : 'add',
                 }))
                 .filter((i: any) => i.name)
            : [],
         note: typeof parsed.note === 'string' ? parsed.note : '',
      };
   },
};
