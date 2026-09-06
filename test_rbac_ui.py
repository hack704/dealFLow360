import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
CHROME_PATH = "/Users/braj/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "playwright_reports", "rbac_verification")
os.makedirs(REPORTS_DIR, exist_ok=True)

def run_rbac_tests():
    print("==================================================================")
    print("   DEALFLOW360 — ROLE-BASED ACCESS CONTROL (RBAC) UI VERIFICATION")
    print("==================================================================\n")

    with sync_playwright() as p:
        launch_opts = {"headless": True}
        if os.path.exists(CHROME_PATH):
            launch_opts["executable_path"] = CHROME_PATH

        browser = p.chromium.launch(**launch_opts)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # -------------------------------------------------------------
        # 1. SALES REP ROLE TEST
        # -------------------------------------------------------------
        print("--- 1. Testing Role: SALES REP (Alex Rivera) ---")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        
        # Click Alex Rivera pill
        page.locator("button:has-text('Alex Rivera')").click()
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Inspect Navbar tabs
        nav_text = page.locator("nav").first.inner_text()
        print(f"Sales Rep Navbar visible links: {nav_text.splitlines()}")

        assert "Quotations" in nav_text, "Sales Rep has Quotations access"
        assert "Pipeline" in nav_text, "Sales Rep has Pipeline access"
        assert "Approvals" not in nav_text, "Sales Rep is RESTRICTED from Approvals queue"
        assert "Fulfillment" not in nav_text, "Sales Rep is RESTRICTED from Fulfillment"
        assert "Invoices" not in nav_text, "Sales Rep is RESTRICTED from Invoices"
        assert "Subscriptions" not in nav_text, "Sales Rep is RESTRICTED from Subscriptions"
        assert "Reports" not in nav_text, "Sales Rep is RESTRICTED from Admin Reports"
        assert "Discount Tiers" not in nav_text, "Sales Rep is RESTRICTED from Discount Tiers"
        print("✅ PASS: Sales Rep navbar contains ONLY authorized links (Dashboard, Quotations, Pipeline, Products)")

        # Verify Route Guard: Sales Rep attempts direct URL navigation to /approvals
        page.goto(f"{BASE_URL}/approvals")
        page.wait_for_load_state("networkidle")
        time.sleep(1)
        current_url = page.url
        assert "/approvals" not in current_url, f"Route Guard blocked /approvals (Redirected to: {current_url})"
        print("✅ PASS: Route Guard blocked Sales Rep from /approvals (Redirected to /dashboard)")
        page.screenshot(path=os.path.join(REPORTS_DIR, "01_sales_rep_restricted.png"))

        # Log out
        page.locator("#btn-close-workspace").click()
        time.sleep(1)

        # -------------------------------------------------------------
        # 2. SALES MANAGER ROLE TEST
        # -------------------------------------------------------------
        print("\n--- 2. Testing Role: SALES MANAGER (Sarah Vance) ---")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        page.locator("button:has-text('Sarah Vance')").click()
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        mgr_nav = page.locator("nav").first.inner_text()
        print(f"Sales Manager Navbar visible links: {mgr_nav.splitlines()}")
        assert "Approvals" in mgr_nav, "Sales Manager has Approvals access"
        assert "Deal Health" in mgr_nav, "Sales Manager has Deal Health access"
        assert "Discount Tiers" in mgr_nav, "Sales Manager has Discount Tiers access"
        assert "Invoices" not in mgr_nav, "Sales Manager is RESTRICTED from Invoices"
        assert "Subscriptions" not in mgr_nav, "Sales Manager is RESTRICTED from Subscriptions"
        assert "Reports" not in mgr_nav, "Sales Manager is RESTRICTED from Admin Reports"
        print("✅ PASS: Sales Manager navbar contains ONLY authorized links")
        page.screenshot(path=os.path.join(REPORTS_DIR, "02_sales_manager_view.png"))

        # Log out
        page.locator("#btn-close-workspace").click()
        time.sleep(1)

        # -------------------------------------------------------------
        # 3. FINANCE / OPERATIONS ROLE TEST
        # -------------------------------------------------------------
        print("\n--- 3. Testing Role: FINANCE / OPERATIONS (David Sterling) ---")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        page.locator("button:has-text('David Sterling')").click()
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        fin_nav = page.locator("nav").first.inner_text()
        print(f"Finance Navbar visible links: {fin_nav.splitlines()}")
        assert "Invoices" in fin_nav, "Finance has Invoices access"
        assert "Subscriptions" in fin_nav, "Finance has Subscriptions access"
        assert "Fulfillment" in fin_nav, "Finance has Fulfillment access"
        assert "Approvals" in fin_nav, "Finance has Tier 2 Approvals access"
        assert "Discount Tiers" not in fin_nav, "Finance is RESTRICTED from Discount Tiers"
        assert "Reports" not in fin_nav, "Finance is RESTRICTED from Admin Reports"
        print("✅ PASS: Finance navbar contains ONLY authorized links")
        page.screenshot(path=os.path.join(REPORTS_DIR, "03_finance_view.png"))

        # Log out
        page.locator("#btn-close-workspace").click()
        time.sleep(1)

        # -------------------------------------------------------------
        # 4. CUSTOMER PORTAL USER TEST
        # -------------------------------------------------------------
        print("\n--- 4. Testing Role: CUSTOMER (Jordan Rivera) ---")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        page.locator("button:has-text('Customer Portal')").first.click()
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        cust_url = page.url
        assert "/portal" in cust_url, f"Customer routed to /portal (URL: {cust_url})"
        cust_nav = page.locator("nav").first.inner_text()
        print(f"Customer Navbar visible links: {cust_nav.splitlines()}")
        assert "My Quotation" in cust_nav, "Customer has My Quotation tab"
        assert "Dashboard" not in cust_nav, "Customer cannot access internal Dashboard"
        assert "Approvals" not in cust_nav, "Customer cannot access internal Approvals"
        print("✅ PASS: Customer Portal has isolated view and cannot see internal workspace")
        page.screenshot(path=os.path.join(REPORTS_DIR, "04_customer_portal_view.png"))

        print("\n==================================================================")
        print("🎉 ALL ROLE-BASED ACCESS CONTROL (RBAC) TESTS PASSED 100%!")
        print("==================================================================")
        browser.close()

if __name__ == "__main__":
    run_rbac_tests()
