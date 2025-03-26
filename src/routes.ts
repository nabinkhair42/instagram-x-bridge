import { Router } from 'express';
import instagramController from './features/instagram/controllers';
import llmController from './features/llm/controllers';
import twitterController from './features/twitter/controllers';
import workflowController from './features/workflow/controllers';

// Add explicit type annotation to fix the type inference error
const router: Router = Router();

// Instagram routes
router.get('/instagram/latest', instagramController.getLatestPost.bind(instagramController));

// LLM routes
router.post('/summarize', llmController.summarizeText.bind(llmController));

// Twitter routes
router.post('/tweet', twitterController.postTweet.bind(twitterController));

// Workflow routes
router.post('/process-instagram', workflowController.processInstagram.bind(workflowController));

export default router;
