# IPO Card Design QA

- Source visual truth: `C:\Users\DELL\.codex\generated_images\01a109f7-c4af-7df1-b878-9de4c5a038f0\exec-55222657-143b-4a0b-baa7-ec6fa6d8f7aa.png`
- Source pixels: 1487 x 1058
- Implementation screenshot: unavailable
- Intended viewport: 1440 x 1024 desktop, device scale factor 1
- State: IPO grid with open, upcoming, and closed/listed cards
- Density normalization: not performed because implementation capture is unavailable

## Full-view comparison evidence

Blocked. The selected source image is available, but the environment does not expose the required in-app browser. An installed local browser can be used only after the user permits direct browser capture.

## Focused region comparison evidence

Blocked for the same reason. The card header, investment hierarchy, metric grid, date row, subscription treatment, CTA, hover state, and responsive behavior still require rendered inspection.

## Findings

- [P1] Rendered fidelity is unverified.
  - Location: IPO card grid and `IpoCard` component.
  - Evidence: source visual is available; no browser-rendered implementation screenshot exists.
  - Impact: typography, card height, wrapping, spacing, responsive behavior, and semantic colors cannot be approved from code or build output alone.
  - Fix: capture the homepage at 1440 x 1024, compare it with the selected source in one visual input, fix any P0/P1/P2 differences, and repeat.

## Comparison history

- Initial pass: blocked before visual comparison because browser capture permission is required.

## Implementation checklist

- Capture the rendered homepage in the installed browser at 1440 x 1024.
- Test card navigation and share actions.
- Check the browser console.
- Compare the source and implementation together.
- Fix all P0/P1/P2 findings and recapture.

final result: blocked
