import { describe, beforeEach, it, expect, cy } from "cypress"

describe("PWA Functionality", () => {
  beforeEach(() => {
    cy.loginAsUser()
  })

  describe("PWA Installation", () => {
    it("should show install prompt on supported browsers", () => {
      cy.visit("/dashboard")
      cy.waitForPageLoad()

      // Simulate beforeinstallprompt event
      cy.window().then((win) => {
        const event = new Event("beforeinstallprompt")
        win.dispatchEvent(event)
      })

      cy.get('[data-testid="install-prompt"]').should("be.visible")
    })

    it("should hide install prompt after installation", () => {
      cy.visit("/dashboard")
      cy.waitForPageLoad()

      // Simulate installation
      cy.window().then((win) => {
        const event = new Event("appinstalled")
        win.dispatchEvent(event)
      })

      cy.get('[data-testid="install-prompt"]').should("not.exist")
    })
  })

  describe("Offline Functionality", () => {
    it("should show offline indicator when offline", () => {
      cy.visit("/dashboard")
      cy.waitForPageLoad()

      // Simulate going offline
      cy.window().then((win) => {
        const event = new Event("offline")
        win.dispatchEvent(event)
      })

      cy.get('[data-testid="offline-indicator"]').should("be.visible")
    })

    it("should show online indicator when back online", () => {
      cy.visit("/dashboard")
      cy.waitForPageLoad()

      // Simulate going offline then online
      cy.window().then((win) => {
        win.dispatchEvent(new Event("offline"))
        win.dispatchEvent(new Event("online"))
      })

      cy.get('[data-testid="online-indicator"]').should("be.visible")
    })

    it("should cache expenses for offline viewing", () => {
      // Create an expense while online
      cy.createTestExpense(25.0, "Offline test expense", "Food")

      // Go to expenses page
      cy.visit("/dashboard/expenses")
      cy.waitForPageLoad()

      // Simulate going offline
      cy.window().then((win) => {
        win.dispatchEvent(new Event("offline"))
      })

      // Should still show cached expenses
      cy.get('[data-testid="expense-list"]').should("be.visible")
      cy.get('[data-testid="expense-item"]').should("contain", "Offline test expense")
    })
  })

  describe("Push Notifications", () => {
    it("should request notification permission", () => {
      cy.visit("/dashboard")
      cy.waitForPageLoad()

      // Mock notification permission
      cy.window().then((win) => {
        cy.stub(win.Notification, "requestPermission").resolves("granted")
      })

      cy.get('[data-testid="enable-notifications"]').click()
      cy.get('[data-testid="notifications-enabled"]').should("be.visible")
    })

    it("should handle notification permission denial", () => {
      cy.visit("/dashboard")
      cy.waitForPageLoad()

      // Mock notification permission denial
      cy.window().then((win) => {
        cy.stub(win.Notification, "requestPermission").resolves("denied")
      })

      cy.get('[data-testid="enable-notifications"]').click()
      cy.get('[data-testid="notifications-denied"]').should("be.visible")
    })
  })

  describe("Service Worker", () => {
    it("should register service worker", () => {
      cy.visit("/dashboard")
      cy.waitForPageLoad()

      cy.window().then((win) => {
        expect(win.navigator.serviceWorker).to.exist
      })
    })

    it("should show update available notification", () => {
      cy.visit("/dashboard")
      cy.waitForPageLoad()

      // Simulate service worker update
      cy.window().then((win) => {
        const event = new Event("swUpdated")
        win.dispatchEvent(event)
      })

      cy.get('[data-testid="update-available"]').should("be.visible")
    })
  })

  describe("App Shortcuts", () => {
    it("should handle app shortcuts navigation", () => {
      // Test direct navigation to add expense via shortcut
      cy.visit("/dashboard/add")
      cy.waitForPageLoad()

      cy.get('[data-testid="add-expense-form"]').should("be.visible")
    })
  })
})
