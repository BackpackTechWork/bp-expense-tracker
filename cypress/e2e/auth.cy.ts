import { describe, beforeEach, it } from "mocha"
import { cy } from "cypress"
import Cypress from "cypress"

describe("Authentication Flow", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  describe("Sign Up", () => {
    it("should allow new user registration", () => {
      cy.visit("/auth/signup")
      cy.waitForPageLoad()

      // Fill out registration form
      cy.get('[data-testid="name-input"]').type("Test User")
      cy.get('[data-testid="email-input"]').type("newuser@example.com")
      cy.get('[data-testid="password-input"]').type("TestPassword123!")
      cy.get('[data-testid="confirm-password-input"]').type("TestPassword123!")

      // Submit form
      cy.get('[data-testid="signup-button"]').click()

      // Should redirect to dashboard or show success message
      cy.url().should("not.include", "/auth/signup")
    })

    it("should show validation errors for invalid input", () => {
      cy.visit("/auth/signup")
      cy.waitForPageLoad()

      // Try to submit empty form
      cy.get('[data-testid="signup-button"]').click()

      // Should show validation errors
      cy.get('[data-testid="name-error"]').should("be.visible")
      cy.get('[data-testid="email-error"]').should("be.visible")
      cy.get('[data-testid="password-error"]').should("be.visible")
    })

    it("should validate password confirmation", () => {
      cy.visit("/auth/signup")
      cy.waitForPageLoad()

      cy.get('[data-testid="name-input"]').type("Test User")
      cy.get('[data-testid="email-input"]').type("test@example.com")
      cy.get('[data-testid="password-input"]').type("TestPassword123!")
      cy.get('[data-testid="confirm-password-input"]').type("DifferentPassword!")

      cy.get('[data-testid="signup-button"]').click()

      // Should show password mismatch error
      cy.get('[data-testid="confirm-password-error"]').should("contain", "Passwords do not match")
    })
  })

  describe("Sign In", () => {
    it("should allow existing user login", () => {
      cy.visit("/auth/signin")
      cy.waitForPageLoad()

      // Fill out login form
      cy.get('[data-testid="email-input"]').type(Cypress.env("TEST_USER_EMAIL"))
      cy.get('[data-testid="password-input"]').type(Cypress.env("TEST_USER_PASSWORD"))

      // Submit form
      cy.get('[data-testid="signin-button"]').click()

      // Should redirect to dashboard
      cy.url().should("include", "/dashboard")
    })

    it("should show error for invalid credentials", () => {
      cy.visit("/auth/signin")
      cy.waitForPageLoad()

      cy.get('[data-testid="email-input"]').type("invalid@example.com")
      cy.get('[data-testid="password-input"]').type("wrongpassword")

      cy.get('[data-testid="signin-button"]').click()

      // Should show error message
      cy.get('[data-testid="error-message"]').should("be.visible")
    })

    it("should validate required fields", () => {
      cy.visit("/auth/signin")
      cy.waitForPageLoad()

      // Try to submit empty form
      cy.get('[data-testid="signin-button"]').click()

      // Should show validation errors
      cy.get('[data-testid="email-error"]').should("be.visible")
      cy.get('[data-testid="password-error"]').should("be.visible")
    })
  })

  describe("Google OAuth", () => {
    it("should display Google sign-in button", () => {
      cy.visit("/auth/signin")
      cy.waitForPageLoad()

      cy.get('[data-testid="google-signin-button"]').should("be.visible")
    })
  })

  describe("Logout", () => {
    it("should allow user to logout", () => {
      cy.loginAsUser()
      cy.visit("/dashboard")
      cy.waitForPageLoad()

      // Click logout button
      cy.get('[data-testid="user-menu"]').click()
      cy.get('[data-testid="logout-button"]').click()

      // Should redirect to home page
      cy.url().should("not.include", "/dashboard")
    })
  })
})
