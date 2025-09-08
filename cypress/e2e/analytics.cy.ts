import { describe, beforeEach, it } from "cypress"
import { cy } from "cypress"

describe("Analytics and Charts", () => {
  beforeEach(() => {
    cy.loginAsUser()
    // Create some test data
    cy.createTestExpense(50.0, "Groceries", "Food")
    cy.createTestExpense(30.0, "Gas", "Transportation")
    cy.createTestExpense(100.0, "Utilities", "Bills")
    cy.visit("/dashboard/analytics")
    cy.waitForPageLoad()
  })

  describe("Analytics Overview", () => {
    it("should display analytics statistics", () => {
      cy.get('[data-testid="total-spent"]').should("be.visible")
      cy.get('[data-testid="average-daily"]').should("be.visible")
      cy.get('[data-testid="top-category"]').should("be.visible")
      cy.get('[data-testid="expense-trend"]').should("be.visible")
    })

    it("should show comparison with previous period", () => {
      cy.get('[data-testid="comparison-stats"]').should("be.visible")
      cy.get('[data-testid="percentage-change"]').should("be.visible")
    })
  })

  describe("Charts", () => {
    it("should display category breakdown pie chart", () => {
      cy.get('[data-testid="category-pie-chart"]').should("be.visible")
      cy.get(".recharts-pie").should("exist")
    })

    it("should display spending trends line chart", () => {
      cy.get('[data-testid="spending-trends-chart"]').should("be.visible")
      cy.get(".recharts-line").should("exist")
    })

    it("should display daily spending bar chart", () => {
      cy.get('[data-testid="daily-spending-chart"]').should("be.visible")
      cy.get(".recharts-bar").should("exist")
    })

    it("should allow chart period selection", () => {
      cy.get('[data-testid="period-selector"]').select("Last 3 months")
      cy.get('[data-testid="spending-trends-chart"]').should("be.visible")
    })
  })

  describe("Export Functionality", () => {
    it("should export analytics as PDF", () => {
      cy.get('[data-testid="export-pdf"]').click()

      // Should trigger download (we can't verify actual file download in Cypress easily)
      cy.get('[data-testid="export-success"]').should("be.visible")
    })

    it("should export data as CSV", () => {
      cy.get('[data-testid="export-csv"]').click()

      // Should trigger download
      cy.get('[data-testid="export-success"]').should("be.visible")
    })
  })

  describe("Responsive Design", () => {
    it("should display charts properly on mobile", () => {
      cy.viewport("iphone-x")
      cy.get('[data-testid="category-pie-chart"]').should("be.visible")
      cy.get('[data-testid="spending-trends-chart"]').should("be.visible")
    })

    it("should stack charts vertically on small screens", () => {
      cy.viewport("iphone-x")
      cy.get('[data-testid="charts-container"]').should("have.class", "flex-col")
    })
  })
})
