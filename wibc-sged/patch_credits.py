import re

with open("app/page.tsx", "r") as f:
    content = f.read()

# 1. Define CreditsFooter
credits_def = """const CreditsFooter = () => (
  <div style={{ textAlign: "center", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border-light)", color: "var(--color-text)", fontFamily: "Aptos, system-ui, sans-serif", fontSize: "0.85rem" }}>
    Powered by{" "}
    <a
      href="https://www.proctorsgroup.com/"
      target="_blank"
      rel="noreferrer"
      style={{
        color: "#000",
        textDecoration: "none",
        fontWeight: 600,
        transition: "opacity 0.2s"
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >
      Proctor + Stevenson
    </a>
  </div>
);

"""
if "const CreditsFooter" not in content:
    content = content.replace("export default function AssessmentWizard() {", credits_def + "export default function AssessmentWizard() {")

# 2. Add to each step
# By looking for the exact function ends:

# Step 1
content = content.replace(
'''        <div className="form-nav" style={{ marginTop: "1rem" }}>
          <div />
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );''',
'''        <div className="form-nav" style={{ marginTop: "1rem" }}>
          <div />
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        </div>
        <CreditsFooter />
      </div>
    </div>
  );'''
)

# Step 2
content = content.replace(
'''        <div className="form-nav" style={{ marginTop: "1rem" }}>
          <button type="button" className="btn btn-secondary" onClick={handlePrev}>
            Back
          </button>
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );''',
'''        <div className="form-nav" style={{ marginTop: "1rem" }}>
          <button type="button" className="btn btn-secondary" onClick={handlePrev}>
            Back
          </button>
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        </div>
        <CreditsFooter />
      </div>
    </div>
  );'''
)

# Step 3
content = content.replace(
'''        <div className="form-nav" style={{ marginTop: "1rem" }}>
          <button type="button" className="btn btn-secondary" onClick={handlePrev}>
            Back
          </button>
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );''',
'''        <div className="form-nav" style={{ marginTop: "1rem" }}>
          <button type="button" className="btn btn-secondary" onClick={handlePrev}>
            Back
          </button>
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Proceed to Payment
          </button>
        </div>
        <CreditsFooter />
      </div>
    </div>
  );'''
)

# Payment Step
content = content.replace(
'''            {isRedirectingToStripe ? (
              <>
                <Loader2 size={16} aria-hidden="true" style={{ animation: "spin 0.8s linear infinite" }} />
                Redirecting to Stripe...
              </>
            ) : (
              "Proceed"
            )}
          </button>
        </div>
      </form>
    </div>
  );''',
'''            {isRedirectingToStripe ? (
              <>
                <Loader2 size={16} aria-hidden="true" style={{ animation: "spin 0.8s linear infinite" }} />
                Redirecting to Stripe...
              </>
            ) : (
              "Proceed"
            )}
          </button>
        </div>
      </form>
      <CreditsFooter />
    </div>
  );'''
)

# Intro Step
content = content.replace(
'''      <div className="form-nav" style={{ justifyContent: "center", gap: "1rem" }}>
        <button className="btn btn-secondary" onClick={handlePrev}>Back</button>
        <button className="btn btn-primary" onClick={handleNext}>Start diagnostic</button>
      </div>
    </div>
  );''',
'''      <div className="form-nav" style={{ justifyContent: "center", gap: "1rem" }}>
        <button className="btn btn-secondary" onClick={handlePrev}>Back</button>
        <button className="btn btn-primary" onClick={handleNext}>Start diagnostic</button>
      </div>
      <CreditsFooter />
    </div>
  );'''
)

# Assessment Step
content = content.replace(
'''            {isSubmitting ? (
              <>
                <Loader2 size={16} aria-hidden="true" style={{ animation: "spin 0.8s linear infinite" }} />
                Submitting...
              </>
            ) : isLastGoal ? (
              "Submit Diagnostic"
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
    );
  };''',
'''            {isSubmitting ? (
              <>
                <Loader2 size={16} aria-hidden="true" style={{ animation: "spin 0.8s linear infinite" }} />
                Submitting...
              </>
            ) : isLastGoal ? (
              "Submit Diagnostic"
            ) : (
              "Next"
            )}
          </button>
        </div>
        <CreditsFooter />
      </div>
    );
  };'''
)

# 3. Remove Global Footer
global_footer = """      {/* Global Footer */}
      <div style={{ textAlign: "center", padding: "1.5rem 1rem 2rem", color: "var(--color-text)", fontFamily: "Aptos, system-ui, sans-serif", fontSize: "0.85rem" }}>
        Powered by{" "}
        <a
          href="https://www.proctorsgroup.com/"
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#000",
            textDecoration: "none",
            fontWeight: 600,
            transition: "opacity 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Proctor + Stevenson
        </a>
      </div>"""

if global_footer in content:
    content = content.replace(global_footer, "")

with open("app/page.tsx", "w") as f:
    f.write(content)

print("Done patching page.tsx")
