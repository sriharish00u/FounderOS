import { Router, Request, Response } from 'express';
import { AIEmployee } from '../models/AIEmployee';
import { Activity } from '../models/Activity';
import { encryptSecret } from '../utils/crypto';
import { requireAuth, type AuthUser } from './authRoutes';

const router = Router();

const toDTO = (doc: any) => {
  const plain = doc.toObject ? doc.toObject() : doc;
  const { apiKeyCipher, apiKey, ...rest } = plain;
  return { ...rest, hasApiKey: Boolean(apiKeyCipher?.data), id: String(doc._id) };
};

const deriveProvider = (url?: string): string => {
  if (!url) return 'Custom';
  const host = url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
  if (host.includes('openai')) return 'OpenAI';
  if (host.includes('anthropic')) return 'Anthropic';
  if (host.includes('groq')) return 'Groq';
  if (host.includes('google') || host.includes('gemini') || host.includes('generativelanguage')) return 'Google';
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0')) return 'Ollama';
  return 'Custom';
};

router.post('/models', requireAuth, async (req: Request, res: Response) => {
  try {
    const { url, apiKey } = req.body;
    if (!url || !apiKey) {
      return res.status(400).json({ error: 'Both endpoint URL and API key are required' });
    }
    const base = String(url).replace(/\/+$/, '');
    const endpoints = [`${base}/models`, `${base}/v1/models`];
    let models: string[] = [];

    for (const endpoint of endpoints) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json'
          },
          signal: ctrl.signal
        });
        clearTimeout(timer);

        if (!response.ok) continue;
        const json = (await response.json()) as Record<string, unknown>;
        const data = json.data ?? json.models ?? [];
        models = (Array.isArray(data) ? data : [])
          .map((m: unknown) => {
            if (typeof m === 'string') return m;
            if (m && typeof m === 'object' && 'id' in m) return String((m as { id: unknown }).id);
            return '';
          })
          .filter((m) => m.length > 0) as string[];
        if (models.length > 0) break;
      } catch (err) {
        if ((err as Error).name === 'AbortError') continue;
      }
    }

    if (models.length === 0) {
      return res.status(400).json({
        error: `Could not load models from ${base}. Check that the endpoint is OpenAI-compatible (exposes /models) and the key is valid.`
      });
    }

    res.json({ provider: deriveProvider(base), models });
  } catch (error) {
    res.status(400).json({ error: 'Could not load models. Please verify the endpoint URL and API key.' });
  }
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const aiList = await AIEmployee.find({ companyCode }).sort({ createdAt: -1 });
    res.json(aiList.map(toDTO));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI employees' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const {
      name,
      role,
      department,
      managerName,
      provider,
      model,
      apiEndpoint,
      apiKey,
      fallbackModel,
      fallbackModels,
      instructions,
      priority
    } = req.body;

    const base = apiEndpoint ? String(apiEndpoint).replace(/\/+$/, '') : '';

    const fallbacks = Array.isArray(fallbackModels)
      ? fallbackModels.map(String).filter(Boolean)
      : (fallbackModel ? [String(fallbackModel)] : []);

    const newAI = await AIEmployee.create({
      name,
      companyCode,
      role,
      department,
      managerName: managerName || user?.name || 'Sri Harish (Founder)',
      provider: provider || deriveProvider(base) || 'Anthropic',
      model,
      apiEndpoint: base || undefined,
      apiKeyCipher: apiKey ? encryptSecret(String(apiKey)) : undefined,
      fallbackModels: fallbacks.length ? fallbacks : undefined,
      fallbackModel: fallbacks[0] || undefined,
      priority: priority || 'HIGH',
      status: 'idle',
      avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150',
      permissions: ['execute_agent_prompts', 'submit_drafts', 'store_memory'],
      tasksCompleted: 0,
      tasksRunning: 0,
      successRate: 100,
      lastActive: 'Just now',
      memory: {
        identitySummary: `${name} is Founder OS's specialized ${role}.`,
        responsibilities: [
          `Execute designated ${role} workflows`,
          'Maintain real-time execution context in Founder OS',
          'Follow organizational quality benchmarks'
        ],
        companyContext: 'Founder OS Tech Labs - AI Software & Operating Systems',
        instructions: instructions || 'Execute tasks efficiently and report results with verifiable metrics.',
        preferences: ['Direct response', 'High accuracy', 'Verifiable outputs'],
        keyLearnings: ['Initialized in Founder OS V1 workforce.'],
        previousOutputsSummary: 'Ready for initial task assignment.',
        tokenCount: 1250,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: user?.name ?? 'Founder',
      actorType: 'founder',
      action: 'provisioned and deployed AI employee',
      target: `${newAI.name} (${newAI.model})`,
      category: 'hire'
    });

    res.status(201).json(toDTO(newAI));
  } catch (error) {
    res.status(500).json({ error: 'Failed to create AI employee' });
  }
});

router.put('/:id/memory', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const { id } = req.params;
    const updates = req.body;
    
    const ai = await AIEmployee.findOne({ _id: id, companyCode });
    if (!ai) {
      res.status(404).json({ error: 'AI Employee not found' });
      return;
    }

    ai.memory = {
      ...ai.memory,
      ...updates,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    await ai.save();
    res.json(toDTO(ai));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update AI memory' });
  }
});

export default router;