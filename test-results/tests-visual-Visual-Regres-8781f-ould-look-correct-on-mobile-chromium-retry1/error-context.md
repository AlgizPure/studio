# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - button "Toggle Sidebar" [ref=e7] [cursor=pointer]:
        - img
        - generic [ref=e8]: Toggle Sidebar
    - main [ref=e9]:
      - generic [ref=e11]:
        - heading "Welcome to Zenith Trainer" [level=2] [ref=e12]
        - paragraph [ref=e13]: Your personal AI-powered fitness and habit tracker.
        - generic [ref=e14]:
          - link "Login" [ref=e15] [cursor=pointer]:
            - /url: /login
          - link "Sign Up" [ref=e16] [cursor=pointer]:
            - /url: /signup
  - region "Notifications (F8)":
    - list
  - alert [ref=e17]
  - button "Open Next.js Dev Tools" [ref=e23] [cursor=pointer]:
    - img [ref=e24]
```