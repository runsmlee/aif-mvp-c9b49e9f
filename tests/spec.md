# Test Specifications

## Unit Tests (Vitest + React Testing Library)

### Dashboard.test.tsx
- [ ] renders without crash
- [ ] displays all four main navigation tabs: Router, Fallbacks, Analytics, Providers
- [ ] active tab highlights correctly on click
- [ ] shows "No routing rules configured" when no rules exist

### ConfidenceRouter.test.tsx
- [ ] renders threshold slider with default value of 0.7
- [ ] changing threshold value updates displayed threshold label
- [ ] displays a list of configured models with confidence indicators
- [ ] shows escalation badge when mock logprob falls below threshold
- [ ] displays both original and escalated model responses side by side on escalation

### FallbackChain.test.tsx
- [ ] renders an empty fallback chain with "Add Model" button
- [ ] clicking "Add Model" opens a model selector dropdown
- [ ] selecting a model appends it to the fallback chain list
- [ ] each fallback entry shows model name, condition type, and remove button
- [ ] removing a model from the chain updates the list immediately
- [ ] reordering fallback entries via drag updates the chain order
- [ ] saving a chain with 3+ models shows success toast notification

### RoutingAnalytics.test.tsx
- [ ] renders analytics overview cards (Total Requests, Escalations, Avg Latency, Cost Savings)
- [ ] displays a request volume chart with mock data points
- [ ] escalation rate percentage matches calculated value from mock data
- [ ] cost savings figure is a positive dollar amount
- [ ] empty state shows "No routing data yet" message

### CostSimulator.test.tsx
- [ ] renders input field for monthly request volume
- [ ] entering a volume and clicking "Simulate" produces a strategy comparison table
- [ ] table shows at least 3 rows: Always Cheapest, Always Best, Confidence-Routed
- [ ] each row displays total cost, avg quality score, and savings percentage
- [ ] input validation prevents negative or zero request volumes
- [ ] default volume of 10,000 produces results with confidence-routed showing >20% savings

### CodeSnippet.test.tsx
- [ ] renders a syntax-highlighted code block with integration example
- [ ] code block contains exactly 5 lines of implementation code
- [ ] "Copy to Clipboard" button copies snippet text to clipboard
- [ ] shows "Copied!" confirmation for 2 seconds after copy

### RequestLogInspector.test.tsx
- [ ] renders a table with columns: Timestamp, Model, Confidence, Latency, Decision
- [ ] displays at least 10 mock log entries
- [ ] filter by model name narrows visible entries correctly
- [ ] filter by decision type (accepted/escalated) narrows entries correctly
- [ ] filter updates render within 200ms threshold
- [ ] empty filter results show "No matching requests" message

### ProviderRegistry.test.tsx
- [ ] renders provider cards for OpenAI, Anthropic, Google, Ollama
- [ ] clicking "Add Provider" shows API key input form
- [ ] "Test Connection" button triggers connection check and shows success/failure
- [ ] removing a provider shows confirmation dialog
- [ ] provider list persists after simulated page reload (localStorage)

## User Journey Tests

### Primary Workflow
1. App loads → Dashboard displays with Router tab active, empty state message shown
2. User adds a model provider (OpenAI) with API key → Provider appears in registry with green status
3. User configures confidence threshold to 0.7 → Threshold saved and displayed
4. User creates a fallback chain: GPT-4o-mini → GPT-4o → Claude Sonnet → Chain renders with 3 entries
5. User submits a test prompt → Routing decision executes, result shows with confidence score and badge
6. Analytics tab updates with new routing event → Request count increments, cost savings recalculates

### Integration Workflow
1. User navigates to "Get Started" section → 5-line code snippet is visible
2. User clicks "Copy to Clipboard" → Snippet copied, confirmation shown
3. User pastes snippet into their application → Code requires only API key replacement to function

## Acceptance Criteria Checklist
(Reviewer verifies these against PRD.md Must Have features)

- [ ] AC: Given a threshold of 0.7 and a response with avg logprob < -1.5, the request is re-routed to the fallback model and the user sees both responses with a routing decision badge.
- [ ] AC: Developer can copy a code snippet from the dashboard and run a routed LLM call in their app with zero additional configuration beyond setting an API key.
- [ ] AC: User can create a chain of 3+ models with distinct conditions, save it, and see it reflected in the routing dashboard immediately.
- [ ] AC: Dashboard displays at least 10 mock routing events with correct escalation counts, latency per model, and a dollar-amount savings figure.
