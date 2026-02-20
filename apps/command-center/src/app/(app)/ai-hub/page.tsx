'use client';

import { useState } from 'react';
import { getToken } from '@/lib/auth';

type Tab = 'chatgpt' | 'copilot' | 'orchestrator' | 'runner' | 'plugin';

const SYSTEM_PROMPT = `You are the AI assistant for Construct-OS, an autonomous construction intelligence platform by Infinity X One Systems.

PLATFORM: Construct-OS Command Center
REPO: InfinityXOneSystems/construct-iq-360
URL: https://infinityxonesystems.github.io/construct-iq-360/
STACK: Next.js 15 (static export), TypeScript, Tailwind CSS, GitHub Pages, Python agents

AGENTS (6 autonomous agents):
- Hunter: Lead discovery (Orlando metro permit databases + Google Maps)
- Architect: CSI MasterFormat estimation + AIA G702/G703 billing + Vertex AI AutoML
- Orator: Document generation (11+ construction templates)
- Shadow: Headless browser automation (form fill, click, scroll, snapshot) + REST API
- Commander: GitHub Pages deployment + workflow health + Genesis Loop
- Vault: Enterprise memory, context rehydration, audit logging

DISPATCH COMMANDS (via repository_dispatch):
- generate-document, build-project, create-agent, deploy-system, genesis-command, run-agent

ORCHESTRATION: ChatGPT or Copilot -> GitHub API -> repository_dispatch -> dispatch-bridge.yml -> agent runner

CRM STATUSES: new > contacted > proposal-sent > negotiating > won/lost
TEMPLATES: residential-bid, commercial-bid, ti-bid, change-order, subcontractor-agreement, lien-waiver, pre-construction-checklist, site-safety-checklist, lead-qualification-runbook, bid-preparation-runbook
BILLING: AIA G702/G703 style, retainage 10% to 5% at 50% completion, CSV export`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DISPATCH_COMMANDS = [
  { id: 'generate-document', label: 'Generate Document', payload: { doc_type: 'residential-bid', project_name: 'New Project' } },
  { id: 'run-agent', label: 'Run Hunter Agent', payload: { agent: 'hunter', target: 'orlando-permits' } },
  { id: 'run-agent', label: 'Run Architect Agent', payload: { agent: 'architect', action: 'estimate' } },
  { id: 'genesis-command', label: 'Genesis Loop', payload: { action: 'self-optimize' } },
  { id: 'create-agent', label: 'Create New Agent', payload: { agent_name: 'custom-agent', template: 'base' } },
  { id: 'deploy-system', label: 'Deploy System', payload: { target: 'github-pages' } },
];

const OPENAPI_SPEC = `openapi: 3.0.0
info:
  title: Construct-OS Infinity Orchestrator API
  version: 1.0.0
  description: >
    GitHub Actions runner bridge. ChatGPT sends commands to this API,
    which fires repository_dispatch events that trigger GitHub Actions
    workflows on InfinityXOneSystems/construct-iq-360.

servers:
  - url: https://api.github.com

paths:
  /repos/InfinityXOneSystems/construct-iq-360/dispatches:
    post:
      operationId: dispatchCommand
      summary: Send a command to the Infinity Orchestrator via GitHub Actions runner
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [event_type]
              properties:
                event_type:
                  type: string
                  enum:
                    - generate-document
                    - build-project
                    - create-agent
                    - deploy-system
                    - genesis-command
                    - run-agent
                    - run-invention-cycle
                  description: Command type dispatched to the GitHub Actions runner
                client_payload:
                  type: object
                  description: Command parameters passed to the runner
      responses:
        '204':
          description: Command accepted - runner triggered

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: GitHub Personal Access Token with repo scope`;

const PLUGIN_MANIFEST = `{
  "schema_version": "v1",
  "name_for_model": "construct_os_orchestrator",
  "name_for_human": "Construct-OS Orchestrator",
  "description_for_model": "Dispatch commands to the Construct-OS autonomous construction intelligence platform via GitHub Actions runners. Use this to generate documents, run agents (Hunter, Architect, Orator, Shadow, Commander, Vault), trigger deployments, and interact with the CRM, billing, and template systems.",
  "description_for_human": "Control the Construct-OS platform: run agents, generate construction documents, manage leads and billing via GitHub Actions.",
  "auth": {
    "type": "user_http",
    "authorization_type": "bearer"
  },
  "api": {
    "type": "openapi",
    "url": "https://infinityxonesystems.github.io/construct-iq-360/openapi.yaml"
  },
  "logo_url": "https://infinityxonesystems.github.io/construct-iq-360/icons/icon-192.png",
  "contact_email": "admin@infinityxonesystems.com",
  "legal_info_url": "https://github.com/InfinityXOneSystems/construct-iq-360"
}`;

const COPILOT_INSTRUCTIONS = `# Copilot Mobile - Construct-OS System Context

## Repository
InfinityXOneSystems/construct-iq-360
Live: https://infinityxonesystems.github.io/construct-iq-360/

## Your Capabilities in This Repo
When working in this repository via Copilot Mobile, you can:

### Read & Understand
- Full codebase: Next.js frontend, Python agents, GitHub Actions workflows
- Agent blueprints: Hunter, Architect, Orator, Shadow, Commander, Vault
- Construction domain: CSI MasterFormat Div 01-33, AIA G702/G703, retainage

### Write & Execute
- TypeScript pages in apps/command-center/src/app/(app)/
- Python agents in apps/hunter-agent/ or apps/biz-ops/agents/
- Workflow YAML in .github/workflows/
- Templates in apps/command-center/src/lib/templates.ts
- CRM data in apps/command-center/src/lib/crm.ts

### Trigger Runners
curl -X POST https://api.github.com/repos/InfinityXOneSystems/construct-iq-360/dispatches \\
  -H "Authorization: Bearer YOUR_PAT" \\
  -H "Accept: application/vnd.github.v3+json" \\
  -d '{"event_type": "generate-document", "client_payload": {"doc_type": "residential-bid"}}'

## System Architecture
- Static export app (no API routes - all backend via GitHub Actions)
- Auth: GitHub PAT in localStorage (ciq360_gh_token, ciq360_gh_user)
- Styling: Tailwind - bg-dark-bg (#000), border-neon-green (#39FF14), NO emojis in UI

## Key Files
- src/lib/auth.ts            GitHub PAT auth
- src/lib/templates.ts       11 construction templates
- src/lib/crm.ts             CRM types + sample data
- src/lib/billing.ts         Invoice calculator
- src/lib/plugin-adapter.ts  Plugin system for external connectors
- apps/hunter-agent/main.py  Lead sniper agent
- apps/biz-ops/agents/       Full biz-ops agent team`;

export default function AiHubPage() {
  const [tab, setTab] = useState<Tab>('chatgpt');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string>('');
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);

  const token = getToken();

  const sendMessage = async () => {
    if (!input.trim() || !apiKey.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content ?? 'No response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Unable to reach OpenAI API.' }]);
    } finally {
      setLoading(false);
    }
  };

  const dispatchCommand = async (cmd: typeof DISPATCH_COMMANDS[0]) => {
    if (!token) { setDispatchStatus('No GitHub token found. Please log in.'); return; }
    setDispatchLoading(true);
    setDispatchStatus('');
    try {
      const res = await fetch('https://api.github.com/repos/InfinityXOneSystems/construct-iq-360/dispatches', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_type: cmd.id, client_payload: cmd.payload }),
      });
      if (res.status === 204) {
        setDispatchStatus(`Command dispatched: ${cmd.label}. Runner triggered.`);
      } else {
        const err = await res.json().catch(() => ({}));
        setDispatchStatus(`Error ${res.status}: ${(err as { message?: string }).message ?? 'Dispatch failed.'}`);
      }
    } catch {
      setDispatchStatus('Network error. Check connection and token.');
    } finally {
      setDispatchLoading(false);
    }
  };

  const copy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 1500);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'chatgpt', label: 'ChatGPT' },
    { id: 'copilot', label: 'Copilot Mobile' },
    { id: 'orchestrator', label: 'Orchestrator' },
    { id: 'runner', label: 'Runner' },
    { id: 'plugin', label: 'Plugin Adapter' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 py-5 border-b border-neon-green/10">
        <h1 className="text-xs font-bold text-white uppercase tracking-widest">AI Hub</h1>
        <p className="text-xs text-gray-600 mt-0.5">ChatGPT, Copilot Mobile, Orchestrator, Runner, Plugin Connectors</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neon-green/10 px-8">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-xs uppercase tracking-widest transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-neon-green text-neon-green'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* ChatGPT */}
        {tab === 'chatgpt' && (
          <div className="flex flex-col h-full">
            <div className="px-8 py-4 border-b border-neon-green/5">
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">OpenAI API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full max-w-md bg-black border border-neon-green/10 rounded px-3 py-2 text-white text-xs font-mono placeholder-gray-700 focus:outline-none focus:border-neon-green/40"
              />
              <p className="text-xs text-gray-700 mt-1">Key stays in-browser. Never sent to any server other than OpenAI.</p>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-xs text-gray-600 uppercase tracking-widest mb-6">GPT-4o — Construct-OS Context Loaded</div>
                  <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                    {[
                      'Generate a residential bid for a 3,500 sqft home renovation',
                      'Qualify this lead: $250K commercial TI, permit pending',
                      'Draft a change order for $15,000 HVAC scope addition',
                      'Show me AIA retainage rules for a $2M project',
                    ].map(s => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="text-left text-xs text-gray-500 border border-neon-green/10 rounded p-3 hover:border-neon-green/30 hover:text-gray-300 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl rounded px-4 py-3 ${
                    m.role === 'user'
                      ? 'bg-neon-green/10 border border-neon-green/20 text-white'
                      : 'bg-dark-surface border border-neon-green/10 text-gray-300'
                  }`}>
                    <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${m.role === 'user' ? 'text-neon-green' : 'text-gray-600'}`}>
                      {m.role === 'user' ? 'You' : 'GPT-4o'}
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-sm">{m.content}</pre>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-dark-surface border border-neon-green/10 rounded px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-4 border-t border-neon-green/10">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask GPT-4o about construction, leads, billing..."
                  className="flex-1 bg-black border border-neon-green/10 rounded px-4 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-neon-green/40"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !apiKey || !input.trim()}
                  className="px-5 py-2.5 bg-neon-green text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-white transition-colors disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Copilot Mobile */}
        {tab === 'copilot' && (
          <div className="px-8 py-6 max-w-3xl space-y-6">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Copilot Mobile — System Connection</h2>
              <p className="text-xs text-gray-500">Configure GitHub Copilot Mobile to read and write to this repository with full agent context and runner access.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  step: 'Step 1',
                  title: 'Connect Repository',
                  items: [
                    'Open GitHub Mobile app — tap Copilot',
                    'Tap "+" then Add repository context',
                    'Search and select InfinityXOneSystems/construct-iq-360',
                    'Grant read/write permissions',
                  ],
                },
                {
                  step: 'Step 2',
                  title: 'System Instructions File',
                  items: [
                    'Copilot Mobile reads .github/copilot-instructions.md automatically',
                    'This file contains full system context, agent capabilities, and dispatch commands',
                    'The file is maintained by the Commander agent and updated each Genesis Loop',
                  ],
                },
              ].map(section => (
                <div key={section.step} className="bg-dark-surface border border-neon-green/10 rounded p-5">
                  <h3 className="text-xs font-bold text-neon-green uppercase tracking-widest mb-3">{section.step} — {section.title}</h3>
                  <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
                    {section.items.map(item => <li key={item}>{item}</li>)}
                  </ol>
                </div>
              ))}

              <div className="bg-dark-surface border border-neon-green/10 rounded p-5">
                <h3 className="text-xs font-bold text-neon-green uppercase tracking-widest mb-3">Step 3 — Trigger Runners from Mobile</h3>
                <p className="text-xs text-gray-500 mb-3">Ask Copilot to run this curl command with your PAT to fire a GitHub Actions runner:</p>
                <div className="bg-black rounded p-3 font-mono text-xs text-gray-400 overflow-x-auto leading-relaxed">
                  <span className="text-neon-green">curl</span> -X POST \<br/>
                  {'  '}https://api.github.com/repos/InfinityXOneSystems/construct-iq-360/dispatches \<br/>
                  {'  '}-H &quot;Authorization: Bearer {'$'}{'{YOUR_PAT}'}&quot; \<br/>
                  {'  '}-H &quot;Accept: application/vnd.github.v3+json&quot; \<br/>
                  {'  '}-d &apos;&#123;&quot;event_type&quot;: &quot;generate-document&quot;, &quot;client_payload&quot;: &#123;&quot;doc_type&quot;: &quot;residential-bid&quot;&#125;&#125;&apos;
                </div>
              </div>

              <div className="bg-dark-surface border border-neon-green/10 rounded p-5">
                <h3 className="text-xs font-bold text-neon-green uppercase tracking-widest mb-3">Copilot-Instructions.md Preview</h3>
                <pre className="bg-black rounded p-4 font-mono text-xs text-gray-400 overflow-y-auto max-h-64 whitespace-pre-wrap">{COPILOT_INSTRUCTIONS}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Orchestrator */}
        {tab === 'orchestrator' && (
          <div className="px-8 py-6 max-w-3xl space-y-6">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-1">ChatGPT Custom GPT — Infinity Orchestrator Bridge</h2>
              <p className="text-xs text-gray-500">
                The &quot;hack&quot;: ChatGPT Custom GPT with a GitHub API action. No separate server required —
                GitHub API acts as the bridge to GitHub Actions runners. ChatGPT dispatches commands
                that execute agents directly.
              </p>
            </div>

            <div className="bg-dark-surface border border-neon-green/10 rounded p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-neon-green uppercase tracking-widest">OpenAPI Action Spec</h3>
                <button
                  onClick={() => copy(OPENAPI_SPEC, setCopiedSpec)}
                  className="text-xs text-gray-500 hover:text-neon-green transition-colors uppercase tracking-widest border border-neon-green/10 rounded px-2 py-1"
                >
                  {copiedSpec ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-black rounded p-4 text-xs text-gray-400 overflow-x-auto font-mono whitespace-pre">{OPENAPI_SPEC}</pre>
            </div>

            <div className="bg-dark-surface border border-neon-green/10 rounded p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-neon-green uppercase tracking-widest">Plugin Manifest (ai-plugin.json)</h3>
                <button
                  onClick={() => copy(PLUGIN_MANIFEST, setCopiedManifest)}
                  className="text-xs text-gray-500 hover:text-neon-green transition-colors uppercase tracking-widest border border-neon-green/10 rounded px-2 py-1"
                >
                  {copiedManifest ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-black rounded p-4 text-xs text-gray-400 overflow-x-auto font-mono whitespace-pre">{PLUGIN_MANIFEST}</pre>
            </div>

            <div className="bg-dark-surface border border-neon-green/10 rounded p-5">
              <h3 className="text-xs font-bold text-neon-green uppercase tracking-widest mb-3">Setup in ChatGPT</h3>
              <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
                <li>ChatGPT → Explore GPTs → Create a GPT</li>
                <li>Name it <span className="text-white font-bold">Construct-OS Operator</span></li>
                <li>Instructions: paste the system prompt from the ChatGPT tab</li>
                <li>Configure → Add Action</li>
                <li>Paste the OpenAPI spec above</li>
                <li>Authentication: Bearer Token — paste your GitHub PAT (repo scope)</li>
                <li>Save and publish (private)</li>
                <li>ChatGPT can now dispatch commands to GitHub Actions runners</li>
              </ol>
            </div>
          </div>
        )}

        {/* Runner */}
        {tab === 'runner' && (
          <div className="px-8 py-6 max-w-3xl space-y-6">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-1">GitHub Actions Runner — Direct Dispatch</h2>
              <p className="text-xs text-gray-500">Dispatch commands directly to the runner from this dashboard using your authenticated session.</p>
            </div>

            {!token && (
              <div className="border border-red-400/20 rounded p-4 text-xs text-red-400 bg-red-400/5">
                No GitHub token found. Sign in to dispatch runner commands.
              </div>
            )}

            {dispatchStatus && (
              <div className={`border rounded p-4 text-xs ${
                dispatchStatus.toLowerCase().includes('error')
                  ? 'border-red-400/20 text-red-400 bg-red-400/5'
                  : 'border-neon-green/20 text-neon-green bg-neon-green/5'
              }`}>
                {dispatchStatus}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {DISPATCH_COMMANDS.map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => dispatchCommand(cmd)}
                  disabled={dispatchLoading || !token}
                  className="text-left bg-dark-surface border border-neon-green/10 rounded p-4 hover:border-neon-green/30 hover:bg-neon-green/5 transition-all disabled:opacity-40 group"
                >
                  <div className="text-xs font-bold text-white uppercase tracking-widest mb-1 group-hover:text-neon-green transition-colors">{cmd.label}</div>
                  <div className="text-xs text-gray-600 font-mono">{cmd.id}</div>
                  <div className="text-xs text-gray-700 mt-2 font-mono truncate">{JSON.stringify(cmd.payload)}</div>
                </button>
              ))}
            </div>

            <div className="bg-dark-surface border border-neon-green/10 rounded p-5">
              <h3 className="text-xs font-bold text-neon-green uppercase tracking-widest mb-4">Runner Architecture</h3>
              <div className="font-mono text-xs text-gray-400 space-y-0.5 leading-relaxed">
                <div><span className="text-neon-green">ChatGPT / Copilot / Dashboard</span></div>
                <div className="ml-4">↓  POST /repos/.../dispatches  (GitHub API)</div>
                <div className="ml-4"><span className="text-white">GitHub Actions Runner</span>  (ubuntu-latest)</div>
                <div className="ml-8">↓  dispatch-bridge.yml routes by event_type</div>
                <div className="ml-12 text-gray-600">generate-document  →  document-pipeline.yml</div>
                <div className="ml-12 text-gray-600">run-agent          →  hunter-cron.yml / biz-ops</div>
                <div className="ml-12 text-gray-600">genesis-command    →  genesis-loop.yml</div>
                <div className="ml-12 text-gray-600">deploy-system      →  deploy-command-center.yml</div>
                <div className="ml-8">↓  Output committed to data/ or docs/</div>
                <div className="ml-4"><span className="text-neon-green">Vault agent</span>  archives to data/dispatch-log/commands.jsonl</div>
              </div>
            </div>
          </div>
        )}

        {/* Plugin Adapter */}
        {tab === 'plugin' && (
          <div className="px-8 py-6 max-w-3xl space-y-6">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Plugin Adapter System</h2>
              <p className="text-xs text-gray-500">Connect Construct-OS to external sites and services. Each plugin is a typed connector registered with the adapter. See <code className="text-neon-green font-mono text-xs">src/lib/plugin-adapter.ts</code>.</p>
            </div>

            <div className="bg-dark-surface border border-neon-green/10 rounded p-5">
              <h3 className="text-xs font-bold text-neon-green uppercase tracking-widest mb-4">Registered Plugins</h3>
              <div className="space-y-2">
                {[
                  { name: 'Dodge Data & Analytics', type: 'leads', status: 'available', description: 'Commercial construction project leads from Dodge database' },
                  { name: 'ConstructConnect', type: 'leads', status: 'available', description: 'Bid management and project tracking integration' },
                  { name: 'Google Workspace', type: 'export', status: 'active', description: 'CSV export to Sheets, Docs generation to Drive' },
                  { name: 'DocuSign', type: 'contracts', status: 'available', description: 'Contract signature automation' },
                  { name: 'Procore', type: 'project-management', status: 'available', description: 'Project management sync via Procore API' },
                  { name: 'QuickBooks', type: 'billing', status: 'available', description: 'Invoice and billing export to QuickBooks Online' },
                  { name: 'Stripe', type: 'payments', status: 'available', description: 'Payment processing for proposals and invoices' },
                ].map(plugin => (
                  <div key={plugin.name} className="flex items-center justify-between bg-black border border-neon-green/5 rounded p-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white">{plugin.name}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{plugin.description}</div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0 ml-4">
                      <span className="text-xs text-gray-600 uppercase tracking-wider border border-neon-green/10 rounded px-2 py-0.5">{plugin.type}</span>
                      <span className={`text-xs uppercase tracking-wider border rounded px-2 py-0.5 ${
                        plugin.status === 'active'
                          ? 'text-neon-green border-neon-green/20'
                          : 'text-gray-600 border-gray-800'
                      }`}>{plugin.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark-surface border border-neon-green/10 rounded p-5">
              <h3 className="text-xs font-bold text-neon-green uppercase tracking-widest mb-3">Plugin Adapter API</h3>
              <div className="bg-black rounded p-4 font-mono text-xs text-gray-400 leading-relaxed">
                <div><span className="text-neon-green">import</span> {'{ PluginAdapter }'} <span className="text-neon-green">from</span> <span className="text-gray-300">&apos;@/lib/plugin-adapter&apos;</span>;</div>
                <div className="mt-3 text-gray-600">{/* Register an external connector */}</div>
                <div>PluginAdapter.register({'{ id: "procore", type: "project-management", ... }'});</div>
                <div className="mt-3 text-gray-600">{/* Execute a plugin action */}</div>
                <div>await PluginAdapter.execute(<span className="text-gray-300">&quot;procore&quot;</span>, <span className="text-gray-300">&quot;syncProject&quot;</span>, payload);</div>
                <div className="mt-3 text-gray-600">{/* List registered plugins */}</div>
                <div>PluginAdapter.list();</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
