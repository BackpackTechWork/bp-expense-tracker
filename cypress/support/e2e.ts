// Import commands.js using ES2015 syntax:
import "./commands"
import { Cypress, cy } from "cypress"

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
Cypress.on("window:before:load", (win) => {
  cy.stub(win.console, "error").as("consoleError")
})

// Handle uncaught exceptions
Cypress.on("uncaught:exception", (err, runnable) => {
  // Ignore NextAuth session errors during testing
  if (err.message.includes("Failed to execute 'json' on 'Response'")) {
    return false
  }
  // Don't fail tests on unhandled promise rejections
  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false
  }
  return true
})
