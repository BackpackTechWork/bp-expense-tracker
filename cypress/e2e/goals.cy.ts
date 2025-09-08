import { describe, beforeEach, it } from "mocha"
import { cy } from "cypress"

describe("Goals and Budgets", () => {
  beforeEach(() => {
    cy.loginAsUser()
    cy.visit("/dashboard/goals")
    cy.waitForPageLoad()
  })

  describe("Budget Management", () => {
    it("should create a new budget", () => {
      cy.get('[data-testid="add-budget"]').click()

      cy.get('[data-testid="budget-category"]').select("Food")
      cy.get('[data-testid="budget-amount"]').type("500")
      cy.get('[data-testid="budget-period"]').select("monthly")

      cy.get('[data-testid="save-budget"]').click()

      cy.get('[data-testid="success-message"]').should("be.visible")
      cy.get('[data-testid="budget-item"]').should("contain", "Food")
    })

    it("should edit an existing budget", () => {
      // First create a budget
      cy.get('[data-testid="add-budget"]').click()
      cy.get('[data-testid="budget-category"]').select("Transportation")
      cy.get('[data-testid="budget-amount"]').type("200")
      cy.get('[data-testid="save-budget"]').click()

      // Then edit it
      cy.get('[data-testid="edit-budget"]').first().click()
      cy.get('[data-testid="budget-amount"]').clear().type("250")
      cy.get('[data-testid="save-budget"]').click()

      cy.get('[data-testid="success-message"]').should("be.visible")
    })

    it("should delete a budget", () => {
      // First create a budget
      cy.get('[data-testid="add-budget"]').click()
      cy.get('[data-testid="budget-category"]').select("Entertainment")
      cy.get('[data-testid="budget-amount"]').type("100")
      cy.get('[data-testid="save-budget"]').click()

      // Then delete it
      cy.get('[data-testid="delete-budget"]').first().click()
      cy.get('[data-testid="confirm-delete"]').click()

      cy.get('[data-testid="success-message"]').should("be.visible")
    })

    it("should show budget progress", () => {
      // Create a budget and some expenses
      cy.get('[data-testid="add-budget"]').click()
      cy.get('[data-testid="budget-category"]').select("Food")
      cy.get('[data-testid="budget-amount"]').type("300")
      cy.get('[data-testid="save-budget"]').click()

      // Add some expenses in that category
      cy.createTestExpense(50, "Groceries", "Food")
      cy.createTestExpense(30, "Restaurant", "Food")

      cy.visit("/dashboard/goals")
      cy.waitForPageLoad()

      // Should show progress
      cy.get('[data-testid="budget-progress"]').should("be.visible")
      cy.get('[data-testid="budget-spent"]').should("contain", "80")
      cy.get('[data-testid="budget-remaining"]').should("contain", "220")
    })
  })

  describe("Savings Goals", () => {
    it("should create a new savings goal", () => {
      cy.get('[data-testid="add-savings-goal"]').click()

      cy.get('[data-testid="goal-name"]').type("Vacation Fund")
      cy.get('[data-testid="goal-target"]').type("2000")
      cy.get('[data-testid="goal-deadline"]').type("2024-12-31")

      cy.get('[data-testid="save-goal"]').click()

      cy.get('[data-testid="success-message"]').should("be.visible")
      cy.get('[data-testid="goal-item"]').should("contain", "Vacation Fund")
    })

    it("should add money to savings goal", () => {
      // First create a goal
      cy.get('[data-testid="add-savings-goal"]').click()
      cy.get('[data-testid="goal-name"]').type("Emergency Fund")
      cy.get('[data-testid="goal-target"]').type("1000")
      cy.get('[data-testid="save-goal"]').click()

      // Add money to it
      cy.get('[data-testid="add-to-goal"]').first().click()
      cy.get('[data-testid="contribution-amount"]').type("100")
      cy.get('[data-testid="save-contribution"]').click()

      cy.get('[data-testid="success-message"]').should("be.visible")
      cy.get('[data-testid="goal-progress"]').should("contain", "100")
    })

    it("should show goal progress visualization", () => {
      // Create a goal with some progress
      cy.get('[data-testid="add-savings-goal"]').click()
      cy.get('[data-testid="goal-name"]').type("New Car")
      cy.get('[data-testid="goal-target"]').type("5000")
      cy.get('[data-testid="save-goal"]').click()

      cy.get('[data-testid="add-to-goal"]').first().click()
      cy.get('[data-testid="contribution-amount"]').type("1000")
      cy.get('[data-testid="save-contribution"]').click()

      // Should show progress bar
      cy.get('[data-testid="goal-progress-bar"]').should("be.visible")
      cy.get('[data-testid="goal-percentage"]').should("contain", "20%")
    })

    it("should edit a savings goal", () => {
      // Create a goal
      cy.get('[data-testid="add-savings-goal"]').click()
      cy.get('[data-testid="goal-name"]').type("House Down Payment")
      cy.get('[data-testid="goal-target"]').type("10000")
      cy.get('[data-testid="save-goal"]').click()

      // Edit it
      cy.get('[data-testid="edit-goal"]').first().click()
      cy.get('[data-testid="goal-target"]').clear().type("15000")
      cy.get('[data-testid="save-goal"]').click()

      cy.get('[data-testid="success-message"]').should("be.visible")
    })

    it("should delete a savings goal", () => {
      // Create a goal
      cy.get('[data-testid="add-savings-goal"]').click()
      cy.get('[data-testid="goal-name"]').type("Gadget Fund")
      cy.get('[data-testid="goal-target"]').type("500")
      cy.get('[data-testid="save-goal"]').click()

      // Delete it
      cy.get('[data-testid="delete-goal"]').first().click()
      cy.get('[data-testid="confirm-delete"]').click()

      cy.get('[data-testid="success-message"]').should("be.visible")
    })
  })

  describe("Goal Notifications", () => {
    it("should show notification when goal is reached", () => {
      // Create a small goal
      cy.get('[data-testid="add-savings-goal"]').click()
      cy.get('[data-testid="goal-name"]').type("Small Goal")
      cy.get('[data-testid="goal-target"]').type("50")
      cy.get('[data-testid="save-goal"]').click()

      // Reach the goal
      cy.get('[data-testid="add-to-goal"]').first().click()
      cy.get('[data-testid="contribution-amount"]').type("50")
      cy.get('[data-testid="save-contribution"]').click()

      // Should show completion notification
      cy.get('[data-testid="goal-completed"]').should("be.visible")
    })

    it("should show warning when budget is exceeded", () => {
      // Create a small budget
      cy.get('[data-testid="add-budget"]').click()
      cy.get('[data-testid="budget-category"]').select("Entertainment")
      cy.get('[data-testid="budget-amount"]').type("50")
      cy.get('[data-testid="save-budget"]').click()

      // Exceed the budget
      cy.createTestExpense(60, "Concert tickets", "Entertainment")

      cy.visit("/dashboard/goals")
      cy.waitForPageLoad()

      // Should show budget exceeded warning
      cy.get('[data-testid="budget-exceeded"]').should("be.visible")
    })
  })
})
