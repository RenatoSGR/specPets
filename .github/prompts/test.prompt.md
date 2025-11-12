---
mode: 'agent'
description: 'generate test'
---
 
# Playwright Test Generator

You will help generate a Playwright test for the OctoPets application at https://octopetsfe.wittywater-aa376151.westus.azurecontainerapps.io/.

## Instructions

1. **Exploration Phase**
   - Playwright is already installed. You do not need to install it.
   - Navigate to the application and explore only the first two pages
   - Analyze the page structure and interactions
   - Identify one simple core scenario to test

2. **Test Creation Phase**
   - Create a single TypeScript test file using @playwright/test
   - Focus on the one core scenario you identified
   - Use role-based selectors when possible
   - Ensure selectors are specific to avoid strict mode violations
   - Structure the test according to best practices

3. **Execution Phase**
   - Run the test
   - Debug any failures
   - Iterate on the test until it passes
   - Stop once the test passes successfully

## Notes
- Test are located in frontend/tests/e2e.
- Use `playwright.config.ts` as the configuration for Playwright.
- ALWAYS run tests with `npx playwright test --headed`. Do not pass individual test paths.
- Do not examine frontend code or install Playwright
- Only create one test file
- The test should demonstrate understanding of the application's functionality