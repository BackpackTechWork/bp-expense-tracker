import { describe, beforeEach, it } from "mocha"
import { cy } from "cypress"

describe("User Dashboard", () => {
  beforeEach(() => {
    cy.loginAsUser()
    cy.visit("/dashboard")
    cy.waitForPageLoad()
  })

  describe("Dashboard Overview", () => {
    it("should display dashboard statistics", () => {
      cy.get('[data-testid="total-expenses"]').should("be.visible")
      cy.get('[data-testid="monthly-budget"]').should("be.visible")
      cy.get('[data-testid="remaining-budget"]').should("be.visible")
      cy.get('[data-testid="expense-count"]').should("be.visible")
    })

    it("should show recent expenses", () => {
      cy.get('[data-testid="recent-expenses"]').should("be.visible")
    })

    it("should display budget progress", () => {
      cy.get('[data-testid="budget-progress"]').should("be.visible")
    })
  })

  describe("Navigation", () => {
    it("should navigate to add expense page", () => {
      cy.get('[data-testid="add-expense-nav"]').click()
      cy.url().should("include", "/dashboard/add")
    })

    it("should navigate to expenses list", () => {
      cy.get('[data-testid="expenses-nav"]').click()
      cy.url().should("include", "/dashboard/expenses")
    })

    it("should navigate to analytics page", () => {
      cy.get('[data-testid="analytics-nav"]').click()
      cy.url().should("include", "/dashboard/analytics")
    })

    it("should navigate to goals page", () => {
      cy.get('[data-testid="goals-nav"]').click()
      cy.url().should("include", "/dashboard/goals")
    })
  })

  describe("Mobile Navigation", () => {
    it("should show mobile navigation on small screens", () => {
      cy.viewport("iphone-x")
      cy.get('[data-testid="mobile-nav"]').should("be.visible")
    })

    it("should hide desktop navigation on mobile", () => {
      cy.viewport("iphone-x")
      cy.get('[data-testid="desktop-nav"]').should("not.be.visible")
    })
  })

  describe("Accessibility", () => {
    it("should meet basic accessibility requirements", () => {
      cy.checkAccessibility()
    })

    it("should be keyboard navigable", () => {
      cy.get("body").tab()
      cy.focused().should("be.visible")
    })
  })
})
