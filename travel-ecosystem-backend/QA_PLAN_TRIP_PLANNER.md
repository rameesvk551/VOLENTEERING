# Trip Planner - QA Plan & Test Specifications

## Test Strategy

### Test Pyramid
```
        /\
       /E2E\          10% - End-to-end user flows
      /______\
     /        \
    /Integration\     30% - API integration tests
   /____________\
  /              \
 /  Unit Tests    \   60% - Component & service unit tests
/__________________\
```

## 1. Unit Tests

### Frontend Components

#### AttractionCard.test.tsx
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AttractionCard } from '@/components/AttractionCard';

describe('AttractionCard', () => {
  const mockAttraction = {
    id: '1',
    name: 'Test Attraction',
    description: 'Test description',
    latitude: 1.0,
    longitude: 1.0,
    imageUrl: 'https://example.com/image.jpg',
    rating: 4.5
  };

  it('renders attraction details', () => {
    render(<AttractionCard attraction={mockAttraction} isSelected={false} onToggle={() => {}} />);
    
    expect(screen.getByText('Test Attraction')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockAttraction.imageUrl);
  });

  it('shows selected state', () => {
    const { container } = render(
      <AttractionCard attraction={mockAttraction} isSelected={true} onToggle={() => {}} />
    );
    
    expect(container.querySelector('[aria-pressed="true"]')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const handleToggle = jest.fn();
    render(<AttractionCard attraction={mockAttraction} isSelected={false} onToggle={handleToggle} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleToggle).toHaveBeenCalledWith('1');
  });

  it('meets accessibility standards', async () => {
    const { container } = render(
      <AttractionCard attraction={mockAttraction} isSelected={false} onToggle={() => {}} />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has minimum touch target size', () => {
    const { container } = render(
      <AttractionCard attraction={mockAttraction} isSelected={false} onToggle={() => {}} />
    );
    
    const button = container.querySelector('button');
    const rect = button?.getBoundingClientRect();
    
    expect(rect?.width).toBeGreaterThanOrEqual(44);
    expect(rect?.height).toBeGreaterThanOrEqual(44);
  });
});
```

#### OptimizeModal.test.tsx
```typescript
describe('OptimizeModal', () => {
  it('renders when open', () => {
    render(<OptimizeModal isOpen={true} onClose={() => {}} selectedCount={3} onSubmit={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes on backdrop click', () => {
    const handleClose = jest.fn();
    render(<OptimizeModal isOpen={true} onClose={handleClose} selectedCount={3} onSubmit={() => {}} />);
    
    fireEvent.click(screen.getByRole('dialog').previousSibling); // backdrop
    expect(handleClose).toHaveBeenCalled();
  });

  it('validates travel type selection', () => {
    render(<OptimizeModal isOpen={true} onClose={() => {}} selectedCount={3} onSubmit={() => {}} />);
    
    const submitButton = screen.getByText('Optimize Route');
    expect(submitButton).toBeDisabled(); // No travel type selected
  });

  it('submits with correct payload', () => {
    const handleSubmit = jest.fn();
    render(<OptimizeModal isOpen={true} onClose={() => {}} selectedCount={3} onSubmit={handleSubmit} />);
    
    // Select travel types
    fireEvent.click(screen.getByLabelText('Public travel mode'));
    fireEvent.click(screen.getByLabelText('Walk travel mode'));
    
    // Set budget
    const slider = screen.getByLabelText('Budget slider');
    fireEvent.change(slider, { target: { value: 100 } });
    
    // Submit
    fireEvent.click(screen.getByText('Optimize Route'));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      travelTypes: ['PUBLIC_TRANSPORT', 'WALKING'],
      budget: 100,
      includeRealtimeTransit: true
    });
  });
});
```

### Backend Services

#### Route Optimizer - Algorithm Tests
```typescript
describe('Route Optimizer Algorithms', () => {
  const testPlaces = [
    { id: '1', name: 'A', lat: 0, lng: 0 },
    { id: '2', name: 'B', lat: 0, lng: 1 },
    { id: '3', name: 'C', lat: 1, lng: 1 },
    { id: '4', name: 'D', lat: 1, lng: 0 }
  ];

  describe('Nearest Neighbor', () => {
    it('returns valid route for 4 places', () => {
      const route = nearestNeighbor(testPlaces);
      expect(route).toHaveLength(4);
      expect(new Set(route.map(p => p.id)).size).toBe(4); // All unique
    });

    it('completes in <10ms for 10 places', () => {
      const places = generateRandomPlaces(10);
      const start = performance.now();
      nearestNeighbor(places);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(10);
    });
  });

  describe('2-Opt', () => {
    it('improves greedy solution', () => {
      const greedyRoute = nearestNeighbor(testPlaces);
      const optimizedRoute = twoOpt(testPlaces);
      
      const greedyDistance = calculateTotalDistance(greedyRoute);
      const optimizedDistance = calculateTotalDistance(optimizedRoute);
      
      expect(optimizedDistance).toBeLessThanOrEqual(greedyDistance);
    });

    it('handles edge case with 2 places', () => {
      const route = twoOpt(testPlaces.slice(0, 2));
      expect(route).toHaveLength(2);
    });
  });

  describe('Algorithm Selection', () => {
    it('selects NEAREST_NEIGHBOR for N<8', () => {
      const algorithm = selectAlgorithm(testPlaces.slice(0, 5), {});
      expect(algorithm).toBe('NEAREST_NEIGHBOR');
    });

    it('selects TSP_2OPT for N<12', () => {
      const algorithm = selectAlgorithm(generateRandomPlaces(10), {});
      expect(algorithm).toBe('TSP_2OPT');
    });
  });
});
```

#### Transportation Service - GTFS Tests
```typescript
describe('Transportation Service', () => {
  let db: Database;

  beforeAll(async () => {
    db = await setupTestDatabase();
    await importTestGTFSFeed(db);
  });

  describe('Nearby Stops', () => {
    it('finds stops within radius', async () => {
      const stops = await findNearbyStops({ lat: 1.0, lng: 1.0 }, 500);
      
      expect(stops.length).toBeGreaterThan(0);
      stops.forEach(stop => {
        const distance = haversineDistance({ lat: 1.0, lng: 1.0 }, stop.location);
        expect(distance).toBeLessThanOrEqual(500);
      });
    });

    it('uses PostGIS spatial index', async () => {
      const explainResult = await db.query(`
        EXPLAIN ANALYZE 
        SELECT * FROM gtfs_stops 
        WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(1.0, 1.0), 4326), 500)
      `);
      
      expect(explainResult.rows[0]['QUERY PLAN']).toContain('Index Scan');
    });
  });

  describe('RAPTOR Routing', () => {
    it('finds route with 0 transfers', async () => {
      const route = await raptorRouter.route('stop1', 'stop2', new Date(), 0);
      expect(route.transfers).toBe(0);
    });

    it('handles no direct route', async () => {
      const route = await raptorRouter.route('stop1', 'stop10', new Date(), 2);
      expect(route.transfers).toBeGreaterThan(0);
      expect(route.transfers).toBeLessThanOrEqual(2);
    });

    it('completes in <400ms', async () => {
      const start = performance.now();
      await raptorRouter.route('stop1', 'stop5', new Date(), 3);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(400);
    });
  });
});
```

## 2. Integration Tests

### API Endpoint Tests

```typescript
describe('Optimize Route Endpoint', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await createTestServer();
  });

  it('POST /api/v1/optimize-route - success', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/optimize-route',
      payload: {
        places: [
          { id: '1', name: 'A', lat: 1.0, lng: 1.0 },
          { id: '2', name: 'B', lat: 1.1, lng: 1.1 },
          { id: '3', name: 'C', lat: 1.2, lng: 1.2 }
        ],
        constraints: {
          travelTypes: ['WALKING'],
          budget: 50
        },
        options: {
          includeRealtimeTransit: false,
          algorithm: 'TSP_2OPT'
        }
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.data.optimizedOrder).toHaveLength(3);
    expect(body.data.estimatedDurationMinutes).toBeGreaterThan(0);
  });

  it('returns 400 for invalid payload', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/optimize-route',
      payload: {
        places: [] // Invalid: empty array
      }
    });

    expect(response.statusCode).toBe(400);
  });

  it('handles large N (async job)', async () => {
    const places = Array.from({ length: 20 }, (_, i) => ({
      id: `${i}`,
      name: `Place ${i}`,
      lat: Math.random(),
      lng: Math.random()
    }));

    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/optimize-route',
      payload: {
        places,
        constraints: { travelTypes: ['DRIVE'] },
        options: { includeRealtimeTransit: false }
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.jobId).toBeDefined();
    expect(body.statusUrl).toContain('/status');
  });
});

describe('Multimodal Transport Endpoint', () => {
  it('returns multiple transport options', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/transport/multi-modal-route',
      payload: {
        from: { lat: 1.0, lng: 1.0 },
        to: { lat: 1.1, lng: 1.1 },
        departureTime: new Date().toISOString(),
        modes: ['WALKING', 'PUBLIC_TRANSPORT', 'DRIVE']
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.options.length).toBeGreaterThan(0);
    
    const walkingOption = body.options.find(o => o.mode === 'WALKING');
    expect(walkingOption).toBeDefined();
    expect(walkingOption.cost).toBe(0);
  });
});
```

## 3. End-to-End Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Trip Planning Flow', () => {
  test('complete user journey', async ({ page }) => {
    // 1. Navigate to app
    await page.goto('http://localhost:5173?city=Singapore&country=Singapore');

    // 2. Wait for attractions to load
    await expect(page.locator('[data-testid="attraction-card"]')).toHaveCount(10, { timeout: 10000 });

    // 3. Select 3 attractions
    const attractions = page.locator('[data-testid="attraction-card"]');
    await attractions.nth(0).click();
    await attractions.nth(2).click();
    await attractions.nth(5).click();

    // 4. Verify FAB appears
    await expect(page.locator('[data-testid="selection-fab"]')).toBeVisible();
    await expect(page.locator('[data-testid="selection-fab"]')).toContainText('3');

    // 5. Open optimization modal
    await page.locator('[data-testid="selection-fab"]').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 6. Select travel preferences
    await page.locator('[aria-label="Public travel mode"]').click();
    await page.locator('[aria-label="Walk travel mode"]').click();
    
    // 7. Set budget
    await page.locator('[aria-label="Budget slider"]').fill('100');

    // 8. Submit optimization
    await page.locator('button:has-text("Optimize Route")').click();

    // 9. Wait for optimization (shows loading, then results)
    await expect(page.locator('text=Optimizing route...')).toBeVisible();
    await expect(page.locator('text=Optimized Route')).toBeVisible({ timeout: 15000 });

    // 10. Verify legs are displayed
    await expect(page.locator('[data-testid="leg-options-list"]')).toHaveCount(2); // 3 places = 2 legs

    // 11. Select transport for each leg
    const legs = page.locator('[data-testid="leg-options-list"]');
    await legs.nth(0).locator('[data-testid="transport-option"]').first().click();
    await legs.nth(1).locator('[data-testid="transport-option"]').first().click();

    // 12. Verify summary shows totals
    await expect(page.locator('[data-testid="total-duration"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-cost"]')).toBeVisible();

    // 13. Generate PDF
    await page.locator('button:has-text("Generate PDF Itinerary")').click();
    await expect(page.locator('text=Generating PDF...')).toBeVisible();

    // 14. Verify PDF opens in new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('button:has-text("Generate PDF Itinerary")').click()
    ]);
    
    await newPage.waitForLoadState();
    expect(newPage.url()).toMatch(/\.pdf$/);
  });

  test('handles errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/v1/optimize-route', route => route.abort());

    await page.goto('http://localhost:5173?city=Singapore');
    
    // Select attractions
    const attractions = page.locator('[data-testid="attraction-card"]');
    await attractions.nth(0).click();
    await attractions.nth(1).click();

    // Try to optimize
    await page.locator('[data-testid="selection-fab"]').click();
    await page.locator('button:has-text("Optimize Route")').click();

    // Should show error
    await expect(page.locator('text=Failed to optimize route')).toBeVisible();
    await expect(page.locator('button:has-text("Try again")' )).toBeVisible();
  });
});
```

## 4. Performance Tests (K6)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // <1% failures
  },
};

export default function () {
  // Test optimize route endpoint
  const payload = JSON.stringify({
    places: [
      { id: '1', name: 'A', lat: 1.0, lng: 1.0 },
      { id: '2', name: 'B', lat: 1.1, lng: 1.1 },
      { id: '3', name: 'C', lat: 1.2, lng: 1.2 }
    ],
    constraints: { travelTypes: ['WALKING'] },
    options: { includeRealtimeTransit: false }
  });

  const res = http.post('http://localhost:3001/api/v1/optimize-route', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

## 5. Accessibility Tests

```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('meets WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('role', 'button');
    
    // Select with Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('[aria-pressed="true"]')).toBeVisible();
  });

  test('screen reader announcements', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const liveRegion = page.locator('[role="status"]');
    await expect(liveRegion).toHaveText('Loading attractions...');
    
    await page.waitForTimeout(2000);
    await expect(liveRegion).toHaveText('10 attractions loaded');
  });
});
```

## Acceptance Criteria Checklist

### UI/UX
- [ ] Mobile-first layout works on 320px width
- [ ] Touch targets ≥ 44px
- [ ] Color contrast ≥ 4.5:1
- [ ] Loading skeletons prevent layout shift
- [ ] Animations respect `prefers-reduced-motion`

### Functionality
- [ ] User can select 1-20 attractions
- [ ] Route optimization completes in <2s for N≤12
- [ ] Transport options load in <3s
- [ ] PDF generates in <5s
- [ ] Offline mode shows graceful fallback

### Performance
- [ ] Lighthouse score > 90
- [ ] FCP < 1.5s
- [ ] TTI < 3.5s
- [ ] 95th percentile API response < 500ms

### Accessibility
- [ ] Axe score > 95
- [ ] Full keyboard navigation
- [ ] Screen reader compatible
- [ ] Focus management correct

### Security
- [ ] JWT validation on all protected endpoints
- [ ] Rate limiting active (100 req/min)
- [ ] Input sanitization prevents XSS/SQL injection
- [ ] HTTPS enforced in production

## Test Execution

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npx playwright test

# Performance tests
k6 run performance-tests.js

# Accessibility tests
npm run test:a11y

# Coverage report
npm run test:coverage
```

## Bug Tracking Template

```
Title: [Component] Brief description
Severity: Critical | High | Medium | Low
Steps to Reproduce:
1. 
2. 
3. 
Expected: 
Actual: 
Browser/Device: 
Screenshots/Logs:
```
