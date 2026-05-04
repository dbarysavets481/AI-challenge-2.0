# Leaderboard Implementation Report

## Approach

I received a task to recreate a leaderboard page based on provided reference screenshots.

The main goal was to replicate the original UI and behavior as closely as possible, including layout, visual hierarchy, filters, sorting logic, top-3 podium, ranked employee list, and expandable activity details.

As a first step, I analyzed the structure of the page:
- identified all key UI components (header, filters, podium, list, expandable rows)
- understood how each element is visually structured
- analyzed how elements interact with each other (filtering, sorting, rank recalculation, expand behavior)

After that, I prepared a structured prompt describing both UI and functionality in detail.

This prompt was used with GitHub Copilot to generate the initial implementation (HTML, CSS, and JavaScript).

Then I manually reviewed and refined the generated code:
- adjusted layout and styling to better match the reference
- fixed spacing, alignment, and color details
- improved filtering and sorting logic
- ensured correct recalculation of ranks and top-3 podium
- updated the expandable section to match the required "Recent Activity" table format

## Tools and Techniques Used

- HTML for page structure
- CSS for layout, styling, responsive behavior, podium, cards, filters, and expanded rows
- JavaScript for rendering leaderboard data, filtering, sorting, recalculating ranks, and expand/collapse logic
- GitHub Copilot for AI-assisted code generation based on a custom prompt
- Browser DevTools for visual adjustments and debugging
- GitHub Pages for deployment

## Data Replacement

The original leaderboard data was not used.

During prompt creation, I explicitly specified that all data should be generated as fictional.  
I instructed Copilot to create:
- fake employee names
- fake roles (titles)
- fake teams/groups
- synthetic scores, categories, and activity records

This allowed the generated solution to preserve the leaderboard structure and realistic behavior, while ensuring that no real or original data was included.

## Implemented Functionality

- Leaderboard header and subtitle
- Year filter
- Quarter filter
- Category filter
- Employee search
- Combined filtering
- Sorting by score in descending order
- Dynamic rank recalculation after filtering
- Top-3 podium recalculation after filtering
- Ranked employee list
- Expandable employee rows
- "Recent Activity" table with Activity, Category, Date, and Points columns
- Empty state when no results match
- Responsive layout for desktop and mobile

## Additional UI Enhancements

In addition to the core functionality, several UI details were implemented to better match the behavior of the reference:

- Tooltip hints for statistic icons  
  When hovering over icons in the stats section, tooltips are displayed to clarify the meaning of each category.

- Search input interaction  
  When the user focuses on the search field:
  - the search icon (magnifying glass) disappears  
  - the input text shifts to the left  

- Expand button interaction  
  - on hover, the expand button becomes visually highlighted with a blue accent  
  - when a row is expanded, the button changes its state (blue color and rotated icon)  

These interaction details improve usability and make the UI closer to a real production-like experience.

## Notes

The implementation focuses on replicating the UI and behavior of the original leaderboard as closely as possible using a simple frontend stack without backend or external libraries.

AI assistance (GitHub Copilot) was used to speed up development, while manual adjustments were applied to ensure correctness, accuracy, and visual consistency with the reference.

Special attention was paid to micro-interactions, hover states, and UI behavior details to improve the overall user experience.