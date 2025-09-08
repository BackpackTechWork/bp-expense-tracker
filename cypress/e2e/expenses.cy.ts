import { describe, beforeEach, it } from "cypress"
import { cy } from "cypress"

describe("Expense Management", () => {
  beforeEach(() => {
    cy.loginAsUser()
  })

  describe("Add Expense", () => {
    it("should create a new expense", () => {
      cy.visit("/dashboard/add")
      cy.waitForPageLoad()

      // Fill out expense form
      cy.get('[data-testid="amount-input"]').type("25.50")
      cy.get('[data-testid="description-input"]').type("Lunch at restaurant")
      cy.get('[data-testid="category-select"]').select("Food")
      cy.get('[data-testid="date-input"]').type("2024-01-15")

      // Submit form
      cy.get('[data-testid="add-expense-button"]').click()

      // Should show success message
      cy.get('[data-testid="success-message"]').should("be.visible")
      cy.url().should("include", "/dashboard")
    })

    it("should validate required fields", () => {
      cy.visit("/dashboard/add")
      cy.waitForPageLoad()

      // Try to submit empty form
      cy.get('[data-testid="add-expense-button"]').click()

      // Should show validation errors
      cy.get('[data-testid="amount-error"]').should("be.visible")
      cy.get('[data-testid="description-error"]').should("be.visible")
      cy.get('[data-testid="category-error"]').should("be.visible")
    })

    it("should validate amount format", () => {
      cy.visit("/dashboard/add")
      cy.waitForPageLoad()

      // Enter invalid amount
      cy.get('[data-testid="amount-input"]').type("invalid")
      cy.get('[data-testid="description-input"]').type("Test expense")
      cy.get('[data-testid="category-select"]').select("Food")

      cy.get('[data-testid="add-expense-button"]').click()

      // Should show amount validation error
      cy.get('[data-testid="amount-error"]').should("contain", "Invalid amount")
    })

    it("should handle receipt upload", () => {
      cy.visit("/dashboard/add")
      cy.waitForPageLoad()

      // Upload a test file
      cy.get('[data-testid="receipt-upload"]').selectFile("cypress/fixtures/test-receipt.jpg", { force: true })

      // Should show file preview
      cy.get('[data-testid="receipt-preview"]').should("be.visible")
    })
  })

  describe("Expense List", () => {
    beforeEach(() => {
      // Create some test expenses first
      cy.createTestExpense(15.99, "Coffee and pastry", "Food")
      cy.createTestExpense(45.0, "Gas station", "Transportation")
      cy.visit("/dashboard/expenses")
      cy.waitForPageLoad()
    })

    it("should display list of expenses", () => {
      cy.get('[data-testid="expense-list"]').should("be.visible")
      cy.get('[data-testid="expense-item"]').should("have.length.at.least", 1)
    })

    it("should filter expenses by category", () => {
      cy.get('[data-testid="category-filter"]').select("Food")
      cy.get('[data-testid="expense-item"]').should("contain", "Coffee and pastry")
    })

    it("should search expenses by description", () => {
      cy.get('[data-testid="search-input"]').type("coffee")
      cy.get('[data-testid="expense-item"]').should("contain", "Coffee and pastry")
    })

    it("should filter expenses by date range", () => {
      cy.get('[data-testid="date-from"]').type("2024-01-01")
      cy.get('[data-testid="date-to"]').type("2024-12-31")
      cy.get('[data-testid="apply-filter"]').click()

      cy.get('[data-testid="expense-list"]').should("be.visible")
    })
  })

  describe("Edit Expense", () => {
    beforeEach(() => {
      cy.createTestExpense(20.0, "Test expense for editing", "Food")
      cy.visit("/dashboard/expenses")
      cy.waitForPageLoad()
    })

    it("should edit an existing expense", () => {
      // Click edit button on first expense
      cy.get('[data-testid="edit-expense"]').first().click()

      // Update expense details
      cy.get('[data-testid="amount-input"]').clear().type("25.00")
      cy.get('[data-testid="description-input"]').clear().type("Updated expense description")

      // Save changes
      cy.get('[data-testid="save-expense-button"]').click()

      // Should show success message
      cy.get('[data-testid="success-message"]').should("be.visible")
    })
  })

  describe("Delete Expense", () => {
    beforeEach(() => {
      cy.createTestExpense(10.0, "Test expense for deletion", "Food")
      cy.visit("/dashboard/expenses")
      cy.waitForPageLoad()
    })

    it("should delete an expense", () => {
      // Click delete button
      cy.get('[data-testid="delete-expense"]').first().click()

      // Confirm deletion
      cy.get('[data-testid="confirm-delete"]').click()

      // Should show success message
      cy.get('[data-testid="success-message"]').should("be.visible")
    })

    it("should cancel deletion", () => {
      // Click delete button
      cy.get('[data-testid="delete-expense"]').first().click()

      // Cancel deletion
      cy.get('[data-testid="cancel-delete"]').click()

      // Expense should still be visible
      cy.get('[data-testid="expense-item"]').should("contain", "Test expense for deletion")
    })
  })
})
