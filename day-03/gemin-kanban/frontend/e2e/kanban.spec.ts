import { test, expect } from "@playwright/test";

test.describe("Kanban Board E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads the board with 5 columns and initial dummy cards", async ({ page }) => {
    // Verify 5 columns
    const columns = page.locator('[data-testid^="column-col-"]');
    await expect(columns).toHaveCount(5);

    // Verify initial column titles
    await expect(page.locator('[data-testid="column-title-col-1"]')).toContainText("Backlog");
    await expect(page.locator('[data-testid="column-title-col-2"]')).toContainText("To Do");
    await expect(page.locator('[data-testid="column-title-col-3"]')).toContainText("In Progress");
    await expect(page.locator('[data-testid="column-title-col-4"]')).toContainText("Review");
    await expect(page.locator('[data-testid="column-title-col-5"]')).toContainText("Done");

    // Verify cards are rendered
    await expect(page.locator('[data-testid="card-card-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-card-1"]')).toContainText("Market research analysis");
  });

  test("allows renaming a column", async ({ page }) => {
    const colTitle = page.locator('[data-testid="column-title-col-1"]');
    await colTitle.click();

    const titleInput = page.locator('[data-testid="column-title-input-col-1"]');
    await expect(titleInput).toBeVisible();

    await titleInput.fill("Ideas Queue");
    await titleInput.press("Enter");

    await expect(page.locator('[data-testid="column-title-col-1"]')).toContainText("Ideas Queue");
  });

  test("adds a new card to a specific column", async ({ page }) => {
    // Click add card button in Column 1
    await page.locator('[data-testid="add-card-button-col-1"]').click();

    // Verify modal appears
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Fill title and details
    await page.locator('[data-testid="card-title-input"]').fill("E2E Automated Task");
    await page.locator('[data-testid="card-details-input"]').fill("Task details created during Playwright test");

    // Submit
    await page.locator('[data-testid="submit-card-button"]').click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();

    // Verify card is present in column 1
    const col1 = page.locator('[data-testid="column-col-1"]');
    await expect(col1).toContainText("E2E Automated Task");
    await expect(col1).toContainText("Task details created during Playwright test");
  });

  test("deletes an existing card", async ({ page }) => {
    // Verify card-1 exists first
    const card = page.locator('[data-testid="card-card-1"]');
    await expect(card).toBeVisible();

    // Click delete button
    await page.locator('[data-testid="delete-card-card-1"]').click();

    // Verify card is removed
    await expect(card).not.toBeVisible();
  });

  test("drags and drops a card to another column using mouse interaction", async ({ page }) => {
    const cardHandle = page.locator('[data-testid="drag-handle-card-1"]');
    const targetDroppable = page.locator('[data-testid="droppable-area-col-2"]');

    await expect(cardHandle).toBeVisible();
    await expect(targetDroppable).toBeVisible();

    const handleBox = await cardHandle.boundingBox();
    const targetBox = await targetDroppable.boundingBox();

    expect(handleBox).not.toBeNull();
    expect(targetBox).not.toBeNull();

    if (handleBox && targetBox) {
      await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 25 });
      await page.waitForTimeout(300);
      await page.mouse.up();
      await page.waitForTimeout(300);
    }

    const col2 = page.locator('[data-testid="column-col-2"]');
    await expect(col2).toContainText("Market research analysis");
  });

  test("drags and drops a card to another column using keyboard navigation", async ({ page }) => {
    const cardHandle = page.locator('[data-testid="drag-handle-card-1"]');
    await expect(cardHandle).toBeVisible();

    // @hello-pangea/dnd has native accessible keyboard support:
    // Focus the drag handle, press Space to lift, ArrowRight to move across columns, Space to drop
    await cardHandle.focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(300);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(300);
    await page.keyboard.press("Space");
    await page.waitForTimeout(300);

    // Verify card-1 is now inside column 2
    const col2 = page.locator('[data-testid="column-col-2"]');
    await expect(col2).toContainText("Market research analysis");
  });
});
