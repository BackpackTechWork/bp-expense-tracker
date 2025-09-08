import { describe, beforeEach, it } from "mocha"
import { cy } from "cypress"

describe("Admin Dashboard", () => {
  beforeEach(() => {
    cy.loginAsAdmin()
  })

  describe("Admin Access", () => {
    it("should allow admin to access admin dashboard", () => {
      cy.visit("/admin")
      cy.waitForPageLoad()

      cy.get('[data-testid="admin-dashboard"]').should("be.visible")
      cy.get('[data-testid="admin-stats"]').should("be.visible")
    })

    it("should prevent non-admin users from accessing admin pages", () => {
      cy.loginAsUser()
      cy.visit("/admin", { failOnStatusCode: false })

      // Should redirect to unauthorized page or dashboard
      cy.url().should("not.include", "/admin")
    })
  })

  describe("User Management", () => {
    beforeEach(() => {
      cy.visit("/admin/users")
      cy.waitForPageLoad()
    })

    it("should display list of users", () => {
      cy.get('[data-testid="users-table"]').should("be.visible")
      cy.get('[data-testid="user-row"]').should("have.length.at.least", 1)
    })

    it("should search users by email", () => {
      cy.get('[data-testid="user-search"]').type("test@example.com")
      cy.get('[data-testid="user-row"]').should("contain", "test@example.com")
    })

    it("should filter users by status", () => {
      cy.get('[data-testid="status-filter"]').select("Active")
      cy.get('[data-testid="user-row"]').should("be.visible")
    })

    it("should ban a user", () => {
      cy.get('[data-testid="ban-user"]').first().click()
      cy.get('[data-testid="confirm-ban"]').click()

      cy.get('[data-testid="success-message"]').should("contain", "User banned successfully")
    })

    it("should unban a user", () => {
      // First ban a user
      cy.get('[data-testid="ban-user"]').first().click()
      cy.get('[data-testid="confirm-ban"]').click()

      // Then unban
      cy.get('[data-testid="unban-user"]').first().click()
      cy.get('[data-testid="confirm-unban"]').click()

      cy.get('[data-testid="success-message"]').should("contain", "User unbanned successfully")
    })
  })

  describe("User Details", () => {
    it("should view user details", () => {
      cy.visit("/admin/users")
      cy.waitForPageLoad()

      cy.get('[data-testid="view-user"]').first().click()

      cy.get('[data-testid="user-details"]').should("be.visible")
      cy.get('[data-testid="user-expenses"]').should("be.visible")
      cy.get('[data-testid="user-activity"]').should("be.visible")
    })

    it("should display user expense statistics", () => {
      cy.visit("/admin/users")
      cy.get('[data-testid="view-user"]').first().click()

      cy.get('[data-testid="total-expenses"]').should("be.visible")
      cy.get('[data-testid="expense-count"]').should("be.visible")
      cy.get('[data-testid="average-expense"]').should("be.visible")
    })
  })

  describe("Activity Logs", () => {
    beforeEach(() => {
      cy.visit("/admin")
      cy.waitForPageLoad()
    })

    it("should display recent activity", () => {
      cy.get('[data-testid="recent-activity"]').should("be.visible")
      cy.get('[data-testid="activity-item"]').should("have.length.at.least", 1)
    })

    it("should filter activity by type", () => {
      cy.get('[data-testid="activity-filter"]').select("LOGIN")
      cy.get('[data-testid="activity-item"]').should("contain", "LOGIN")
    })

    it("should filter activity by date range", () => {
      cy.get('[data-testid="activity-date-from"]').type("2024-01-01")
      cy.get('[data-testid="activity-date-to"]').type("2024-12-31")
      cy.get('[data-testid="apply-activity-filter"]').click()

      cy.get('[data-testid="recent-activity"]').should("be.visible")
    })
  })

  describe("Admin Statistics", () => {
    beforeEach(() => {
      cy.visit("/admin")
      cy.waitForPageLoad()
    })

    it("should display key metrics", () => {
      cy.get('[data-testid="total-users"]').should("be.visible")
      cy.get('[data-testid="active-users"]').should("be.visible")
      cy.get('[data-testid="total-expenses"]').should("be.visible")
      cy.get('[data-testid="revenue-stats"]').should("be.visible")
    })

    it("should display user activity chart", () => {
      cy.get('[data-testid="user-activity-chart"]').should("be.visible")
      cy.get(".recharts-line").should("exist")
    })
  })
})
