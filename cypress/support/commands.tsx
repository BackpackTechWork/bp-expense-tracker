/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      loginAsAdmin(): Chainable<void>
      loginAsUser(): Chainable<void>
      createTestExpense(amount: number, description: string, category?: string): Chainable<void>
      waitForPageLoad(): Chainable<void>
      checkAccessibility(): Chainable<void>
    }
  }
}

// Import Cypress
import { cy } from "cypress"

// Custom command to login
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit("/auth/signin")
    cy.get('[data-testid="email-input"]').type(email)
    cy.get('[data-testid="password-input"]').type(password)
    cy.get('[data-testid="signin-button"]').click()
    cy.url().should("not.include", "/auth/signin")
  })
})

// Login as admin user
Cypress.Commands.add("loginAsAdmin", () => {
  cy.login(Cypress.env("TEST_ADMIN_EMAIL"), Cypress.env("TEST_ADMIN_PASSWORD"))
})

// Login as regular user
Cypress.Commands.add("loginAsUser", () => {
  cy.login(Cypress.env("TEST_USER_EMAIL"), Cypress.env("TEST_USER_PASSWORD"))
})

// Create a test expense
Cypress.Commands.add("createTestExpense", (amount: number, description: string, category = "Food") => {
  cy.visit("/dashboard/add")
  cy.get('[data-testid="amount-input"]').type(amount.toString())
  cy.get('[data-testid="description-input"]').type(description)
  cy.get('[data-testid="category-select"]').select(category)
  cy.get('[data-testid="add-expense-button"]').click()
  cy.get('[data-testid="success-message"]').should("be.visible")
})

// Wait for page to fully load
Cypress.Commands.add("waitForPageLoad", () => {
  cy.get("body").should("be.visible")
  cy.wait(1000) // Allow for any async operations
})

// Basic accessibility check
Cypress.Commands.add("checkAccessibility", () => {
  // Check for basic accessibility attributes
  cy.get("img").each(($img) => {
    cy.wrap($img).should("have.attr", "alt")
  })

  // Check for proper heading hierarchy
  cy.get("h1, h2, h3, h4, h5, h6").should("exist")

  // Check for form labels
  cy.get("input, select, textarea").each(($input) => {
    const id = $input.attr("id")
    if (id) {
      cy.get(`label[for="${id}"]`).should("exist")
    }
  })
})
